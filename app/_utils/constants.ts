export interface ToolInfo {
    title: string,
    path: string
}

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

export const tools = [
    Tool.ImageToPdf,
    Tool.MergePdf,
    Tool.PageNumbers,
    Tool.PdfToJpg,
    Tool.ProtectPdf,
    Tool.ReorderPDf,
    Tool.RotatePdf,
    Tool.SplitPdf,
    Tool.Unprotect]
export const toolsInfo: { [key in Tool]: ToolInfo } = {
    [Tool.ImageToPdf]: {title: 'Image to pdf', path: '/tool/image-to-pdf'},
    [Tool.MergePdf]: {title: 'Merge pdf', path: '/tool/merge-pdf'},
    [Tool.PageNumbers]: {title: 'Page numbers', path: '/tool/page-numbers'},
    [Tool.PdfToJpg]: {title: 'Pdf to jpg', path: '/tool/pdf-to-jpg'},
    [Tool.ProtectPdf]: {title: 'Protect pdf', path: '/tool/protect-pdf'},
    [Tool.ReorderPDf]: {title: 'Reorder pdf', path: '/tool/reorder-pdf'},
    [Tool.RotatePdf]: {title: 'Rotate pdf', path: '/tool/rotate-pdf'},
    [Tool.SplitPdf]: {title: 'Split pdf', path: '/tool/split-pdf'},
    [Tool.Unprotect]: {title: 'Unprotect pdf', path: '/tool/unprotect-pdf'},
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