// main.js
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');
const { PDFDocument } = require('pdf-lib');
const { execSync } = require('child_process');

let mainWindow;
let currentPdfPath;

async function getFoldersChildren(folderPath, folder) {
	if (folderPath == null) folderPath = os.homedir();
	if (folder !== null) {
		folderPath = path.join(folderPath, folder);
	}
	try {
		let folders = fs.readdirSync(folderPath, { withFileTypes: true });
		folders = folders.filter(dirent => dirent.isDirectory());
		folders = folders.map(folders => folders.name);
		folders = folders.filter(folders => folders.charAt(0) !== '.');
		return folders;
	} catch (err) {
		console.error('Error reading directory:', err);
		return [];
	}
}

const { nativeImage } = require('electron');

function renderPDFThumbnail(pdfPath) {
	try {
	  if (!fs.existsSync(pdfPath) || path.extname(pdfPath).toLowerCase() !== '.pdf') {
		throw new Error('Invalid PDF path');
	  }
  
	  const dir = path.dirname(pdfPath);
	  const base = path.basename(pdfPath, '.pdf');
	  const outputPath = path.join(dir, `${base}.png`);

	  if (fs.existsSync(outputPath)) {
		return outputPath;
	  }
  
	  const command = `qlmanage -t -s 300 -o "${dir}" "${pdfPath}" >/dev/null 2>&1`;
	  execSync(command);
  
	  const generatedPreview = `${pdfPath}.png`;
  
	  if (fs.existsSync(generatedPreview)) {
		fs.renameSync(generatedPreview, outputPath);
		return outputPath;
	  } else {
		throw new Error('Thumbnail not created');
	  }
	} catch (err) {
	  console.error(`Failed to render thumbnail for ${pdfPath}:`, err.message);
	  return null;
	}
  }
  

  

async function getCurrentFolder(folderPath, folder) {
	if (folderPath == null) folderPath = os.homedir();
	if (folder !== null) {
		folderPath = path.join(folderPath, folder);
	}
	return folderPath;
}

async function getParentFolder(folderPath) {
	return path.dirname(folderPath);
}

async function createFolder(currentPath, folderName) {
	const folderPath = path.join(currentPath, folderName);

	if (!fs.existsSync(folderPath)) {
		fs.mkdirSync(folderPath);
	}
}

async function setHome(currentPath) {
	try {
	  await fs.promises.writeFile(await getConfigurationFilePath(), currentPath);
	  return true;  // If writeFile succeeds
	} catch (err) {
	  console.error(err);
	  return false;  // If an error occurs
	}
  }

async function getHome() {
	try {
	  const filePath = await getConfigurationFilePath();
	  const data = await fs.promises.readFile(filePath, 'utf8');
	  return data;  // This will return the file content
	} catch (err) {
	  console.error('Error reading home configuration file:', err);
	  return null;  // Return null if there's an error reading the file
	}
  }

function generateThumbnail(pdfPath, thumbnailPath) {
	try {
	  const command = `qlmanage -t -s 300 -o "${path.dirname(thumbnailPath)}" "${pdfPath}" >/dev/null 2>&1`;
	  execSync(command);
  
	  // qlmanage appends `.pdf.png` to the original filename
	  const generatedFile = `${pdfPath}.png`;
  
	  // Move it to the desired thumbnail path
	  fs.renameSync(generatedFile, thumbnailPath);
	  return thumbnailPath;
	} catch (err) {
	  console.error(`Failed to generate thumbnail for ${pdfPath}:`, err);
	  return null;
	}
  }

  async function getFoldersPDFs(foldersPath) {
	let pdfs = fs.readdirSync(foldersPath, { withFileTypes: true });
	pdfs = pdfs.filter(pdf => (!pdf.isDirectory() && path.extname(pdf.name) === ".pdf"));

	const pdfData = await Promise.all(pdfs.map(async pdf => {
		const pdfPath = path.join(foldersPath, pdf.name);
		try {
			const pdfBytes = fs.readFileSync(pdfPath);
			const pdfDoc = await PDFDocument.load(pdfBytes);
			const pageCount = pdfDoc.getPageCount();

			let keywords = pdfDoc.getKeywords();
			let bookmark = null;
			let currentScale = null;

			if (keywords) {
				let keywordsList = keywords.split(",");

				if (keywordsList.length > 0) {
					bookmark = keywordsList[0].split(":")[1];
				}
				if (keywordsList.length > 1) {
					currentScale = keywordsList[1].split(":")[1];
				}
			}
			const thumbnailPath = renderPDFThumbnail(pdfPath);
			const image = thumbnailPath ? `data:image/png;base64,${fs.readFileSync(thumbnailPath).toString('base64')}` : null;

			return {
				path: path.join(foldersPath, pdf.name),
				name: pdfDoc.getTitle() ? pdfDoc.getTitle() : pdf.name,
				image: image,
				author: pdfDoc.getAuthor(),
				progress: Math.floor(100 * (bookmark/pageCount)),
				bookmark: bookmark || 0,
				currentScale: currentScale || 0
			};
		} catch (err) {
			console.error(`Failed to process ${pdf.name}:`, err);
			return {
				path: path.join(foldersPath, pdf.name),
				name:  pdfDoc.getTitle() ? pdfDoc.getTitle() : pdf.name,
				author: pdfDoc.getAuthor(),
				progress: 0,
				bookmark: 0,
				currentScale: null,
				error: true
			};
		}
	}));

	return pdfData;
}

