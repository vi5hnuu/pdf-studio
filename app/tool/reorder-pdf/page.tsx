"use client";

import {ChangeEvent, useState} from "react";
import {Button, Card, CardActions, CardContent, Icon} from "@mui/material";
import * as React from 'react';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import {ChooseFiles} from "@/app/_components/choose_files";
import {PdfView} from "@/app/_components/pdf-view";
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import {DragDrop} from "@/app/_components/drag-drop";
import {MergeProgress} from "@/app/tool/merge-pdf/merge-progress";
import {generateId, swapItem} from "@/app/_utils/constants";
import {ReorderProgress} from "@/app/tool/reorder-pdf/reorder-progress";
import {ProgressStepper} from "@/app/_components/progress-stepper";
import {NextPrevActions} from "@/app/_components/next-prev-actions";

export interface FileData {
    id: string,
    file: File
};
export default function Home() {
    const [activeStep, setActiveStep] = useState(0);
    const [file, setFile] = useState<FileData | null>(null);
    const [pageOrder, setPageOrder] = useState<number[]>([]);
    const accept = ['application/pdf'];

    function handleFile(e: ChangeEvent<HTMLInputElement>) {
        let newFiles = Object.values(e.target.files ?? {}) as File[];
        if (!newFiles.length || newFiles.length > 1) return;
        setFile({id: generateId(32, 'FILE_'), file: newFiles[0]});
    }

    const steps = [
        'Select Files',
        'Re-arrange files pages order',
        'Get Single Pdf',
    ];


    return (
        <>
            <Card style={{height:file ? 'fit-content':'auto'}} className='flex-1 relative pt-16 rounded-md !shadow-lg w-full flex flex-col'>
                <NextPrevActions onPrev={() => setActiveStep(lA => lA - 1)}
                                 onNext={() => setActiveStep(lA => lA + 1)}
                                 prevDisabled={activeStep === 0}
                                 nextDisabled={activeStep === 2 || !file}></NextPrevActions>
                <CardContent className='h-full flex flex-col gap-16 md:m-4 lg:m-8 mt-6'>
                    <ProgressStepper steps={steps} activeStepIndex={activeStep}></ProgressStepper>
                    <div className='flex flex-col items-center w-full h-full !shadow-none'>
                        {activeStep == 0 && <div className='w-full'>
                            <div className='relative w-full mx-auto mb-8'>
                                <ChooseFiles single accept={accept} onChange={handleFile}/>
                            </div>
                            <div className='flex-1 text-white font-thin grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 rounded-md bg-gray-800 gap-4 md:gap-6 p-6 max-h-[25rem] overflow-auto'>
                                {!file && <div className='col-span-4 text-center text-xl'>Select file</div>}
                                {file && <PdfView
                                    className='m-auto hover:scale-105 !w-64 aspect-[1/1.41] z-50 transition-all duration-1000'
                                    key={file.id} file={file.file}/>}
                            </div>
                        </div>}
                        {activeStep == 1 && <div className='w-full'>
                            {file && <PdfView
                                allowReordering
                                onOrderUpdate={(order) => setPageOrder(order)}
                                showAllPages={'grid'}
                                className='m-auto z-50 aspect-[1/1.41] transition-all duration-1000'
                                key={file.id} file={file.file}/>}
                        </div>}
                        {activeStep == 2 && <ReorderProgress order={pageOrder} file={file!}/>}
                    </div>
                </CardContent>
            </Card>
        </>
    );
}
