import { sql, testConnection } from "./connection";

const debugData = async () => {
  console.log("🔍 Debugging database data...");

  try {
    // Test connection first
    const isConnected = await testConnection();
    if (!isConnected) {
      console.error("❌ Cannot connect to database");
      process.exit(1);
    }

    // Check users table
    console.log("\n📋 Users table:");
    const users = await sql`SELECT id, firebase_uid, email, name FROM users LIMIT 5`;
    console.log(users);

    // Check reports table with status
    console.log("\n📋 Reports table with status:");
    const reports = await sql`SELECT id, user_id, category, street_name, status, created_at FROM reports LIMIT 5`;
    console.log(reports);

    // Check if there are any reports for the specific user
    const firebaseUid = 'zEvLcZ7tU0aN7PjkCYR0yE1QMSM2';
    console.log(`\n🔍 Looking for user with firebase_uid: ${firebaseUid}`);
    
    const user = await sql`SELECT id, firebase_uid, email, name FROM users WHERE firebase_uid = ${firebaseUid}`;
    console.log("User found:", user);

    if (user.length > 0) {
      const userId = user[0].id;
      console.log(`\n🔍 Looking for reports with user_id: ${userId}`);
      
      const userReports = await sql`SELECT id, user_id, category, street_name, status, created_at FROM reports WHERE user_id = ${userId}`;
      console.log("User reports:", userReports);

      // Check verified reports specifically
      console.log(`\n🔍 Looking for VERIFIED reports with user_id: ${userId}`);
      const verifiedReports = await sql`SELECT id, user_id, category, street_name, status, created_at FROM reports WHERE user_id = ${userId} AND status = 'verified'`;
      console.log("Verified reports:", verifiedReports);
    }

  } catch (error) {
    console.error("❌ Debug failed:", error);
    process.exit(1);
  } finally {
    await sql.end();
  }
};

// Run debug if this file is executed directly
if (import.meta.main) {
  debugData();
}

export { debugData }; 