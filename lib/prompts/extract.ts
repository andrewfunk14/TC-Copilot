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

Mark a field in uncertain_fields if:
- The value is present but unclear or partially legible
- Multiple possible values exist
- The field was inferred rather than explicitly stated

For dates, use YYYY-MM-DD format. For purchase_price, return as a number (no dollar signs or commas).
For short_address, extract only the street number and street name (e.g. "1234 Maple St" from "1234 Maple St, Salt Lake City, UT 84101").

Return null for any field that cannot be determined from the document.`
}
