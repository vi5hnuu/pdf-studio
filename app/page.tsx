import Card from '@mui/material/Card';
import {CardContent} from "@mui/material";
import Link from "next/link";
import {tools, toolsInfo} from "@/app/_utils/constants";
export default function Home() {
    return (
        <main className="min-h-screen flex-col items-center justify-start p-24">
            <h1 className='mx-auto text-6xl mb-6 w-full text-center'>Pdf Studio</h1>
            <ul className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6'>
                {tools.map((tool,index)=><Card key={index} className='mx-auto !bg-green-200 w-72 h-60 !rounded-md !shadow-sm hover:!shadow-md transition-all cursor-pointer'>
                    <CardContent className='flex items-center justify-center h-full text-3xl font-normal'>
                        <Link href={toolsInfo[tool].path}>{toolsInfo[tool].title}</Link>
                    </CardContent>
                </Card>)}
            </ul>
        </main>
    );
}
