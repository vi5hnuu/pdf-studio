"use client";

import {ChangeEvent, useState} from "react";
import {Button, Card, CardActions, CardContent, Divider, Icon, TextField} from "@mui/material";
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
import {generateId} from "@/app/_utils/constants";
import {PdfToJpgProgress} from "@/app/tool/pdf-to-jpg/pdf-to-jpg-progress";
import {Pdf2jpgForm} from "@/app/tool/pdf-to-jpg/pdf2jpg-form";
import {Pdf2JpgOptions} from "@/app/_models/pdf-to-jpg-options";

const initOptionsState = {fileName: '', compression: 'LOW', direction: 'VERTICAL', pageGap: 0, single: true};
export interface FileData{ id:string,file: File }
export default function Home() {
    const [activeStep, setActiveStep] = useState(0);
    const [file, setFile] = useState<FileData|null>(null);
    const [options, setOptions] = useState<Pdf2JpgOptions>(initOptionsState);
    const accept = ['application/pdf'];

    function handleFile(e: ChangeEvent<HTMLInputElement>) {
        let newFiles = Object.values(e.target.files ?? {}) as File[];
        if(!newFiles.length || newFiles.length>1) return;
        setFile({id:generateId(32,'FILE_'),file:newFiles[0]});
    }

    function onFormDataChange(data:Pdf2JpgOptions){
        setOptions(data);
    }

    const steps = [
        'Select File',
        'Modify Options',
        'Convert to Jpg',
    ];

    return (
        <>
            <main className="w-full flex flex-col justify-center items-center">
                <Card className='relative pt-16 !shadow-none w-full'>
                    <CardActions className='absolute m-4 flex gap-1 !p-0 bg-gray-100 overflow-hidden rounded-full top-0 right-0'>
                        <Button onClick={()=>setActiveStep(lA=>lA-1)} className='!py-3' disabled={activeStep===0}>
                            <NavigateBeforeIcon/>
                            <span>
                                Previous
                            </span>
                        </Button>
                        <Button onClick={()=>setActiveStep(lA=>lA+1)} className='!py-3'  disabled={activeStep===2 || !file}>
                            <span>
                                Next
                            </span>
                            <NavigateNextIcon/>
                        </Button>
                    </CardActions>
                    <CardContent className='flex flex-col gap-16 m-8'>
                        <Stepper activeStep={activeStep} alternativeLabel>
                            {steps.map((label) => (
                                <Step key={label}>
                                    <StepLabel>{label}</StepLabel>
                                </Step>
                            ))}
                        </Stepper>
                        <div className='flex flex-col items-center w-full !shadow-none'>
                            {activeStep == 0 && <div className='w-full'>
                                <div className='relative w-full md:w-1/2 mx-auto mb-8'>
                                    <ChooseFiles single={true} accept={accept} onChange={handleFile}/>
                                </div>
                                <div className='grid grid-cols-1 rounded-xl p-6'>
                                    {!file && <div className='col-span-4 text-center text-xl font-mono'>Select file</div>}
                                    {file && <PdfView className='m-auto !w-52 aspect-[1/1.41] hover:scale-105 z-50 transition-all duration-1000' key={file.id} file={file.file}/>}
                                </div>
                            </div>}
                            {activeStep == 1 && <div className={`w-full grid grid-cols-2`}>
                                <Pdf2jpgForm className={`mx-auto mb-8 ${options.single && options.direction==='VERTICAL' ? 'col-span-1':'col-span-2'}`}  initState={initOptionsState} onChange={onFormDataChange}/>
                                {/*<div className='!mb-4 h-0.5 border-dashed w-3/4 border-b-2 border-gray-400 mx-auto' />*/}
                                <PdfView showAllPages={options.single ? (options.direction==='HORIZONTAL' ? 'spread-horizontal' : 'spread-vertical'):'grid'} pageClassName='aspect-[1/1.41]' className={`mx-auto ${options.single && options.direction==='VERTICAL' ? 'col-span-1 max-h-[52rem]':'col-span-2'}`} file={file!.file}/>
                            </div>}
                            {activeStep == 2 && <PdfToJpgProgress options={options} file={file!}/>}
                        </div>
                    </CardContent>
                </Card>
            </main>
        </>
    );
}
