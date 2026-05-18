import { z } from 'zod'

export const TransactionExtraction = z.object({
  // Buyer / client
  client_name:                 z.string().nullable(),
  client_phone:                z.string().nullable(),
  client_email:                z.string().nullable(),

  // Property
  property_address:            z.string().nullable(),
  mls_number:                  z.string().nullable(),

  // Contract terms
  purchase_price:              z.number().nullable(),
  earnest_money:               z.number().nullable(),
  construction_deposit:        z.number().nullable(),
  concessions:                 z.number().nullable(),
  offer_reference_date:        z.string().nullable(),
  acceptance_date:             z.string().nullable(),

  // Deadlines
  seller_disclosure_date:      z.string().nullable(),
  due_diligence_date:          z.string().nullable(),
  financing_date:              z.string().nullable(),
  close_date:                  z.string().nullable(),

  // Commission
  sac_percent:                 z.number().nullable(),
  bac_percent:                 z.number().nullable(),
  net_or_gross:                z.string().nullable(),
  transaction_fee:             z.number().nullable(),

  // Home warranty
  home_warranty:               z.boolean().nullable(),
  home_warranty_paid_by:       z.string().nullable(),
  home_warranty_amount:        z.number().nullable(),

  // Seller contact
  seller_name:                 z.string().nullable(),
  seller_phone:                z.string().nullable(),
  seller_email:                z.string().nullable(),

  // Buyer agent (KW agent)
  agent_name:                  z.string().nullable(),
  agent_company:               z.string().nullable(),
  agent_phone:                 z.string().nullable(),
  agent_email:                 z.string().nullable(),
  agent_office_address:        z.string().nullable(),
  tc_name:                     z.string().nullable(),

  // Listing agent (seller's agent)
  sellers_agent_name:          z.string().nullable(),
  sellers_agent_company:       z.string().nullable(),
  sellers_agent_phone:         z.string().nullable(),
  sellers_agent_email:         z.string().nullable(),

  // Buyer title company
  title_company:               z.string().nullable(),
  title_officer_name:          z.string().nullable(),
  title_officer_phone:         z.string().nullable(),
  title_officer_email:         z.string().nullable(),

  // Seller title company
  seller_title_company:        z.string().nullable(),
  seller_title_officer_name:   z.string().nullable(),
  seller_title_officer_phone:  z.string().nullable(),
  seller_title_officer_email:  z.string().nullable(),

  // Lender
  lender_company:              z.string().nullable(),
  lender_name:                 z.string().nullable(),
  lender_phone:                z.string().nullable(),
  lender_email:                z.string().nullable(),

  // Notes
  water_shares_rights:         z.string().nullable(),
  notes_content:               z.string().nullable(),

  // Meta — transaction_type is selected manually by TC, not extracted
  kw_side:              z.enum(['buyer', 'seller']).nullable(),
  team_detection: z.object({
    team:             z.enum(['CHR', 'KW_UTAH', 'KW_IDAHO']).nullable(),
    confidence:       z.enum(['high', 'medium', 'low']).nullable(),
    detection_source: z.string().nullable(),
    uncertain:        z.boolean(),
  }),
  uncertain_fields: z.array(z.string()),
})

export type TransactionExtraction = z.infer<typeof TransactionExtraction>

const nullableText    = z.string().nullable()
const nullableNum     = z.number().nullable()
const nullableDate    = z.string().nullable()
const nullableBool    = z.boolean().nullable()

