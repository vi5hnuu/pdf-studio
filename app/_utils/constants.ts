export enum Tool {
    ImageToPdf = "ImageToPdf",
    MergePdf = "MergePdf",
    PageNumbers = "PageNumbers",
    PdfToJpg = "PdfToJpg",
    ProtectPdf = "ProtectPdf",
    ReorderPDf = "ReorderPDf",
    RotatePdf = "RotatePdf",
    SplitPdf = "SplitPdf",
    Unprotect = "Unprotect"
}

export interface ToolInfo{
    title:string,
    description:string,
    src:string,
    tool:Tool,
    path: string,
    backgroundColor:string
}

export const toolsInfo: { [key in Tool]: ToolInfo } = {
    [Tool.ImageToPdf]: {description:'Convert images into ordered, high-quality PDF documents',backgroundColor:'bg-blue-500',src: "tools/image-to-pdf.svg", tool: Tool.ImageToPdf,title: 'Image to pdf', path: '/tool/image-to-pdf'},
    [Tool.MergePdf]: {description:'Combine multiple PDFs into one unified file',backgroundColor:'bg-purple-500',src: "tools/merge-pdf.svg", tool: Tool.MergePdf,title: 'Merge pdf', path: '/tool/merge-pdf'},
    [Tool.PageNumbers]: {description:'Add customizable page numbers with layout control',backgroundColor:'bg-green-500',src: "tools/page-numbers.svg", tool: Tool.PageNumbers,title: 'Page numbers', path: '/tool/page-numbers'},
    [Tool.PdfToJpg]: {description:'Export PDF pages as compressed or full-quality images',backgroundColor:'bg-orange-500',src: "tools/pdf-to-jpg.svg", tool: Tool.PdfToJpg,title: 'Pdf to jpg', path: '/tool/pdf-to-jpg'},
    [Tool.ProtectPdf]: {description:'Secure PDFs using passwords and permission controls',backgroundColor:'bg-red-500',src: "tools/protect-pdf.svg", tool: Tool.ProtectPdf,title: 'Protect pdf', path: '/tool/protect-pdf'},
    [Tool.ReorderPDf]: {description:'Rearrange PDF pages using visual drag-and-drop',backgroundColor:'bg-indigo-500',src: "tools/reorder-pdf.svg", tool: Tool.ReorderPDf,title: 'Reorder pdf', path: '/tool/reorder-pdf'},
    [Tool.RotatePdf]: {description:'Rotate pages globally or individually with precision',backgroundColor:'bg-pink-500',src: "tools/rotate-pdf.svg", tool: Tool.RotatePdf,title: 'Rotate pdf', path: '/tool/rotate-pdf'},
    [Tool.SplitPdf]: {description:'Split PDFs by ranges, groups, or individual pages',backgroundColor:'bg-teal-500',src: "tools/split-pdf.svg", tool: Tool.SplitPdf,title: 'Split pdf', path: '/tool/split-pdf'},
    [Tool.Unprotect]: {description:'Remove PDF security using authorized master password',backgroundColor:'bg-yellow-500',src: "tools/unprotect-pdf.svg", tool: Tool.Unprotect,title: 'Unprotect pdf', path: '/tool/unprotect-pdf'},
}

export function generateId(length:number=32,prefix:string='') {
    const chars = `ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+<>?":{}[];',./\``;
    let id = prefix;
    for (let i = prefix.length; i < length; i++) {
        const randomChar = chars.charAt(Math.floor(Math.random() * chars.length));
        id += randomChar;
    }
    return id;
}

export enum Font {
    TIMES_ROMAN="TIMES_ROMAN", //
    TIMES_BOLD="TIMES_BOLD", //
    TIMES_ITALIC="TIMES_ITALIC", //
    TIMES_BOLD_ITALIC="TIMES_BOLD_ITALIC", //
    HELVETICA="HELVETICA", //
    HELVETICA_BOLD="HELVETICA_BOLD", //
    HELVETICA_OBLIQUE="HELVETICA_OBLIQUE", //
    HELVETICA_BOLD_OBLIQUE="HELVETICA_BOLD_OBLIQUE", //
    COURIER="COURIER", //
    COURIER_BOLD="COURIER_BOLD", //
    COURIER_OBLIQUE="COURIER_OBLIQUE", //
    COURIER_BOLD_OBLIQUE="COURIER_BOLD_OBLIQUE", //
    SYMBOL="SYMBOL", //
    ZAPF_DINGBATS="ZAPF_DINGBATS"
}

export function hexToRGBA(hex:string, alpha?:number) {
    var r = parseInt(hex.slice(1, 3), 16),
        g = parseInt(hex.slice(3, 5), 16),
        b = parseInt(hex.slice(5, 7), 16);
        return {r,g,b,a:alpha??1};
}

///////////////////
export enum UserPermission{
    PRINT="PRINT",
    MODIFICATION="MODIFICATION",
    EXTRACT="EXTRACT",
    MODIFY_ANNOTATIONS="MODIFY_ANNOTATIONS",
    FILL_IN_FORM="FILL_IN_FORM",
    EXTRACT_FOR_ACCESSIBILITY="EXTRACT_FOR_ACCESSIBILITY",
    ASSEMBLE_DOCUMENT="ASSEMBLE_DOCUMENT",
    FAITHFUL_PRINT="FAITHFUL_PRINT",
    READ_ONLY="READ_ONLY"
}
export const userPermissions=[UserPermission.PRINT,UserPermission.MODIFICATION,UserPermission.EXTRACT,UserPermission.MODIFY_ANNOTATIONS,UserPermission.FILL_IN_FORM,UserPermission.EXTRACT_FOR_ACCESSIBILITY,UserPermission.ASSEMBLE_DOCUMENT,UserPermission.FAITHFUL_PRINT,UserPermission.READ_ONLY];


export function swapItem(items:any[],from:number,to:number){
    if(from<0 || from>items.length || to<0 || to>items.length) throw new Error('invalid args');

    const item=items[from];
    items[from]=items[to];
    items[to]=item;
}