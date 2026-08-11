import type { Destination } from './destination.types';

export interface Trip {
  id: string;
  userId: string;
  title: string;
  createdAt: string;
}

export interface TripDestination {
  tripId: string;
  destinationId: string;
  position: number;
  plannedDate: string | null;
  destination: Destination;
}

export interface TripWithDestinations extends Trip {
  destinations: TripDestination[];
}