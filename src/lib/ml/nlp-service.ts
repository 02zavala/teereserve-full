import { getTenantId } from '../tenant';
import { cacheService } from '../cache-service';
import { monitoringService } from '../monitoring-service';

// Tipos para NLP
export interface ReviewAnalysis {
  id: string;
  reviewId: string;
  fieldId: string;
  sentiment: SentimentAnalysis;
  topics: TopicAnalysis[];
  entities: EntityExtraction[];
  keywords: KeywordExtraction[];
  insights: ReviewInsight[];
  actionItems: ActionItem[];
  confidence: number;
  language: string;
  processedAt: Date;
  tenant: string;
}

export interface SentimentAnalysis {
  overall: SentimentScore;
  aspects: AspectSentiment[];
  emotions: EmotionAnalysis;
  confidence: number;
}

export interface SentimentScore {
  label: 'positive' | 'negative' | 'neutral';
  score: number; // -1 to 1
  magnitude: number; // 0 to 1
}

export interface AspectSentiment {
  aspect: string;
  sentiment: SentimentScore;
  mentions: string[];
  importance: number;
}

export interface EmotionAnalysis {
  joy: number;
  anger: number;
  fear: number;
  sadness: number;
  surprise: number;
  disgust: number;
  trust: number;
  anticipation: number;
}

export interface TopicAnalysis {
  topic: string;
  relevance: number;
  keywords: string[];
  category: TopicCategory;
  sentiment: SentimentScore;
}

export type TopicCategory = 
  | 'course_condition'
  | 'service_quality'
  | 'facilities'
  | 'pricing'
  | 'staff'
  | 'booking_experience'
  | 'amenities'
  | 'accessibility'
  | 'maintenance'
  | 'food_beverage';

export interface EntityExtraction {
  entity: string;
  type: EntityType;
  confidence: number;
  mentions: EntityMention[];
  sentiment: SentimentScore;
}

export type EntityType = 
  | 'person'
  | 'location'
  | 'facility'
  | 'service'
  | 'equipment'
  | 'hole_number'
  | 'date'
  | 'time'
  | 'price'
  | 'rating';

export interface EntityMention {
  text: string;
  startIndex: number;
  endIndex: number;
  context: string;
}

export interface KeywordExtraction {
  keyword: string;
  frequency: number;
  tfidf: number;
  category: string;
  sentiment: SentimentScore;
}

export interface ReviewInsight {
  type: InsightType;
  description: string;
  impact: 'high' | 'medium' | 'low';
  confidence: number;
  supportingEvidence: string[];
  recommendations: string[];
}

export type InsightType = 
  | 'recurring_complaint'
  | 'praise_pattern'
  | 'service_gap'
  | 'improvement_opportunity'
  | 'competitive_advantage'
  | 'seasonal_trend'
  | 'demographic_preference';

export interface ActionItem {
  id: string;
  priority: 'urgent' | 'high' | 'medium' | 'low';
  category: string;
  description: string;
  department: string;
  estimatedEffort: string;
  potentialImpact: string;
  deadline: Date;
  status: 'pending' | 'in_progress' | 'completed';
}

export interface FeedbackSummary {
  fieldId: string;
  period: DateRange;
  totalReviews: number;
  averageRating: number;
  sentimentDistribution: SentimentDistribution;
  topTopics: TopicSummary[];
  keyInsights: ReviewInsight[];
  trendAnalysis: TrendAnalysis;
  competitiveAnalysis: CompetitiveAnalysis;
  recommendations: RecommendationSummary[];
  tenant: string;
}

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

export interface SentimentDistribution {
  positive: number;
  negative: number;
  neutral: number;
}

export interface TopicSummary {
  topic: string;
  frequency: number;
  averageSentiment: number;
  trend: 'improving' | 'declining' | 'stable';
  keyMentions: string[];
}

export interface TrendAnalysis {
  overallTrend: 'improving' | 'declining' | 'stable';
  sentimentTrend: number[]; // Time series
  topicTrends: TopicTrend[];
  seasonalPatterns: SeasonalPattern[];
}

export interface TopicTrend {
  topic: string;
  trend: 'improving' | 'declining' | 'stable';
  changeRate: number;
  significance: number;
}

export interface SeasonalPattern {
  season: string;
  averageSentiment: number;
  commonTopics: string[];
  uniqueInsights: string[];
}

export interface CompetitiveAnalysis {
  competitorComparisons: CompetitorComparison[];
  strengthsVsCompetitors: string[];
  weaknessesVsCompetitors: string[];
  opportunitiesIdentified: string[];
}

