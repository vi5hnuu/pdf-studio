import {BottomNavigation, Button, Card, CardContent, Icon} from "@mui/material";
import {Document, Page} from "react-pdf";
import * as React from "react";
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import {useState} from "react";
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

export interface PdfViewInfo {
    className?: string,
    style?: React.CSSProperties,
    file: File,
    showAllPages?: 'grid' | 'spread-horizontal' | 'spread-vertical',
    pageClassName?: string,
}

export function PdfView(props: PdfViewInfo) {
    const [totalPages, setTotalPages] = useState<number | null>(null)
    const [activePage, setActivePage] = useState<number>(1)

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

    return <Card className={`w-full h-full ${props.className ?? ''}`} style={props.style}>
        <CardContent className='relative h-full w-full !p-8'>
            <Document
                className={`w-full h-full pdf-cover-parent hide-text-layer hide-annotation-layer ${props.showAllPages === 'grid' ? 'overflow-visible grid grid-cols-4 gap-6' : (props.showAllPages === 'spread-horizontal' ? 'flex gap-6 p-4 overflow-x-scroll' : 'flex p-4 flex-col gap-12 overflow-y-scroll')}`}
                file={props.file} onLoadSuccess={onDocumentLoad}>
                {!props.showAllPages && <Page className={props.pageClassName} pageNumber={activePage}/>}
                {props.showAllPages && Array.from({length: totalPages || 1}).map((_, index) => <div
                    className='relative w-full h-full group'>
                    <div
                        className='absolute flex items-center justify-center right-1/2 translate-x-1/2 -translate-y-1/2 rounded-full top-0 p-2 size-8 text-md bg-gray-200 group-hover:bg-blue-300 transition-all text-white z-10'>{index + 1}</div>
                    {props.showAllPages === 'grid' && <div
                        className='absolute group-last-of-type:hidden right-0 bottom-0 translate-x-full -translate-y-1/2 p-2 size-8 text-xl md:text-5xl z-10'>,</div>}
                    {props.showAllPages !== 'grid' && <div
                        className={`absolute group-last-of-type:hidden ${props.showAllPages==='spread-horizontal'? '-right-2 bottom-1/2 translate-x-1/2 translate-y-1/2':'right-1/2 translate-x-1/2 -bottom-6'} p-2 size-8 text-xl md:text-3xl z-10`}>{props.showAllPages==='spread-horizontal' ? <ArrowRight/> :<ArrowDropDown/>}</div>}
                    <Page
                        className={`${props.showAllPages ? '!bg-gray-100 group-hover:!bg-blue-300 transition-all p-2 rounded-md' : ''} ${props.showAllPages === 'spread-horizontal' ? '!w-24 md:!w-52 aspect-[1/1.41]' : ''} ${props.pageClassName ?? ''}`}
                        pageNumber={index + 1}/>
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