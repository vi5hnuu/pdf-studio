"use client";

import * as React from "react";
import {ChangeEvent, useState} from "react";
import {Button, Card, CardActions, CardContent} from "@mui/material";
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import {ChooseFiles} from "@/app/_components/choose_files";
import {PdfView} from "@/app/_components/pdf-view/pdf-view";
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import {Font, generateId} from "@/app/_utils/constants";
import {PageNumbersForm} from "@/app/tool/page-numbers/page-numbers-form";
import {PageNumbersOptions} from "@/app/_models/page-numbers-options";
import {PagenoProgress} from "@/app/tool/page-numbers/pageno-progress";

const initOptionsState:PageNumbersOptions = {size:14,out_file_name:'',fill_color:{r:0,g:0,b:0,a:1},padding:{top:0,right:0,bottom:0,left:0},font_name:Font.HELVETICA,from_page:0,page_no_type:'ONLY_X',horizontal_position:'CENTER',vertical_position:'START'};
export interface FileData{ id:string,file: File }
export default function Home() {
    const [activeStep, setActiveStep] = useState(0);
    const [file, setFile] = useState<FileData|null>(null);
    const [options, setOptions] = useState<PageNumbersOptions>(initOptionsState);
    const accept = ['application/pdf'];

    function handleFile(e: ChangeEvent<HTMLInputElement>) {
        let newFiles = Object.values(e.target.files ?? {}) as File[];
        if(!newFiles.length || newFiles.length>1) return;
        setFile({id:generateId(32,'FILE_'),file:newFiles[0]});
    }

    function onFormDataChange(data:PageNumbersOptions){
        setOptions(data);
    }

    const steps = [
        'Select File',
        'Modify Options',
        'Add Page Numbers',
    ];

    return (
        <>
            <main className="min-h-screen flex flex-col justify-center items-center bg-gray-200 p-8 md:p-24">
                <Card className='relative pt-16 !shadow-none w-full'>
                    <CardActions className='absolute m-4 flex gap-1 !p-0 bg-gray-100 overflow-hidden rounded-full top-0 right-0'>
                        <Button onClick={()=>setActiveStep(lA=>lA-1)} className='!py-3' disabled={activeStep===0}>
                            <NavigateBeforeIcon/>
                            <span>
                                Previous
                            </span>
                        </Button>
                        <Button onClick={()=>setActiveStep(lA=>lA+1)} className='!py-3'  disabled={activeStep===2 || !file || (activeStep===1 && !options.out_file_name.length)}>
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
                            {activeStep == 1 && <div className={`w-full`}>
                                <PageNumbersForm className={`mx-auto mb-8`}  initState={initOptionsState} onChange={onFormDataChange}/>
                            </div>}
                            {activeStep == 2 && <PagenoProgress options={options} file={file!}/>}
                        </div>
                    </CardContent>
                </Card>
            </main>
        </>
    );
}
