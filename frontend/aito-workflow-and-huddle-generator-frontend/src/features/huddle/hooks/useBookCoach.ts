import { useMutation } from "@tanstack/react-query";
import { useApiClient } from "@/api/useApiClient";
import { bookCoach } from "../api";
import type { BookCoachRequest } from "../types";

export function useBookCoach() {
  const apiClient = useApiClient();
  return useMutation({ mutationFn: (request: BookCoachRequest) => bookCoach(apiClient, request) });
}
