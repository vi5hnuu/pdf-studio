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
import {ProgressStepper} from "@/app/_components/progress-stepper";
import {NextPrevActions} from "@/app/_components/next-prev-actions";

export interface FileData {
    id: string,
    file: File
};
export default function Home() {
    const [jumpReorder, setJumpReorder] = useState<boolean>(true);
    const [replace, setReplace] = useState<boolean>(false);
    const [activeStep, setActiveStep] = useState(0);
    const [files, setFiles] = useState<FileData[]>([]);
    const accept = ['application/pdf'];

    function handleFiles(e: ChangeEvent<HTMLInputElement>) {
        let newFiles = Object.values(e.target.files ?? {}) as File[];
        if (!newFiles.length) return;
        const newFilesData = newFiles.map(f => ({id: generateId(32, 'FILE_'), file: f} as FileData))
        setFiles(fs => replace ? newFilesData : fs.concat(newFilesData));
    }

    const steps = [
        'Select Files',
        'Re-arrange files order',
        'Merge files',
    ];

    function onReorder(pPos: number, curPos: number) {
        setFiles(fs => {
            const newOrder = [...fs];
            if (jumpReorder) {
                swapItem(newOrder, pPos, curPos);
                return newOrder;
            }
            for (let fNo = pPos; fNo < curPos; fNo++) {
                swapItem(newOrder, fNo, fNo + 1);
            }
            for (let fNo = pPos; fNo > curPos; fNo--) {
                swapItem(newOrder, fNo, fNo - 1);
            }
            return newOrder;
        })
    }

    return (
        <>
            <Card style={{height:files.length ? 'fit-content':'auto'}} className='flex-1 relative pt-16 rounded-md !shadow-lg w-full flex flex-col'>
                <NextPrevActions onPrev={() => setActiveStep(lA => lA - 1)}
                                 onNext={() => setActiveStep(lA => lA + 1)}
                                 prevDisabled={activeStep === 0}
                                 nextDisabled={activeStep === 2 || files.length <= 1}></NextPrevActions>
                <CardContent className='flex flex-col gap-16 md:m-4 lg:m-8 mt-6'>
                    <ProgressStepper steps={steps} activeStepIndex={activeStep}></ProgressStepper>
                    <div className='flex-1 max-w-7xl mx-auto flex flex-col items-center w-full !shadow-none'>
                        {activeStep == 0 && <div className='w-full'>
                            <div className='relative w-full mx-auto mb-8'>
                                <ChooseFiles accept={accept} onChange={handleFiles}/>
                                <div className='flex gap-4 absolute right-0 -top-0 -translate-y-[120%]'>
                                    <input checked={replace}
                                           onChange={(e: ChangeEvent<HTMLInputElement>) => setReplace(e.target.checked)}
                                           id='replace-files' type="checkbox"/>
                                    <label htmlFor='replace-files'>replace</label>
                                </div>
                            </div>
                            <div
                                className='flex-1 text-white font-thin grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 rounded-md bg-gray-800 gap-4 md:gap-6 p-6 max-h-[45rem] overflow-auto'>
                                {!files.length &&
                                    <div className='col-span-4 text-center text-xl'>Select some files</div>}
                                {files.map((fd, index) => <PdfView
                                    className='m-auto hover:scale-[1.01] aspect-[1/1.41] z-50 transition-all duration-1000'
                                    key={fd.id} file={fd.file}/>)}
                            </div>
                        </div>}
                        {activeStep == 1 && <div className='w-full'>
                            <div className='flex gap-4 items-center justify-center'>
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
                            <DragDrop onUpdateItemsOrder={onReorder}>
                                {files.map((fd, index) => <PdfView
                                    className='m-auto hover:scale-105 z-50 aspect-[1/1.41] transition-all duration-1000'
                                    key={fd.id} file={fd.file}/>)}
                            </DragDrop>
                        </div>}
                        {activeStep == 2 && <MergeProgress files={files}/>}
                    </div>
                </CardContent>
            </Card>
        </>
    );
}
