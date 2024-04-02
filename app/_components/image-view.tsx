import {BottomNavigation, Button, Card, CardContent, Icon} from "@mui/material";
import {Document, Page} from "react-pdf";
import * as React from "react";
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import {useEffect, useState} from "react";
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
import Image from "next/image";

export interface ImageViewInfo {
    className?: string,
    style?: React.CSSProperties,
    file: File,
    pageClassName?: string,
}

export function ImageView(props: ImageViewInfo) {
    const [url,setUrl]=useState<string|null>(null);

    useEffect(()=>{
        const url=URL.createObjectURL(props.file);
        setUrl(url)
        return ()=>URL.revokeObjectURL(url);
    },[props.file])

    return <div className='w-full h-full'>
        {url && <img className='w-full aspect-auto' src={url} alt={props.file.name}/>}
    </div>
}