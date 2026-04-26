import { z } from 'zod'

export const TransactionExtraction = z.object({
  client_name:          z.string().nullable(),
  client_email:         z.string().nullable(),
  property_address:     z.string().nullable(),
  agent_name:           z.string().nullable(),
  agent_email:          z.string().nullable(),
  agent_office_address: z.string().nullable(),
  tc_name:              z.string().nullable(),
  contract_date:        z.string().nullable(),
  close_date:           z.string().nullable(),
  purchase_price:       z.number().nullable(),
  mls_number:           z.string().nullable(),
  notes_content:        z.string().nullable(),
  lender_name:          z.string().nullable(),
  lender_email:         z.string().nullable(),
  title_company:        z.string().nullable(),
  title_officer_name:   z.string().nullable(),
  title_officer_email:  z.string().nullable(),
  sellers_agent_name:   z.string().nullable(),
  sellers_agent_email:  z.string().nullable(),
  kw_side:              z.enum(['buyer', 'seller']).nullable(),
  transaction_type:     z.enum(['residential', 'land']).nullable(),
  team_detection: z.object({
    team:             z.enum(['CHR', 'KW_UTAH', 'KW_IDAHO']).nullable(),
    confidence:       z.enum(['high', 'medium', 'low']).nullable(),
    detection_source: z.string().nullable(),
    uncertain:        z.boolean(),
  }),
  uncertain_fields: z.array(z.string()),
})

export type TransactionExtraction = z.infer<typeof TransactionExtraction>

export const Transaction = z.object({
  id:                   z.string().uuid(),
  created_at:           z.string(),
  status:               z.string(),
  team:                 z.enum(['CHR', 'KW_UTAH', 'KW_IDAHO']).nullable(),
  kw_side:              z.string().nullable(),
  transaction_type:     z.string().nullable(),
  client_name:          z.string().nullable(),
  client_email:         z.string().nullable(),
  property_address:     z.string().nullable(),
  short_address:        z.string().nullable(),
  agent_name:           z.string().nullable(),
  agent_email:          z.string().nullable(),
  agent_office_address: z.string().nullable(),
  tc_name:              z.string().nullable(),
  contract_date:        z.string().nullable(),
  close_date:           z.string().nullable(),
  purchase_price:       z.number().nullable(),
  mls_number:           z.string().nullable(),
  lender_name:          z.string().nullable(),
  lender_email:         z.string().nullable(),
  title_company:        z.string().nullable(),
  title_officer_name:   z.string().nullable(),
  title_officer_email:  z.string().nullable(),
  sellers_agent_name:   z.string().nullable(),
  sellers_agent_email:  z.string().nullable(),
  monday_checklist_id:  z.string().nullable(),
  monday_clients_id:    z.string().nullable(),
  drive_folder_id:      z.string().nullable(),
  drive_folder_url:     z.string().nullable(),
  notes:                z.string().nullable(),
})

export type Transaction = z.infer<typeof Transaction>

export const TransactionInsert = z.object({
  team:                 z.enum(['CHR', 'KW_UTAH', 'KW_IDAHO']),
  kw_side:              z.string(),
  transaction_type:     z.string(),
  client_name:          z.string().nullable(),
  client_email:         z.string().nullable(),
  property_address:     z.string().nullable(),
  short_address:        z.string().nullable(),
  agent_name:           z.string().nullable(),
  agent_email:          z.string().nullable(),
  agent_office_address: z.string().nullable(),
  tc_name:              z.string().nullable(),
  contract_date:        z.string().nullable(),
  close_date:           z.string().nullable(),
  purchase_price:       z.number().nullable(),
  mls_number:           z.string().nullable(),
  lender_name:          z.string().nullable(),
  lender_email:         z.string().nullable(),
  title_company:        z.string().nullable(),
  title_officer_name:   z.string().nullable(),
  title_officer_email:  z.string().nullable(),
  sellers_agent_name:   z.string().nullable(),
  sellers_agent_email:  z.string().nullable(),
  notes:                z.string().nullable(),
})

export type TransactionInsert = z.infer<typeof TransactionInsert>

export const EmailDraft = z.object({
  type:    z.string(),
  subject: z.string(),
  body:    z.string(),
})

export type EmailDraft = z.infer<typeof EmailDraft>

export const LaunchResult = z.object({
  monday: z.object({
    success:           z.boolean(),
    checklist_item_id: z.string().optional(),
    clients_item_id:   z.string().optional(),
    error:             z.string().optional(),
  }),
  drive: z.object({
    success:          z.boolean(),
    drive_folder_id:  z.string().optional(),
    drive_folder_url: z.string().optional(),
    error:            z.string().optional(),
    error_code:       z.string().optional(),
  }),
  emails: z.object({
    success: z.boolean(),
    drafts:  z.array(EmailDraft).optional(),
    error:   z.string().optional(),
  }),
})

export type LaunchResult = z.infer<typeof LaunchResult>

export const ConfigPatchInput = z.object({
  key:   z.string(),
  value: z.string().max(1000, 'Value exceeds 1000 characters'),
})

export type ConfigPatchInput = z.infer<typeof ConfigPatchInput>
