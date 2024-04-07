
export namespace ToolsApi{
    const baseUrl:string='https://pdf-studio-api.onrender.com';
    // const baseUrl:string='http://localhost:8082';
    export const mergePdf=`${baseUrl}/api/v1/pdf-studio/merge-pdf`;
    export const reorderPdf=`${baseUrl}/api/v1/pdf-studio/reorder-pdf`
    export const splitPdf=`${baseUrl}/api/v1/pdf-studio/split-pdf`
    export const pdfToJpg=`${baseUrl}/api/v1/pdf-studio/pdf-to-jpg`
    export const imagePdf=`${baseUrl}/api/v1/pdf-studio/image-to-pdf`
    export const pageNumbers=`${baseUrl}/api/v1/pdf-studio/page-numbers`
    export const rotatePdf=`${baseUrl}/api/v1/pdf-studio/rotate-pdf`
    export const unprotectPdf=`${baseUrl}/api/v1/pdf-studio/unprotect-pdf`
    export const protectPdf=`${baseUrl}/api/v1/pdf-studio/protect-pdf`
}