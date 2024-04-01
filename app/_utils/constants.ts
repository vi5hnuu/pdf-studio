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