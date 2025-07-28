/**
 * Administrative Module Export
 * 
 * Public exports for the Indonesian administrative data module.
 * Following clean architecture pattern with layer separation.
 */

// API router export (main export)
export { administrativeRouter } from "./api";

// Type exports for external use
export type {
  Province,
  Regency,
  District,
  SyncStatus,
  AdministrativeHierarchy,
  AdministrativeNames,
  GeocodingAdministrative,
} from "./types";

// Shell layer exports for internal use by other modules
export {
  getAllProvinces,
  getRegenciesByProvince,
  getDistrictsByRegency,
  getSyncStatus,
  validateAdministrativeHierarchy,
  getAdministrativeNames,
} from "./shell";

// Core utility exports for validation
export {
  isValidProvinceCode,
  isValidRegencyCode,
  isValidDistrictCode,
  isValidAdministrativeHierarchy,
  extractParentCodes,
  getAdministrativeLevel,
} from "./core";

// Admin sync service export
export { adminSyncService } from "../../services/admin-sync";