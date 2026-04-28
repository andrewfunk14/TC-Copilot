import type { Transaction } from '../schemas'

export type EmailType = 'title_lender_buyer' | 'sellers_agent_buyer' | 'client_buyer'

export function buildEmailUserPrompt(
  type: EmailType,
  transaction: Transaction,
  template: string
): string {
  const details = `
Transaction Details:
- Client: ${transaction.client_name ?? 'Unknown'}
- Property: ${transaction.property_address ?? 'Unknown'}
- Agent: ${transaction.agent_name ?? 'Unknown'}
- Acceptance Date: ${transaction.acceptance_date ?? 'Unknown'}
- Close Date: ${transaction.close_date ?? 'Unknown'}
- Purchase Price: ${transaction.purchase_price ? `$${transaction.purchase_price.toLocaleString()}` : 'Unknown'}
- MLS #: ${transaction.mls_number ?? 'N/A'}
- Lender: ${transaction.lender_name ?? 'Unknown'}
- Lender Email: ${transaction.lender_email ?? 'Unknown'}
- Title Company: ${transaction.title_company ?? 'Unknown'}
- Title Officer: ${transaction.title_officer_name ?? 'Unknown'}
- Title Officer Email: ${transaction.title_officer_email ?? 'Unknown'}
- Seller's Agent: ${transaction.sellers_agent_name ?? 'Unknown'}
- Seller's Agent Email: ${transaction.sellers_agent_email ?? 'Unknown'}
- TC: ${transaction.tc_name ?? 'Unknown'}
- Transaction Type: ${transaction.transaction_type ?? 'residential'}
- Team: ${transaction.team ?? 'Unknown'}
`.trim()

  return `Using the template below and the transaction details, generate an email draft.

${details}

EMAIL TEMPLATE:
${template}

Instructions:
- Fill in all [BRACKET] placeholders with the actual transaction data above
- Maintain the exact tone, structure, and sign-off from the template
- Do not add any information not present in the template or transaction details
- Do not auto-populate To/CC fields — leave recipient guidance as-is in the template
- Return: { type: "${type}", subject: "<subject line>", body: "<full email body>" }`
}
