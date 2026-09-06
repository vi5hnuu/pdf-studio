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
    SanitizePdf = "SanitizePdf",
    RemoveMetadata = "RemoveMetadata",
    MirrorPdf = "MirrorPdf",
    ResizePage = "ResizePage",
    ScalePdf = "ScalePdf",
    SplitBySize = "SplitBySize",
    InsertPdf = "InsertPdf",
    ReplacePages = "ReplacePages",
    ExtractImages = "ExtractImages",
    ExtractFonts = "ExtractFonts",
    ExtractEmbeddedFiles = "ExtractEmbeddedFiles",
    AnalyzePdf = "AnalyzePdf",
    RotateImage = "RotateImage",
    FlipImage = "FlipImage",
    BorderImage = "BorderImage",
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
[Tool.SanitizePdf]: {description:'Strip JavaScript, embedded files and actions from a PDF',backgroundColor:'bg-green-700',src:'tools/sanitize-pdf.svg',tool:Tool.SanitizePdf,title:'Sanitize PDF',path:'/tool/sanitize-pdf'},
    [Tool.RemoveMetadata]: {description:'Remove all document info and XMP metadata from a PDF',backgroundColor:'bg-slate-700',src:'tools/remove-metadata.svg',tool:Tool.RemoveMetadata,title:'Remove Metadata',path:'/tool/remove-metadata'},
    [Tool.MirrorPdf]: {description:'Flip PDF pages horizontally or vertically',backgroundColor:'bg-cyan-700',src:'tools/mirror-pdf.svg',tool:Tool.MirrorPdf,title:'Mirror PDF',path:'/tool/mirror-pdf'},
    [Tool.ResizePage]: {description:'Resize every page to A4, Letter or Legal',backgroundColor:'bg-sky-700',src:'tools/resize-page.svg',tool:Tool.ResizePage,title:'Resize Page',path:'/tool/resize-page'},
    [Tool.ScalePdf]: {description:'Scale page size and content by a uniform factor',backgroundColor:'bg-indigo-700',src:'tools/scale-pdf.svg',tool:Tool.ScalePdf,title:'Scale PDF',path:'/tool/scale-pdf'},
    [Tool.SplitBySize]: {description:'Split a PDF into parts no larger than a chosen size',backgroundColor:'bg-teal-700',src:'tools/split-by-size.svg',tool:Tool.SplitBySize,title:'Split by Size',path:'/tool/split-by-size'},
    [Tool.InsertPdf]: {description:'Insert one PDF into another after a chosen page',backgroundColor:'bg-purple-700',src:'tools/insert-pdf.svg',tool:Tool.InsertPdf,title:'Insert PDF',path:'/tool/insert-pdf'},
    [Tool.ReplacePages]: {description:'Replace a page range with the pages of another PDF',backgroundColor:'bg-rose-700',src:'tools/replace-pages.svg',tool:Tool.ReplacePages,title:'Replace Pages',path:'/tool/replace-pages'},
    [Tool.ExtractImages]: {description:'Extract every embedded image from a PDF as a ZIP',backgroundColor:'bg-orange-700',src:'tools/extract-images.svg',tool:Tool.ExtractImages,title:'Extract Images',path:'/tool/extract-images'},
    [Tool.ExtractFonts]: {description:'Extract embedded font programs from a PDF as a ZIP',backgroundColor:'bg-amber-700',src:'tools/extract-fonts.svg',tool:Tool.ExtractFonts,title:'Extract Fonts',path:'/tool/extract-fonts'},
    [Tool.ExtractEmbeddedFiles]: {description:'Extract file attachments embedded in a PDF',backgroundColor:'bg-lime-700',src:'tools/extract-embedded-files.svg',tool:Tool.ExtractEmbeddedFiles,title:'Extract Attachments',path:'/tool/extract-embedded-files'},
    [Tool.AnalyzePdf]: {description:'Inspect a PDF: pages, size, fonts, images and security',backgroundColor:'bg-emerald-700',src:'tools/analyze-pdf.svg',tool:Tool.AnalyzePdf,title:'Analyze PDF',path:'/tool/analyze-pdf'},
    [Tool.RotateImage]: {description:'Rotate an image by 90, 180 or 270 degrees',backgroundColor:'bg-pink-600',src:'tools/rotate-image.svg',tool:Tool.RotateImage,title:'Rotate Image',path:'/tool/rotate-image'},
    [Tool.FlipImage]: {description:'Flip an image horizontally or vertically',backgroundColor:'bg-violet-700',src:'tools/flip-image.svg',tool:Tool.FlipImage,title:'Flip Image',path:'/tool/flip-image'},
    [Tool.BorderImage]: {description:'Add a solid coloured border around an image',backgroundColor:'bg-fuchsia-700',src:'tools/border-image.svg',tool:Tool.BorderImage,title:'Add Border',path:'/tool/border-image'},
}

/**
 * Stable id for a client-side list item (used as a React key).
 *
 * The previous implementation drew from a charset including quotes, angle brackets and
 * backticks and used Math.random. Neither is appropriate for a value that ends up in the
 * DOM, and randomUUID is both collision-free and simpler.
 */
export function generateId(length: number = 32, prefix: string = '') {
    const random =
        typeof crypto !== 'undefined' && 'randomUUID' in crypto
            ? crypto.randomUUID()
            : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
    return `${prefix}${random}`.slice(0, Math.max(length, prefix.length + 8));
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
    // Bounds were `> items.length`, which let the last valid index + 1 through and produced
    // an undefined entry instead of throwing.
    if(from<0 || from>=items.length || to<0 || to>=items.length) throw new Error('invalid args');

    const item=items[from];
    items[from]=items[to];
    items[to]=item;
}