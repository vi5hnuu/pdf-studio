"use client";

import * as React from "react";
import { ChangeEvent, useState } from "react";
import { ChooseFiles } from "@/app/_components/choose_files";
import { ProgressStepper } from "@/app/_components/progress-stepper";
import { ToolSeoSection } from "@/app/_components/tool-seo-section";
import { generateId } from "@/app/_utils/constants";
import { ToolsApi } from "@/app/_utils/api";
import { runToolRequest } from '@/app/_hooks/use-tool-request';
import { authedFetch } from '@/app/_utils/auth';

interface FileData { id: string; file: File; }

enum Step { IDLE = 'idle', LOADING = 'loading', UPLOAD = 'upload', PROCESS = 'process', DOWNLOAD = 'download' }

/** Client-side bookmark node with a temporary id for React keying. */
interface BookmarkNode {
    _id: string;
    title: string;
    pageIndex: number;
    children: BookmarkNode[];
}

function makeNode(title = 'New Bookmark', pageIndex = 0): BookmarkNode {
    return { _id: generateId(10, 'B_'), title, pageIndex, children: [] };
}

/** Recursively attach API response nodes and assign client _ids. */
function fromApi(nodes: { title: string; pageIndex: number; children?: unknown[] }[]): BookmarkNode[] {
    return (nodes ?? []).map(n => ({
        _id: generateId(10, 'B_'),
        title: n.title ?? '',
        pageIndex: n.pageIndex ?? 0,
        children: fromApi((n.children as typeof nodes) ?? []),
    }));
}

/** Strip client _id before sending to API. */
function toApi(nodes: BookmarkNode[]): { title: string; pageIndex: number; children: unknown[] }[] {
    return nodes.map(({ title, pageIndex, children }) => ({ title, pageIndex, children: toApi(children) }));
}

// ─── Immutable tree helpers ────────────────────────────────────────────────────

function updateNode(tree: BookmarkNode[], id: string, patch: Partial<Pick<BookmarkNode, 'title' | 'pageIndex'>>): BookmarkNode[] {
    return tree.map(n => n._id === id
        ? { ...n, ...patch }
        : { ...n, children: updateNode(n.children, id, patch) }
    );
}

function deleteNode(tree: BookmarkNode[], id: string): BookmarkNode[] {
    return tree
        .filter(n => n._id !== id)
        .map(n => ({ ...n, children: deleteNode(n.children, id) }));
}

function addChild(tree: BookmarkNode[], parentId: string): BookmarkNode[] {
    return tree.map(n => n._id === parentId
        ? { ...n, children: [...n.children, makeNode()] }
        : { ...n, children: addChild(n.children, parentId) }
    );
}

// ─── BookmarkRow (recursive) ───────────────────────────────────────────────────

interface BookmarkRowProps {
    node: BookmarkNode;
    depth: number;
    onUpdate: (id: string, patch: Partial<Pick<BookmarkNode, 'title' | 'pageIndex'>>) => void;
    onDelete: (id: string) => void;
    onAddChild: (parentId: string) => void;
}

function BookmarkRow({ node, depth, onUpdate, onDelete, onAddChild }: BookmarkRowProps) {
    return (
        <div style={{ marginLeft: `${depth * 20}px` }}>
            <div className="flex items-center gap-2 py-1.5 group">
                {/* Tree connector */}
                {depth > 0 && (
                    <span className="flex-shrink-0 w-4 text-slate-300 select-none">└</span>
                )}
                {/* Title */}
                <input
                    type="text"
                    value={node.title}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => onUpdate(node._id, { title: e.target.value })}
                    placeholder="Bookmark title"
                    className="flex-1 min-w-0 px-2.5 py-1.5 rounded-lg border border-slate-200 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 bg-white dark:bg-slate-800 dark:border-slate-700"
                />
                {/* Page */}
                <div className="flex items-center gap-1 flex-shrink-0">
                    <span className="text-xs text-slate-400 dark:text-slate-500">p.</span>
                    <input
                        type="number"
                        min={0}
                        value={node.pageIndex}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => onUpdate(node._id, { pageIndex: Math.max(0, parseInt(e.target.value) || 0) })}
                        className="w-14 px-2 py-1.5 rounded-lg border border-slate-200 text-sm text-center outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 bg-white dark:bg-slate-800 dark:border-slate-700"
                    />
                </div>
                {/* Add child */}
                <button type="button" onClick={() => onAddChild(node._id)}
                    title="Add child bookmark"
                    className="flex-shrink-0 p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors opacity-0 group-hover:opacity-100 dark:text-slate-500">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                </button>
                {/* Delete */}
                <button type="button" onClick={() => onDelete(node._id)}
                    title="Delete"
                    className="flex-shrink-0 p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100 dark:text-slate-500">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                </button>
            </div>
            {/* Children */}
            {node.children.map(child => (
                <BookmarkRow key={child._id} node={child} depth={depth + 1}
                    onUpdate={onUpdate} onDelete={onDelete} onAddChild={onAddChild} />
            ))}
        </div>
    );
}

