import { contextBridge, ipcRenderer } from 'electron'
import type { ActionId, MenuAction } from '../shared/actions'

const api = {
  listActions: (): Promise<MenuAction[]> => ipcRenderer.invoke('actions:list'),
  setActionVisibility: (id: ActionId, visible: boolean): Promise<MenuAction[]> =>
    ipcRenderer.invoke('actions:set-visibility', id, visible),
  hidePanel: (): Promise<void> => ipcRenderer.invoke('app:hide-panel'),
  quit: (): Promise<void> => ipcRenderer.invoke('app:quit')
}

contextBridge.exposeInMainWorld('freelancerTools', api)

export type FreelancerToolsApi = typeof api
