import {Property} from "csstype";
import {Font, UserPermission} from "@/app/_utils/constants";


export enum SplitType{
    SPLIT_BY_RANGE="SPLIT_BY_RANGE",
    FIXED_RANGE="FIXED_RANGE",
    DELETE_PAGES="DELETE_PAGES",
    EXTRACT_ALL_PAGES="EXTRACT_ALL_PAGES"
}

export interface SplitRange{
    from:number;
    to:number;
}
export interface SplitOptions {
    out_file_name:string;
    type:SplitType;
    fixed:number;
    ranges:SplitRange[];
}
