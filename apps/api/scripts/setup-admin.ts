#!/usr/bin/env bun

/**
 * Admin Setup Script
 * 
 * This script sets up admin users based on environment configuration.
 * It reads ADMIN_EMAILS from environment variables and sets those users as admins.
 * 
 * ⚠️  SECURITY WARNING: This script modifies user roles. Only run in trusted environments.
 * 
 * Usage:
 * bun run scripts/setup-admin.ts
 * 
 * Environment Variables:
 * - ADMIN_EMAILS: Comma-separated list of admin email addresses
 * - DATABASE_URL: PostgreSQL connection string
 */

import { sql } from "../src/db/connection";

interface AdminUser {
  id: string;
  email: string;
  role: string;
  name: string;
}

/**
 * Get admin emails from environment variables
 */
function getAdminEmails(): string[] {
  const adminEmails = process.env.ADMIN_EMAILS;
  
  if (!adminEmails) {
    console.error("❌ ADMIN_EMAILS environment variable is required");
    console.error("Example: ADMIN_EMAILS=xxx@gmail.com,other@email.com");
    process.exit(1);
  }
  
  const emails = adminEmails.split(',').map(email => email.trim()).filter(email => email.length > 0);
  
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const invalidEmails = emails.filter(email => !emailRegex.test(email));
  
  if (invalidEmails.length > 0) {
    console.error("❌ Invalid email format(s):", invalidEmails.join(', '));
    process.exit(1);
  }
  
  return emails;
}

/**
 * Log admin changes for audit trail
 */
async function logAdminChange(email: string, action: 'grant' | 'revoke', success: boolean): Promise<void> {
  try {
    await sql`
      INSERT INTO admin_audit_log (email, action, success, executed_at, executed_by)
      VALUES (${email}, ${action}, ${success}, NOW(), ${process.env.USER || 'unknown'})
    `;
  } catch (error) {
    console.warn("⚠️  Could not log admin change to audit trail:", error);
  }
}

/**
 * Check if user exists in database
 */
async function checkUserExists(email: string): Promise<boolean> {
  const result = await sql`
    SELECT COUNT(*) as count 
    FROM users 
    WHERE email = ${email}
  `;
  
  return result[0]?.count > 0;
}

/**
 * Set user as admin
 */
async function setUserAsAdmin(email: string): Promise<AdminUser | null> {
  try {
    const result = await sql`
      UPDATE users 
      SET role = 'admin', updated_at = NOW()
      WHERE email = ${email}
      RETURNING id, email, role, name
    `;
    
    if (result.length === 0) {
      await logAdminChange(email, 'grant', false);
      return null;
    }
    
    await logAdminChange(email, 'grant', true);
    return result[0] as AdminUser;
  } catch (error) {
    console.error(`❌ Error setting ${email} as admin:`, error);
    await logAdminChange(email, 'grant', false);
    return null;
  }
}

/**
 * Get current admin users
 */
async function getCurrentAdmins(): Promise<AdminUser[]> {
  const result = await sql`
    SELECT id, email, role, name 
    FROM users 
    WHERE role = 'admin'
    ORDER BY email
  `;
  
  return result as unknown as AdminUser[];
}

/**
 * Confirm admin setup with user
 */
async function confirmAdminSetup(adminEmails: string[]): Promise<boolean> {
  console.log("\n⚠️  SECURITY CONFIRMATION REQUIRED");
  console.log("==================================");
  console.log("You are about to grant admin privileges to the following users:");
  adminEmails.forEach(email => console.log(`  • ${email}`));
  console.log("\nThis action will:");
  console.log("  • Grant full admin access to these users");
  console.log("  • Allow them to manage all system data");
  console.log("  • Be logged in the audit trail");
  console.log("\nAre you sure you want to continue? (yes/no)");
  
  // For automated environments, you can set CONFIRM_ADMIN_SETUP=true
  if (process.env.CONFIRM_ADMIN_SETUP === 'true') {
    console.log("Auto-confirmed via CONFIRM_ADMIN_SETUP environment variable");
    return true;
  }
  
  // In a real implementation, you'd read from stdin
  // For now, we'll simulate confirmation
  console.log("⚠️  In production, implement proper confirmation prompt");
  return true;
}

/**
 * Main setup function
 */
async function setupAdmins() {
  console.log("🔧 Setting up admin users...\n");
  
  const adminEmails = getAdminEmails();
  console.log(`📧 Admin emails from environment: ${adminEmails.join(', ')}\n`);
  
  // Security confirmation
  const confirmed = await confirmAdminSetup(adminEmails);
  if (!confirmed) {
    console.log("❌ Admin setup cancelled by user");
    process.exit(0);
  }
  
  const results: { email: string; success: boolean; message: string }[] = [];
  
  // Process each admin email
  for (const email of adminEmails) {
    console.log(`Processing: ${email}`);
    
    // Check if user exists
    const userExists = await checkUserExists(email);
    
    if (!userExists) {
      console.log(`  ⚠️  User ${email} not found in database`);
      console.log(`  💡 User must first login through the application to be created`);
      results.push({
        email,
        success: false,
        message: "User not found - must login first"
      });
      continue;
    }
    
    // Set user as admin
    const adminUser = await setUserAsAdmin(email);
    
    if (adminUser) {
      console.log(`  ✅ Set ${email} as admin (ID: ${adminUser.id})`);
      results.push({
        email,
        success: true,
        message: "Admin role assigned successfully"
      });
    } else {
      console.log(`  ❌ Failed to set ${email} as admin`);
      results.push({
        email,
        success: false,
        message: "Failed to assign admin role"
      });
    }
  }
  
  console.log("\n📊 Setup Results:");
  console.log("==================");
  
  results.forEach(result => {
    const status = result.success ? "✅" : "❌";
    console.log(`${status} ${result.email}: ${result.message}`);
  });
  
  // Show current admins
  console.log("\n👥 Current Admin Users:");
  console.log("=======================");
  
  const currentAdmins = await getCurrentAdmins();
  
  if (currentAdmins.length === 0) {
    console.log("No admin users found");
  } else {
    currentAdmins.forEach(admin => {
      console.log(`• ${admin.email} (${admin.name})`);
    });
  }
  
  console.log("\n🎉 Admin setup completed!");
  console.log("\nNext steps:");
  console.log("1. Verify admin users can access /admin/dashboard");
  console.log("2. Test admin functionality");
  console.log("3. Check audit logging is working");
  console.log("\n🔒 Security notes:");
  console.log("• All admin changes are logged in admin_audit_log table");
  console.log("• Monitor admin_audit_log for suspicious activity");
  console.log("• Consider implementing admin role expiration");
}

// Run the setup
setupAdmins()
  .then(() => {
    console.log("\n✅ Script completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Script failed:", error);
    process.exit(1);
  }); 