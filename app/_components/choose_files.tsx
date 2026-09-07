import React, { ChangeEventHandler, DragEvent, useEffect, useRef, useState } from "react";
import { CarriedFile, carriedMatches, getCarried, onCarriedChange } from "@/app/_utils/carry";

export function ChooseFiles(props: {
    id?: string;
    single?: boolean;
    className?: string;
    style?: React.CSSProperties;
    accept: string[];
    onChange: ChangeEventHandler<HTMLInputElement>;
    title?: string;
}) {
    const isImage = props.accept.some(a => a.startsWith('image'));
    const inputId = props.id ?? 'file-upload';
    const inputRef = useRef<HTMLInputElement>(null);
    const [dragging, setDragging] = useState(false);

    /**
     * The last result this visit produced, offered as a one-click alternative to hunting for it
     * in the downloads folder. Read after mount so the server-rendered markup and the first
     * client render agree.
     */
    const [carried, setCarried] = useState<CarriedFile | null>(null);
    useEffect(() => {
        setCarried(getCarried());
        return onCarriedChange(setCarried);
    }, []);

    const offer = carried && carriedMatches(carried.file, props.accept) ? carried : null;

    /**
     * Hands a file to the real input and replays its change event, so every caller's existing
     * `onChange` works unchanged. The same route a dropped file takes.
     */
    function adopt(file: File) {
        if (!inputRef.current) return;
        const transfer = new DataTransfer();
        transfer.items.add(file);
        inputRef.current.files = transfer.files;
        inputRef.current.dispatchEvent(new Event('change', { bubbles: true }));
    }

    /**
     * The zone has always said "or drag and drop", but nothing handled a drop — dropping a
     * file did nothing, or navigated the browser away from the page. Dropped files are
     * assigned to the real input and its change event replayed, so every caller's existing
     * onChange handler works unchanged.
     */
    function onDrop(event: DragEvent<HTMLLabelElement>) {
        event.preventDefault();
        setDragging(false);

        const dropped = Array.from(event.dataTransfer?.files ?? []);
        if (dropped.length === 0 || !inputRef.current) return;

        const transfer = new DataTransfer();
        for (const file of props.single ? dropped.slice(0, 1) : dropped) {
            if (accepts(file, props.accept)) transfer.items.add(file);
        }
        if (transfer.files.length === 0) return;

        inputRef.current.files = transfer.files;
        inputRef.current.dispatchEvent(new Event('change', { bubbles: true }));
    }

    return (
        <div style={props.style} className={`w-full ${props.className ?? ''}`}>
            <label
                htmlFor={inputId}
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={onDrop}
                className={`relative flex items-center justify-center gap-3 w-full rounded-sm border-2 border-dashed px-4 py-5 text-center cursor-pointer transition-all group ${
                    dragging
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                        : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 hover:border-blue-400 hover:bg-blue-50/40 dark:hover:bg-blue-900/20'
                }`}
            >
                <input
                    ref={inputRef}
                    onChange={props.onChange}
                    type="file"
                    accept={props.accept.join(',')}
                    multiple={!props.single}
                    name="files[]"
                    className="sr-only"
                    id={inputId}
                />

                {/* Icon */}
                <div className="flex items-center justify-center w-9 h-9 flex-shrink-0 rounded-sm bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50 transition-colors dark:bg-blue-900/20 dark:border-blue-900">
                    {isImage ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"
                            className="text-blue-600 dark:text-blue-400">
                            <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
                            <circle cx="9" cy="9" r="2"/>
                            <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
                        </svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"
                            className="text-blue-600 dark:text-blue-400">
                            <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/>
                            <path d="M14 2v4a2 2 0 0 0 2 2h4"/>
                            <path d="M12 12v6"/>
                            <path d="m15 15-3-3-3 3"/>
                        </svg>
                    )}
                </div>

                {/* Text */}
                <div className="text-left">
                    <p className="font-semibold text-slate-800 dark:text-slate-100 text-sm leading-tight">
                        {props.title ?? (props.single ? 'Click to upload a file' : 'Click to upload files')}
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 leading-tight mt-0.5">
                        or drag and drop
                        {props.accept.length > 0 && (
                            <span className="ml-1 text-xs text-slate-300 dark:text-slate-600">
                                ({describeAccept(props.accept)})
                            </span>
                        )}
                    </p>
                </div>
            </label>

            {offer && (
                <button
                    type="button"
                    onClick={() => adopt(offer.file)}
                    className="mt-2 flex w-full items-center gap-2 rounded-sm border border-slate-200
                               dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 px-3 py-2
                               text-left text-xs text-slate-600 dark:text-slate-300
                               hover:border-blue-400 hover:bg-blue-50/40 dark:hover:bg-blue-900/20
                               transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
                         fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                         strokeLinejoin="round" className="flex-shrink-0 text-blue-600 dark:text-blue-400">
                        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                        <path d="M3 3v5h5" />
                    </svg>
                    <span className="min-w-0">
                        Use your last result:{' '}
                        <strong className="font-semibold text-slate-800 dark:text-slate-100 break-all">
                            {offer.file.name}
                        </strong>
                    </span>
                </button>
            )}
        </div>
    );
}

/** Whether a dropped file matches the accepted types, so an unrelated file is ignored. */
function accepts(file: File, accept: string[]): boolean {
    if (accept.length === 0) return true;
    return accept.some((type) =>
        type.endsWith('/*') ? file.type.startsWith(type.slice(0, -1)) : file.type === type);
}

/**
 * Readable list of accepted file types.
 *
 * A wildcard subtype rendered as a literal "*" — the image pickers offered "or drag and
 * drop (*)", which tells the user nothing about what they can drop.
 */
function describeAccept(accept: string[]): string {
    const seen = new Set<string>();
    for (const type of accept) {
        const [group, subtype] = type.split('/');
        seen.add(!subtype || subtype === '*' ? `${group}s` : subtype);
    }
    return Array.from(seen).join(', ');
}
