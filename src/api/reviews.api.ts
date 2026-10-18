import http from './http';
import type {
  DestinationReview,
  DestinationReviewInput,
  DestinationReviewsParams,
  DestinationReviewsResponse,
} from '@/types/review.types';

export function getDestinationReviews(destinationId: string, params: DestinationReviewsParams = {}) {
  return http.get<DestinationReviewsResponse>(`/reviews/destinations/${destinationId}`, { params });
}

export function createDestinationReview(destinationId: string, data: DestinationReviewInput) {
  return http.post<DestinationReview>(`/reviews/destinations/${destinationId}`, data);
}

export function updateDestinationReview(reviewId: string, data: DestinationReviewInput) {
  return http.put<DestinationReview>(`/reviews/${reviewId}`, data);
}

export function deleteDestinationReview(reviewId: string) {
  return http.delete(`/reviews/${reviewId}`);
}

export function adminDeleteDestinationReview(reviewId: string) {
  return http.delete(`/reviews/${reviewId}/admin`);
}
