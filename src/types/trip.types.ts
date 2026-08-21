import type { Destination } from './destination.types';

export interface Trip {
  id: string;
  userId: string;
  title: string;
  budgetTotal: number | null;
  peopleCount: number;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
}

export interface TripDestination {
  tripId: string;
  destinationId: string;
  position: number;
  plannedDate: string | null;
  accommodationName: string | null;
  accommodationPrice: number | null;
  accommodationUrl: string | null;
  destination: Destination;
}

export interface TripWithDestinations extends Trip {
  destinations: TripDestination[];
}

export interface AccommodationInput {
  accommodationName?: string;
  accommodationPrice?: number;
  accommodationUrl?: string;
}