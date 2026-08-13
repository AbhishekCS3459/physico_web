/** Normalize a Canadian postal code or FSA prefix: T2P 1J9 → T2P1J9 */
export function normalizePostalCode(input: string): string {
  return input.toUpperCase().replace(/[^A-Z0-9]/g, "")
}

/** Display form: T2P1J9 → T2P 1J9 */
export function formatPostalCode(normalized: string): string {
  const code = normalizePostalCode(normalized)
  if (code.length === 6) return `${code.slice(0, 3)} ${code.slice(3)}`
  return code
}

/**
 * Covered if any stored code exactly matches, or is a prefix of, the user input.
 * Example: stored T2P covers T2P 1J9; stored T2P1J9 covers only that code.
 */
export function isPostalCodeCovered(userInput: string, storedCodes: string[]): boolean {
  return findBestCoverageMatch(userInput, storedCodes.map((code) => ({ code }))) !== null
}

/** Most specific matching pincode (longest code that covers the input). */
export function findBestCoverageMatch<T extends { code: string }>(
  userInput: string,
  pincodes: T[]
): T | null {
  const input = normalizePostalCode(userInput)
  if (input.length < 3) return null
  const matches = pincodes.filter((p) => {
    const code = normalizePostalCode(p.code)
    return Boolean(code) && (input === code || input.startsWith(code))
  })
  if (matches.length === 0) return null
  return [...matches].sort(
    (a, b) => normalizePostalCode(b.code).length - normalizePostalCode(a.code).length
  )[0]
}

export function formatTravelFee(fee: number | null | undefined): string {
  if (fee == null || Number.isNaN(fee) || fee <= 0) return "None"
  return `$${fee % 1 === 0 ? fee.toFixed(0) : fee.toFixed(2)}`
}

export function parsePincodeList(raw: string): string[] {
  const canadianMatches = raw.toUpperCase().match(/\b[ABCEGHJ-NPRSTVXY]\d[ABCEGHJ-NPRSTV-Z](?:\s?\d[ABCEGHJ-NPRSTV-Z]\d)?\b/g) ?? []
  const split = raw
    .split(/[\n,;]+/)
    .map((s) => s.trim())
    .filter(Boolean)

  const combined = [...canadianMatches, ...split]
    .map(normalizePostalCode)
    .filter((code) => code.length >= 3)

  return [...new Set(combined)]
}
