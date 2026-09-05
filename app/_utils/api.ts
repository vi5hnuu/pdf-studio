import { API_URL } from '@/app/_utils/config';

export namespace ToolsApi{
    // Was: `'http://localhost:8082' ?? process.env… ` — `??` never falls through a non-null
    // left side, so production pointed every request at localhost.
    const baseUrl: string = API_URL;
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
    export const pdfToWord=`${baseUrl}/api/v1/pdf-studio/pdf-to-word`
    export const pdfToExcel=`${baseUrl}/api/v1/pdf-studio/pdf-to-excel`
    export const pdfToPptx=`${baseUrl}/api/v1/pdf-studio/pdf-to-pptx`
    export const duplicatePages=`${baseUrl}/api/v1/pdf-studio/duplicate-pages`
    export const compressImage=`${baseUrl}/api/v1/image-studio/compress-image`
    export const convertToJpg=`${baseUrl}/api/v1/image-studio/convert-to-jpg`
    export const convertFromJpg=`${baseUrl}/api/v1/image-studio/convert-from-jpg`
    export const resizeImage=`${baseUrl}/api/v1/image-studio/resize-image`
    export const filterImage=`${baseUrl}/api/v1/image-studio/filter-image`
    export const placeImage=`${baseUrl}/api/v1/pdf-studio/place-image`
    export const redactPdf=`${baseUrl}/api/v1/pdf-studio/redact-pdf`
    export const getBookmarks=`${baseUrl}/api/v1/pdf-studio/get-bookmarks`
    export const editBookmarks=`${baseUrl}/api/v1/pdf-studio/edit-bookmarks`
}