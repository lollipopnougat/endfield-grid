let counter = 0;
export function nextId(prefix = 'id'): string {
  return `${prefix}_${Date.now()}_${++counter}`;
}
