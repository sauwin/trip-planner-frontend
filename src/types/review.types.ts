export interface DestinationReview {
  id: string;
  userId: string;
  destinationId: string;
  rating: number;
  body: string;
  photos: string[];
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string | null;
  };
}

export interface DestinationReviewsResponse {
  items: DestinationReview[];
  ownReview: DestinationReview | null;
  averageRating: number | null;
  total: number;
}

export interface DestinationReviewInput {
  rating: number;
  body: string;
  photos: string[];
}

export interface DestinationReviewsParams {
  offset?: number;
  limit?: number;
}
