import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

/**
 * 분석 결과 테이블
 * 거래 글/판매자 분석 이력을 저장
 */
export const analyses = sqliteTable('analyses', {
  id: integer('id').primaryKey({ autoIncrement: true }),

  // 분석 대상 정보
  url: text('url').notNull(),
  platform: text('platform', { enum: ['twitter', 'instagram', 'unknown'] }).notNull(),
  analysisType: text('analysis_type', { enum: ['listing', 'seller', 'image'] }).notNull(),

  // 분석 결과
  riskScore: integer('risk_score').notNull(), // 0-100
  warnings: text('warnings', { mode: 'json' }).$type<string[]>(), // 경고 메시지 배열
  recommendations: text('recommendations', { mode: 'json' }).$type<string[]>(), // 권장사항 배열
  reasoning: text('reasoning'), // AI의 분석 근거

  // 전체 분석 데이터 (JSON)
  analysisData: text('analysis_data', { mode: 'json' }).$type<{
    detectedPatterns?: string[];
    priceAnalysis?: {
      inputPrice?: number;
      averagePrice?: number;
      isPriceNormal?: boolean;
    };
    imageAnalysis?: {
      isAuthentic?: boolean;
      isPotentialFake?: boolean;
    };
  }>(),

  // 메타데이터
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
  ipAddress: text('ip_address'), // 사용자 IP (통계용)
});

/**
 * 사기 패턴 테이블
 * AI가 감지하는 사기성 키워드/패턴 저장
 */
export const fraudPatterns = sqliteTable('fraud_patterns', {
  id: integer('id').primaryKey({ autoIncrement: true }),

  keyword: text('keyword').notNull().unique(),
  category: text('category', {
    enum: ['urgent', 'prepay', 'fake', 'suspicious_price', 'vague_description']
  }).notNull(),

  // 위험도 가중치 (1-10)
  weight: integer('weight').notNull().default(5),

  // 설명
  description: text('description'),
  exampleTexts: text('example_texts', { mode: 'json' }).$type<string[]>(),

  // 언어
  language: text('language', { enum: ['ko', 'en', 'ja', 'zh'] }).notNull().default('ko'),

  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
});

/**
 * 가격 이력 테이블
 * K-pop 굿즈/포토카드 거래 가격 기록
 */
export const priceHistory = sqliteTable('price_history', {
  id: integer('id').primaryKey({ autoIncrement: true }),

  // 아이템 정보
  itemName: text('item_name').notNull(),
  itemType: text('item_type', { enum: ['photocard', 'album', 'lightstick', 'other'] })
    .notNull()
    .default('photocard'),
  artist: text('artist'), // 아티스트/그룹명

  // 가격 정보
  price: real('price').notNull(), // 실제 거래 가격
  currency: text('currency').notNull().default('KRW'),

  // 출처
  source: text('source'), // 'twitter', 'instagram', 'daangn', etc.
  sourceUrl: text('source_url'),

  // 거래 상태
  condition: text('condition', { enum: ['new', 'like_new', 'used', 'unknown'] })
    .default('unknown'),

  recordedAt: integer('recorded_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
});

/**
 * 사용자 피드백 테이블
 * 분석 결과에 대한 사용자 피드백 수집 (AI 개선용)
 */
export const userFeedback = sqliteTable('user_feedback', {
  id: integer('id').primaryKey({ autoIncrement: true }),

  analysisId: integer('analysis_id')
    .notNull()
    .references(() => analyses.id, { onDelete: 'cascade' }),

  // 피드백 유형
  wasAccurate: integer('was_accurate', { mode: 'boolean' }), // 분석이 정확했는지
  actualOutcome: text('actual_outcome', {
    enum: ['safe_transaction', 'scam_detected', 'price_issue', 'other']
  }),

  // 상세 피드백
  comments: text('comments'),

  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
});

// 타입 추출
export type Analysis = typeof analyses.$inferSelect;
export type NewAnalysis = typeof analyses.$inferInsert;

export type FraudPattern = typeof fraudPatterns.$inferSelect;
export type NewFraudPattern = typeof fraudPatterns.$inferInsert;

export type PriceHistory = typeof priceHistory.$inferSelect;
export type NewPriceHistory = typeof priceHistory.$inferInsert;

export type UserFeedback = typeof userFeedback.$inferSelect;
export type NewUserFeedback = typeof userFeedback.$inferInsert;
