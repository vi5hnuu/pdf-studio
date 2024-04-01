import {ToolsApi} from "@/app/_utils/api";
import {Button, LinearProgress, TextField} from "@mui/material";
import * as React from "react";
import {ChangeEvent, useState} from "react";
import {FileData} from "@/app/tool/merge-pdf/page";
import {Pdf2JpgOptions} from "@/app/_models/pdf-to-jpg-options";
import {PageNumbersOptions} from "@/app/_models/page-numbers-options";
import {ProtectOptions} from "@/app/_models/protect-options";
import {UnprotectOptions} from "@/app/_models/unprotect-options";

enum MergeStep {
    NONE = 'none',
    UPLOAD = "upload",
    PROCESS = 'process',
    DOWNLOAD = 'download'
}

export function UnprotectProgress({file,options}: { file: FileData,options:UnprotectOptions }) {
    const [step, setStep] = useState<MergeStep>(MergeStep.NONE)
    const [progress, setProgress] = useState(0);
    const [req, setReq] = useState<XMLHttpRequest | null>(null);
    const [error, setError] = useState<string | null>(null)

    async function startUnProtect() {
        req?.abort();

        const formData = new FormData();
        formData.append("unprotect-pdf-info", new Blob([JSON.stringify(options)], {type: 'application/json'}))
        formData.append('file', file.file);

        const xhr = new XMLHttpRequest();

        //save req
        setReq(xhr);
        setError(null);

        xhr.open('POST', ToolsApi.unprotectPdf, true);
        xhr.responseType = 'blob';
        xhr.onprogress = (event) => {
            if (!event.lengthComputable) return;
            step !== MergeStep.DOWNLOAD && setStep(MergeStep.DOWNLOAD);
            const percentComplete = (event.loaded / event.total) * 100;
            if (percentComplete >= 100) setStep(MergeStep.NONE);
            setProgress(percentComplete);
        }
        xhr.upload.addEventListener('progress', (event) => {
            if (!event.lengthComputable) return;
            step !== MergeStep.UPLOAD && setStep(MergeStep.UPLOAD);
            const percentComplete = (event.loaded / event.total) * 100;
            if (percentComplete >= 100) setStep(MergeStep.PROCESS);
            setProgress(percentComplete);
        });
        xhr.onload = async () => {
            if (xhr.status !== 200) {
                setError("Failed to unprotect file");
                setStep(MergeStep.NONE)
                console.error('Failed to unprotect file:', xhr.status, xhr.statusText);
                return;
            }
            const disposition = xhr.getResponseHeader('Content-Disposition') ?? '';
            const filename = disposition.split('filename=', 2)[1] ?? 'unprotected.pdf';

            const url = URL.createObjectURL(xhr.response);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            a.click();
            URL.revokeObjectURL(url);
        }
        xhr.onerror = () => {
            setError("Failed to unprotect file");
            setStep(MergeStep.NONE)
            console.error('Failed to unprotect file:', xhr.status, xhr.statusText);
        };
        xhr.onabort = () => {
            console.error('req aborted');
        };
        xhr.send(formData);
    }

    return <div className='w-full flex flex-col items-center justify-center md:w-3/4'>
        {[MergeStep.UPLOAD, MergeStep.DOWNLOAD].includes(step) &&
            <LinearProgress className='w-full' variant="determinate" value={progress}/>}
        {MergeStep.PROCESS === step && <LinearProgress className='w-full' variant="indeterminate"/>}
        {error && <div className='w-full text-center mb-6 text-red-500 font-medium'>{error}</div>}
        {step == MergeStep.NONE && <div className='flex flex-col items-center justify-center gap-6'>
            <Button className='mx-auto !rounded-full !bg-blue-50 hover:!bg-blue-100 !px-6 !py-3'
                    onClick={startUnProtect}>UnProtect</Button>
        </div>}
    </div>
}