import {Button, Card, CardContent, Icon} from "@mui/material";
import {Document, Page} from "react-pdf";
import * as React from "react";
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import {useState} from "react";
import {DocumentCallback} from "@/node_modules/react-pdf/dist/cjs/shared/types";
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
export interface PdfViewInfo{
    className?:string,
    style?:React.CSSProperties,
    file:File,
    showAllPages?:'scroll-x'|'scroll-y'|'spread-horizontal'|'spread-vertical'
}
export function PdfView(props:PdfViewInfo){
    const [totalPages,setTotalPages]=useState<number|null>(null)
    const [activePage,setActivePage]=useState<number>(1)
    function onShowNextPage(){
        if(totalPages===null) return;
        setActivePage(lActive=>Math.min(lActive+1,totalPages));
    }
    function onShowPrevPage(){
        setActivePage(lActive=>Math.max(lActive-1,1));
    }

    function onDocumentLoad(doc:DocumentCallback){
        setTotalPages(doc.numPages);
    }

    return <Card className={`w-full h-full ${props.className ?? ''}`} style={props.style}>
        <CardContent className='relative h-full w-full'>
            <Document className={`w-full h-full pdf-cover-parent hide-text-layer hide-annotation-layer ${props.showAllPages ? 'overflow-visible grid grid-cols-4 gap-4':''}`} file={props.file} onLoadSuccess={onDocumentLoad}>
                {!props.showAllPages && <Page pageNumber={activePage}/>}
                {props.showAllPages && Array.from({length:totalPages || 1}).map((_,index)=><div className='relative w-full h-full'>
                    <div className='absolute left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full top-0 p-2 size-16 text-md bg-gray-200 text-white z-10'>{index+1}</div>
                    <Page className={`w-64  aspect-[1/1.41] ${props.showAllPages ? '!bg-gray-100 p-2 rounded-md':''}`} pageNumber={index+1}/>
                </div>)}
            </Document>
            {!props.showAllPages && <div
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
        </CardContent>
    </Card>
}