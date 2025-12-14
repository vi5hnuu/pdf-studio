'use client'

import Link from "next/link";
import {Button} from "@mui/material";
import {useRouter} from "next/navigation";

export default function Layout({
                                   children,
                               }: Readonly<{
    children: React.ReactNode;
}>) {
    const navigate = useRouter();
    return (<div className="flex flex-col h-dvh overflow-auto bg-gradient-to-br from-slate-50 to-slate-100">
        <header className="bg-white shadow-sm border-b border-slate-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center rounded-md overflow-hidden gap-4">
                        <Button onClick={()=>navigate.back()} className="group flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors" data-discover="true">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                                 fill="none"
                                 stroke="currentColor" strokeWidth="2" strokeLinejoin="round"
                                 className="lucide group-hover:-translate-x-1 transition-all lucide-arrow-left w-5 h-5">
                                <path d="m12 19-7-7 7-7"></path>
                                <path d="M19 12H5"></path>
                            </svg>
                            <span>Back to Dashboard</span>
                        </Button>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                                 fill="none" stroke="currentColor" strokeWidth="2"
                                 strokeLinejoin="round" className="lucide lucide-file-text w-6 h-6 text-white">
                                <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"></path>
                                <path d="M14 2v4a2 2 0 0 0 2 2h4"></path>
                                <path d="M10 9H8"></path>
                                <path d="M16 13H8"></path>
                                <path d="M16 17H8"></path>
                            </svg>
                        </div>
                        <span className="text-slate-900">PDF Studio</span>
                    </div>
                </div>
            </div>
        </header>
        <main className="flex-1 flex overflow-auto max-w-8xl h-auto p-16 px-6 md:px-16 pt-8 md:pt-24">
            {children}
        </main>
    </div>);
}