export interface CompetitorComparison {
  competitorName: string;
  ourRating: number;
  theirRating: number;
  ourSentiment: number;
  theirSentiment: number;
  differentiators: string[];
}

export interface RecommendationSummary {
  category: string;
  priority: 'urgent' | 'high' | 'medium' | 'low';
  description: string;
  expectedImpact: string;
  implementationComplexity: 'low' | 'medium' | 'high';
  estimatedCost: string;
  timeline: string;
}

export interface ConversationAnalysis {
  conversationId: string;
  participants: string[];
  sentiment: SentimentAnalysis;
  intent: IntentAnalysis;
  entities: EntityExtraction[];
  summary: string;
  actionItems: ActionItem[];
  escalationNeeded: boolean;
  satisfactionScore: number;
  tenant: string;
}

export interface IntentAnalysis {
  primaryIntent: string;
  confidence: number;
  secondaryIntents: SecondaryIntent[];
  category: IntentCategory;
}

export interface SecondaryIntent {
  intent: string;
  confidence: number;
}

export type IntentCategory = 
  | 'booking_inquiry'
  | 'complaint'
  | 'compliment'
  | 'information_request'
  | 'cancellation'
  | 'modification'
  | 'technical_support'
  | 'billing_inquiry'
  | 'general_inquiry';

// Clase principal para NLP
export class NLPService {
  private static instance: NLPService;
  private models: Map<string, any> = new Map();
  private analysisHistory: Map<string, ReviewAnalysis[]> = new Map();
  private conversationHistory: Map<string, ConversationAnalysis[]> = new Map();

  private constructor() {
    this.initializeService();
  }

  public static getInstance(): NLPService {
    if (!NLPService.instance) {
      NLPService.instance = new NLPService();
    }
    return NLPService.instance;
  }

  private initializeService(): void {
    // Cargar modelos de NLP
    this.loadNLPModels();
    
    // Programar análisis automático
    setInterval(() => {
      this.processNewReviews();
    }, 30 * 60 * 1000); // Cada 30 minutos
  }

  private loadNLPModels(): void {
    // En producción, estos serían modelos reales de Hugging Face o similares
    this.models.set('sentiment_analyzer', {
      name: 'BERT Sentiment Analyzer',
      version: '1.0.0',
      accuracy: 0.94
    });
    
    this.models.set('topic_extractor', {
      name: 'LDA Topic Extractor',
      version: '1.0.0',
      accuracy: 0.87
    });
    
    this.models.set('entity_recognizer', {
      name: 'SpaCy NER Model',
      version: '1.0.0',
      accuracy: 0.91
    });
    
    this.models.set('intent_classifier', {
      name: 'DistilBERT Intent Classifier',
      version: '1.0.0',
      accuracy: 0.89
    });
  }

