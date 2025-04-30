const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getFoldersChildren: (folderPath, folder) => ipcRenderer.invoke('get-folders-children', folderPath, folder),
  getCurrentFolder: (folderPath, folder) => ipcRenderer.invoke('get-current-folder', folderPath, folder),
  getParentFolder: (folderPath) => ipcRenderer.invoke('get-parent-folder', folderPath),
  createFolder: (currentPath, folderName) => ipcRenderer.invoke('create-folder', currentPath, folderName),
  setHome: (currentPath) => ipcRenderer.invoke('set-home', currentPath),
  getHome: () => ipcRenderer.invoke('get-home'),
  getFoldersPDFs: (foldersPath) => ipcRenderer.invoke('get-folders-pdfs', foldersPath),
  openPDF: (pdfPath, currentFolder, pageNumber) => ipcRenderer.invoke('open-pdf', pdfPath, currentFolder, pageNumber),
  backToApp: (pageNumber) => ipcRenderer.invoke('back-to-app', pageNumber),
  getPageNumber: () => ipcRenderer.invoke('get-page-number')
});