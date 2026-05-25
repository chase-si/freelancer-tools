export type ActionId = 'log-time' | 'upwork-jobs' | 'cursor-usage' | 'settings'

export type MenuAction = {
  id: ActionId
  label: string
  description: string
  status: 'ready' | 'planned'
  visible: boolean
  order: number
}

export const DEFAULT_ACTIONS: MenuAction[] = [
  {
    id: 'log-time',
    label: 'Log Time',
    description: 'Track time spent on each freelance project.',
    status: 'planned',
    visible: true,
    order: 10
  },
  {
    id: 'upwork-jobs',
    label: 'Upwork Jobs',
    description: 'Run a local workflow that fetches and filters Upwork jobs.',
    status: 'planned',
    visible: true,
    order: 20
  },
  {
    id: 'cursor-usage',
    label: 'Cursor Usage',
    description: 'Show current Cursor usage and quota signals.',
    status: 'planned',
    visible: true,
    order: 30
  },
  {
    id: 'settings',
    label: 'Manage Menu',
    description: 'Choose which actions appear in the menu bar panel.',
    status: 'ready',
    visible: true,
    order: 40
  }
]
