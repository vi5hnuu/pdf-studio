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


export function ProtectForm(props: {
    className?: string,
    initState: ProtectOptions,
    onChange: (data: ProtectOptions) => void
}) {
    const [state, setState] = useState<ProtectOptions>(props.initState)

    useEffect(() => props.onChange(state), [state]);

    function updatePermission(permission: UserPermission,add:boolean) {
        setState(state => {
            const newPerms=state.userAccess_permissions;
            if(add) newPerms.add(permission);
            else newPerms.delete(permission);
            return {...state, userPermissions:new Set(newPerms)}
        });
    }

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
            <TextField label='Owner Password( Master password )' error={!state.owner_password}
                       onChange={(e: ChangeEvent<HTMLInputElement>) => setState(state => ({
                           ...state,
                           owner_password: e.target.value?.trim() ?? ''
                       }))}
                       id='out-file-name' value={state.owner_password}/>
        </FormControl>
        <FormControl>
            <TextField label='User Password' error={!state.user_password}
                       onChange={(e: ChangeEvent<HTMLInputElement>) => setState(state => ({
                           ...state,
                           user_password: e.target.value?.trim() ?? ''
                       }))}
                       id='out-file-name' value={state.user_password}/>
        </FormControl>
        <FormGroup>
            <FormLabel>User Permission</FormLabel>
            {userPermissions.map(permission => <FormControlLabel
                control={<Checkbox onChange={(e: ChangeEvent<HTMLInputElement>) => updatePermission(permission,e.target.checked)}
                                   checked={state.userAccess_permissions.has(permission)}/>} label={permission.toLowerCase().split('_').join(' ')}/>)}
        </FormGroup>
    </form>
}