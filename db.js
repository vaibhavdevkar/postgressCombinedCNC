const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: '192.168.1.5',
  database: 'postgres',
  password: 'Theta@123',  // change this
  port: 5432,
});

module.exports = pool;
