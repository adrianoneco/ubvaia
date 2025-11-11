// Centralized date/time helpers for server and frontend

/**
 * Parses a DB timestamp (string, number, Date) and returns a Date object.
 * If the string lacks timezone info, assumes America/Sao_Paulo (-03:00).
 */

function formatIsoToBrDate(isoString: string): string {
  const date = new Date(isoString);

  if (isNaN(date.getTime())) {
    throw new Error("Invalid ISO date string");
  }

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${day}/${month}/${year} ${hours}:${minutes}`;
}


export function parseDbTimestamp(v: any): Date | null {
  if (v === null || v === undefined) return null;
  if (v instanceof Date) return v;
  if (typeof v === 'number') return new Date(v);
  if (typeof v === 'string') {
    let s = v.trim();
    if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(s)) {
      s = s.replace(' ', 'T') + '-03:00';
    } else if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?$/.test(s)) {
      s = s + '-03:00';
    }
    const d = new Date(s);
    if (isNaN(d.getTime())) return null;
    return d;
  }
  return null;
}

/**
 * Formats a Date object to pt-BR and America/Sao_Paulo timezone.
 * Returns 'Sem data' if null/invalid.
 */
export function formatToSaoPaulo(date: Date | null): string {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) return 'Sem data';
  return formatIsoToBrDate(date.toISOString());
}
