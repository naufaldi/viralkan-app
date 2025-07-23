import { useMutation, useQueryClient } from '@tanstack/react-query'
import { reportsService } from '../../services/reports'
import type { CreateReportInput } from '../../lib/types/api'

/**
 * Hook for creating a new report
 */
export const useCreateReport = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ data, token }: { data: CreateReportInput; token: string }) =>
      reportsService.createReport(data, token),
    onSuccess: () => {
      // Invalidate and refetch reports
      queryClient.invalidateQueries({ queryKey: ['reports'] })
      queryClient.invalidateQueries({ queryKey: ['reports-enriched'] })
      queryClient.invalidateQueries({ queryKey: ['reports-stats'] })
      queryClient.invalidateQueries({ queryKey: ['user-reports'] })
    },
    onError: (error) => {
      console.error('Failed to create report:', error)
    },
  })
}

/**
 * Hook for updating an existing report
 */
export const useUpdateReport = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      data,
      token,
    }: {
      id: number
      data: Partial<CreateReportInput>
      token: string
    }) => reportsService.updateReport(id, data, token),
    onSuccess: (data, variables) => {
      // Update the specific report in cache
      queryClient.setQueryData(['report', variables.id], data)
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['reports'] })
      queryClient.invalidateQueries({ queryKey: ['reports-enriched'] })
      queryClient.invalidateQueries({ queryKey: ['user-reports'] })
    },
    onError: (error) => {
      console.error('Failed to update report:', error)
    },
  })
}

/**
 * Hook for deleting a report
 */
export const useDeleteReport = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, token }: { id: number; token: string }) =>
      reportsService.deleteReport(id, token),
    onSuccess: (_, variables) => {
      // Remove the report from cache
      queryClient.removeQueries({ queryKey: ['report', variables.id] })
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['reports'] })
      queryClient.invalidateQueries({ queryKey: ['reports-enriched'] })
      queryClient.invalidateQueries({ queryKey: ['reports-stats'] })
      queryClient.invalidateQueries({ queryKey: ['user-reports'] })
    },
    onError: (error) => {
      console.error('Failed to delete report:', error)
    },
  })
}

/**
 * Hook for validating report ownership
 */
export const useValidateReportOwnership = () => {
  return useMutation({
    mutationFn: ({ id, token }: { id: number; token: string }) =>
      reportsService.validateOwnership(id, token),
    onError: (error) => {
      console.error('Failed to validate report ownership:', error)
    },
  })
} 