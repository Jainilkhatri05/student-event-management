// lib/db.ts
// Uses mysql2 to connect to TiDB Cloud (free MySQL-compatible cloud database)
// TiDB Cloud requires SSL connections

import mysql from 'mysql2/promise';

let pool: mysql.Pool | null = null;

export function getPool(): mysql.Pool {
  if (pool) return pool;

  pool = mysql.createPool({
    host:     process.env.MYSQL_HOST     || 'gateway01.ap-southeast-1.prod.aws.tidbcloud.com',
    port:     Number(process.env.MYSQL_PORT) || 4000,
    user:     process.env.MYSQL_USER     || 'XYWmVqzjiVgrs83.root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'test',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    // TiDB Cloud requires SSL
    ssl: {
      minVersion: 'TLSv1.2',
      rejectUnauthorized: true,
    },
  });

  return pool;
}

// Helper: run a query and return all rows
export async function query<T = mysql.RowDataPacket>(
  sql: string,
  params: any[] = []
): Promise<T[]> {
  const db = getPool();
  const [rows] = await db.execute<mysql.RowDataPacket[]>(sql, params);
  return rows as T[];
}

// Helper: run a query and return first row or null
export async function queryOne<T = mysql.RowDataPacket>(
  sql: string,
  params: any[] = []
): Promise<T | null> {
  const rows = await query<T>(sql, params);
  return rows[0] ?? null;
}

// Helper: run an INSERT / UPDATE / DELETE and return OkPacket info
export async function execute(
  sql: string,
  params: any[] = []
): Promise<mysql.ResultSetHeader> {
  const db = getPool();
  const [result] = await db.execute<mysql.ResultSetHeader>(sql, params);
  return result;
}
