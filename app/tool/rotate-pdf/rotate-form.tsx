import {
    Button, Checkbox,
    FormControl,
    FormControlLabel, FormGroup,
    FormLabel,
    MenuItem,
    Radio,
    RadioGroup, Select, SelectChangeEvent,
    TextField
} from "@mui/material";
import {ChangeEvent, useEffect, useReducer, useState} from "react";
import * as React from "react";
import {Font, hexToRGBA} from "@/app/_utils/constants";
import {PageNumbersOptions} from "@/app/_models/page-numbers-options";
import {RotateOptions} from "@/app/_models/rotate-options";


const fonts = [Font.TIMES_ROMAN, Font.TIMES_BOLD, Font.TIMES_ITALIC, Font.TIMES_BOLD_ITALIC, Font.HELVETICA, Font.HELVETICA_BOLD, Font.HELVETICA_OBLIQUE, Font.HELVETICA_BOLD_OBLIQUE, Font.COURIER, Font.COURIER_OBLIQUE, Font.COURIER_BOLD, Font.COURIER_BOLD_OBLIQUE, Font.SYMBOL, Font.ZAPF_DINGBATS]

export function RotateForm(props: {
    className?: string,
    initState: RotateOptions,
    onChange: (data: RotateOptions) => void
}) {
    const [state, setState] = useState<RotateOptions>(props.initState)

    useEffect(() => props.onChange(state), [state]);

    return <form className={`flex flex-col w-full md:w-7/12 gap-6 ${props.className ?? ''}`}>
        <FormControl>
            <TextField label='Output file name' error={!state.out_file_name}
                       onChange={(e: ChangeEvent<HTMLInputElement>) => setState(state => ({
                           ...state,
                           out_file_name: e.target.value?.trim() ?? ''
                       }))}
                       id='out-file-name' value={state.out_file_name}/>
        </FormControl>
        <FormControlLabel control={ <Checkbox
            onChange={(e: ChangeEvent<HTMLInputElement>) => setState(state => ({
                ...state,
                maintain_ratio: e.target.checked
            }))}
            id='mar' checked={state.maintain_ratio}/>} label='Maintain Aspect Ratio'/>
        <FormControl>
            <TextField type='number' label='File angle ( Master Angle )'
                       onChange={(e: ChangeEvent<HTMLInputElement>) => setState(state => ({
                           ...state,
                           file_angle: +e.target.value
                       }))}
                       id='out-file-name' value={state.file_angle}/>
        </FormControl>
        <FormGroup className='!grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
            {[...state.page_angles.entries()].map(entry => <FormControl>
                <TextField type='number' label={`Page ( ${+entry[0] + 1} )`}
                           onChange={(e: ChangeEvent<HTMLInputElement>) => setState(st => {
                               const newAngles=new Map(st.page_angles.entries());
                               newAngles.set(+entry[0],+e.target.value)
                               return {...st, page_angles: newAngles}
                           })}
                           id={`page-${entry[0]}`} value={entry[1]}/>
            </FormControl>)}
            <Button onClick={()=>setState(st=>{
                const newAngles=new Map(st.page_angles.entries());
                newAngles.set(newAngles.size,0);
                return {...st,page_angles:newAngles};
            })}>Add Page angle</Button>
        </FormGroup>
    </form>
}