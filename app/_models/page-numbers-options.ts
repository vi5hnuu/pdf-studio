import {Property} from "csstype";
import {Font} from "@/app/_utils/constants";

export interface PageNumbersOptions {
    out_file_name:string;
    page_no_type:string;
    size:number;//14 default
    fill_color?:{r:number,g:number,b:number,a:number};
    vertical_position:string;
    horizontal_position:string;
    padding:{top:number,right:number,bottom:number,left:number}; //default 0
    from_page:number;
    to_page?:number;
    font_name:Font;
}
