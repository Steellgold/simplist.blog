/** Format a date for display */
export function formatDate(date?: Date | null): string | null {
  if (!date) return null
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(date))
}

/** Check if a JSON string is valid */
export function isValidJson(str: string): boolean {
  try {
    JSON.parse(str)
    return true
  } catch {
    return false
  }
}

/** Format JSON with indentation */
export function formatJson(payload: unknown): string {
  return JSON.stringify(payload, null, 2)
}

/** Format response for display */
export function formatResponse(response: unknown): string {
  if (!response) return "No response"
  try {
    return JSON.stringify(response, null, 2)
  } catch {
    return String(response)
  }
}