async function updateBook(pdfPath, book) {
	const pdfBytes = fs.readFileSync(pdfPath);
	const pdfDoc = await PDFDocument.load(pdfBytes);
	pdfDoc.setTitle(book.title);

	const modifiedPdfBytes = await pdfDoc.save();

	const fd = fs.openSync(pdfPath, 'w');
	fs.writeSync(fd, modifiedPdfBytes);
	fs.fsyncSync(fd);
	fs.closeSync(fd);
}

async function getConfigurationFilePath() {
	const appDataPath = process.env.APPDATA || (process.platform == 'darwin' ? process.env.HOME + '/Library/Preferences' : process.env.HOME + "/.local/share");

	return path.join(appDataPath, "library_home.txt");
}

async function setMetadata(pageNumber, currentScale) {
		// Read the PDF file
		const pdfBytes = fs.readFileSync(currentPdfPath);
		const pdfDoc = await PDFDocument.load(pdfBytes);
		
		let metadata = [`bookmark:${pageNumber}, currentScale:${currentScale}`];
	
		pdfDoc.setKeywords(metadata);

		// Save the modified PDF
		const modifiedPdfBytes = await pdfDoc.save();

		// Write it back to the same file
		const fd = fs.openSync(currentPdfPath, 'w');
		fs.writeSync(fd, modifiedPdfBytes);
		fs.fsyncSync(fd); // <-- Forces write to disk
		fs.closeSync(fd);
		// fs.writeFileSync(currentPdfPath, modifiedPdfBytes);
}

// Create the Electron window
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
		plugins: true, // Enable PDF viewer
		preload: path.join(__dirname, 'preload.ts'),
		nodeIntegration: false,
		contextIsolation: true,
	  },
  });

  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5174/');
  } else {
    mainWindow.loadFile(path.join(__dirname, 'dist/index.html'));
  }

  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}



app.whenReady().then(createWindow);

ipcMain.handle('get-folders-children', async (event, folderPath, folder) => {
    return await getFoldersChildren(folderPath, folder);  // Calling the extracted function
});

ipcMain.handle('get-current-folder', async (event, folderPath, folder) => {
    return await getCurrentFolder(folderPath, folder);  // Calling the extracted function
});

ipcMain.handle('get-parent-folder', async (event, folderPath) => {
    return await getParentFolder(folderPath);  // Calling the extracted function
});

ipcMain.handle('create-folder', async (event, currentPath, folderName) => {
    await createFolder(currentPath, folderName);  // Calling the extracted function
});

ipcMain.handle('get-home', async (event) => {
    return await getHome();  // Calling the extracted function
});

ipcMain.handle('set-home', async (event, currentPath) => {
    return await setHome(currentPath);  // Calling the extracted function
});

ipcMain.handle('get-folders-pdfs', async (event, foldersPath) => {
    return await getFoldersPDFs(foldersPath);  // Calling the extracted function
});

ipcMain.handle('update-book', async (event, pdfPath, book) => {
    return await updateBook(pdfPath, book);  // Calling the extracted function
});

ipcMain.handle('open-pdf', async (event, pdfPath, currentFolder, pageNumber, currentScale) => {
	currentPdfPath = pdfPath;
	try {
	  const pdfUrl = `file://${pdfPath}#page=${pageNumber}&currentScale=${currentScale}`;
	  if (!fs.existsSync(pdfPath)) {
		throw new Error('PDF file does not exist');
	  }
	  // Load custom PDF viewer with query parameters
	  
	  mainWindow.loadFile('pdf-viewer.html', {
		query: { pdfUrl: encodeURIComponent(pdfUrl) },
	  });
	  return true;
	} catch (err) {
	  console.error('Error opening PDF:', err);
	  throw err;
	}
  });
  
  ipcMain.handle('back-to-app', async (event, pageNumber, currentScale) => {
	await setMetadata(pageNumber, currentScale);

	try {
	  if (process.env.NODE_ENV === 'development') {
		// mainWindow.loadURL('http://localhost:5173/');
		mainWindow.loadURL('http://localhost:5174/');
	  } else {
		mainWindow.loadFile(path.join(__dirname, 'dist/index.html'));
	  }
	  return true;
	} catch (err) {
	  console.error('Error returning to app:', err);
	  throw err;
	}
  });

  ipcMain.handle('get-page-number', async () => {
	try {
	  // Get the webContents of the iframe (assumes iframe is the only one)
	  const webContents = mainWindow.webContents;
	  
	  // Execute JavaScript in the iframe's context
	  const pageData = await webContents.executeJavaScript(`
		(function() {
		  try {
			// Access the PDF viewer's shadow DOM (Chromium-specific)
			const viewer = document.querySelector('embed[type="application/pdf"]') ||
						  document.querySelector('iframe')?.contentDocument;
			if (!viewer) return null;
  
			// Find the toolbar's page number input (may vary by Chromium version)
			const pageInput = document.querySelector('#pageNumber') ||
							 document.querySelector('input[title="Page number"]');
			const totalPages = document.querySelector('#pageCount')?.textContent ||
							  document.querySelector('span[title="Total pages"]')?.textContent;
			console.log(viewer);
  
			return {
			  currentPage: pageInput?.value || 1,
			  totalPages: totalPages || 0
			};
		  } catch (e) {
			console.error(e);
			return null;
		  }
		})();
	  `);
  
	  return pageData || { currentPage: 1, totalPages: 0 };
	} catch (err) {
	  console.error('Error getting page number:', err);
	  return null;
	}
  });

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', function () {
  if (mainWindow === null) createWindow();
});
