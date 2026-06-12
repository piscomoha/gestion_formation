export interface ApiEnvelope<T> {
  status?: string;
  message?: string;
  data: T;
}

export function unwrapApiData<T>(payload: T | ApiEnvelope<T>): T {
  if (
    payload &&
    typeof payload === "object" &&
    "data" in payload &&
    ("status" in payload || "message" in payload)
  ) {
    return (payload as ApiEnvelope<T>).data;
  }

  return payload as T;
}
