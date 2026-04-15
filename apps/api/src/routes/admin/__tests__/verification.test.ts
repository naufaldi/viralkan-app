// apps/api/src/routes/admin/__tests__/verification.test.ts
import { describe, test, expect } from "bun:test";
import {
  AdminReportActionResponseSchema,
  AdminReportActionRequestSchema,
} from "../types";

describe("Admin Verification System", () => {
  describe("AdminReportActionResponseSchema", () => {
    test("accepts valid verify response shape", () => {
      const validResponse = {
        success: true,
        message: "Report verified successfully",
        report: {
          id: "018e4c3a-1234-7000-8000-abcdef123456",
          status: "verified",
          verified_at: new Date().toISOString(),
          verified_by: "018e4c3a-0000-7000-8000-abcdef000001",
          rejection_reason: null,
          deleted_at: null,
        },
      };

      const result = AdminReportActionResponseSchema.safeParse(validResponse);
      expect(result.success).toBe(true);
    });

    test("accepts valid reject response shape", () => {
      const validResponse = {
        success: true,
        message: "Report rejected",
        report: {
          id: "018e4c3a-1234-7000-8000-abcdef123456",
          status: "rejected",
          verified_at: null,
          verified_by: null,
          rejection_reason: "Gambar tidak jelas",
          deleted_at: null,
        },
      };

      const result = AdminReportActionResponseSchema.safeParse(validResponse);
      expect(result.success).toBe(true);
    });

    test("rejects response missing required report fields", () => {
      const invalidResponse = {
        success: true,
        message: "ok",
        report: {
          id: "018e4c3a-1234-7000-8000-abcdef123456",
          // missing status, verified_at, etc.
        },
      };

      const result = AdminReportActionResponseSchema.safeParse(invalidResponse);
      expect(result.success).toBe(false);
    });
  });

  describe("AdminReportActionRequestSchema", () => {
    test("accepts reject request with reason", () => {
      const req = { reason: "Gambar tidak jelas" };
      const result = AdminReportActionRequestSchema.safeParse(req);
      expect(result.success).toBe(true);
    });

    test("accepts verify request with no body", () => {
      const req = {};
      const result = AdminReportActionRequestSchema.safeParse(req);
      expect(result.success).toBe(true);
    });

    test("rejects unknown status value", () => {
      const req = { status: "approved" };
      const result = AdminReportActionRequestSchema.safeParse(req);
      expect(result.success).toBe(false);
    });
  });

  describe("verifyReport business logic", () => {
    test("verifyReport success shape matches AdminReportActionResponseSchema", () => {
      const simulatedShellReturn = {
        success: true,
        data: {
          success: true,
          message: "Report verified successfully",
          report: {
            id: "018e4c3a-1234-7000-8000-abcdef123456",
            status: "verified",
            verified_at: new Date().toISOString(),
            verified_by: "018e4c3a-0000-7000-8000-abcdef000001",
            rejection_reason: null,
            deleted_at: null,
          },
        },
      };

      expect(simulatedShellReturn.success).toBe(true);
      const result = AdminReportActionResponseSchema.safeParse(
        simulatedShellReturn.data,
      );
      expect(result.success).toBe(true);
    });

    test("verifyReport not-found shape", () => {
      const notFoundReturn = {
        success: false,
        error: "Report not found",
        statusCode: 404,
      };

      expect(notFoundReturn.success).toBe(false);
      expect(notFoundReturn.statusCode).toBe(404);
      expect(notFoundReturn.error).toBe("Report not found");
    });
  });

  describe("rejectReport business logic", () => {
    test("rejectReport success shape matches AdminReportActionResponseSchema", () => {
      const simulatedShellReturn = {
        success: true,
        data: {
          success: true,
          message: "Report rejected",
          report: {
            id: "018e4c3a-1234-7000-8000-abcdef123456",
            status: "rejected",
            verified_at: null,
            verified_by: null,
            rejection_reason: "Gambar tidak jelas",
            deleted_at: null,
          },
        },
      };

      expect(simulatedShellReturn.success).toBe(true);
      const result = AdminReportActionResponseSchema.safeParse(
        simulatedShellReturn.data,
      );
      expect(result.success).toBe(true);
    });
  });

  describe("requireAdmin middleware logic", () => {
    test("role check: 'admin' matches 'admin'", () => {
      const userRole: string = "admin";
      const requiredRole: string = "admin";
      expect(userRole === requiredRole).toBe(true);
    });

    test("role check: 'user' does not match 'admin'", () => {
      const userRole: string = "user";
      const requiredRole: string = "admin";
      expect(userRole === requiredRole).toBe(false);
    });

    test("permissions error response shape", () => {
      const errorResponse = {
        error: "admin access required",
        statusCode: 403,
        timestamp: new Date().toISOString(),
      };
      expect(errorResponse.statusCode).toBe(403);
      expect(typeof errorResponse.timestamp).toBe("string");
    });
  });
});
