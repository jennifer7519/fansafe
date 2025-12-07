import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from './schema';

/**
 * Turso (프로덕션) 또는 SQLite (로컬) 데이터베이스 클라이언트 생성
 */
const createDbClient = () => {
  // Turso 설정이 있으면 Turso 사용 (프로덕션)
  if (process.env.TURSO_DATABASE_URL && process.env.TURSO_AUTH_TOKEN) {
    return createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
  }

  // 로컬 SQLite 사용 (개발)
  const databaseUrl = process.env.DATABASE_URL || 'file:./dev.db';
  return createClient({
    url: databaseUrl,
  });
};

const client = createDbClient();

/**
 * Drizzle ORM 인스턴스
 * - 전체 스키마 접근 가능
 * - 타입 안전한 쿼리 빌더
 */
export const db = drizzle(client, { schema });

/**
 * 데이터베이스 연결 상태 확인
 */
export async function checkDbConnection(): Promise<boolean> {
  try {
    await client.execute('SELECT 1');
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}

/**
 * 로컬 개발 환경에서 테이블 초기화 (마이그레이션 전용)
 * 주의: 프로덕션에서는 drizzle-kit migrate 사용
 */
export async function initializeLocalDb() {
  if (process.env.TURSO_DATABASE_URL) {
    console.warn('Cannot initialize tables in production. Use drizzle-kit migrate instead.');
    return;
  }

  console.log('Initializing local database tables...');

  // 테이블 생성 SQL (drizzle-kit generate로 생성된 마이그레이션 사용 권장)
  await client.execute(`
    CREATE TABLE IF NOT EXISTS analyses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      url TEXT NOT NULL,
      platform TEXT NOT NULL CHECK(platform IN ('twitter', 'instagram', 'unknown')),
      analysis_type TEXT NOT NULL CHECK(analysis_type IN ('listing', 'seller', 'image')),
      risk_score INTEGER NOT NULL,
      warnings TEXT,
      recommendations TEXT,
      reasoning TEXT,
      analysis_data TEXT,
      created_at INTEGER NOT NULL DEFAULT (unixepoch()),
      ip_address TEXT
    )
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS fraud_patterns (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      keyword TEXT NOT NULL UNIQUE,
      category TEXT NOT NULL CHECK(category IN ('urgent', 'prepay', 'fake', 'suspicious_price', 'vague_description')),
      weight INTEGER NOT NULL DEFAULT 5,
      description TEXT,
      example_texts TEXT,
      language TEXT NOT NULL DEFAULT 'ko' CHECK(language IN ('ko', 'en', 'ja', 'zh')),
      created_at INTEGER NOT NULL DEFAULT (unixepoch()),
      updated_at INTEGER NOT NULL DEFAULT (unixepoch())
    )
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS price_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      item_name TEXT NOT NULL,
      item_type TEXT NOT NULL DEFAULT 'photocard' CHECK(item_type IN ('photocard', 'album', 'lightstick', 'other')),
      artist TEXT,
      price REAL NOT NULL,
      currency TEXT NOT NULL DEFAULT 'KRW',
      source TEXT,
      source_url TEXT,
      condition TEXT DEFAULT 'unknown' CHECK(condition IN ('new', 'like_new', 'used', 'unknown')),
      recorded_at INTEGER NOT NULL DEFAULT (unixepoch())
    )
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS user_feedback (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      analysis_id INTEGER NOT NULL,
      was_accurate INTEGER,
      actual_outcome TEXT CHECK(actual_outcome IN ('safe_transaction', 'scam_detected', 'price_issue', 'other')),
      comments TEXT,
      created_at INTEGER NOT NULL DEFAULT (unixepoch()),
      FOREIGN KEY (analysis_id) REFERENCES analyses(id) ON DELETE CASCADE
    )
  `);

  console.log('Local database initialized successfully!');
}
