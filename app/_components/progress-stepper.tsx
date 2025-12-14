import {PdfViewInfo} from "@/app/_components/pdf-view";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import Stepper from "@mui/material/Stepper";
import * as React from "react";


export function ProgressStepper({steps,activeStepIndex}:{steps:string[],activeStepIndex:number}) {
    return (<Stepper activeStep={activeStepIndex} alternativeLabel>
        {steps.map((label) => (
            <Step key={label}>
                <StepLabel>{label}</StepLabel>
            </Step>
        ))}
    </Stepper>)
}