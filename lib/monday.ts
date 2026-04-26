import type { Transaction } from './schemas'

interface MondayBoardConfig {
  board_id: string
  group_id: string
  columns: Record<string, string>
}

interface MondayTeamConfig {
  checklist: MondayBoardConfig
  clients: MondayBoardConfig
}

type MondayBuyerConfig = Record<string, MondayTeamConfig>

interface MondayCreateResult {
  checklist_item_id: string
  clients_item_id: string
}

export class MondayClient {
  private apiKey: string
  private apiUrl = 'https://api.monday.com/v2'

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  private async query<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
    const res = await fetch(this.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: this.apiKey,
        'API-Version': '2024-01',
      },
      body: JSON.stringify({ query, variables }),
    })

    if (!res.ok) throw new Error(`Monday API error: ${res.status} ${res.statusText}`)

    const json = await res.json() as { data?: T; errors?: { message: string }[] }
    if (json.errors?.length) throw new Error(`Monday GraphQL error: ${json.errors[0].message}`)
    return json.data as T
  }

  async createItem(
    boardId: string,
    groupId: string,
    itemName: string,
    columnValues: Record<string, unknown>
  ): Promise<string> {
    const data = await this.query<{ create_item: { id: string } }>(`
      mutation CreateItem($boardId: ID!, $groupId: String!, $itemName: String!, $columnValues: JSON!) {
        create_item(
          board_id: $boardId
          group_id: $groupId
          item_name: $itemName
          column_values: $columnValues
        ) {
          id
        }
      }
    `, {
      boardId,
      groupId,
      itemName,
      columnValues: JSON.stringify(columnValues),
    })
    return data.create_item.id
  }

  buildColumnValues(
    transaction: Transaction,
    columns: Record<string, string>,
    tcUserId?: string
  ): Record<string, unknown> {
    const values: Record<string, unknown> = {}

    if (columns.client_name && transaction.client_name) {
      values[columns.client_name] = transaction.client_name
    }
    if (columns.client_email && transaction.client_email) {
      values[columns.client_email] = { email: transaction.client_email, text: transaction.client_email }
    }
    if (columns.address && transaction.property_address) {
      values[columns.address] = transaction.property_address
    }
    if (columns.agent_name && transaction.agent_name) {
      values[columns.agent_name] = transaction.agent_name
    }
    if (columns.agent_email && transaction.agent_email) {
      values[columns.agent_email] = { email: transaction.agent_email, text: transaction.agent_email }
    }
    if (columns.contract_date && transaction.contract_date) {
      values[columns.contract_date] = { date: transaction.contract_date }
    }
    if (columns.close_date && transaction.close_date) {
      values[columns.close_date] = { date: transaction.close_date }
    }
    if (columns.purchase_price && transaction.purchase_price) {
      values[columns.purchase_price] = String(transaction.purchase_price)
    }
    if (columns.mls_number && transaction.mls_number) {
      values[columns.mls_number] = transaction.mls_number
    }
    if (columns.lender_name && transaction.lender_name) {
      values[columns.lender_name] = transaction.lender_name
    }
    if (columns.title_company && transaction.title_company) {
      values[columns.title_company] = transaction.title_company
    }
    if (columns.buyer_seller) {
      values[columns.buyer_seller] = { label: 'Buyer' }
    }
    if (columns.tc && tcUserId) {
      values[columns.tc] = { personsAndTeams: [{ id: Number(tcUserId), kind: 'person' }] }
    }

    return values
  }
}

export async function createMondayRows(
  transaction: Transaction,
  config: MondayBuyerConfig,
  tcUserId?: string
): Promise<MondayCreateResult> {
  const apiKey = process.env.MONDAY_API_KEY
  if (!apiKey) throw new Error('MONDAY_API_KEY not configured')

  const team = transaction.team
  if (!team) throw new Error('Transaction team is required for Monday row creation')

  const teamConfig = config[team]
  if (!teamConfig) throw new Error(`No Monday config found for team: ${team}`)

  const client = new MondayClient(apiKey)
  const itemName = transaction.short_address ?? transaction.property_address ?? 'Unknown Property'

  const [checklistId, clientsId] = await Promise.all([
    client.createItem(
      teamConfig.checklist.board_id,
      teamConfig.checklist.group_id,
      itemName,
      client.buildColumnValues(transaction, teamConfig.checklist.columns, tcUserId)
    ),
    client.createItem(
      teamConfig.clients.board_id,
      teamConfig.clients.group_id,
      itemName,
      client.buildColumnValues(transaction, teamConfig.clients.columns, tcUserId)
    ),
  ])

  return {
    checklist_item_id: checklistId,
    clients_item_id: clientsId,
  }
}
