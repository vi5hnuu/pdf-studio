import {Checkbox, FormControl, FormControlLabel, FormLabel, Radio, RadioGroup, TextField} from "@mui/material";
import {ChangeEvent, useEffect, useReducer} from "react";
import * as React from "react";
import {Pdf2JpgOptions} from "@/app/_models/pdf-to-jpg-options";


function reducer(state:Pdf2JpgOptions, action:Action<any>) {
    console.log(state);
    if(action instanceof UpdateFileName){
        return {...state,fileName:action.data};
    }else if(action instanceof UpdateDirection){
        return {...state,direction:action.data};
    }else if(action instanceof UpdatePageGap){
        return {...state,pageGap:action.data};
    }else if(action instanceof UpdateCompression){
        return {...state,compression:action.data};
    }else if(action instanceof UpdateIsSingle){
        return {...state,single:action.data};
    }else {
        throw new Error('invalid action type');
    }
}

class Action<T>{
    type:Pdf2JpgActionTYPE;
    data:T
    constructor(type:Pdf2JpgActionTYPE,data:T) {
        this.type=type;
        this.data=data;
    }
}
class UpdateFileName extends Action<string>{
    constructor(name:string) {
        super(Pdf2JpgActionTYPE.CHANGE_FILENAME,name);
    }
}
class UpdateDirection extends Action<string>{
    constructor(direction:string) {
        super(Pdf2JpgActionTYPE.CHANGE_DIRECTION,direction);
    }
}
class UpdateIsSingle extends Action<boolean>{
    constructor(single:boolean) {
        super(Pdf2JpgActionTYPE.CHANGE_ISSINGLE,single);
    }
}
class UpdateCompression extends Action<string>{
    constructor(compression:string) {
        super(Pdf2JpgActionTYPE.CHANGE_COMPRESSION,compression);
    }
}
class UpdatePageGap extends Action<number>{
    constructor(gap:number) {
        super(Pdf2JpgActionTYPE.CHANGE_PAGEGAP,gap);
    }
}
enum Pdf2JpgActionTYPE{
    CHANGE_FILENAME,
    CHANGE_DIRECTION,
    CHANGE_ISSINGLE,
    CHANGE_COMPRESSION,
    CHANGE_PAGEGAP,
}

export function Pdf2jpgForm(props: { className?:string,initState:Pdf2JpgOptions,onChange:(data:Pdf2JpgOptions)=>void }) {
    const [state, dispatch] = useReducer(reducer, props.initState)

    useEffect(()=>props.onChange(state),[state]);

    return <form className={`flex flex-col w-full md:w-7/12 gap-6 ${props.className??''}`}>
        <FormControl>
            <TextField label='Output file name'  error={!state.fileName} onChange={(e:ChangeEvent<HTMLInputElement>)=>dispatch(new UpdateFileName(e.target.value?.trim()??''))} id='out-file-name' value={state.fileName}/>
        </FormControl>
        <FormControl className='flex !flex-row gap-16 items-center'>
            <FormLabel id="compression-radio-group">Compression Level</FormLabel>
            <RadioGroup
                onChange={(e:ChangeEvent<HTMLInputElement>)=>dispatch(new UpdateCompression(e.target.value?.trim()??''))}
                className='flex !flex-row gap-4'
                aria-labelledby="compression-radio-group"
                defaultValue="LOW"
                value={state.compression}
                name="compression-radio-buttons-group"
            >
                <FormControlLabel value="LOW" control={<Radio/>} label="Low"/>
                <FormControlLabel value="MEDIUM" control={<Radio/>} label="Medium"/>
                <FormControlLabel value="HIGH" control={<Radio/>} label="High"/>
            </RadioGroup>
        </FormControl>
        <FormControl className='flex !flex-row gap-16 items-center'>
            <FormLabel id="join-pages">Single ( join pages to single image )</FormLabel>
            <Checkbox onChange={(e:ChangeEvent<HTMLInputElement>)=>dispatch(new UpdateIsSingle(e.target.checked))}  id='join-pages' value={state.single}/>
        </FormControl>
        <FormControl disabled={!state.single} className='flex !flex-row gap-16'>
            <FormLabel id="page-gapp">Page gap</FormLabel>
            <TextField disabled={!state.single} onChange={(e:ChangeEvent<HTMLInputElement>)=>dispatch(new UpdatePageGap(+e.target.value?.trim() ?? 0))} value={state.pageGap} defaultValue={0}/>
        </FormControl>
        <FormControl disabled={!state.single} className='flex !flex-row items-center gap-16'>
            <FormLabel id="direction-radio-group">Join Direction</FormLabel>
            <RadioGroup
                onChange={(e:ChangeEvent<HTMLInputElement>)=>dispatch(new UpdateDirection(e.target.value ?? 0))}
                className='flex !flex-row gap-4'
                aria-labelledby="direction-radio-group"
                defaultValue="VERTICAL"
                value={state.direction}
                name="direction-radio-buttons-group"
            >
                <FormControlLabel value="VERTICAL" control={<Radio/>} label="Vertical"/>
                <FormControlLabel value="HORIZONTAL" control={<Radio/>} label="Horizontal"/>
            </RadioGroup>
        </FormControl>
    </form>
}