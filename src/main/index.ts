import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { getRendererHandlers, registerIpcMain } from '@egoist/tipc/main'
import { RendererHandlers, router } from './tipc'

function createWindow(): BrowserWindow {
  const mainWindow = new BrowserWindow({
    width: 1920,
    height: 1080,
    show: false,
    ...(process.platform === 'linux' ? { icon } : {}),
    backgroundColor: '#ffffff',
    titleBarStyle: 'hidden',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    },
    autoHideMenuBar: true,
    titleBarOverlay: {
      color: '#fff',
      symbolColor: '#000',
      height: 30
    },
    frame: true
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()

    const handlers = getRendererHandlers<RendererHandlers>(mainWindow.webContents)

    // TODO: this is ugly, we are setting the quiqr paths on every navigation
    // Maybe we can fix it trough a preload?
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ipcMain.on('navigation-event', async (_, _location) => {
      handlers.getUserAgent.invoke().then(console.log).catch(console.error)
      handlers.setUserdataDirectoryPath.send(app.getPath('userData'))
      handlers.setHomeDirectoryPath.send(app.getPath('home'))
      handlers.setQuiqrHomeDirectoryPath.send(app.getPath('home') + '/Quiqr/sites')
    })
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  // mainWindow.webContents.openDevTools()

  return mainWindow
}

app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  registerIpcMain(router)

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
