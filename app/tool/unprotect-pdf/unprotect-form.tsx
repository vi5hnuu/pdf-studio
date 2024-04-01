import {
    Checkbox,
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
import {Font, hexToRGBA, UserPermission, userPermissions} from "@/app/_utils/constants";
import {PageNumbersOptions} from "@/app/_models/page-numbers-options";
import {ProtectOptions} from "@/app/_models/protect-options";
import {UnprotectOptions} from "@/app/_models/unprotect-options";


export function UnprotectForm(props: {
    className?: string,
    initState: UnprotectOptions,
    onChange: (data: UnprotectOptions) => void
}) {
    const [state, setState] = useState<UnprotectOptions>(props.initState)

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
        <FormControl>
            <TextField label='Password( Master password )' error={!state.password}
                       onChange={(e: ChangeEvent<HTMLInputElement>) => setState(state => ({
                           ...state,
                           password: e.target.value?.trim() ?? ''
                       }))}
                       id='out-file-name' value={state.password}/>
        </FormControl>
    </form>
}