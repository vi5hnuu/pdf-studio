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
import {ProgressStepper} from "@/app/_components/progress-stepper";
import {NextPrevActions} from "@/app/_components/next-prev-actions";

const initOptionsState: ProtectOptions = {
    out_file_name: 'protected-file',
    owner_password: '',
    user_password: '',
    userAccess_permissions: new Set<UserPermission>()
};

export interface FileData {
    id: string,
    file: File
}

export default function Home() {
    const [activeStep, setActiveStep] = useState(0);
    const [file, setFile] = useState<FileData | null>(null);
    const [options, setOptions] = useState<ProtectOptions>(initOptionsState);
    const accept = ['application/pdf'];

    function handleFile(e: ChangeEvent<HTMLInputElement>) {
        let newFiles = Object.values(e.target.files ?? {}) as File[];
        if (!newFiles.length || newFiles.length > 1) return;
        setFile({id: generateId(32, 'FILE_'), file: newFiles[0]});
    }

    function onFormDataChange(data: ProtectOptions) {
        setOptions(data);
    }

    const steps = [
        'Select File',
        'Modify Options',
        'Protect File',
    ];

    return (
        <>
            <Card style={{height:file ? 'fit-content':'auto'}} className='flex-1 relative pt-16 rounded-md !shadow-lg w-full flex flex-col'>
                <NextPrevActions onPrev={() => setActiveStep(lA => lA - 1)}
                                 onNext={() => setActiveStep(lA => lA + 1)}
                                 prevDisabled={activeStep === 0}
                                 nextDisabled={activeStep === 2 || !file || (activeStep === 1 && !options.out_file_name.length)}></NextPrevActions>
                <CardContent className='flex flex-col gap-16 md:m-4 lg:m-8 mt-6'>
                    <ProgressStepper steps={steps} activeStepIndex={activeStep}></ProgressStepper>
                    <div className='flex-1 max-w-7xl mx-auto flex flex-col items-center w-full !shadow-none'>
                        {activeStep == 0 && <div className='w-full'>
                            <div className='relative w-full mx-auto mb-8'>
                                <ChooseFiles single={true} accept={accept} onChange={handleFile}/>
                            </div>
                            <div className='flex-1 text-white font-thin grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 rounded-md bg-gray-800 gap-4 md:gap-6 p-6 max-h-[25rem] overflow-auto'>
                                {!file && <div className='col-span-4 text-center text-xl'>Select file</div>}
                                {file && <PdfView
                                    className='m-auto !w-52 aspect-[1/1.41] hover:scale-105 z-50 transition-all duration-1000'
                                    key={file.id} file={file.file}/>}
                            </div>
                        </div>}
                        {activeStep == 1 && <div className={`w-full`}>
                            <ProtectForm className={`mx-auto mb-8`} initState={initOptionsState}
                                         onChange={onFormDataChange}/>
                        </div>}
                        {activeStep == 2 && <ProtectProgress options={options} file={file!}/>}
                    </div>
                </CardContent>
            </Card>
        </>
    );
}
