import Link from "next/link";
import {toolsInfo} from "@/app/_utils/constants";


export default function Home() {
    return (<main className="flex flex-col overflow-auto h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <header className="bg-white shadow-sm border-b border-slate-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                             stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                             className="lucide lucide-file-text w-8 h-8 text-white">
                            <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"></path>
                            <path d="M14 2v4a2 2 0 0 0 2 2h4"></path>
                            <path d="M10 9H8"></path>
                            <path d="M16 13H8"></path>
                            <path d="M16 17H8"></path>
                        </svg>
                    </div>
                    <div>
                        <h1 className="text-slate-900">PDF Studio</h1>
                        <p className="text-slate-600 text-sm">Professional PDF Tools Suite</p>
                    </div>
                </div>
            </div>
        </header>
        <div className="overflow-auto max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div
                className="opacity-100 transform-none">
                <div className="text-center mb-12">
                    <h2 className="text-slate-900 mb-4">Choose a Tool</h2>
                    <p className="text-slate-600 max-w-2xl mx-auto">Select from our comprehensive suite of PDF tools to edit, convert, and manage your PDF documents with ease.</p>
                </div>
                <div className="grid grid-cols-1 p-2 overflow-visible sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Object.values(toolsInfo).map((tool, i) => {
                        return <div className="opacity-100 transform-none">
                            <Link
                                className='h-full flex w-full'
                                key={i} href={tool.path} data-discover="true">
                                <div className="w-full rounded-xl p-6 shadow-md hover:shadow-xl transition-shadow cursor-pointer border border-slate-200">
                                    <div className="flex items-start gap-4">
                                        <div className={`${tool.backgroundColor} p-3 rounded-lg`}>
                                            <img alt="tool image" src={tool.src}/>
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-slate-900 mb-1">{tool.title}</h3>
                                            <p className="line-clamp-2 overflow-ellipsis text-slate-600 text-sm">{tool.description}</p>
                                        </div>
                                    </div>
                                </div>
                            </Link></div>
                    })}
                </div>
            </div>
        </div>
    </main>);
}
