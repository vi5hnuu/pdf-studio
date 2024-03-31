import React, {ChangeEventHandler} from "react";

export function ChooseFiles(props:{single?:boolean,className?:string,style?:React.CSSProperties,accept:string[],onChange:ChangeEventHandler<HTMLInputElement>}) {

    return <div style={props.style} className={`p-3 w-full rounded-md mx-auto ${props.className ?? ''}`}>
        <div
            className="h-32 w-full overflow-hidden relative shadow-md border-2 items-center rounded-md cursor-pointer  border-gray-400 border-dotted">
            <input type="file" onChange={props.onChange} className="h-full w-full opacity-0 z-10 absolute"
                   accept={props.accept.join(',')} multiple={!props.single} name="files[]"/>
            <div className="h-full w-full bg-gray-200 absolute z-1 flex justify-center items-center top-0">
                <div className="flex flex-col">
                    <i className="mdi mdi-folder-open text-[30px] text-gray-300 text-center"></i>
                    <span className="text-[12px]">{`Drag and Drop a file`}</span>
                </div>
            </div>
        </div>
    </div>
}