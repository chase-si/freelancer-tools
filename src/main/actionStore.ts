import { dirname, join } from 'node:path'
import { mkdirSync } from 'node:fs'
import Database from 'better-sqlite3'
import { DEFAULT_ACTIONS, type ActionId, type MenuAction } from '../shared/actions'

type ActionRow = {
  id: ActionId
  label: string
  description: string
  status: MenuAction['status']
  visible: 0 | 1
  order_index: number
}

export class ActionStore {
  private readonly db: Database.Database

  constructor(dbPath: string) {
    mkdirSync(dirname(dbPath), { recursive: true })
    this.db = new Database(dbPath)
    this.db.pragma('journal_mode = WAL')
    this.createSchema()
    this.seedDefaults()
  }

  listActions(): MenuAction[] {
    const rows = this.db
      .prepare('select id, label, description, status, visible, order_index from menu_actions order by order_index asc')
      .all() as ActionRow[]

    return rows.map((row) => ({
      id: row.id,
      label: row.label,
      description: row.description,
      status: row.status,
      visible: Boolean(row.visible),
      order: row.order_index
    }))
  }

  setActionVisibility(id: ActionId, visible: boolean): MenuAction[] {
    this.db
      .prepare('update menu_actions set visible = @visible, updated_at = datetime(\'now\') where id = @id')
      .run({ id, visible: visible ? 1 : 0 })

    return this.listActions()
  }

  private createSchema(): void {
    this.db.exec(`
      create table if not exists menu_actions (
        id text primary key,
        label text not null,
        description text not null,
        status text not null check (status in ('ready', 'planned')),
        visible integer not null default 1,
        order_index integer not null,
        created_at text not null default (datetime('now')),
        updated_at text not null default (datetime('now'))
      );
    `)
  }

  private seedDefaults(): void {
    const insert = this.db.prepare(`
      insert into menu_actions (id, label, description, status, visible, order_index)
      values (@id, @label, @description, @status, @visible, @order)
      on conflict(id) do update set
        label = excluded.label,
        description = excluded.description,
        status = excluded.status,
        order_index = excluded.order_index,
        updated_at = datetime('now');
    `)

    const transaction = this.db.transaction(() => {
      for (const action of DEFAULT_ACTIONS) {
        insert.run({
          ...action,
          visible: action.visible ? 1 : 0
        })
      }
    })

    transaction()
  }
}

export function createActionStore(userDataPath: string): ActionStore {
  return new ActionStore(join(userDataPath, 'freelancer-tools.sqlite'))
}
