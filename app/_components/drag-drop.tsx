import {PdfView} from "@/app/_components/pdf-view";
import * as React from "react";
import {useState} from "react";

export function DragDrop({children,onUpdateItemsOrder}: Readonly<{ onUpdateItemsOrder:(pPos:number,curPos:number)=>void,children: React.ReactElement[] }>) {

    function onDrag(e:any) {
        e.preventDefault();
    }
    function onDragEnd(e:any){
        e.preventDefault();
    }
    function onDrop(e:any){
        e.preventDefault();
        const prevPos= parseInt(e.dataTransfer?.getData('child_no'));
        const curPos= parseInt((e.currentTarget as HTMLDivElement)?.getAttribute('data-child_no')??'');
        if(isNaN(prevPos) || isNaN(curPos)) return;
        onUpdateItemsOrder(prevPos,curPos);
    }
    function onDragEnter(e:any){
        e.preventDefault();
    }
    function onDragLeave(e:any){
        e.preventDefault();
    }
    function onDragExit(e:any){
        e.preventDefault();

    }
    function onDragStart(e:any){
        const childNo=(e.currentTarget as HTMLDivElement)?.getAttribute('data-child_no');
        if(childNo===null || isNaN(+childNo)) return;
        e.dataTransfer?.setData('child_no',childNo)
    }
    function onDragOver(e:any){
        e.preventDefault();
    }
    return <div
        className='flex-1 text-white font-thin grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 rounded-md bg-gray-800 gap-4 md:gap-6 p-6 max-h-[45rem] overflow-auto'>
        {children.map((child,childNo) => <div
            key={child.key}
            className='cursor-move'
            data-child_no={childNo}
            onDrag={onDrag}
            onDragEnd={onDragEnd}
            onDrop={onDrop}
            onDragEnter={onDragEnter}
            onDragLeave={onDragLeave}
            onDragExit={onDragExit}
            onDragStart={onDragStart}
            onDragOver={onDragOver}
            draggable={true}>
            {child}
        </div>)}
    </div>
}