export const Transaction = z.object({
  id:                          z.string().uuid(),
  created_at:                  z.string(),
  status:                      z.string(),
  team:                        z.enum(['CHR', 'KW_UTAH', 'KW_IDAHO']).nullable(),
  kw_side:                     nullableText,
  transaction_type:            nullableText,

  client_name:                 nullableText,
  client_phone:                nullableText,
  client_email:                nullableText,

  property_address:            nullableText,
  short_address:               nullableText,
  mls_number:                  nullableText,

  purchase_price:              nullableNum,
  earnest_money:               nullableNum,
  construction_deposit:        nullableNum,
  concessions:                 nullableNum,
  offer_reference_date:        nullableDate,
  acceptance_date:             nullableDate,

  seller_disclosure_date:      nullableDate,
  due_diligence_date:          nullableDate,
  financing_date:              nullableDate,
  close_date:                  nullableDate,

  sac_percent:                 nullableNum,
  bac_percent:                 nullableNum,
  net_or_gross:                nullableText,
  transaction_fee:             nullableNum,

  home_warranty:               nullableBool,
  home_warranty_paid_by:       nullableText,
  home_warranty_amount:        nullableNum,

  seller_name:                 nullableText,
  seller_phone:                nullableText,
  seller_email:                nullableText,

  agent_name:                  nullableText,
  agent_company:               nullableText,
  agent_phone:                 nullableText,
  agent_email:                 nullableText,
  agent_office_address:        nullableText,
  tc_name:                     nullableText,

  sellers_agent_name:          nullableText,
  sellers_agent_company:       nullableText,
  sellers_agent_phone:         nullableText,
  sellers_agent_email:         nullableText,

  title_company:               nullableText,
  title_officer_name:          nullableText,
  title_officer_phone:         nullableText,
  title_officer_email:         nullableText,

  seller_title_company:        nullableText,
  seller_title_officer_name:   nullableText,
  seller_title_officer_phone:  nullableText,
  seller_title_officer_email:  nullableText,

  lender_company:              nullableText,
  lender_name:                 nullableText,
  lender_phone:                nullableText,
  lender_email:                nullableText,

  monday_checklist_id:         nullableText,
  monday_clients_id:           nullableText,
  drive_folder_id:             nullableText,
  drive_folder_url:            nullableText,

  water_shares_rights:         nullableText,
  notes:                       nullableText,
})

export type Transaction = z.infer<typeof Transaction>

export const TransactionInsert = z.object({
  team:                        z.enum(['CHR', 'KW_UTAH', 'KW_IDAHO']),
  kw_side:                     z.string(),
  transaction_type:            z.string(),

  client_name:                 nullableText,
  client_phone:                nullableText,
  client_email:                nullableText,

  property_address:            nullableText,
  short_address:               nullableText,
  mls_number:                  nullableText,

  purchase_price:              nullableNum,
  earnest_money:               nullableNum,
  construction_deposit:        nullableNum,
  concessions:                 nullableNum,
  offer_reference_date:        nullableDate,
  acceptance_date:             nullableDate,

  seller_disclosure_date:      nullableDate,
  due_diligence_date:          nullableDate,
  financing_date:              nullableDate,
  close_date:                  nullableDate,

  sac_percent:                 nullableNum,
  bac_percent:                 nullableNum,
  net_or_gross:                nullableText,
  transaction_fee:             nullableNum,

  home_warranty:               nullableBool,
  home_warranty_paid_by:       nullableText,
  home_warranty_amount:        nullableNum,

  seller_name:                 nullableText,
  seller_phone:                nullableText,
  seller_email:                nullableText,

  agent_name:                  nullableText,
  agent_company:               nullableText,
  agent_phone:                 nullableText,
  agent_email:                 nullableText,
  agent_office_address:        nullableText,
  tc_name:                     nullableText,

  sellers_agent_name:          nullableText,
  sellers_agent_company:       nullableText,
  sellers_agent_phone:         nullableText,
  sellers_agent_email:         nullableText,

  title_company:               nullableText,
  title_officer_name:          nullableText,
  title_officer_phone:         nullableText,
  title_officer_email:         nullableText,

  seller_title_company:        nullableText,
  seller_title_officer_name:   nullableText,
  seller_title_officer_phone:  nullableText,
  seller_title_officer_email:  nullableText,

  lender_company:              nullableText,
  lender_name:                 nullableText,
  lender_phone:                nullableText,
  lender_email:                nullableText,

  water_shares_rights:         nullableText,
  notes:                       nullableText,
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
