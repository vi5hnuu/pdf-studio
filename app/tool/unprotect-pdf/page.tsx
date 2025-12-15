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
import {ProgressStepper} from "@/app/_components/progress-stepper";
import {NextPrevActions} from "@/app/_components/next-prev-actions";

const initOptionsState: UnprotectOptions = {out_file_name: '', password: ''};

export interface FileData {
    id: string,
    file: File
}

export default function Home() {
    const [activeStep, setActiveStep] = useState(0);
    const [file, setFile] = useState<FileData | null>(null);
    const [options, setOptions] = useState<UnprotectOptions>(initOptionsState);
    const accept = ['application/pdf'];

    function handleFile(e: ChangeEvent<HTMLInputElement>) {
        let newFiles = Object.values(e.target.files ?? {}) as File[];
        if (!newFiles.length || newFiles.length > 1) return;
        setFile({id: generateId(32, 'FILE_'), file: newFiles[0]});
    }

    function onFormDataChange(data: UnprotectOptions) {
        setOptions(data);
    }

    const steps = [
        'Select File',
        'Modify Options',
        'UnProtect File',
    ];

    return (
        <>
            <div className='h-fit flex-1 relative rounded-md w-full flex flex-col'>
                <NextPrevActions className={'sticky right-0 top-4 w-min ml-auto'} onPrev={() => setActiveStep(lA => lA - 1)}
                                 onNext={() => setActiveStep(lA => lA + 1)}
                                 prevDisabled={activeStep === 0}
                                 nextDisabled={activeStep === 2 || !file || (activeStep === 1 && (!options.out_file_name.length || !options.password.length))}></NextPrevActions>
                <CardContent className='flex flex-col gap-16 md:m-4 lg:m-8 mt-6'>
                    <ProgressStepper steps={steps} activeStepIndex={activeStep}></ProgressStepper>
                    <div className='flex-1 max-w-7xl mx-auto flex flex-col items-center w-full !shadow-none'>
                        {activeStep == 0 && <div className='w-full'>
                            <div className='relative w-full mx-auto mb-8'>
                                <ChooseFiles single={true} accept={accept} onChange={handleFile}/>
                            </div>
                            <div className='flex-1 text-white font-thin grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 rounded-md bg-gray-800 gap-4 md:gap-6 p-6 max-h-[25rem] overflow-auto'>
                                {!file && <div className='col-span-4 text-center text-xl'>Select file</div>}
                                {file &&
                                    <div className='col-span-4 text-center text-xl'>Selected {file.file.name}</div>}
                            </div>
                        </div>}
                        {activeStep == 1 && <div className={`w-full`}>
                            <UnprotectForm className={`mx-auto mb-8`} initState={initOptionsState}
                                           onChange={onFormDataChange}/>
                        </div>}
                        {activeStep == 2 && <UnprotectProgress options={options} file={file!}/>}
                    </div>
                </CardContent>
            </div>
        </>
    );
}
