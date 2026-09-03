export type TripStatus = 'planning' | 'upcoming' | 'active' | 'completed';

export function getTripStatus(startDate: string | null, endDate: string | null): TripStatus {
  if (!startDate) return 'planning';

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : start;

  if (today < start) return 'upcoming';
  if (today > end) return 'completed';
  return 'active';
}