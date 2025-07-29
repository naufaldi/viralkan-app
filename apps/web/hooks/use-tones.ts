import { useQuery } from '@tanstack/react-query';
import { tonesAPI, type ToneConfig } from '@/services/tones-api';

/**
 * Custom hook to fetch available tones using TanStack Query
 * Provides caching, loading states, and error handling
 */
export function useTones() {
  return useQuery({
    queryKey: ['tones'],
    queryFn: () => tonesAPI.getAvailableTones(),
    staleTime: 1000 * 60 * 60, // 1 hour - tones rarely change
    gcTime: 1000 * 60 * 60 * 24, // 24 hours cache time
    refetchOnWindowFocus: false, // Don't refetch on window focus
    retry: 2, // Retry twice on failure
    refetchOnMount: false, // Don't refetch if data exists
  });
}

/**
 * Hook to get a specific tone by value
 */
export function useTone(value: string) {
  const { data: tones, ...query } = useTones();
  
  const tone = tones?.find(t => t.value === value);
  
  return {
    ...query,
    data: tone,
    tone,
  };
}

/**
 * Hook to get tone options formatted for select components
 */
export function useToneOptions() {
  const { data: tones, ...query } = useTones();
  
  const options = tones?.map(tone => ({
    value: tone.value,
    label: tone.label,
    description: tone.description,
    icon: tone.icon,
  })) || [];
  
  return {
    ...query,
    data: options,
    options,
  };
}

// Export types for convenience
export type { ToneConfig };
export type Tone = ToneConfig['value'];