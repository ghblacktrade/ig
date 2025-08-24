export function dateIsoUtil(): string {
  return new Date().toISOString();
}

export function dateIsoMlsUtil(date: Date = new Date()): string {
  const iso = date.toISOString();
  return iso.replace(/\.\d{3}Z$/, 'Z');
}
