/**
 * Fechas sin zona (YYYY-MM-DD) y `new Date("YYYY-MM-DD")` en JS = medianoche UTC,
 * lo que en Colombia y otras zonas muestra el día anterior al formatear.
 * Aquí todo lo que mostramos/filtramos como “día civil” usa calendario local.
 */

import { isValid, parseISO } from 'date-fns';

export function ymdFromParts(year: number, month1to12: number, day: number): string {
  return `${year}-${String(month1to12).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

/** Medianoche del día YYYY-MM-DD en la zona horaria local. */
export function parseYmdLocal(ymd: string): Date {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(ymd.trim());
  if (!m) return new Date(NaN);
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
}

/**
 * Convierte `fecha` del backend (ISO con/sin Z, LocalDateTime JSON, etc.)
 * al día de calendario local como YYYY-MM-DD.
 *
 * Usamos `parseISO` para evitar que valores como `YYYY-MM-DD` se
 * interpreten como medianoche UTC en algunos motores JS.
 */
export function apiDateToLocalYmd(raw: string | undefined | null): string {
  if (raw == null || String(raw).trim() === '') {
    const n = new Date();
    return ymdFromParts(n.getFullYear(), n.getMonth() + 1, n.getDate());
  }

  const trimmed = String(raw).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }

  const d = parseISO(trimmed);
  if (!isValid(d)) {
    return trimmed.length >= 10 ? trimmed.slice(0, 10) : trimmed;
  }

  return ymdFromParts(d.getFullYear(), d.getMonth() + 1, d.getDate());
}

export function formatYmdLocal(
  ymd: string,
  locale: string,
  options?: Intl.DateTimeFormatOptions,
): string {
  const d = parseYmdLocal(ymd);
  if (Number.isNaN(d.getTime())) return ymd;
  return d.toLocaleDateString(
    locale,
    options ?? { year: 'numeric', month: 'long', day: 'numeric' },
  );
}

export function compareYmdDesc(a: string, b: string): number {
  return b.localeCompare(a);
}