// ─── Main page ─────────────────────────────────────────────────────────────────

export default function EditBookmarks() {
    const [activeStep, setActiveStep] = useState(0);
    const [fileData, setFileData] = useState<FileData | null>(null);
    const [bookmarks, setBookmarks] = useState<BookmarkNode[]>([]);
    const [outFileName, setOutFileName] = useState('');
    const [step, setStep] = useState<Step>(Step.IDLE);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [loadError, setLoadError] = useState<string | null>(null);

    const steps = ['Select File', 'Edit Bookmarks', 'Save'];

    function handleFile(e: ChangeEvent<HTMLInputElement>) {
        const f = (Object.values(e.target.files ?? {}) as File[])[0];
        if (f) setFileData({ id: generateId(32, 'FILE_'), file: f });
    }

    async function loadBookmarks() {
        if (!fileData) return;
        setLoadError(null);
        setStep(Step.LOADING);
        try {
            const formData = new FormData();
            formData.append('file', fileData.file);
            const res = await authedFetch(ToolsApi.getBookmarks, { method: 'POST', body: formData });
            if (!res.ok) throw new Error(`Server returned ${res.status}`);
            const data = await res.json();
            setBookmarks(fromApi(Array.isArray(data) ? data : []));
            setActiveStep(1);
        } catch (err: unknown) {
            setLoadError(err instanceof Error ? err.message : 'Failed to load bookmarks');
        } finally {
            setStep(Step.IDLE);
        }
    }

    function handleUpdate(id: string, patch: Partial<Pick<BookmarkNode, 'title' | 'pageIndex'>>) {
        setBookmarks(b => updateNode(b, id, patch));
    }

    function handleDelete(id: string) {
        setBookmarks(b => deleteNode(b, id));
    }

    function handleAddChild(parentId: string) {
        setBookmarks(b => addChild(b, parentId));
    }

    function addTopLevel() {
        setBookmarks(b => [...b, makeNode()]);
    }

    async function startSave() {
        if (!fileData) return;
        const body = {
            out_file_name: outFileName || 'bookmarks-edited',
            bookmarks: JSON.stringify(toApi(bookmarks)),
        };
        const formData = new FormData();
        formData.append('edit-bookmarks-info', new Blob([JSON.stringify(body)], { type: 'application/json' }));
        formData.append('file', fileData.file);

        await runToolRequest({
            url: ToolsApi.editBookmarks,
            formData,
            fallbackFilename: 'edit-bookmarks.pdf',
            onStep: (s) => setStep(s as Step),
            onProgress: setProgress,
            onError: setError,
        });
    }

    const statusText = step === Step.UPLOAD ? 'Uploading...' : step === Step.PROCESS ? 'Saving bookmarks...' : step === Step.DOWNLOAD ? 'Preparing download...' : '';

    const totalBookmarks = (function count(nodes: BookmarkNode[]): number {
        return nodes.reduce((s, n) => s + 1 + count(n.children), 0);
    })(bookmarks);

    return (
        <div className="flex-1 flex flex-col">
            <div className="bg-gradient-to-r from-indigo-600 to-violet-700 text-white px-6 md:px-10 py-5 flex-shrink-0">
                <div className="max-w-5xl mx-auto flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                        <img src="/tools/edit-bookmarks.svg" alt="" className="w-7 h-7" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h1 className="text-xl font-bold">Edit Bookmarks</h1>
                        <p className="text-sm opacity-75 mt-0.5">View and edit the navigation outline of any PDF</p>
                    </div>
                    <div className="hidden md:block text-sm opacity-60">Step {activeStep + 1} / {steps.length}</div>
                </div>
            </div>

            <div className="bg-white border-b border-slate-100 px-6 md:px-10 py-3 flex-shrink-0 dark:bg-slate-800 dark:border-slate-700">
                <div className="max-w-5xl mx-auto">
                    <ProgressStepper steps={steps} activeStepIndex={activeStep} />
                </div>
            </div>

            <div className="flex-1 px-6 md:px-10 py-8">
                <div className="max-w-5xl mx-auto">

                    {activeStep === 0 && (
                        <div className="max-w-2xl mx-auto space-y-4">
                            <ChooseFiles single accept={['application/pdf']} onChange={handleFile} />
                            {fileData && <p className="text-sm text-center text-slate-500 dark:text-slate-400">Selected: <strong>{fileData.file.name}</strong></p>}
                            {loadError && (
                                <div role="alert" className="flex gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0 mt-0.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                                    {loadError}
                                </div>
                            )}
                            {fileData && (
                                <button
                                    onClick={loadBookmarks}
                                    disabled={step === Step.LOADING}
                                    className="w-full py-3 rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-wait transition-colors shadow-sm"
                                >
                                    {step === Step.LOADING ? 'Loading bookmarks…' : 'Load Bookmarks'}
                                </button>
                            )}
                        </div>
                    )}

                    {activeStep === 1 && (
                        <div className="max-w-2xl mx-auto space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-slate-500 dark:text-slate-400">
                                    {totalBookmarks === 0 ? 'No bookmarks yet' : `${totalBookmarks} bookmark${totalBookmarks !== 1 ? 's' : ''}`}
                                </div>
                                <div className="text-xs text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full dark:bg-slate-700 dark:text-slate-500">
                                    Hover a row to see actions
                                </div>
                            </div>

                            {/* Header hint */}
                            <div className="flex items-center gap-2 text-xs text-slate-400 px-1 pb-1 border-b border-slate-100 dark:border-slate-700 dark:text-slate-500">
                                <span className="flex-1">Title</span>
                                <span className="w-20 text-center">Page (0-idx)</span>
                                <span className="w-16" />
                            </div>

                            {/* Tree */}
                            <div className="space-y-0.5 min-h-[60px]">
                                {bookmarks.length === 0 ? (
                                    <p className="text-sm text-slate-400 text-center py-8 dark:text-slate-500">No bookmarks. Add one below.</p>
                                ) : (
                                    bookmarks.map(node => (
                                        <BookmarkRow key={node._id} node={node} depth={0}
                                            onUpdate={handleUpdate} onDelete={handleDelete} onAddChild={handleAddChild} />
                                    ))
                                )}
                            </div>

                            <button type="button" onClick={addTopLevel}
                                className="w-full py-2.5 rounded-xl border-2 border-dashed border-slate-300 text-slate-500 text-sm font-medium hover:border-indigo-400 hover:text-indigo-600 transition-colors dark:border-slate-600 dark:text-slate-400">
                                + Add top-level bookmark
                            </button>

                            <div className="bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-3 text-xs text-indigo-700 leading-relaxed">
                                Page numbers start at 1. Click the <strong>+</strong> icon on any bookmark to add a nested child. Hover a row to reveal action buttons.
                            </div>
                        </div>
                    )}

                    {activeStep === 2 && (
                        <div className="max-w-md mx-auto flex flex-col gap-6 py-8">
                            {step !== Step.IDLE && (
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="font-medium text-slate-700 dark:text-slate-200">{statusText}</span>
                                        {step !== Step.PROCESS && <span className="text-slate-400 tabular-nums dark:text-slate-500">{Math.round(progress)}%</span>}
                                    </div>
                                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden dark:bg-slate-700">
                                        {step === Step.PROCESS
                                            ? <div className="h-full w-full bg-indigo-600 animate-pulse" />
                                            : <div className="h-full bg-indigo-600 rounded-full transition-all" style={{ width: `${progress}%` }} />
                                        }
                                    </div>
                                </div>
                            )}
                            {error && (
                                <div role="alert" className="flex gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0 mt-0.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                                    {error}
                                </div>
                            )}
                            {step === Step.IDLE && (
                                <div className="flex flex-col gap-4">
                                    <div className="bg-slate-50 rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700 space-y-1 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-200">
                                        <p>File: <strong>{fileData?.file.name}</strong></p>
                                        <p>Bookmarks: <strong>{totalBookmarks}</strong></p>
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Output file name</label>
                                        <input type="text" value={outFileName} onChange={(e: ChangeEvent<HTMLInputElement>) => setOutFileName(e.target.value.trim())}
                                            placeholder="bookmarks-edited"
                                            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 dark:border-slate-700" />
                                    </div>
                                    <button onClick={startSave}
                                        className="w-full py-3.5 rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 transition-colors shadow-sm">
                                        Save & Download
                                    </button>
                                    <p className="text-center text-xs text-slate-400 dark:text-slate-500">Your updated PDF will download automatically</p>
                                </div>
                            )}
                        </div>
                    )}

                    <ToolSeoSection
                        toolPath="/tool/edit-bookmarks"
                        toolName="Edit Bookmarks"
                        about="Load the bookmark outline from any PDF, edit the navigation tree — add, remove, rename, or reorganize bookmarks at any nesting depth — then save the result as a new PDF. Useful for fixing broken outlines, adding navigation to scanned documents, or reorganizing large reports."
                        features={[
                            { icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-indigo-600"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>, title: 'Load existing outline', description: 'Reads the full bookmark tree from your PDF so you can see and edit what is already there.' },
                            { icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-indigo-600"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>, title: 'Nested bookmarks', description: 'Add child bookmarks at any depth to create a rich hierarchical navigation tree.' },
                            { icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-indigo-600"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>, title: 'Rename & reorder', description: 'Edit titles and target page indices, then reorder by adding and deleting nodes.' },
                            { icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-indigo-600"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg>, title: 'Secure processing', description: 'Files are processed in memory and never stored on our servers.' },
                        ]}
                        faqs={[
                            { q: 'What if my PDF has no bookmarks?', a: 'The editor will start empty. You can add any number of bookmarks from scratch and save them into the PDF.' },
                            { q: 'Will the existing PDF content be changed?', a: 'No. Only the bookmark outline (navigation panel) is modified. Text, images, and page layout are untouched.' },
                            { q: 'How do I create nested bookmarks?', a: 'Hover over any bookmark row and click the + icon on the right to add a child. You can nest to any depth.' },
                            { q: 'What does page index mean?', a: 'Pages are numbered from 0. Page index 0 is the first page, 1 is the second, and so on. When a reader clicks the bookmark, the viewer will jump to that page.' },
                        ]}
                    />
                </div>
            </div>

            <div className="flex-shrink-0 bg-white border-t border-slate-200 px-6 py-4 dark:bg-slate-800 dark:border-slate-700">
                <div className="max-w-5xl mx-auto flex items-center justify-between">
                    <button
                        disabled={activeStep === 0}
                        onClick={() => setActiveStep(a => a - 1)}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6"/></svg>
                        Back
                    </button>
                    <span className="text-xs text-slate-400 dark:text-slate-500">{activeStep + 1} / {steps.length}</span>
                    {/* Step 0 → 1 is handled by the Load button; Step 1 → 2 uses the normal Next */}
                    {activeStep === 1 ? (
                        <button
                            onClick={() => setActiveStep(2)}
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm"
                        >
                            Proceed
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6"/></svg>
                        </button>
                    ) : (
                        <button
                            disabled
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold opacity-40 cursor-not-allowed"
                        >
                            Next
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6"/></svg>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
