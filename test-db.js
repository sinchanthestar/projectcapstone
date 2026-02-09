const { Client } = require('pg');
const client = new Client({ 
  host: 'localhost', 
  user: 'postgres', 
  password: 'koko123', 
  database: 'shift_manager' 
});

client.connect().then(async () => {
  console.log('=== Checking Scheduled Assignments ===');
  
  // Check Feb 16-28
  const assign = await client.query(
    'SELECT COUNT(*) as cnt FROM schedule_assignments WHERE scheduled_date >= $1',
    ['2026-02-16']
  );
  console.log('Assignments from Feb 16+:', assign.rows[0].cnt);
  
  // Get all unique dates with assignments
  const dates = await client.query(
    'SELECT DISTINCT scheduled_date FROM schedule_assignments WHERE scheduled_date >= $1 ORDER BY scheduled_date ASC LIMIT 15',
    ['2026-02-16']
  );
  console.log('\nDates with assignments (first 15):');
  dates.rows.forEach(r => {
    const dateStr = new Date(r.scheduled_date).toISOString().split('T')[0];
    console.log(`  ${dateStr}`);
  });
  
  // Get first date
  const first = await client.query(
    'SELECT MIN(scheduled_date) as first FROM schedule_assignments WHERE scheduled_date >= $1',
    ['2026-02-16']
  );
  if (first.rows[0].first) {
    const firstDate = new Date(first.rows[0].first).toISOString().split('T')[0];
    console.log(`\nFirst scheduled date: ${firstDate}`);
  }
  
  client.end();
}).catch(e => console.error('DB Error:', e.message));
