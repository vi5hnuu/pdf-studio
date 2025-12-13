import {
    FormControl,
    FormControlLabel,
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


const fonts = [Font.TIMES_ROMAN, Font.TIMES_BOLD, Font.TIMES_ITALIC, Font.TIMES_BOLD_ITALIC, Font.HELVETICA, Font.HELVETICA_BOLD, Font.HELVETICA_OBLIQUE, Font.HELVETICA_BOLD_OBLIQUE, Font.COURIER, Font.COURIER_OBLIQUE, Font.COURIER_BOLD, Font.COURIER_BOLD_OBLIQUE, Font.SYMBOL, Font.ZAPF_DINGBATS]

export function PageNumbersForm(props: {
    className?: string,
    initState: PageNumbersOptions,
    onChange: (data: PageNumbersOptions) => void
}) {
    const [state, setState] = useState<PageNumbersOptions>(props.initState)

    useEffect(() => props.onChange(state), [state]);

    return <form className={`flex flex-col w-full md:w-7/12 gap-6 ${props.className ?? ''}`}>
        <FormControl>
            <TextField label='Output file name' error={!state.out_file_name}
                       onChange={(e: ChangeEvent<HTMLInputElement>) => setState(state=>({...state,out_file_name:e.target.value?.trim() ?? ''}))}
                       id='out-file-name' value={state.out_file_name}/>
        </FormControl>
        <FormControl className='flex !flex-row gap-16 items-center'>
            <FormLabel id="page-no-type-radio-group">Page no design</FormLabel>
            <RadioGroup
                onChange={(e: ChangeEvent<HTMLInputElement>) => setState(state=>({...state,page_no_type:e.target.value}))}
                className='flex !flex-row gap-4'
                aria-labelledby="page-no-type-radio-group"
                defaultValue="ONLY_X"
                value={state.page_no_type}
                name="page-no-type-radio-buttons-group"
            >
                <FormControlLabel value="ONLY_X" control={<Radio/>} label="X"/>
                <FormControlLabel value="PAGE_X_OF_Y" control={<Radio/>} label="Page X of Y"/>
                <FormControlLabel value="PAGE_X" control={<Radio/>} label="page X"/>
            </RadioGroup>
        </FormControl>
        <FormControl className='flex !flex-row gap-16'>
            <FormLabel id="font-size">Font size</FormLabel>
            <TextField onChange={(e: ChangeEvent<HTMLInputElement>) => setState(state=>({...state,size:+e.target.value?.trim() ?? 0}))}
                       value={state.size} defaultValue={0}/>
        </FormControl>
        <FormControl className='flex !flex-row gap-16 items-center'>
            <FormLabel id="horizontal-position-radio-group">Horizontal Position</FormLabel>
            <RadioGroup
                onChange={(e: ChangeEvent<HTMLInputElement>) => setState(state=>({...state,horizontal_position:e.target.value}))}
                className='flex !flex-row gap-4'
                aria-labelledby="horizontal-position-radio-group"
                defaultValue="END"
                value={state.horizontal_position}
                name="horizontal-position-radio-buttons-group"
            >
                <FormControlLabel value="START" control={<Radio/>} label="start"/>
                <FormControlLabel value="CENTER" control={<Radio/>} label="center"/>
                <FormControlLabel value="END" control={<Radio/>} label="end"/>
            </RadioGroup>
        </FormControl>
        <FormControl className='flex !flex-row gap-16 items-center'>
            <FormLabel id="vertical-position-radio-group">Vertical Position</FormLabel>
            <RadioGroup
                onChange={(e: ChangeEvent<HTMLInputElement>) => setState(state=>({...state,vertical_position:e.target.value}))}
                className='flex !flex-row gap-4'
                aria-labelledby="vertical-position-radio-group"
                defaultValue="END"
                value={state.vertical_position}
                name="vertical-position-radio-buttons-group"
            >
                <FormControlLabel value="START" control={<Radio/>} label="start"/>
                <FormControlLabel value="CENTER" control={<Radio/>} label="center"/>
                <FormControlLabel value="END" control={<Radio/>} label="end"/>
            </RadioGroup>
        </FormControl>
        <FormControl className='flex !flex-row gap-16'>
            <FormLabel id="padding">Padding</FormLabel>
            <TextField className='!min-w-16' type='number' onChange={(e: ChangeEvent<HTMLInputElement>) => setState(state=>({...state,padding:{...state.padding,top:+e.target.value}}))}
                       value={state.padding?.top ?? 0} defaultValue={0}/>
            <TextField className='!min-w-16' type='number' onChange={(e: ChangeEvent<HTMLInputElement>) => setState(state=>({...state,padding:{...state.padding,right:+e.target.value}}))}
                       value={state.padding?.right ?? 0} defaultValue={0}/>
            <TextField className='!min-w-16' type='number' onChange={(e: ChangeEvent<HTMLInputElement>) => setState(state=>({...state,padding:{...state.padding,bottom:+e.target.value}}))}
                       value={state.padding?.bottom ?? 0} defaultValue={0}/>
            <TextField className='!min-w-16' type='number' onChange={(e: ChangeEvent<HTMLInputElement>) => setState(state=>({...state,padding:{...state.padding,left:+e.target.value}}))}
                       value={state.padding?.left ?? 0} defaultValue={0}/>
        </FormControl>
        <FormControl className='flex !flex-row gap-16'>
            <FormLabel id="color">Fill Color</FormLabel>
            <TextField type='color'
                       className='!min-w-16'
                       onChange={(e: ChangeEvent<HTMLInputElement>) =>setState(state=>({...state,fill_color:hexToRGBA(e.target.value)}))}
                        defaultValue={'#000000'}/>
        </FormControl>
        <FormControl className='flex !flex-row gap-16'>
            <FormLabel id="from-page">From page no</FormLabel>
            <TextField type='number'
                       onChange={(e: ChangeEvent<HTMLInputElement>) => setState(state=>({...state,from_page:+e.target.value}))}
                       value={state.from_page} defaultValue={0}/>
        </FormControl>
        <FormControl className='flex !flex-row gap-16'>
            <FormLabel id="to-page">To page</FormLabel>
            <TextField type='number'
                       onChange={(e: ChangeEvent<HTMLInputElement>) => setState(state=>({...state,to_page:+e.target.value}))}
                       value={state.to_page}/>
        </FormControl>
        <FormControl className='flex !flex-row gap-16'>
            <FormLabel id="text-font">Font</FormLabel>
            <Select
                id="font-select"
                value={state.font_name}
                onChange={(e: SelectChangeEvent<any>)=>setState(state=>({...state,font_name:e.target.value as Font}))}
            >
                {fonts.map((font,i) => <MenuItem key={i} value={font}>{font}</MenuItem>)}
            </Select>
        </FormControl>
    </form>
}