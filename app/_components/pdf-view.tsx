import {BottomNavigation, Button, Card, CardContent, Icon} from "@mui/material";
import {Document, Page} from "react-pdf";
import * as React from "react";
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import {ChangeEvent, useEffect, useState} from "react";
import {DocumentCallback} from "@/node_modules/react-pdf/dist/cjs/shared/types";
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import {
    ArrowDownward,
    ArrowDownwardOutlined,
    ArrowDownwardRounded,
    ArrowDropDown,
    ArrowRight
} from "@mui/icons-material";
import {DragDrop} from "@/app/_components/drag-drop";
import {swapItem} from "@/app/_utils/constants";

export interface PdfViewInfo {
    className?: string,
    style?: React.CSSProperties,
    file: File,
    showAllPages?: 'grid' | 'spread-horizontal' | 'spread-vertical' | 'range',
    pageClassName?: string,
    pageContainerClassName?: string,
    pageClass?:{[key:number]:string},//0 index
    allowReordering?: boolean,
    onOrderUpdate?:(order:number[])=>void,
    pageRotations?:Map<number,number>, //0 index
    rotation?:number
}

export function PdfView(props: PdfViewInfo) {
    const [totalPages, setTotalPages] = useState<number | null>(null)
    const [activePage, setActivePage] = useState<number>(1)
    const [pagesOrder, setPagesOrder] = useState<number[]>([0]);
    const [jumpReorder, setJumpReorder] = useState<boolean>(true);

    useEffect(()=>{
        props.onOrderUpdate && props.onOrderUpdate(pagesOrder);
    },[pagesOrder]);

    useEffect(() => {
        setPagesOrder(Array.from({length: totalPages ?? 1}).map((_, index) => index));
    }, [totalPages]);

    function onShowNextPage() {
        if (totalPages === null) return;
        setActivePage(lActive => Math.min(lActive + 1, totalPages));
    }

    function onShowPrevPage() {
        setActivePage(lActive => Math.max(lActive - 1, 1));
    }

    function onDocumentLoad(doc: DocumentCallback) {
        setTotalPages(doc.numPages);
    }

    function onReorder(pPos:number,curPos:number){
        setPagesOrder(order=>{
            const newOrder=[...order];
            if(jumpReorder){
                swapItem(newOrder,pPos,curPos);
                return newOrder;
            }
            for(let fNo=pPos;fNo<curPos;fNo++){
                swapItem(newOrder,fNo,fNo+1);
            }
            for(let fNo=pPos;fNo>curPos;fNo--){
                swapItem(newOrder,fNo,fNo-1);
            }
            return newOrder;
        })
    }

    return <Card className={`w-full h-full overflow-auto ${props.className ?? ''}`} style={props.style}>
        <CardContent className='relative h-full w-full !p-4 overflow-auto'>
            {!props.allowReordering && <Document
                className={`w-full h-auto pdf-cover-parent hide-text-layer hide-annotation-layer ${props.showAllPages === 'grid' ? 'overflow-visible grid grid-cols-4 gap-6' : (props.showAllPages === 'spread-horizontal' ? 'flex gap-6 p-4 overflow-x-scroll' : (props.showAllPages === 'spread-vertical' ? 'flex p-4 flex-col gap-12 overflow-y-scroll' : ''))}`}
                file={props.file} onLoadSuccess={onDocumentLoad}>
                {!props.showAllPages && <Page className={props.pageClassName} pageNumber={activePage}/>}
                {props.showAllPages && pagesOrder.map((pageNo,i) => <div
                    key={i}
                    style={{transform:`rotateZ(-${props.pageRotations?.get(pageNo)?? props.rotation ?? 0}deg)`,marginBottom:i<pagesOrder.length-1 ? '1.5rem':'0'}}
                    className={`relative w-full h-auto group ${props.pageContainerClassName ?? ''}`}>
                    <div
                        className='absolute flex items-center justify-center right-1/2 translate-x-1/2 -translate-y-1/2 rounded-full top-0 p-2 size-8 text-md bg-gray-200 group-hover:bg-blue-300 transition-all text-white z-10'>{pageNo + 1}</div>
                    {props.showAllPages === 'grid' && <div
                        className='absolute group-last-of-type:hidden right-0 bottom-0 translate-x-full -translate-y-1/2 p-2 size-8 text-xl md:text-5xl z-10'>,</div>}
                    {props.showAllPages !== 'grid' && <div
                        className={`absolute group-last-of-type:hidden ${props.showAllPages === 'spread-horizontal' ? '-right-2 bottom-1/2 translate-x-1/2 translate-y-1/2' : 'right-1/2 translate-x-1/2 -bottom-6'} p-2 size-8 text-xl md:text-3xl z-10`}>{props.showAllPages === 'spread-horizontal' ?
                        <ArrowRight/> : <ArrowDropDown/>}</div>}
                    <Page
                        className={`${props.showAllPages ? '!bg-gray-100 group-hover:!bg-blue-300 transition-all p-2 rounded-md' : ''} ${props.showAllPages === 'spread-horizontal' ? '!w-24 md:!w-52 aspect-[1/1.41]' : ''} ${props.pageClassName ?? ''} ${(props.pageClass && props.pageClass[pageNo]) ?? ''}`}
                        pageNumber={pageNo + 1}/>
                </div>)}
            </Document>}
            {(!props.showAllPages && !props.allowReordering) && <div
                className='absolute flex gap-1 bottom-0 left-1/2 -translate-x-1/2 -translate-y-1 bg-gray-100 rounded-2xl px-1.5'>
                <Button style={{padding: 0, display: 'contents'}} disabled={totalPages == null || activePage == 1}
                        onClick={onShowPrevPage}>
                    <NavigateBeforeIcon className='hover:scale-110 transition-all'/>
                </Button>
                <Button style={{padding: 0, display: 'contents'}}
                        disabled={totalPages == null || activePage >= totalPages} onClick={onShowNextPage}>
                    <NavigateNextIcon className='hover:scale-110 transition-all'/>
                </Button>
            </div>}

            {/* if reordering is allowed */}
            {props.allowReordering && <div>
                <div className='flex gap-4 items-center justify-center mb-6'>
                    <div className='flex gap-4 text-center'>
                        <label htmlFor='jump-order'>jump</label>
                        <input checked={jumpReorder}
                               onChange={(e: ChangeEvent<HTMLInputElement>) => setJumpReorder(e.target.checked)}
                               id='jump-order' type="radio"/>
                    </div>
                    <div className='flex gap-4 text-center'>
                        <label htmlFor='slide-order'>slide</label>
                        <input checked={!jumpReorder}
                               onChange={(e: ChangeEvent<HTMLInputElement>) => setJumpReorder(!e.target.checked)}
                               id='slide-order' type="radio"/>
                    </div>
                </div>
                <Document
                    className={`w-full h-full pdf-cover-parent hide-text-layer hide-annotation-layer overflow-visible`}
                    file={props.file} onLoadSuccess={onDocumentLoad}>
                    {
                        <DragDrop onUpdateItemsOrder={onReorder}>
                            {pagesOrder.map((pageNo,i) => <div
                                key={i}
                                style={{transform:`rotateZ(-${props.pageRotations?.get(pageNo) ?? props.rotation ?? 0}deg)`}}
                                className={`relative w-full h-full aspect-[1/1.41] group ${props.pageContainerClassName ?? ''}`}>
                                <div
                                    className='absolute flex items-center justify-center right-1/2 translate-x-1/2 -translate-y-1/2 rounded-full top-0 p-2 size-8 text-md bg-gray-200 group-hover:bg-blue-300 transition-all text-white z-10'>{pageNo + 1}</div>
                                <div
                                    className='absolute group-last-of-type:hidden right-0 bottom-0 translate-x-full -translate-y-1/2 p-2 size-8 text-xl md:text-5xl z-10'>,
                                </div>
                                <Page
                                    className={`!bg-gray-100 group-hover:!bg-blue-300 transition-all p-2 rounded-md ${props.pageClassName ?? ''}`}
                                    pageNumber={pageNo + 1}/>
                            </div>)}
                        </DragDrop>
                    }
                </Document>
            </div>}
        </CardContent>
    </Card>
}