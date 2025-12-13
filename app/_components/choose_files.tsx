import React, {ChangeEventHandler} from "react";

export function ChooseFiles(props: {
    single?: boolean,
    className?: string,
    style?: React.CSSProperties,
    accept: string[],
    onChange: ChangeEventHandler<HTMLInputElement>
}) {

    return <div style={props.style} className={`p-3 w-full rounded-md mx-auto ${props.className ?? ''}`}>
        <div className="space-y-6">
            <div
                className="relative opacity-100 transform-none border-2 border-dashed border-slate-300 rounded-xl p-12 text-center hover:border-blue-400 hover:bg-blue-50/50 transition-all cursor-pointer bg-white">
                <input onChange={props.onChange} type="file" accept={props.accept.join(',')} multiple={!props.single} name="files[]"
                       className="opacity-0 absolute inset-0" id="file-upload"/>
                <label htmlFor="file-upload" className="cursor-pointer">
                    <div className="inline-block p-4 bg-blue-100 rounded-full mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                             stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                             className="lucide lucide-upload w-8 h-8 text-blue-600">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                            <polyline points="17 8 12 3 7 8"></polyline>
                            <line x1="12" x2="12" y1="3" y2="15"></line>
                        </svg>
                    </div>
                    <p className="text-slate-700 mb-2">Drag and drop images here or click to browse</p>
                    <p className="text-slate-500 text-sm">Image files only</p>
                </label>
            </div>
        </div>
    </div>
}