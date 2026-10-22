interface ApiValidationDetail {
  field: string;
  message: string;
}

interface ApiErrorResponse {
  error?: string;
  code?: string;
  details?: ApiValidationDetail[];
}

function asRecord(value: unknown): Record<string, unknown> | undefined {
  return typeof value === 'object' && value !== null
    ? value as Record<string, unknown>
    : undefined;
}

function getApiErrorResponse(error: unknown): ApiErrorResponse | undefined {
  const data = asRecord(asRecord(asRecord(error)?.response)?.data);
  if (!data) return undefined;

  const details = Array.isArray(data.details)
    ? data.details.flatMap((detail) => {
        const item = asRecord(detail);
        return typeof item?.field === 'string' && typeof item.message === 'string'
          ? [{ field: item.field, message: item.message }]
          : [];
      })
    : undefined;

  return {
    ...(typeof data.error === 'string' ? { error: data.error } : {}),
    ...(typeof data.code === 'string' ? { code: data.code } : {}),
    ...(details ? { details } : {}),
  };
}

export function getApiErrorCode(error: unknown): string | undefined {
  return getApiErrorResponse(error)?.code;
}

export function getApiErrorMessage(error: unknown, fallback: string): string {
  const response = getApiErrorResponse(error);
  const details = response?.details;

  if (details && details.length > 0) {
    return details.map((d) => d.message).join(' ');
  }

  return response?.error || fallback;
}