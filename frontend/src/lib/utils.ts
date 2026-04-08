export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

export function formatPercentage(value: number) {
  return `${Math.round(value * 100)}%`;
}

export function formatScore(value: number) {
  return `${Math.round(value)}/100`;
}