  // Analizar review completo
  async analyzeReview(
    reviewId: string,
    fieldId: string,
    reviewText: string,
    rating?: number,
    metadata?: any,
    tenant?: string
  ): Promise<ReviewAnalysis> {
    const tenantId = tenant || getTenantId();
    const cacheKey = `nlp:review:${reviewId}`;

    try {
      // Verificar caché
      const cached = await cacheService.get<ReviewAnalysis>(cacheKey, { tenant: tenantId });
      if (cached) {
        return cached;
      }

      console.log(`Analyzing review ${reviewId}...`);

      // Detectar idioma
      const language = await this.detectLanguage(reviewText);
      
      // Análisis de sentimiento
      const sentiment = await this.analyzeSentiment(reviewText, language);
      
      // Análisis de tópicos
      const topics = await this.extractTopics(reviewText, language);
      
      // Extracción de entidades
      const entities = await this.extractEntities(reviewText, language);
      
      // Extracción de palabras clave
      const keywords = await this.extractKeywords(reviewText, language);
      
      // Generar insights
      const insights = await this.generateInsights(reviewText, sentiment, topics, entities);
      
      // Generar action items
      const actionItems = await this.generateActionItems(insights, sentiment);
      
      // Calcular confianza general
      const confidence = this.calculateOverallConfidence(sentiment, topics, entities);

      const analysis: ReviewAnalysis = {
        id: `analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        reviewId,
        fieldId,
        sentiment,
        topics,
        entities,
        keywords,
        insights,
        actionItems,
        confidence,
        language,
        processedAt: new Date(),
        tenant: tenantId
      };

      // Guardar en caché por 24 horas
      await cacheService.set(cacheKey, analysis, {
        tenant: tenantId,
        ttl: 86400,
        tags: ['nlp', 'review', `field:${fieldId}`]
      });

      // Guardar en historial
      this.saveAnalysisToHistory(analysis);

      // Registrar métricas
      monitoringService.recordMetric('nlp.review_analyzed', 1, {
        field: fieldId,
        sentiment: sentiment.overall.label,
        language: language
      }, tenantId);

      return analysis;
    } catch (error) {
      console.error('Error analyzing review:', error);
      monitoringService.recordMetric('nlp.analysis_error', 1, {
        field: fieldId,
        error: (error as Error).message
      }, tenantId);
      throw error;
    }
  }

  // Detectar idioma
  private async detectLanguage(text: string): Promise<string> {
    // Simular detección de idioma
    // En producción usaría una librería como franc o langdetect
    
    const spanishWords = ['el', 'la', 'de', 'que', 'y', 'en', 'un', 'es', 'se', 'no', 'te', 'lo', 'le', 'da', 'su', 'por', 'son', 'con', 'para', 'muy', 'campo', 'golf', 'juego', 'excelente', 'bueno', 'malo'];
    const englishWords = ['the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i', 'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at', 'golf', 'course', 'game', 'excellent', 'good', 'bad'];
    
    const words = text.toLowerCase().split(/\s+/);
    let spanishCount = 0;
    let englishCount = 0;
    
    words.forEach(word => {
      if (spanishWords.includes(word)) spanishCount++;
      if (englishWords.includes(word)) englishCount++;
    });
    
    return spanishCount > englishCount ? 'es' : 'en';
  }

  // Analizar sentimiento
  private async analyzeSentiment(text: string, language: string): Promise<SentimentAnalysis> {
    try {
      // Simular análisis de sentimiento con BERT
      const overallSentiment = this.calculateOverallSentiment(text);
      
      // Análisis de aspectos específicos
      const aspects = await this.analyzeAspectSentiment(text, language);
      
      // Análisis de emociones
      const emotions = await this.analyzeEmotions(text);
      
      return {
        overall: overallSentiment,
        aspects,
        emotions,
        confidence: 0.85 + Math.random() * 0.1
      };
    } catch (error) {
      console.error('Error in sentiment analysis:', error);
      throw error;
    }
  }

  // Calcular sentimiento general
  private calculateOverallSentiment(text: string): SentimentScore {
    // Palabras positivas y negativas simples para simulación
    const positiveWords = ['excelente', 'bueno', 'genial', 'perfecto', 'increíble', 'fantástico', 'excellent', 'good', 'great', 'perfect', 'amazing', 'fantastic'];
    const negativeWords = ['malo', 'terrible', 'horrible', 'pésimo', 'awful', 'bad', 'terrible', 'horrible', 'worst'];
    
    const words = text.toLowerCase().split(/\s+/);
    let positiveCount = 0;
    let negativeCount = 0;
    
    words.forEach(word => {
      if (positiveWords.some(pw => word.includes(pw))) positiveCount++;
      if (negativeWords.some(nw => word.includes(nw))) negativeCount++;
    });
    
    const totalSentimentWords = positiveCount + negativeCount;
    let score = 0;
    let label: 'positive' | 'negative' | 'neutral' = 'neutral';
    
    if (totalSentimentWords > 0) {
      score = (positiveCount - negativeCount) / totalSentimentWords;
      if (score > 0.1) label = 'positive';
      else if (score < -0.1) label = 'negative';
    }
    
    return {
      label,
      score,
      magnitude: Math.abs(score)
    };
  }

  // Analizar sentimiento por aspectos
  private async analyzeAspectSentiment(text: string, language: string): Promise<AspectSentiment[]> {
    const aspects = [
      'course_condition',
      'service_quality',
      'facilities',
      'pricing',
      'staff',
      'food_beverage'
    ];
    
    const aspectSentiments: AspectSentiment[] = [];
    
    for (const aspect of aspects) {
      const mentions = this.findAspectMentions(text, aspect, language);
      if (mentions.length > 0) {
        const sentiment = this.calculateAspectSentiment(mentions);
        aspectSentiments.push({
          aspect,
          sentiment,
          mentions,
          importance: mentions.length / text.split(' ').length
        });
      }
    }
    
    return aspectSentiments;
  }

  // Encontrar menciones de aspectos
  private findAspectMentions(text: string, aspect: string, language: string): string[] {
    const aspectKeywords: Record<string, string[]> = {
      course_condition: language === 'es' 
        ? ['campo', 'césped', 'green', 'fairway', 'condición', 'mantenimiento']
        : ['course', 'grass', 'green', 'fairway', 'condition', 'maintenance'],
      service_quality: language === 'es'
        ? ['servicio', 'atención', 'personal', 'staff']
        : ['service', 'staff', 'personnel', 'attention'],
      facilities: language === 'es'
        ? ['instalaciones', 'facilidades', 'clubhouse', 'vestuario']
        : ['facilities', 'clubhouse', 'locker', 'amenities'],
      pricing: language === 'es'
        ? ['precio', 'costo', 'tarifa', 'caro', 'barato']
        : ['price', 'cost', 'rate', 'expensive', 'cheap'],
      staff: language === 'es'
        ? ['personal', 'empleados', 'caddie', 'recepción']
        : ['staff', 'employees', 'caddie', 'reception'],
      food_beverage: language === 'es'
        ? ['comida', 'bebida', 'restaurante', 'bar', 'cafetería']
        : ['food', 'drink', 'restaurant', 'bar', 'cafe']
    };
    
    const keywords = aspectKeywords[aspect] || [];
    const mentions: string[] = [];
    
    const sentences = text.split(/[.!?]+/);
    sentences.forEach(sentence => {
      if (keywords.some(keyword => sentence.toLowerCase().includes(keyword))) {
        mentions.push(sentence.trim());
      }
    });
    
    return mentions;
  }

  // Calcular sentimiento de aspecto
  private calculateAspectSentiment(mentions: string[]): SentimentScore {
    const combinedText = mentions.join(' ');
    return this.calculateOverallSentiment(combinedText);
  }

  // Analizar emociones
  private async analyzeEmotions(text: string): Promise<EmotionAnalysis> {
    // Simular análisis de emociones con modelo de Plutchik
    const emotionKeywords = {
      joy: ['feliz', 'alegre', 'contento', 'happy', 'joyful', 'pleased'],
      anger: ['enojado', 'molesto', 'furioso', 'angry', 'mad', 'furious'],
      fear: ['miedo', 'temor', 'nervioso', 'fear', 'scared', 'nervous'],
      sadness: ['triste', 'deprimido', 'melancólico', 'sad', 'depressed', 'melancholy'],
      surprise: ['sorprendido', 'asombrado', 'surprised', 'amazed', 'shocked'],
      disgust: ['asco', 'repugnancia', 'disgusted', 'repulsed'],
      trust: ['confianza', 'seguro', 'trust', 'confident', 'secure'],
      anticipation: ['expectativa', 'esperanza', 'anticipation', 'expectation', 'hope']
    };
    
    const emotions: EmotionAnalysis = {
      joy: 0,
      anger: 0,
      fear: 0,
      sadness: 0,
      surprise: 0,
      disgust: 0,
      trust: 0,
      anticipation: 0
    };
    
    const words = text.toLowerCase().split(/\s+/);
    
    Object.entries(emotionKeywords).forEach(([emotion, keywords]) => {
      const count = words.filter(word => 
        keywords.some(keyword => word.includes(keyword))
      ).length;
      emotions[emotion as keyof EmotionAnalysis] = Math.min(1, count / words.length * 10);
    });
    
    return emotions;
  }

  // Extraer tópicos
  private async extractTopics(text: string, language: string): Promise<TopicAnalysis[]> {
    // Simular extracción de tópicos con LDA
    const topicKeywords: Record<string, string[]> = {
      course_condition: language === 'es' 
        ? ['campo', 'césped', 'green', 'fairway', 'condición', 'mantenimiento', 'hoyo']
        : ['course', 'grass', 'green', 'fairway', 'condition', 'maintenance', 'hole'],
      service_quality: language === 'es'
        ? ['servicio', 'atención', 'personal', 'amable', 'profesional']
        : ['service', 'staff', 'friendly', 'professional', 'helpful'],
      facilities: language === 'es'
        ? ['instalaciones', 'clubhouse', 'vestuario', 'baño', 'parking']
        : ['facilities', 'clubhouse', 'locker', 'bathroom', 'parking'],
      pricing: language === 'es'
        ? ['precio', 'costo', 'valor', 'caro', 'barato', 'promoción']
        : ['price', 'cost', 'value', 'expensive', 'cheap', 'promotion'],
      food_beverage: language === 'es'
        ? ['comida', 'bebida', 'restaurante', 'bar', 'desayuno', 'almuerzo']
        : ['food', 'drink', 'restaurant', 'bar', 'breakfast', 'lunch']
    };
    
    const topics: TopicAnalysis[] = [];
    
    Object.entries(topicKeywords).forEach(([topic, keywords]) => {
      const relevance = this.calculateTopicRelevance(text, keywords);
      if (relevance > 0.1) {
        const topicSentiment = this.calculateTopicSentiment(text, keywords);
        topics.push({
          topic,
          relevance,
          keywords: keywords.filter(keyword => 
            text.toLowerCase().includes(keyword)
          ),
          category: topic as TopicCategory,
          sentiment: topicSentiment
        });
      }
    });
    
    return topics.sort((a, b) => b.relevance - a.relevance);
  }

  // Calcular relevancia de tópico
  private calculateTopicRelevance(text: string, keywords: string[]): number {
    const words = text.toLowerCase().split(/\s+/);
    const matchCount = words.filter(word => 
      keywords.some(keyword => word.includes(keyword))
    ).length;
    
    return matchCount / words.length;
  }

  // Calcular sentimiento de tópico
  private calculateTopicSentiment(text: string, keywords: string[]): SentimentScore {
    const sentences = text.split(/[.!?]+/);
    const relevantSentences = sentences.filter(sentence =>
      keywords.some(keyword => sentence.toLowerCase().includes(keyword))
    );
    
    const combinedText = relevantSentences.join(' ');
    return this.calculateOverallSentiment(combinedText);
  }

  // Extraer entidades
  private async extractEntities(text: string, language: string): Promise<EntityExtraction[]> {
    const entities: EntityExtraction[] = [];
    
    // Simular extracción de entidades con SpaCy
    const entityPatterns = {
      hole_number: /hoyo\s+(\d+)|hole\s+(\d+)/gi,
      price: /\$(\d+(?:,\d{3})*(?:\.\d{2})?)|(\d+(?:,\d{3})*(?:\.\d{2})?)\s*(?:pesos|dollars?)/gi,
      rating: /(\d+(?:\.\d+)?)\s*(?:estrellas?|stars?)|(\d+)\/(\d+)/gi,
      time: /(\d{1,2}):(\d{2})\s*(?:am|pm)?/gi,
      date: /(\d{1,2})\/(\d{1,2})\/(\d{2,4})/gi
    };
    
    Object.entries(entityPatterns).forEach(([entityType, pattern]) => {
      const matches = Array.from(text.matchAll(pattern));
      matches.forEach(match => {
        const entity = match[0];
        const sentiment = this.calculateEntitySentiment(text, entity);
        
        entities.push({
          entity,
          type: entityType as EntityType,
          confidence: 0.8 + Math.random() * 0.15,
          mentions: [{
            text: entity,
            startIndex: match.index || 0,
            endIndex: (match.index || 0) + entity.length,
            context: this.getEntityContext(text, match.index || 0, entity.length)
          }],
          sentiment
        });
      });
    });
    
    return entities;
  }

  // Calcular sentimiento de entidad
  private calculateEntitySentiment(text: string, entity: string): SentimentScore {
    const sentences = text.split(/[.!?]+/);
    const relevantSentences = sentences.filter(sentence =>
      sentence.includes(entity)
    );
    
    const combinedText = relevantSentences.join(' ');
    return this.calculateOverallSentiment(combinedText);
  }

  // Obtener contexto de entidad
  private getEntityContext(text: string, startIndex: number, length: number): string {
    const contextStart = Math.max(0, startIndex - 50);
    const contextEnd = Math.min(text.length, startIndex + length + 50);
    return text.substring(contextStart, contextEnd);
  }

  // Extraer palabras clave
  private async extractKeywords(text: string, language: string): Promise<KeywordExtraction[]> {
    // Simular extracción de palabras clave con TF-IDF
    const stopWords = language === 'es' 
      ? ['el', 'la', 'de', 'que', 'y', 'en', 'un', 'es', 'se', 'no', 'te', 'lo', 'le', 'da', 'su', 'por', 'son', 'con', 'para', 'muy']
      : ['the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i', 'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at'];
    
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 2 && !stopWords.includes(word));
    
    const wordFreq: Record<string, number> = {};
    words.forEach(word => {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    });
    
    const keywords: KeywordExtraction[] = Object.entries(wordFreq)
      .map(([keyword, frequency]) => ({
        keyword,
        frequency,
        tfidf: frequency / words.length, // Simplificado
        category: this.categorizeKeyword(keyword, language),
        sentiment: this.calculateKeywordSentiment(text, keyword)
      }))
      .sort((a, b) => b.tfidf - a.tfidf)
      .slice(0, 10);
    
    return keywords;
  }

  // Categorizar palabra clave
  private categorizeKeyword(keyword: string, language: string): string {
    const categories = {
      golf: ['golf', 'hoyo', 'hole', 'green', 'fairway', 'tee', 'bunker'],
      service: ['servicio', 'service', 'atención', 'staff', 'personal'],
      quality: ['calidad', 'quality', 'excelente', 'excellent', 'bueno', 'good'],
      facility: ['instalación', 'facility', 'clubhouse', 'vestuario', 'locker']
    };
    
    for (const [category, words] of Object.entries(categories)) {
      if (words.some(word => keyword.includes(word))) {
        return category;
      }
    }
    
    return 'general';
  }

  // Calcular sentimiento de palabra clave
  private calculateKeywordSentiment(text: string, keyword: string): SentimentScore {
    const sentences = text.split(/[.!?]+/);
    const relevantSentences = sentences.filter(sentence =>
      sentence.toLowerCase().includes(keyword)
    );
    
    const combinedText = relevantSentences.join(' ');
    return this.calculateOverallSentiment(combinedText);
  }

  // Generar insights
  private async generateInsights(
    text: string,
    sentiment: SentimentAnalysis,
    topics: TopicAnalysis[],
    entities: EntityExtraction[]
  ): Promise<ReviewInsight[]> {
    const insights: ReviewInsight[] = [];
    
    // Insight sobre sentimiento general
    if (sentiment.overall.magnitude > 0.7) {
      insights.push({
        type: sentiment.overall.label === 'positive' ? 'praise_pattern' : 'recurring_complaint',
        description: sentiment.overall.label === 'positive' 
          ? 'Review expresa alta satisfacción general'
          : 'Review indica problemas significativos',
        impact: 'high',
        confidence: sentiment.confidence,
        supportingEvidence: [text.substring(0, 100) + '...'],
        recommendations: sentiment.overall.label === 'positive'
          ? ['Mantener estándares actuales', 'Usar como testimonio']
          : ['Investigar problemas mencionados', 'Contactar al cliente']
      });
    }
    
    // Insights sobre tópicos específicos
    topics.forEach(topic => {
      if (topic.relevance > 0.3 && Math.abs(topic.sentiment.score) > 0.5) {
        insights.push({
          type: topic.sentiment.label === 'positive' ? 'competitive_advantage' : 'improvement_opportunity',
          description: `${topic.topic} recibe ${topic.sentiment.label === 'positive' ? 'elogios' : 'críticas'} específicas`,
          impact: topic.relevance > 0.5 ? 'high' : 'medium',
          confidence: 0.8,
          supportingEvidence: topic.keywords,
          recommendations: topic.sentiment.label === 'positive'
            ? [`Destacar ${topic.topic} en marketing`, 'Mantener calidad']
            : [`Mejorar ${topic.topic}`, 'Priorizar en plan de acción']
        });
      }
    });
    
    return insights;
  }

  // Generar action items
  private async generateActionItems(
    insights: ReviewInsight[],
    sentiment: SentimentAnalysis
  ): Promise<ActionItem[]> {
    const actionItems: ActionItem[] = [];
    
    insights.forEach((insight, index) => {
      if (insight.impact === 'high' || insight.type === 'recurring_complaint') {
        actionItems.push({
          id: `action_${Date.now()}_${index}`,
          priority: insight.impact === 'high' ? 'high' : 'medium',
          category: insight.type,
          description: insight.recommendations[0] || 'Revisar feedback',
          department: this.getDepartmentForInsight(insight.type),
          estimatedEffort: insight.impact === 'high' ? '2-4 horas' : '1-2 horas',
          potentialImpact: `Mejorar satisfacción del cliente en ${insight.type}`,
          deadline: new Date(Date.now() + (insight.impact === 'high' ? 3 : 7) * 24 * 60 * 60 * 1000),
          status: 'pending'
        });
      }
    });
    
    return actionItems;
  }

  // Obtener departamento para insight
  private getDepartmentForInsight(insightType: InsightType): string {
    const departmentMap: Record<InsightType, string> = {
      recurring_complaint: 'Customer Service',
      praise_pattern: 'Marketing',
      service_gap: 'Operations',
      improvement_opportunity: 'Management',
      competitive_advantage: 'Marketing',
      seasonal_trend: 'Operations',
      demographic_preference: 'Marketing'
    };
    
    return departmentMap[insightType] || 'General';
  }

  // Calcular confianza general
  private calculateOverallConfidence(
    sentiment: SentimentAnalysis,
    topics: TopicAnalysis[],
    entities: EntityExtraction[]
  ): number {
    const sentimentConfidence = sentiment.confidence;
    const topicConfidence = topics.length > 0 
      ? topics.reduce((sum, t) => sum + t.relevance, 0) / topics.length 
      : 0.5;
    const entityConfidence = entities.length > 0
      ? entities.reduce((sum, e) => sum + e.confidence, 0) / entities.length
      : 0.5;
    
    return (sentimentConfidence + topicConfidence + entityConfidence) / 3;
  }

  // Generar resumen de feedback
  async generateFeedbackSummary(
    fieldId: string,
    startDate: Date,
    endDate: Date,
    tenant?: string
  ): Promise<FeedbackSummary> {
    const tenantId = tenant || getTenantId();
    
    try {
      // Obtener análisis del período
      const analyses = this.getAnalysesForPeriod(fieldId, startDate, endDate, tenantId);
      
      if (analyses.length === 0) {
        throw new Error('No reviews found for the specified period');
      }
      
      // Calcular métricas agregadas
      const totalReviews = analyses.length;
      const averageRating = this.calculateAverageRating(analyses);
      const sentimentDistribution = this.calculateSentimentDistribution(analyses);
      const topTopics = this.calculateTopTopics(analyses);
      const keyInsights = this.aggregateInsights(analyses);
      const trendAnalysis = this.calculateTrendAnalysis(analyses);
      const competitiveAnalysis = await this.generateCompetitiveAnalysis(fieldId, tenantId);
      const recommendations = this.generateRecommendations(analyses, keyInsights);
      
      return {
        fieldId,
        period: { startDate, endDate },
        totalReviews,
        averageRating,
        sentimentDistribution,
        topTopics,
        keyInsights,
        trendAnalysis,
        competitiveAnalysis,
        recommendations,
        tenant: tenantId
      };
    } catch (error) {
      console.error('Error generating feedback summary:', error);
      throw error;
    }
  }

  // Obtener análisis para período
  private getAnalysesForPeriod(
    fieldId: string,
    startDate: Date,
    endDate: Date,
    tenant: string
  ): ReviewAnalysis[] {
    const key = `${tenant}:${fieldId}`;
    const analyses = this.analysisHistory.get(key) || [];
    
    return analyses.filter(analysis =>
      analysis.processedAt >= startDate && analysis.processedAt <= endDate
    );
  }

  // Calcular rating promedio
  private calculateAverageRating(analyses: ReviewAnalysis[]): number {
    // En producción, esto vendría de los datos de rating reales
    return 4.2 + Math.random() * 0.6; // Simulado
  }

  // Calcular distribución de sentimiento
  private calculateSentimentDistribution(analyses: ReviewAnalysis[]): SentimentDistribution {
    const distribution = { positive: 0, negative: 0, neutral: 0 };
    
    analyses.forEach(analysis => {
      distribution[analysis.sentiment.overall.label]++;
    });
    
    const total = analyses.length;
    return {
      positive: (distribution.positive / total) * 100,
      negative: (distribution.negative / total) * 100,
      neutral: (distribution.neutral / total) * 100
    };
  }

  // Calcular top tópicos
  private calculateTopTopics(analyses: ReviewAnalysis[]): TopicSummary[] {
    const topicCounts: Record<string, { count: number; sentiments: number[] }> = {};
    
    analyses.forEach(analysis => {
      analysis.topics.forEach(topic => {
        if (!topicCounts[topic.topic]) {
          topicCounts[topic.topic] = { count: 0, sentiments: [] };
        }
        topicCounts[topic.topic].count++;
        topicCounts[topic.topic].sentiments.push(topic.sentiment.score);
      });
    });
    
    return Object.entries(topicCounts)
      .map(([topic, data]) => ({
        topic,
        frequency: data.count,
        averageSentiment: data.sentiments.reduce((a, b) => a + b, 0) / data.sentiments.length,
        trend: 'stable' as const, // Simplificado
        keyMentions: [] // Se llenarían con menciones reales
      }))
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 10);
  }

  // Agregar insights
  private aggregateInsights(analyses: ReviewAnalysis[]): ReviewInsight[] {
    const insightCounts: Record<string, ReviewInsight[]> = {};
    
    analyses.forEach(analysis => {
      analysis.insights.forEach(insight => {
        if (!insightCounts[insight.type]) {
          insightCounts[insight.type] = [];
        }
        insightCounts[insight.type].push(insight);
      });
    });
    
    return Object.entries(insightCounts)
      .map(([type, insights]) => ({
        type: type as InsightType,
        description: `${insights.length} menciones de ${type}`,
        impact: insights.some(i => i.impact === 'high') ? 'high' as const : 'medium' as const,
        confidence: insights.reduce((sum, i) => sum + i.confidence, 0) / insights.length,
        supportingEvidence: insights.flatMap(i => i.supportingEvidence).slice(0, 5),
        recommendations: [...new Set(insights.flatMap(i => i.recommendations))].slice(0, 3)
      }))
      .sort((a, b) => b.confidence - a.confidence);
  }

  // Calcular análisis de tendencias
  private calculateTrendAnalysis(analyses: ReviewAnalysis[]): TrendAnalysis {
    // Simplificado para la simulación
    return {
      overallTrend: 'stable',
      sentimentTrend: analyses.map(a => a.sentiment.overall.score),
      topicTrends: [],
      seasonalPatterns: []
    };
  }

  // Generar análisis competitivo
  private async generateCompetitiveAnalysis(fieldId: string, tenant: string): Promise<CompetitiveAnalysis> {
    // Simulado - en producción obtendría datos reales de competidores
    return {
      competitorComparisons: [],
      strengthsVsCompetitors: ['Excelente mantenimiento del campo', 'Servicio al cliente superior'],
      weaknessesVsCompetitors: ['Precios ligeramente más altos', 'Instalaciones más antiguas'],
      opportunitiesIdentified: ['Mejorar experiencia digital', 'Expandir servicios de food & beverage']
    };
  }

  // Generar recomendaciones
  private generateRecommendations(
    analyses: ReviewAnalysis[],
    insights: ReviewInsight[]
  ): RecommendationSummary[] {
    const recommendations: RecommendationSummary[] = [];
    
    insights.forEach(insight => {
      if (insight.impact === 'high') {
        recommendations.push({
          category: insight.type,
          priority: 'high',
          description: insight.recommendations[0] || 'Revisar área de oportunidad',
          expectedImpact: 'Mejora significativa en satisfacción del cliente',
          implementationComplexity: 'medium',
          estimatedCost: '$1,000 - $5,000',
          timeline: '2-4 semanas'
        });
      }
    });
    
    return recommendations.slice(0, 5);
  }

  // Procesar nuevas reviews
  private async processNewReviews(): Promise<void> {
    console.log('Processing new reviews for NLP analysis...');
    
    // En producción, esto obtendría nuevas reviews de la base de datos
    // y las procesaría automáticamente
  }

  // Guardar análisis en historial
  private saveAnalysisToHistory(analysis: ReviewAnalysis): void {
    const key = `${analysis.tenant}:${analysis.fieldId}`;
    const history = this.analysisHistory.get(key) || [];
    
    history.push(analysis);
    
    // Mantener solo los últimos 1000 análisis
    if (history.length > 1000) {
      history.splice(0, history.length - 1000);
    }
    
    this.analysisHistory.set(key, history);
  }

  // Obtener estadísticas del servicio
  getServiceStats(tenant?: string): any {
    const tenantId = tenant || getTenantId();
    
    const totalAnalyses = Array.from(this.analysisHistory.values())
      .flat()
      .filter(analysis => analysis.tenant === tenantId).length;
    
    const recentAnalyses = Array.from(this.analysisHistory.values())
      .flat()
      .filter(analysis => 
        analysis.tenant === tenantId && 
        analysis.processedAt > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      );
    
    const avgConfidence = recentAnalyses.length > 0
      ? recentAnalyses.reduce((sum, a) => sum + a.confidence, 0) / recentAnalyses.length
      : 0;
    
    return {
      totalAnalyses,
      recentAnalyses: recentAnalyses.length,
      averageConfidence: avgConfidence,
      modelsLoaded: this.models.size,
      languagesSupported: ['es', 'en'],
      lastAnalysis: recentAnalyses.length > 0
        ? Math.max(...recentAnalyses.map(a => a.processedAt.getTime()))
        : null
    };
  }
}

// Exportar instancia
export const nlpService = NLPService.getInstance();

