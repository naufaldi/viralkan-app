"use client";

import { ReportFormFields } from "./report-form-fields";
import { ReportAddressFields } from "./fields/report-address-fields";
import { ReportLocationFields } from "./fields/report-location-fields";
import { ReportCategoryField } from "./fields/report-category-field";
import { ReportFormProvider } from "./report-form-provider";
import type { ReportResponse } from "../../../lib/types/api";

interface ReportFormProps {
  children: React.ReactNode;
  onSuccess?: (reportId: string) => void;
  initialData?: ReportResponse;
  isEditing?: boolean;
}

/**
 * ReportForm - Compound component root
 * Provides context and compound component API
 */
function ReportForm({ children, ...providerProps }: ReportFormProps) {
  return <ReportFormProvider {...providerProps}>{children}</ReportFormProvider>;
}

/**
 * ReportForm.Fields - Main form fields container
 */
ReportForm.Fields = ReportFormFields;

/**
 * ReportForm.AddressFields - Address and administrative fields
 */
ReportForm.AddressFields = ReportAddressFields;

/**
 * ReportForm.LocationFields - Location coordinates and description fields
 */
ReportForm.LocationFields = ReportLocationFields;

/**
 * ReportForm.CategoryField - Category selection field
 */
ReportForm.CategoryField = ReportCategoryField;

export { ReportForm };
