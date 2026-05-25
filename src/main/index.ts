import { join } from 'node:path'
import { app, BrowserWindow, dialog, ipcMain, nativeImage, screen, Tray } from 'electron'
import { electronApp, is, optimizer } from '@electron-toolkit/utils'
import { createActionStore, type ActionStore } from './actionStore'
import type { ActionId } from '../shared/actions'

let tray: Tray | null = null
let panelWindow: BrowserWindow | null = null
let actionStore: ActionStore | null = null

const PANEL_WIDTH = 380
const PANEL_HEIGHT = 560

function createTrayImage(): Electron.NativeImage {
  const image =
    process.platform === 'darwin'
      ? nativeImage.createFromNamedImage('NSActionTemplate')
      : nativeImage.createFromDataURL(
          'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAARUlEQVR4AWMYBaNgFIyCUTAKRsEoGAXDgP8MDAwM/xkYGBj+MTAw/AfZgKxASkryH4qKigZcJgYGBv8hKChowGUUGAVjYBQMAwBfQhEXSxZ3sQAAAABJRU5ErkJggg=='
        )

  if (image.isEmpty()) {
    return nativeImage.createFromDataURL(
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAARUlEQVR4AWMYBaNgFIyCUTAKRsEoGAXDgP8MDAwM/xkYGBj+MTAw/AfZgKxASkryH4qKigZcJgYGBv8hKChowGUUGAVjYBQMAwBfQhEXSxZ3sQAAAABJRU5ErkJggg=='
    )
  }

  image.setTemplateImage(true)
  return image
}

function createPanelWindow(): BrowserWindow {
  const window = new BrowserWindow({
    width: PANEL_WIDTH,
    height: PANEL_HEIGHT,
    show: false,
    frame: false,
    resizable: false,
    movable: false,
    fullscreenable: false,
    skipTaskbar: true,
    alwaysOnTop: true,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  window.on('blur', () => {
    if (!window.webContents.isDevToolsOpened()) {
      window.hide()
    }
  })

  if (is.dev && process.env.ELECTRON_RENDERER_URL) {
    window.loadURL(process.env.ELECTRON_RENDERER_URL)
  } else {
    window.loadFile(join(__dirname, '../renderer/index.html'))
  }

  return window
}

function positionPanelWindow(): void {
  if (!tray || !panelWindow) return

  const trayBounds = tray.getBounds()
  const display = screen.getDisplayNearestPoint({
    x: trayBounds.x,
    y: trayBounds.y
  })

  const x = Math.round(trayBounds.x + trayBounds.width / 2 - PANEL_WIDTH / 2)
  const y = Math.round(display.workArea.y + 8)
  const clampedX = Math.min(Math.max(x, display.workArea.x + 8), display.workArea.x + display.workArea.width - PANEL_WIDTH - 8)

  panelWindow.setBounds({
    x: clampedX,
    y,
    width: PANEL_WIDTH,
    height: PANEL_HEIGHT
  })
}

function togglePanel(): void {
  if (!panelWindow) return

  if (panelWindow.isVisible()) {
    panelWindow.hide()
    return
  }

  positionPanelWindow()
  panelWindow.show()
  panelWindow.focus()
}

function registerIpc(): void {
  ipcMain.handle('actions:list', () => actionStore?.listActions() ?? [])
  ipcMain.handle('actions:set-visibility', (_event, id: ActionId, visible: boolean) => {
    return actionStore?.setActionVisibility(id, visible) ?? []
  })
  ipcMain.handle('app:hide-panel', () => panelWindow?.hide())
  ipcMain.handle('app:quit', () => app.quit())
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.freelancertools.menubar')
  app.dock?.hide()

  actionStore = createActionStore(app.getPath('userData'))
  registerIpc()

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  panelWindow = createPanelWindow()
  tray = new Tray(createTrayImage())
  tray.setToolTip('Freelancer Tools')
  tray.on('click', togglePanel)
  tray.on('right-click', togglePanel)

  if (is.dev) {
    panelWindow.webContents.once('did-finish-load', () => {
      positionPanelWindow()
      panelWindow?.show()
      panelWindow?.focus()
    })
  }
}).catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error)

  dialog.showErrorBox(
    'Freelancer Tools failed to start',
    `${message}\n\nIf this mentions better-sqlite3 or NODE_MODULE_VERSION, run: pnpm run rebuild:native`
  )
  app.quit()
})

app.on('window-all-closed', () => {})

app.on('before-quit', () => {
  panelWindow?.removeAllListeners('close')
})
