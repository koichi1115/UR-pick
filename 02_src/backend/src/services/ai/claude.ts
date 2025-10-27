import Anthropic from '@anthropic-ai/sdk';
import { config } from '../../config/index.js';
import { logger } from '../../utils/logger.js';
import { ExternalApiError } from '../../utils/errors.js';

/**
 * Claude API client wrapper
 */
export class ClaudeClient {
  private client: Anthropic;
  private model: string = 'claude-sonnet-4-20250514';
  private maxTokens: number = 4096;

  constructor(apiKey?: string) {
    const key = apiKey || config.claude.apiKey;

    if (!key) {
      throw new Error('Claude API key is required');
    }

    this.client = new Anthropic({
      apiKey: key,
    });

    logger.info('Claude API client initialized', { model: this.model });
  }

  /**
   * Send a message to Claude
   */
  async sendMessage(
    prompt: string,
    systemPrompt?: string,
    options?: {
      temperature?: number;
      maxTokens?: number;
    }
  ): Promise<string> {
    try {
      logger.debug('Sending message to Claude', {
        promptLength: prompt.length,
        systemPromptLength: systemPrompt?.length || 0,
      });

      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: options?.maxTokens || this.maxTokens,
        temperature: options?.temperature || 1.0,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      // Extract text from response
      const textContent = response.content.find((block) => block.type === 'text');
      if (!textContent || textContent.type !== 'text') {
        throw new Error('No text content in Claude response');
      }

      logger.info('Claude API response received', {
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
        stopReason: response.stop_reason,
      });

      return textContent.text;
    } catch (error) {
      logger.error('Claude API error', error);

      if (error instanceof Anthropic.APIError) {
        throw new ExternalApiError('Claude API', `${error.status}: ${error.message}`);
      }

      throw error;
    }
  }

  /**
   * Generate recommendation reasons for products
   */
  async generateRecommendationReasons(
    query: string,
    productName: string,
    productDescription: string,
    userContext?: string
  ): Promise<string> {
    const systemPrompt = `You are a shopping assistant helping users find products that match their needs.
Generate a concise recommendation reason (1-2 sentences, max 50 words) in Japanese.
Focus on why this product matches the user's request.`;

    const prompt = `ユーザーのリクエスト: ${query}

商品名: ${productName}
商品説明: ${productDescription}
${userContext ? `\nユーザーの嗜好: ${userContext}` : ''}

この商品がユーザーのリクエストにマッチする理由を、簡潔に1-2文で説明してください。`;

    return this.sendMessage(prompt, systemPrompt, {
      temperature: 0.7,
      maxTokens: 200,
    });
  }

  /**
   * Analyze user preferences from swipe history
   */
  async analyzeUserPreferences(
    likedProducts: Array<{ name: string; price: number; description: string }>,
    dislikedProducts: Array<{ name: string; price: number; description: string }>
  ): Promise<string> {
    const systemPrompt = `You are a data analyst specializing in user preference analysis.
Analyze the user's liked and disliked products to identify patterns and preferences.
Return a concise summary in Japanese (max 100 words).`;

    const likedList = likedProducts.map((p) => `- ${p.name} (¥${p.price})`).join('\n');
    const dislikedList = dislikedProducts.map((p) => `- ${p.name} (¥${p.price})`).join('\n');

    const prompt = `以下のユーザーのスワイプ履歴から、嗜好のパターンを分析してください。

【興味ありの商品】
${likedList || 'なし'}

【興味なしの商品】
${dislikedList || 'なし'}

このユーザーの嗜好の傾向を簡潔にまとめてください（価格帯、カテゴリ、ブランドなど）。`;

    return this.sendMessage(prompt, systemPrompt, {
      temperature: 0.5,
      maxTokens: 300,
    });
  }

  /**
   * Select best products from a list based on user query and preferences
   */
  async selectBestProducts(
    query: string,
    products: Array<{ id: string; name: string; price: number; description: string }>,
    userPreferences?: string,
    maxResults: number = 10
  ): Promise<string[]> {
    const systemPrompt = `You are a product recommendation expert.
Select the ${maxResults} best products that match the user's query and preferences.
Return ONLY a JSON array of product IDs in order of relevance, like: ["id1", "id2", "id3"]`;

    const productsList = products
      .map((p, i) => `${i + 1}. ID: ${p.id}, 名前: ${p.name}, 価格: ¥${p.price}`)
      .join('\n');

    const prompt = `ユーザーのリクエスト: ${query}
${userPreferences ? `\nユーザーの嗜好: ${userPreferences}` : ''}

商品リスト:
${productsList}

上記の商品から、ユーザーのリクエストに最もマッチする${maxResults}件を選択し、商品IDのJSON配列で返してください。`;

    const response = await this.sendMessage(prompt, systemPrompt, {
      temperature: 0.3,
      maxTokens: 500,
    });

    try {
      // Extract JSON from response
      const jsonMatch = response.match(/\[.*\]/s);
      if (!jsonMatch) {
        logger.warn('No JSON array found in Claude response', { response });
        return [];
      }

      const productIds = JSON.parse(jsonMatch[0]) as string[];
      return productIds;
    } catch (error) {
      logger.error('Failed to parse Claude response', { response, error });
      return [];
    }
  }
}
