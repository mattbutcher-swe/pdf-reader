export interface IElectronAPI {
    getFoldersChildren: (folderPath: string | null, folder: string | null) => Promise<Array<string>>,
    getCurrentFolder: (folderPath: string | null, folder: string | null) => Promise<string>,
    getParentFolder: (currentPath: string | null) => Promise<string>,
    createFolder: (currentPath: string, folderName: string) => void,
    setHome: (currentPath: string|null) => Promise<boolean>,
    getHome: () => Promise<string>,
    getFoldersPDFs: (foldersPath: string) => Promise<string[]>,
    openPDF: (pdfPath: string, currentFolder: string, pageNumber: string) => void,
    backToApp: (pageNumber: string) => void,
    getPageNumber: () => Promise<object>,
    updateBook: (pdfPath: string, book: object) => void
  }
  
  declare global {
    interface Window {
      electronAPI: IElectronAPI
    }
  }