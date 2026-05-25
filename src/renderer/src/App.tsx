import { useEffect, useMemo, useState } from 'react'
import { BriefcaseBusiness, Clock3, Gauge, Power, Settings2, SlidersHorizontal, X } from 'lucide-react'
import type { ActionId, MenuAction } from '../../shared/actions'

const iconByAction: Record<ActionId, typeof Clock3> = {
  'log-time': Clock3,
  'upwork-jobs': BriefcaseBusiness,
  'cursor-usage': Gauge,
  settings: Settings2
}

export function App(): JSX.Element {
  const [actions, setActions] = useState<MenuAction[]>([])
  const [selectedActionId, setSelectedActionId] = useState<ActionId>('settings')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    window.freelancerTools.listActions().then((nextActions) => {
      setActions(nextActions)
      setIsLoading(false)
    })
  }, [])

  const visibleActions = useMemo(() => actions.filter((action) => action.visible), [actions])
  const selectedAction = useMemo(
    () => actions.find((action) => action.id === selectedActionId) ?? actions[0],
    [actions, selectedActionId]
  )

  async function setActionVisibility(action: MenuAction, visible: boolean): Promise<void> {
    const nextActions = await window.freelancerTools.setActionVisibility(action.id, visible)
    setActions(nextActions)

    if (!visible && selectedActionId === action.id) {
      setSelectedActionId('settings')
    }
  }

  return (
    <main className="h-screen overflow-hidden bg-mist text-ink">
      <header className="flex h-14 items-center justify-between border-b border-line bg-white/80 px-4">
        <div>
          <h1 className="text-sm font-semibold leading-tight">Freelancer Tools</h1>
          <p className="text-xs text-neutral-500">Menu bar workspace</p>
        </div>
        <div className="flex items-center gap-1">
          <button className="icon-button" type="button" title="Hide panel" onClick={() => window.freelancerTools.hidePanel()}>
            <X size={16} />
          </button>
          <button className="icon-button" type="button" title="Quit" onClick={() => window.freelancerTools.quit()}>
            <Power size={16} />
          </button>
        </div>
      </header>

      {isLoading ? (
        <section className="flex h-[calc(100vh-56px)] items-center justify-center text-sm text-neutral-500">Loading...</section>
      ) : (
        <section className="grid h-[calc(100vh-56px)] grid-rows-[auto_1fr]">
          <nav className="border-b border-line bg-white px-3 py-3">
            <div className="grid grid-cols-4 gap-2">
              {visibleActions.map((action) => {
                const Icon = iconByAction[action.id]
                const isSelected = selectedAction?.id === action.id

                return (
                  <button
                    key={action.id}
                    className={isSelected ? 'action-button action-button-selected' : 'action-button'}
                    type="button"
                    title={action.label}
                    onClick={() => setSelectedActionId(action.id)}
                  >
                    <Icon size={18} />
                    <span>{action.label}</span>
                  </button>
                )
              })}
            </div>
          </nav>

          <div className="overflow-y-auto px-4 py-4">
            {selectedAction ? (
              <ActionPanel action={selectedAction} actions={actions} onSetVisibility={setActionVisibility} />
            ) : null}
          </div>
        </section>
      )}
    </main>
  )
}

function ActionPanel({
  action,
  actions,
  onSetVisibility
}: {
  action: MenuAction
  actions: MenuAction[]
  onSetVisibility: (action: MenuAction, visible: boolean) => Promise<void>
}): JSX.Element {
  if (action.id === 'settings') {
    return (
      <section>
        <div className="mb-4 flex items-center gap-2">
          <SlidersHorizontal size={18} className="text-moss" />
          <h2 className="text-base font-semibold">Menu Actions</h2>
        </div>
        <div className="space-y-2">
          {actions.map((item) => (
            <label key={item.id} className="row-card">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="truncate text-sm font-medium">{item.label}</span>
                  <StatusPill status={item.status} />
                </div>
                <p className="mt-1 text-xs leading-5 text-neutral-500">{item.description}</p>
              </div>
              <input
                className="toggle"
                type="checkbox"
                checked={item.visible}
                onChange={(event) => onSetVisibility(item, event.target.checked)}
              />
            </label>
          ))}
        </div>
      </section>
    )
  }

  const Icon = iconByAction[action.id]

  return (
    <section className="space-y-4">
      <div className="flex items-start gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-md bg-white text-moss shadow-sm ring-1 ring-line">
          <Icon size={20} />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold">{action.label}</h2>
            <StatusPill status={action.status} />
          </div>
          <p className="mt-1 text-sm leading-6 text-neutral-600">{action.description}</p>
        </div>
      </div>

      <div className="rounded-md border border-line bg-white p-4">
        <p className="text-sm leading-6 text-neutral-600">
          This action is registered in the menu framework. Its workflow can be implemented next without changing the tray,
          panel, or visibility settings.
        </p>
      </div>
    </section>
  )
}

function StatusPill({ status }: { status: MenuAction['status'] }): JSX.Element {
  return <span className={status === 'ready' ? 'status-ready' : 'status-planned'}>{status}</span>
}
