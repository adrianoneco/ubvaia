// Centralized date/time helpers for server and frontend

/**
 * Parses a DB timestamp (string, number, Date) and returns a Date object.
 * If the string lacks timezone info, assumes America/Sao_Paulo (-03:00).
 */

function formatIsoToBrDate(dateOrIso: string | Date): string {
  const date = typeof dateOrIso === 'string' ? new Date(dateOrIso) : dateOrIso;

  if (isNaN(date.getTime())) {
    throw new Error("Invalid ISO date string");
  }

  // Use Intl.DateTimeFormat with America/Sao_Paulo timezone to reliably format
  try {
    const opts: Intl.DateTimeFormatOptions = {
      timeZone: 'America/Sao_Paulo',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    };
    // Example output: 11/11/2025 14:05 (pt-BR)
    const parts = new Intl.DateTimeFormat('pt-BR', opts).formatToParts(date);
    const get = (type: string) => parts.find(p => p.type === type)?.value || '';
    const day = get('day');
    const month = get('month');
    const year = get('year');
    const hour = get('hour');
    const minute = get('minute');
    return `${day}/${month}/${year} ${hour}:${minute}`;
  } catch {
    // Fallback: compute São Paulo local time manually (UTC-3) so output is consistent
    // Even if Node was built without full ICU, this will show the correct Brazil time (no DST handling).
    const saoOffsetMs = -3 * 60 * 60 * 1000; // -03:00
    const target = new Date(date.getTime() + saoOffsetMs);
    const day = String(target.getUTCDate()).padStart(2, "0");
    const month = String(target.getUTCMonth() + 1).padStart(2, "0");
    const year = target.getUTCFullYear();
    const hours = String(target.getUTCHours()).padStart(2, "0");
    const minutes = String(target.getUTCMinutes()).padStart(2, "0");
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  }
}


export function parseDbTimestamp(v: unknown): Date | null {
  if (v === null || v === undefined) return null;
  if (v instanceof Date) return v;
  if (typeof v === 'number') return new Date(v);
  if (typeof v === 'string') {
    let s = v.trim();
    // Formato brasileiro: 'DD/MM/YYYY HH:mm'
    const brMatch = s.match(/^(\d{2})\/(\d{2})\/(\d{4}) (\d{2}):(\d{2})$/);
    let d;
    if (brMatch) {
      // Monta ISO: YYYY-MM-DDTHH:mm:00Z (assume UTC)
      const [_, dd, mm, yyyy, hh, min] = brMatch;
      s = `${yyyy}-${mm}-${dd}T${hh}:${min}:00Z`;
      d = new Date(s);
    } else if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(s)) {
      // Assume UTC
      s = s.replace(' ', 'T') + 'Z';
      d = new Date(s);
    } else if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(s)) {
      s = s + 'Z';
      d = new Date(s);
    } else {
      d = new Date(s);
    }
  if (isNaN(d.getTime())) return null;
  // Adiciona +3 horas para corrigir atraso
  return new Date(d.getTime() + 3 * 60 * 60 * 1000);
  }
  return null;
}

/**
 * Formats a Date object to pt-BR and America/Sao_Paulo timezone.
 * Returns 'Sem data' if null/invalid.
 */
export function formatToSaoPaulo(date: Date | null): string {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) return 'Sem data';
  return formatIsoToBrDate(date);
}

/**
 * Returns YYYY-MM-DD for the given date in America/Sao_Paulo timezone.
 */
export function formatToYMD(date: Date | null): string | null {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) return null;
  try {
    const opts: Intl.DateTimeFormatOptions = { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit' };
    const parts = new Intl.DateTimeFormat('en-CA', opts).format(date); // en-CA produces YYYY-MM-DD order
    // format returns YYYY-MM-DD in en-CA; ensure trimmed
    return parts;
  } catch {
    // fallback manual utc-3 shift
    const saoOffsetMs = -3 * 60 * 60 * 1000;
    const target = new Date(date.getTime() + saoOffsetMs);
    const y = target.getUTCFullYear();
    const m = String(target.getUTCMonth() + 1).padStart(2, '0');
    const d = String(target.getUTCDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
}
