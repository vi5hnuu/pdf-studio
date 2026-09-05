export { SITE_URL, API_URL, AUTH_URL, API_AUDIENCE, MAX_FILE_BYTES, MAX_FILE_LABEL } from '@/app/_utils/config';

/**
 * @deprecated Use SITE_URL (canonical/OG/sitemap) or API_URL (requests) from _utils/config.
 * This name conflated the two, and was hardcoded to localhost by a `true ||` short-circuit.
 */
export { SITE_URL as BASE_URL } from '@/app/_utils/config';

export enum Tool {
    ImageToPdf = "ImageToPdf",
    MergePdf = "MergePdf",
    PageNumbers = "PageNumbers",
    PdfToJpg = "PdfToJpg",
    ProtectPdf = "ProtectPdf",
    ReorderPDf = "ReorderPDf",
    RotatePdf = "RotatePdf",
    SplitPdf = "SplitPdf",
    Unprotect = "Unprotect",
    CompressPdf = "CompressPdf",
    WatermarkPdf = "WatermarkPdf",
    DeletePages = "DeletePages",
    ExtractText = "ExtractText",
    GrayscalePdf = "GrayscalePdf",
    CropPdf = "CropPdf",
    EditMetadata = "EditMetadata",
    HeaderFooter = "HeaderFooter",
    RepairPdf = "RepairPdf",
    FlattenPdf = "FlattenPdf",
    AddBlankPages = "AddBlankPages",
    StampPdf = "StampPdf",
    RemoveBlankPages = "RemoveBlankPages",
    OptimizePdf = "OptimizePdf",
    NUpPdf = "NUpPdf",
    PdfToWord = "PdfToWord",
    PdfToExcel = "PdfToExcel",
    PdfToPptx = "PdfToPptx",
    DuplicatePages = "DuplicatePages",
    CompressImage = "CompressImage",
    ConvertToJpg = "ConvertToJpg",
    ConvertFromJpg = "ConvertFromJpg",
    ResizeImage = "ResizeImage",
    FilterImage = "FilterImage",
    PlaceImage = "PlaceImage",
    RedactPdf = "RedactPdf",
    EditBookmarks = "EditBookmarks",
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
    [Tool.CompressPdf]: {description:'Reduce PDF file size with smart image compression',backgroundColor:'bg-slate-600',src: "tools/compress-pdf.svg", tool: Tool.CompressPdf,title: 'Compress pdf', path: '/tool/compress-pdf'},
    [Tool.WatermarkPdf]: {description:'Stamp text watermarks with custom opacity and angle',backgroundColor:'bg-cyan-600',src: "tools/watermark-pdf.svg", tool: Tool.WatermarkPdf,title: 'Watermark pdf', path: '/tool/watermark-pdf'},
    [Tool.DeletePages]: {description:'Remove unwanted pages from any PDF visually',backgroundColor:'bg-rose-600',src: "tools/delete-pages.svg", tool: Tool.DeletePages,title: 'Delete pages', path: '/tool/delete-pages'},
    [Tool.ExtractText]: {description:'Extract all text content from any PDF file',backgroundColor:'bg-violet-600',src: "tools/extract-text.svg", tool: Tool.ExtractText,title: 'Extract text', path: '/tool/extract-text'},
    [Tool.GrayscalePdf]: {description:'Convert any PDF to black and white grayscale',backgroundColor:'bg-zinc-500',src: "tools/grayscale-pdf.svg", tool: Tool.GrayscalePdf,title: 'Grayscale pdf', path: '/tool/grayscale-pdf'},
    [Tool.CropPdf]: {description:'Crop PDF pages by setting custom margins',backgroundColor:'bg-lime-600',src:'tools/crop-pdf.svg',tool:Tool.CropPdf,title:'Crop PDF',path:'/tool/crop-pdf'},
    [Tool.EditMetadata]: {description:'Edit PDF title, author, subject, and keywords',backgroundColor:'bg-sky-600',src:'tools/edit-metadata.svg',tool:Tool.EditMetadata,title:'Edit Metadata',path:'/tool/edit-metadata'},
    [Tool.HeaderFooter]: {description:'Add custom header and footer text to every page',backgroundColor:'bg-emerald-600',src:'tools/header-footer.svg',tool:Tool.HeaderFooter,title:'Header & Footer',path:'/tool/header-footer'},
    [Tool.RepairPdf]: {description:'Repair corrupted or broken PDF files',backgroundColor:'bg-orange-500',src:'tools/repair-pdf.svg',tool:Tool.RepairPdf,title:'Repair PDF',path:'/tool/repair-pdf'},
    [Tool.FlattenPdf]: {description:'Flatten form fields and annotations into page content',backgroundColor:'bg-stone-600',src:'tools/flatten-pdf.svg',tool:Tool.FlattenPdf,title:'Flatten PDF',path:'/tool/flatten-pdf'},
    [Tool.AddBlankPages]: {description:'Insert blank pages at specific positions in your PDF',backgroundColor:'bg-indigo-600',src:'tools/add-blank-pages.svg',tool:Tool.AddBlankPages,title:'Add Blank Pages',path:'/tool/add-blank-pages'},
    [Tool.StampPdf]: {description:'Overlay a stamp PDF onto every page of another PDF',backgroundColor:'bg-fuchsia-600',src:'tools/stamp-pdf.svg',tool:Tool.StampPdf,title:'Stamp PDF',path:'/tool/stamp-pdf'},
    [Tool.RemoveBlankPages]: {description:'Automatically detect and remove blank pages from any PDF',backgroundColor:'bg-amber-600',src:'tools/remove-blank-pages.svg',tool:Tool.RemoveBlankPages,title:'Remove Blank Pages',path:'/tool/remove-blank-pages'},
    [Tool.OptimizePdf]: {description:'Optimize PDF structure by removing redundant data and thumbnails',backgroundColor:'bg-emerald-500',src:'tools/optimize-pdf.svg',tool:Tool.OptimizePdf,title:'Optimize PDF',path:'/tool/optimize-pdf'},
    [Tool.NUpPdf]: {description:'Arrange multiple PDF pages onto a single sheet (2-up or 4-up)',backgroundColor:'bg-violet-600',src:'tools/n-up-pdf.svg',tool:Tool.NUpPdf,title:'N-Up Layout',path:'/tool/n-up'},
    [Tool.PdfToWord]: {description:'Convert PDF text content to an editable Word document',backgroundColor:'bg-blue-600',src:'tools/pdf-to-word.svg',tool:Tool.PdfToWord,title:'PDF to Word',path:'/tool/pdf-to-word'},
    [Tool.PdfToExcel]: {description:'Export PDF text content to a structured Excel spreadsheet',backgroundColor:'bg-green-600',src:'tools/pdf-to-excel.svg',tool:Tool.PdfToExcel,title:'PDF to Excel',path:'/tool/pdf-to-excel'},
    [Tool.PdfToPptx]: {description:'Convert PDF pages into PowerPoint presentation slides',backgroundColor:'bg-orange-600',src:'tools/pdf-to-pptx.svg',tool:Tool.PdfToPptx,title:'PDF to PPTX',path:'/tool/pdf-to-pptx'},
    [Tool.DuplicatePages]: {description:'Duplicate selected pages within your PDF document',backgroundColor:'bg-indigo-500',src:'tools/duplicate-pages.svg',tool:Tool.DuplicatePages,title:'Duplicate Pages',path:'/tool/duplicate-pages'},
    [Tool.CompressImage]: {description:'Compress images to JPEG with adjustable quality output',backgroundColor:'bg-sky-500',src:'tools/compress-image.svg',tool:Tool.CompressImage,title:'Compress Image',path:'/tool/compress-image'},
    [Tool.ConvertToJpg]: {description:'Convert PNG, BMP, or GIF images to JPEG format',backgroundColor:'bg-amber-500',src:'tools/convert-to-jpg.svg',tool:Tool.ConvertToJpg,title:'Image to JPG',path:'/tool/convert-to-jpg'},
    [Tool.ConvertFromJpg]: {description:'Convert JPEG images to PNG or BMP format',backgroundColor:'bg-rose-500',src:'tools/convert-from-jpg.svg',tool:Tool.ConvertFromJpg,title:'JPG to PNG/BMP',path:'/tool/convert-from-jpg'},
    [Tool.ResizeImage]: {description:'Resize images to exact pixel dimensions with aspect ratio control',backgroundColor:'bg-teal-500',src:'tools/resize-image.svg',tool:Tool.ResizeImage,title:'Resize Image',path:'/tool/resize-image'},
    [Tool.FilterImage]: {description:'Apply visual filters — grayscale, sepia, sharpen, vintage and more',backgroundColor:'bg-purple-500',src:'tools/filter-image.svg',tool:Tool.FilterImage,title:'Filter Image',path:'/tool/filter-image'},
    [Tool.PlaceImage]: {description:'Insert an image at a precise position on any PDF page',backgroundColor:'bg-teal-600',src:'tools/place-image.svg',tool:Tool.PlaceImage,title:'Place Image',path:'/tool/place-image'},
    [Tool.RedactPdf]: {description:'Permanently black out sensitive regions on PDF pages',backgroundColor:'bg-zinc-700',src:'tools/redact-pdf.svg',tool:Tool.RedactPdf,title:'Redact PDF',path:'/tool/redact-pdf'},
    [Tool.EditBookmarks]: {description:'View and edit the outline and bookmark tree of any PDF',backgroundColor:'bg-indigo-600',src:'tools/edit-bookmarks.svg',tool:Tool.EditBookmarks,title:'Edit Bookmarks',path:'/tool/edit-bookmarks'},
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