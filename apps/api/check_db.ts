import { sql } from './src/db/connection.ts';

try {
  console.log('Checking database records...');
  
  const users = await sql`SELECT id, firebase_uid, email FROM users LIMIT 3`;
  console.log('Users:', users.map(u => ({ id: u.id, email: u.email })));
  
  const reports = await sql`SELECT id, user_id FROM reports LIMIT 3`;  
  console.log('Reports:', reports.map(r => ({ id: r.id, user_id: r.user_id })));
  
  process.exit(0);
} catch (error) {
  console.error('Database error:', error.message);
  process.exit(1);
}
EOF < /dev/null