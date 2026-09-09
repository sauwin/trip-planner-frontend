export type TripStatus = 'planning' | 'upcoming' | 'active' | 'completed';

export function getTripStatus(startDate: string | null, endDate: string | null): TripStatus {
  if (!startDate) return 'planning';
  
  const todayKey = new Date().toISOString().slice(0, 10);
  const startKey = startDate.slice(0, 10);
  const endKey = (endDate ?? startDate).slice(0, 10);

  if (todayKey < startKey) return 'upcoming';
  if (todayKey > endKey) return 'completed';
  return 'active';
}