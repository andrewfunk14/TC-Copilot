// tc_custom_instructions is always last — TC preferences override everything above
export function assembleSystemPrompt(
  keys: string[],
  configMap: Record<string, string>
): string {
  return keys
    .filter(key => configMap[key])
    .map(key => configMap[key])
    .join('\n\n---\n\n')
}
