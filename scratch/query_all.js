const { Client } = require('pg');

async function test() {
  const client = new Client({
    connectionString: "postgresql://neondb_owner:npg_YTs07lmnqVWz@ep-bold-dew-aps08828-pooler.c-7.us-east-1.aws.neon.tech/neondb?sslmode=require"
  });
  await client.connect();
  const res = await client.query('SELECT id, name, color, "colorHex", stock FROM "Product";');
  console.log(res.rows);
  await client.end();
}

test().catch(console.error);
