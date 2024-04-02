import {Button, FormControl, FormControlLabel, FormGroup, FormLabel, Radio, RadioGroup, TextField} from "@mui/material";
import * as React from "react";
import {ChangeEvent, useEffect, useState} from "react";
import {SplitOptions, SplitType} from "@/app/_models/split-options";


export function SplitForm(props: {
    className?: string,
    initState: SplitOptions,
    onChange: (data: SplitOptions) => void
}) {
    const [state, setState] = useState<SplitOptions>(props.initState)

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
        <FormControl className='flex !flex-row items-center gap-16'>
            <FormLabel id="split-type-radio-group">Split type</FormLabel>
            <RadioGroup
                onChange={(e: ChangeEvent<HTMLInputElement>) => setState(st => ({
                    ...st,
                    type: e.target.value as SplitType
                }))}
                className='flex !flex-row gap-4'
                aria-labelledby="direction-radio-group"
                defaultValue={SplitType.FIXED_RANGE}
                value={state.type}
                name="split-type-radio-buttons-group"
            >
                <FormControlLabel value={SplitType.SPLIT_BY_RANGE} control={<Radio/>} label={SplitType.SPLIT_BY_RANGE}/>
                <FormControlLabel value={SplitType.FIXED_RANGE} control={<Radio/>} label={SplitType.FIXED_RANGE}/>
                <FormControlLabel value={SplitType.EXTRACT_ALL_PAGES} control={<Radio/>}
                                  label={SplitType.EXTRACT_ALL_PAGES}/>
                <FormControlLabel value={SplitType.DELETE_PAGES} control={<Radio/>} label={SplitType.DELETE_PAGES}/>
            </RadioGroup>
        </FormControl>
        {state.type===SplitType.FIXED_RANGE && <FormControl>
            <TextField type='number' label='Fixed' error={!state.fixed}
                       onChange={(e: ChangeEvent<HTMLInputElement>) => setState(state => ({
                           ...state,
                           fixed: +e.target.value
                       }))}
                       id='split-by-fix' value={state.fixed}/>
        </FormControl>}
        {![SplitType.EXTRACT_ALL_PAGES,SplitType.FIXED_RANGE].includes(state.type) && <FormGroup>
            <Button onClick={() => setState(st => ({...st, ranges: [...st.ranges, {from: 0, to: 0}]}))}>Add
                Range</Button>
            <div className='flex flex-col gap-2'>
                {state.ranges.map(range => <div
                    className='flex gap-2 p-2 border border-dashed border-gray-200 rounded-md'>
                    <TextField type='number' label='From' error={!range.from}
                               onChange={(e: ChangeEvent<HTMLInputElement>) => setState(state => ({
                                   ...state,
                                   fixed: +e.target.value
                               }))}
                               id='range-from' value={range.from}/>
                    <TextField type='number' label='To' error={!range.to}
                               onChange={(e: ChangeEvent<HTMLInputElement>) => setState(state => ({
                                   ...state,
                                   fixed: +e.target.value
                               }))}
                               id='range-to' value={range.to}/>
                </div>)}
            </div>
        </FormGroup>}
    </form>
}