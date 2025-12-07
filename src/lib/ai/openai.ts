import OpenAI from 'openai';

/**
 * OpenAI 클라이언트 싱글톤 (지연 초기화)
 */
let openaiClient: OpenAI | null = null;

export function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openaiClient;
}

// 기존 코드 호환성을 위한 getter
export const openai = {
  get beta() {
    return getOpenAIClient().beta;
  },
  get chat() {
    return getOpenAIClient().chat;
  },
};

/**
 * OpenAI API 사용 가능 여부 확인
 */
export function isOpenAIConfigured(): boolean {
  return !!process.env.OPENAI_API_KEY;
}

/**
 * OpenAI 모델 목록
 */
export const MODELS = {
  GPT4O: 'gpt-4o',
  GPT4O_MINI: 'gpt-4o-mini',
} as const;

/**
 * 기본 OpenAI 설정
 */
export const DEFAULT_CONFIG = {
  model: MODELS.GPT4O,
  temperature: 0.3, // 일관성 있는 분석을 위해 낮은 temperature
  max_tokens: 2000,
} as const;
