import { useQuery } from '@tanstack/react-query'
import { reportsService } from '../../services/api-client'

export interface ReportsStats {
  total: number
  byCategory: Record<string, number>
  recent: number
}

/**
 * Hook for fetching reports statistics
 */
export const useReportsStats = () => {
  return useQuery({
    queryKey: ['reports-stats'],
    queryFn: () => reportsService.getReportsStats(),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
    retry: (failureCount, error) => {
      if (error instanceof Error && error.message.includes('HTTP 4')) {
        return false
      }
      return failureCount < 2
    },
  })
}

/**
 * Hook for fetching category-specific stats
 */
export const useCategoryStats = (category?: string) => {
  return useQuery({
    queryKey: ['reports-stats', 'category', category],
    queryFn: async () => {
      const stats = await reportsService.getReportsStats()
      if (category) {
        return {
          total: stats.byCategory[category] || 0,
          category,
        }
      }
      return stats.byCategory
    },
    enabled: !!category,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error) => {
      if (error instanceof Error && error.message.includes('HTTP 4')) {
        return false
      }
      return failureCount < 2
    },
  })
} 