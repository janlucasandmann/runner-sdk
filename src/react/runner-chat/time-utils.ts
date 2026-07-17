export function parseDurationSecondsValue(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.max(0, Math.round(value));
  }
  if (typeof value === "string") {
    const parsed = Number.parseFloat(value.trim());
    if (Number.isFinite(parsed)) {
      return Math.max(0, Math.round(parsed));
    }
  }
  return null;
}

export function parseIsoTimestampMs(value: unknown): number | null {
  if (typeof value !== "string" || !value.trim()) {
    return null;
  }
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function formatElapsedDurationLabel(secondsValue: number): string {
  const totalSeconds = Math.max(0, Math.round(secondsValue));
  if (totalSeconds < 120) {
    return `${totalSeconds}s`;
  }

  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes < 60) {
    return seconds > 0 ? `${minutes} min ${seconds}s` : `${minutes} min`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes} min` : `${hours}h`;
}

export function parseSecondsFromClock(time: string): number | null {
  const hhmmss = time.match(/^(\d{2}):(\d{2}):(\d{2})$/);
  if (hhmmss) {
    const [, hours, minutes, seconds] = hhmmss;
    return Number(hours) * 3600 + Number(minutes) * 60 + Number(seconds);
  }
  const mmss = time.match(/^(\d{2}):(\d{2})$/);
  if (mmss) {
    const [, minutes, seconds] = mmss;
    return Number(minutes) * 60 + Number(seconds);
  }
  return null;
}
