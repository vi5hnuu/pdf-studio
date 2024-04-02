import {Property} from "csstype";
import {Font} from "@/app/_utils/constants";

export interface RotateOptions {
    out_file_name:string;
    file_angle:number; // angle at which all pages will be rotated
    page_angles:Map<number,number>; // if a page do not have angle file angle is used else no rotation [0 index]
    maintain_ratio:boolean;//default true
}
