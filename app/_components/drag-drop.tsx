'use client';

import * as React from 'react';
import { SortableGrid } from '@/app/_components/sortable-grid';

export function DragDrop({ children, onUpdateItemsOrder }: Readonly<{
    onUpdateItemsOrder: (from: number, to: number) => void;
    children: React.ReactElement[];
}>) {
    return (
        <SortableGrid
            onReorder={onUpdateItemsOrder}
            getLabel={(i) => `#${i + 1}`}
            hint="Drag files to reorder"
            columns={4}
        >
            {children}
        </SortableGrid>
    );
}
