
export namespace ToolsApi{
    const baseUrl:string = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'https://pdf-studio-api.onrender.com';
    export const mergePdf=`${baseUrl}/api/v1/pdf-studio/merge-pdf`;
    export const reorderPdf=`${baseUrl}/api/v1/pdf-studio/reorder-pdf`
    export const splitPdf=`${baseUrl}/api/v1/pdf-studio/split-pdf`
    export const pdfToJpg=`${baseUrl}/api/v1/pdf-studio/pdf-to-jpg`
    export const imagePdf=`${baseUrl}/api/v1/pdf-studio/image-to-pdf`
    export const pageNumbers=`${baseUrl}/api/v1/pdf-studio/page-numbers`
    export const rotatePdf=`${baseUrl}/api/v1/pdf-studio/rotate-pdf`
    export const unprotectPdf=`${baseUrl}/api/v1/pdf-studio/unprotect-pdf`
    export const protectPdf=`${baseUrl}/api/v1/pdf-studio/protect-pdf`
    export const compressPdf=`${baseUrl}/api/v1/pdf-studio/compress-pdf`
    export const watermarkPdf=`${baseUrl}/api/v1/pdf-studio/watermark-pdf`
    export const extractText=`${baseUrl}/api/v1/pdf-studio/extract-text`
    export const grayscalePdf=`${baseUrl}/api/v1/pdf-studio/grayscale-pdf`
    export const cropPdf=`${baseUrl}/api/v1/pdf-studio/crop-pdf`
    export const editMetadata=`${baseUrl}/api/v1/pdf-studio/edit-metadata`
    export const headerFooter=`${baseUrl}/api/v1/pdf-studio/header-footer`
    export const repairPdf=`${baseUrl}/api/v1/pdf-studio/repair-pdf`
    export const flattenPdf=`${baseUrl}/api/v1/pdf-studio/flatten-pdf`
    export const addBlankPages=`${baseUrl}/api/v1/pdf-studio/add-blank-pages`
    export const stampPdf=`${baseUrl}/api/v1/pdf-studio/stamp-pdf`
    export const getMetadata=`${baseUrl}/api/v1/pdf-studio/get-metadata`
    export const removeBlankPages=`${baseUrl}/api/v1/pdf-studio/remove-blank-pages`
    export const optimizePdf=`${baseUrl}/api/v1/pdf-studio/optimize-pdf`
    export const nUpPdf=`${baseUrl}/api/v1/pdf-studio/n-up`
}