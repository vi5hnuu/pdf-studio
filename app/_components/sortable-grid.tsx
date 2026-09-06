'use client';

import * as React from 'react';
import { useState } from 'react';

const GripIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
        <circle cx="9" cy="5" r="1.5" /><circle cx="15" cy="5" r="1.5" />
        <circle cx="9" cy="12" r="1.5" /><circle cx="15" cy="12" r="1.5" />
        <circle cx="9" cy="19" r="1.5" /><circle cx="15" cy="19" r="1.5" />
    </svg>
);

interface SortableGridProps {
    children: React.ReactElement[];
    onReorder: (from: number, to: number) => void;
    /** Optional label shown on each card (e.g., "Page 3"). Defaults to positional index. */
    getLabel?: (index: number) => string;
    columns?: 2 | 3 | 4 | 5;
    hint?: string;
}

export function SortableGrid({
    children,
    onReorder,
    getLabel,
    columns = 4,
    hint = 'Drag to reorder',
}: SortableGridProps) {
    const [dragging, setDragging] = useState<number | null>(null);
    const [dragOver, setDragOver] = useState<number | null>(null);

    const colClass =
        columns === 2 ? 'grid-cols-2' :
        columns === 3 ? 'grid-cols-2 sm:grid-cols-3' :
        columns === 5 ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5' :
        'grid-cols-2 sm:grid-cols-3 md:grid-cols-4';

    function handleDragStart(e: React.DragEvent, index: number) {
        e.dataTransfer.setData('sg-idx', String(index));
        e.dataTransfer.effectAllowed = 'move';
        // Small delay so the CSS can apply before screenshot
        setTimeout(() => setDragging(index), 0);
    }

    function handleDragEnd() {
        setDragging(null);
        setDragOver(null);
    }

    function handleDragOver(e: React.DragEvent, index: number) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        if (dragOver !== index) setDragOver(index);
    }

    function handleDrop(e: React.DragEvent, index: number) {
        e.preventDefault();
        const from = parseInt(e.dataTransfer.getData('sg-idx'));
        setDragging(null);
        setDragOver(null);
        if (!isNaN(from) && from !== index) onReorder(from, index);
    }

    return (
        <div className="space-y-3">
            {/* Header hint */}
            <div className="flex items-center justify-between px-0.5">
                <span className="inline-flex items-center gap-1.5 text-xs text-slate-400">
                    <GripIcon />
                    {hint}
                </span>
                <span className="text-xs text-slate-400">{children.length} item{children.length !== 1 ? 's' : ''}</span>
            </div>

            {/* Grid */}
            <div className={`grid ${colClass} gap-3`}>
                {children.map((child, index) => {
                    const isDragging = dragging === index;
                    const isOver = dragOver === index && dragging !== index;
                    const label = getLabel ? getLabel(index) : `${index + 1}`;

                    return (
                        <div
                            key={child.key ?? index}
                            draggable
                            onDragStart={(e) => handleDragStart(e, index)}
                            onDragEnd={handleDragEnd}
                            onDragOver={(e) => handleDragOver(e, index)}
                            onDragLeave={() => setDragOver(null)}
                            onDrop={(e) => handleDrop(e, index)}
                            className={[
                                'relative group select-none cursor-grab active:cursor-grabbing',
                                'bg-white rounded-sm overflow-hidden border-2 transition-all duration-150',
                                isDragging ? 'opacity-40 scale-95 border-slate-200 shadow-sm' :
                                isOver    ? 'border-blue-400 shadow-2xl scale-[1.04] z-10' :
                                            'border-transparent shadow-sm hover:shadow-md hover:border-slate-200',
                            ].join(' ')}
                        >
                            {/* Blue drop-zone overlay */}
                            {isOver && (
                                <div className="absolute inset-0 bg-blue-400/10 z-10 pointer-events-none rounded-sm" />
                            )}

                            {/* Drag handle — visible on hover */}
                            <div className="absolute top-2 right-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 backdrop-blur-sm rounded-sm p-1 shadow-sm text-slate-400">
                                <GripIcon />
                            </div>

                            {/* Position badge */}
                            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 bg-slate-900/65 backdrop-blur-sm text-white text-[10px] font-semibold px-2.5 py-0.5 rounded-full whitespace-nowrap pointer-events-none">
                                {label}
                            </div>

                            {/* The actual child content */}
                            <div className="w-full h-full pointer-events-none">
                                {child}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
