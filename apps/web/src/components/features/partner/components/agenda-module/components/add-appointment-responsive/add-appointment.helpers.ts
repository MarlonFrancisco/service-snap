export function addMinutesToTime(time: string, minutesToAdd: number): string {
  const [hourStr, minuteStr] = time.split(':');
  const baseMinutes =
    Number.parseInt(hourStr ?? '0', 10) * 60 +
    Number.parseInt(minuteStr ?? '0', 10);
  const totalMinutes = baseMinutes + minutesToAdd;

  const hours = Math.floor(totalMinutes / 60) % 24;
  const minutes = totalMinutes % 60;

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}
