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
const ReportFormFieldsComponent = (
  props: React.ComponentProps<typeof ReportFormFields>,
) => <ReportFormFields {...props} />;
ReportForm.Fields = ReportFormFieldsComponent;

/**
 * ReportForm.AddressFields - Address and administrative fields
 */
const ReportAddressFieldsComponent = (
  props: React.ComponentProps<typeof ReportAddressFields>,
) => <ReportAddressFields {...props} />;
ReportForm.AddressFields = ReportAddressFieldsComponent;

/**
 * ReportForm.LocationFields - Location coordinates and description fields
 */
const ReportLocationFieldsComponent = (
  props: React.ComponentProps<typeof ReportLocationFields>,
) => <ReportLocationFields {...props} />;
ReportForm.LocationFields = ReportLocationFieldsComponent;

/**
 * ReportForm.CategoryField - Category selection field
 */
const ReportCategoryFieldComponent = (
  props: React.ComponentProps<typeof ReportCategoryField>,
) => <ReportCategoryField {...props} />;
ReportForm.CategoryField = ReportCategoryFieldComponent;

export { ReportForm };
