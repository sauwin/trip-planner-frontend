interface ApiValidationDetail {
  field: string;
  message: string;
}

interface ApiErrorResponse {
  error?: string;
  details?: ApiValidationDetail[];
}

export function getApiErrorStatus(error: unknown): number | undefined {
  const status = (error as { response?: { status?: unknown } })?.response?.status;
  return typeof status === 'number' ? status : undefined;
}

export function getApiErrorMessage(error: unknown, fallback: string): string {
  const response = (error as { response?: { data?: ApiErrorResponse } })?.response;
  const details = response?.data?.details;

  if (details && details.length > 0) {
    return details.map((d) => d.message).join(' ');
  }

  return response?.data?.error || fallback;
}