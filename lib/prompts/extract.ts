export function buildExtractionUserPrompt(chrAgentNames: string[]): string {
  const agentList = chrAgentNames.length > 0
    ? `Known CHR agents: ${chrAgentNames.join(', ')}`
    : 'No CHR agent list provided.'

  return `Extract all transaction details from this real estate info sheet PDF.

${agentList}

Team detection — evaluate in this exact priority order:
1. CHR branding: scan for "CHR", "Christenson", or "Isabel" anywhere → team=CHR, confidence=high
2. CHR agent name match: compare agent_name against the known CHR agents list (fuzzy match ok) → team=CHR, confidence=high
3. Agent office address state: Idaho cities/state → team=KW_IDAHO confidence=high; Utah cities/state → team=KW_UTAH confidence=high
4. Agent office name keywords: contains Idaho/Utah city names → confidence=medium
5. Property address state fallback: use property state only if no office info → confidence=low, uncertain=true
6. No signal: team=null, uncertain=true

Field mapping guide (the info sheet uses these section labels):
- BUYER section → client_name, client_phone, client_email
- BUYER AGENT section → agent_name, agent_company, agent_phone, agent_email (this is the KW agent)
- BUYER TITLE COMPANY → title_company, title_officer_name, title_officer_phone, title_officer_email
- LENDER section → lender_company (Company field), lender_name (Loan Officer field), lender_phone, lender_email
- SELLER section → seller_name (may be multiple names), seller_phone, seller_email
- LISTING AGENT section → sellers_agent_name, sellers_agent_company, sellers_agent_phone, sellers_agent_email
- SELLER TITLE COMPANY → seller_title_company, seller_title_officer_name, seller_title_officer_phone, seller_title_officer_email
- CONTRACT section:
  - PURCHASE PRICE → purchase_price (number, no $ or commas)
  - EARNEST MONEY → earnest_money
  - CONSTRUCTION DEPOSIT → construction_deposit (null if N/A)
  - CONCESSIONS → concessions (null if blank/dash)
  - OFFER REFERENCE DATE → offer_reference_date
  - ACCEPTANCE DATE → acceptance_date
- DEADLINES section:
  - SELLER DISCLOSURE → seller_disclosure_date
  - DUE DILIGENCE → due_diligence_date
  - FINANCING → financing_date
  - SETTLEMENT → close_date
- COMMISSION section:
  - SAC% → sac_percent (number, null if dash/blank)
  - BAC% → bac_percent (number, e.g. 2.5)
  - NET OR GROSS → net_or_gross (text: "net" or "gross")
  - TRANSACTION FEE → transaction_fee (number, no $)
- HOME WARRANTY section:
  - YES/NO checkbox → home_warranty (true if YES is checked, false if NO is checked)
  - PAID BY → home_warranty_paid_by
  - AMOUNT → home_warranty_amount
- NOTES section:
  - WATER SHARES/RIGHTS → water_shares_rights
  - Any other notes → notes_content
- ADDRESS field → property_address
- MLS# → mls_number

Mark a field in uncertain_fields if:
- The value is present but unclear or partially legible
- Multiple possible values exist
- The field was inferred rather than explicitly stated

For dates, use YYYY-MM-DD format. Short dates like "11-8-25" → "2025-11-08".
For numeric fields, return as a number (no dollar signs, commas, or % symbols).
For seller_name, if multiple seller names are listed join them with " & " (e.g. "Tyler Godfrey & Katie Godfrey").
Return null for any field that cannot be determined from the document.`
}
