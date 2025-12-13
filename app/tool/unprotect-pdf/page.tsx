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
import {Font, generateId, UserPermission} from "@/app/_utils/constants";
import {PageNumbersForm} from "@/app/tool/page-numbers/page-numbers-form";
import {PageNumbersOptions} from "@/app/_models/page-numbers-options";
import {PagenoProgress} from "@/app/tool/page-numbers/pageno-progress";
import {ProtectOptions} from "@/app/_models/protect-options";
import {ProtectForm} from "@/app/tool/protect-pdf/protect-form";
import {ProtectProgress} from "@/app/tool/protect-pdf/protect-progress";
import {UnprotectOptions} from "@/app/_models/unprotect-options";
import {UnprotectForm} from "@/app/tool/unprotect-pdf/unprotect-form";
import {UnprotectProgress} from "@/app/tool/unprotect-pdf/unprotect-progress";

const initOptionsState:UnprotectOptions = {out_file_name:'',password:''};

export interface FileData{ id:string,file: File }
export default function Home() {
    const [activeStep, setActiveStep] = useState(0);
    const [file, setFile] = useState<FileData|null>(null);
    const [options, setOptions] = useState<UnprotectOptions>(initOptionsState);
    const accept = ['application/pdf'];

    function handleFile(e: ChangeEvent<HTMLInputElement>) {
        let newFiles = Object.values(e.target.files ?? {}) as File[];
        if(!newFiles.length || newFiles.length>1) return;
        setFile({id:generateId(32,'FILE_'),file:newFiles[0]});
    }

    function onFormDataChange(data:UnprotectOptions){
        setOptions(data);
    }

    const steps = [
        'Select File',
        'Modify Options',
        'UnProtect File',
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
                        <Button onClick={()=>setActiveStep(lA=>lA+1)} className='!py-3'  disabled={activeStep===2 || !file || (activeStep===1 && (!options.out_file_name.length || !options.password.length))}>
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
                                    {file && <div className='col-span-4 text-center text-xl font-mono'>Selected {file.file.name}</div>}
                                </div>
                            </div>}
                            {activeStep == 1 && <div className={`w-full`}>
                                <UnprotectForm className={`mx-auto mb-8`}  initState={initOptionsState} onChange={onFormDataChange}/>
                            </div>}
                            {activeStep == 2 && <UnprotectProgress options={options} file={file!}/>}
                        </div>
                    </CardContent>
                </Card>
            </main>
        </>
    );
}
