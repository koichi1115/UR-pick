import { ProductSource, type Product } from '../../types/product.js';
import type { AffiliateClient, SearchParams, SearchResult } from './types.js';
import { logger } from '../../utils/logger.js';

/**
 * Mock affiliate client for development/demo
 * Returns sample products when real affiliate APIs are not configured
 */
export class MockAffiliateClient implements AffiliateClient {
  private sampleProducts: Array<Omit<Product, 'id'>> = [
    {
      name: 'ワイヤレスイヤホン Bluetooth 5.3 高音質',
      price: 3980,
      description: '最新Bluetooth 5.3搭載。クリアな高音質と快適な装着感を実現したワイヤレスイヤホン。',
      imageUrl: 'https://via.placeholder.com/300x300/4CAF50/ffffff?text=Earphones',
      source: ProductSource.RAKUTEN,
      affiliateUrl: 'https://example.com/product1',
      rating: 4.5,
      reviewCount: 1250,
      recommendReason: '高評価レビュー多数の人気商品',
    },
    {
      name: 'モバイルバッテリー 20000mAh 大容量 急速充電',
      price: 2480,
      description: '大容量20000mAhで外出時も安心。スマホを約5回フル充電可能。',
      imageUrl: 'https://via.placeholder.com/300x300/2196F3/ffffff?text=Battery',
      source: ProductSource.AMAZON,
      affiliateUrl: 'https://example.com/product2',
      rating: 4.3,
      reviewCount: 890,
      recommendReason: 'コスパ最高の大容量モデル',
    },
    {
      name: 'スマートウォッチ 健康管理 防水',
      price: 5980,
      description: '心拍数、睡眠、運動を24時間記録。IP68防水で安心。',
      imageUrl: 'https://via.placeholder.com/300x300/FF9800/ffffff?text=Watch',
      source: ProductSource.YAHOO,
      affiliateUrl: 'https://example.com/product3',
      rating: 4.6,
      reviewCount: 2100,
      recommendReason: '健康管理に最適な高機能モデル',
    },
    {
      name: 'ワイヤレスマウス 静音 USB充電式',
      price: 1580,
      description: '静音クリックで作業に集中。USB充電式で電池不要。',
      imageUrl: 'https://via.placeholder.com/300x300/9C27B0/ffffff?text=Mouse',
      source: ProductSource.RAKUTEN,
      affiliateUrl: 'https://example.com/product4',
      rating: 4.2,
      reviewCount: 670,
      recommendReason: '静音設計でオフィスに最適',
    },
    {
      name: 'デスクライト LED 調光調色',
      price: 4280,
      description: '目に優しいLED。色温度と明るさを自由に調整可能。',
      imageUrl: 'https://via.placeholder.com/300x300/FFC107/ffffff?text=Lamp',
      source: ProductSource.AMAZON,
      affiliateUrl: 'https://example.com/product5',
      rating: 4.7,
      reviewCount: 1540,
      recommendReason: '目に優しく長時間作業向け',
    },
    {
      name: 'ノートパソコンスタンド アルミ製 折りたたみ式',
      price: 2980,
      description: '姿勢改善に最適。放熱性抜群のアルミ製で軽量コンパクト。',
      imageUrl: 'https://via.placeholder.com/300x300/607D8B/ffffff?text=Stand',
      source: ProductSource.YAHOO,
      affiliateUrl: 'https://example.com/product6',
      rating: 4.4,
      reviewCount: 980,
      recommendReason: '姿勢改善で肩こり解消',
    },
    {
      name: 'ワイヤレスキーボード 静音 コンパクト',
      price: 3480,
      description: '静かなタイピング音。薄型コンパクトでデスクをすっきり。',
      imageUrl: 'https://via.placeholder.com/300x300/795548/ffffff?text=Keyboard',
      source: ProductSource.RAKUTEN,
      affiliateUrl: 'https://example.com/product7',
      rating: 4.5,
      reviewCount: 1120,
      recommendReason: '快適なタイピングで作業効率UP',
    },
    {
      name: 'Webカメラ フルHD 1080p マイク内蔵',
      price: 3780,
      description: 'クリアな映像と音声。テレワーク・オンライン授業に最適。',
      imageUrl: 'https://via.placeholder.com/300x300/3F51B5/ffffff?text=Camera',
      source: ProductSource.AMAZON,
      affiliateUrl: 'https://example.com/product8',
      rating: 4.3,
      reviewCount: 760,
      recommendReason: 'テレワーク必須アイテム',
    },
    {
      name: 'USBハブ 7ポート 高速データ転送',
      price: 1980,
      description: 'USB3.0対応で高速転送。7ポートで複数デバイスを接続。',
      imageUrl: 'https://via.placeholder.com/300x300/009688/ffffff?text=Hub',
      source: ProductSource.YAHOO,
      affiliateUrl: 'https://example.com/product9',
      rating: 4.1,
      reviewCount: 540,
      recommendReason: 'ポート不足を一発解決',
    },
    {
      name: 'スマホスタンド 角度調整可能 滑り止め',
      price: 980,
      description: '動画視聴に最適。安定感抜群で角度自由自在。',
      imageUrl: 'https://via.placeholder.com/300x300/E91E63/ffffff?text=Stand',
      source: ProductSource.RAKUTEN,
      affiliateUrl: 'https://example.com/product10',
      rating: 4.4,
      reviewCount: 1340,
      recommendReason: 'お手頃価格で高評価',
    },
  ];

  async search(params: SearchParams): Promise<SearchResult> {
    logger.info('Using mock affiliate data', { query: params.query });

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Filter products based on price range
    let filtered = this.sampleProducts;
    if (params.minPrice !== undefined) {
      filtered = filtered.filter((p) => p.price >= params.minPrice!);
    }
    if (params.maxPrice !== undefined) {
      filtered = filtered.filter((p) => p.price <= params.maxPrice!);
    }

    // Convert to Product type with IDs
    const products: Product[] = filtered
      .slice(0, params.maxResults || 10)
      .map((p, index) => ({
        ...p,
        id: `mock-${index}-${Date.now()}`,
      }));

    return {
      products,
      totalCount: filtered.length,
      source: 'rakuten', // Mock as Rakuten
    };
  }

  async isAvailable(): Promise<boolean> {
    return true; // Always available
  }
}
