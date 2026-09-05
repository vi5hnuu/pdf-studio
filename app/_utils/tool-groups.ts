import { Tool, toolsInfo } from '@/app/_utils/constants';

/**
 * The canonical grouping of tools by job.
 *
 * Lived inside the tools grid, which meant nothing else could use it. The related-tools
 * links on each tool page need the same grouping, and two copies would drift the first
 * time a tool was added.
 */
export const TOOL_GROUPS: { id: string; label: string; tools: Tool[] }[] = [
    {
        id: 'organize',
        label: 'Organize',
        tools: [Tool.MergePdf, Tool.SplitPdf, Tool.ReorderPDf, Tool.DeletePages, Tool.AddBlankPages,
            Tool.DuplicatePages, Tool.RemoveBlankPages, Tool.NUpPdf, Tool.InsertPdf, Tool.ReplacePages],
    },
    {
        id: 'convert',
        label: 'Convert',
        tools: [Tool.ImageToPdf, Tool.PdfToJpg, Tool.PdfToWord, Tool.PdfToExcel, Tool.PdfToPptx,
            Tool.ExtractText, Tool.ExtractImages, Tool.ExtractFonts, Tool.ExtractEmbeddedFiles],
    },
    {
        id: 'edit',
        label: 'Edit',
        tools: [Tool.RotatePdf, Tool.CropPdf, Tool.PageNumbers, Tool.HeaderFooter, Tool.WatermarkPdf,
            Tool.StampPdf, Tool.GrayscalePdf, Tool.EditMetadata, Tool.FlattenPdf, Tool.PlaceImage,
            Tool.EditBookmarks, Tool.MirrorPdf, Tool.ResizePage, Tool.ScalePdf],
    },
    {
        id: 'optimize',
        label: 'Optimize & Repair',
        tools: [Tool.CompressPdf, Tool.OptimizePdf, Tool.RepairPdf, Tool.SplitBySize, Tool.AnalyzePdf],
    },
    {
        id: 'security',
        label: 'Security',
        tools: [Tool.ProtectPdf, Tool.Unprotect, Tool.RedactPdf, Tool.SanitizePdf, Tool.RemoveMetadata],
    },
    {
        id: 'image',
        label: 'Image Tools',
        tools: [Tool.CompressImage, Tool.ConvertToJpg, Tool.ConvertFromJpg, Tool.ResizeImage,
            Tool.FilterImage, Tool.RotateImage, Tool.FlipImage, Tool.BorderImage],
    },
];

/** The tool list for a group id, for the grid to render. */
export function groupTools(id: string): Tool[] {
    return TOOL_GROUPS.find((group) => group.id === id)?.tools ?? [];
}

/**
 * Tools in the same group as {@code path}, excluding it.
 *
 * Internal links between related tools are the main way a utility site spreads authority
 * across its pages; every tool page was previously a dead end with no outbound link but
 * the header logo.
 */
export function relatedTools(path: string, limit = 6) {
    const group = TOOL_GROUPS.find((g) =>
        g.tools.some((tool) => toolsInfo[tool].path === path));
    if (!group) return [];

    return group.tools
        .map((tool) => toolsInfo[tool])
        .filter((info) => info.path !== path)
        .slice(0, limit);
}
