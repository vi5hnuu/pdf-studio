"use client";

import * as React from "react";
import {ChangeEvent, useState} from "react";
import {Button, Card, CardActions, CardContent} from "@mui/material";
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import {ChooseFiles} from "@/app/_components/choose_files";
import {PdfView} from "@/app/_components/pdf-view";
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import {generateId} from "@/app/_utils/constants";
import {SplitProgress} from "@/app/tool/split-pdf/split-progress";
import {SplitOptions, SplitType} from "@/app/_models/split-options";
import {SplitForm} from "@/app/tool/split-pdf/split-form";

const initOptionsState:SplitOptions = {out_file_name:'',type:SplitType.FIXED_RANGE,fixed:2,ranges:[]};
export interface FileData{ id:string,file: File }
export default function Home() {
    const [activeStep, setActiveStep] = useState(0);
    const [file, setFile] = useState<FileData|null>(null);
    const [options, setOptions] = useState<SplitOptions>(initOptionsState);
    const accept = ['application/pdf'];

    function handleFile(e: ChangeEvent<HTMLInputElement>) {
        let newFiles = Object.values(e.target.files ?? {}) as File[];
        if(!newFiles.length || newFiles.length>1) return;
        setFile({id:generateId(32,'FILE_'),file:newFiles[0]});
    }

    function onFormDataChange(data:SplitOptions){
        setOptions(data);
    }

    const steps = [
        'Select File',
        'Modify Options',
        'Split',
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
                            {activeStep == 1 && <div className={`relative w-full grid grid-cols-2`}>
                                <div className='absolute right-0 top-0 -translate-y-full'>{options.type===SplitType.DELETE_PAGES ? 'Pdf' : 'zip'} will be generated.</div>
                                <SplitForm className={`mx-auto mb-8`}  initState={initOptionsState} onChange={onFormDataChange}/>
                                <PdfView showAllPages={options.type===SplitType.EXTRACT_ALL_PAGES ? 'grid':'range'} pageClassName='aspect-[1/1.41]' className={`mx-auto max-h-[52rem]`} file={file!.file}/>
                            </div>}
                            {activeStep == 2 && <SplitProgress options={options} file={file!}/>}
                        </div>
                    </CardContent>
                </Card>
            </main>
        </>
    );
}
