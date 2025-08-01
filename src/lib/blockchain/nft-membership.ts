import { getTenantId } from '../tenant';
import { cacheService } from '../cache-service';
import { monitoringService } from '../monitoring-service';

// Tipos para NFT Membership
export interface MembershipNFT {
  tokenId: string;
  contractAddress: string;
  owner: string;
  membershipType: MembershipType;
  tier: MembershipTier;
  metadata: NFTMetadata;
  benefits: MembershipBenefit[];
  status: NFTStatus;
  mintedAt: Date;
  expiresAt?: Date;
  transferHistory: TransferRecord[];
  tenant: string;
}

export type MembershipType = 
  | 'annual'
  | 'lifetime'
  | 'seasonal'
  | 'corporate'
  | 'family'
  | 'student'
  | 'senior'
  | 'trial';

export type MembershipTier = 
  | 'bronze'
  | 'silver'
  | 'gold'
  | 'platinum'
  | 'diamond'
  | 'founder'
  | 'vip'
  | 'ambassador';

export interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  animationUrl?: string;
  externalUrl?: string;
  attributes: NFTAttribute[];
  properties: NFTProperty[];
  levels: NFTLevel[];
  stats: NFTStat[];
}

export interface NFTAttribute {
  traitType: string;
  value: string | number;
  displayType?: 'string' | 'number' | 'boost_number' | 'boost_percentage' | 'date';
  maxValue?: number;
}

export interface NFTProperty {
  name: string;
  value: string;
  category: 'membership' | 'access' | 'utility' | 'cosmetic' | 'achievement';
}

export interface NFTLevel {
  name: string;
  value: number;
  maxValue: number;
  description: string;
}

export interface NFTStat {
  name: string;
  value: number;
  description: string;
  category: 'golf' | 'social' | 'rewards' | 'activity';
}

export interface MembershipBenefit {
  id: string;
  name: string;
  description: string;
  type: BenefitType;
  value: BenefitValue;
  conditions: BenefitCondition[];
  active: boolean;
  usageLimit?: number;
  usageCount: number;
  validFrom: Date;
  validUntil?: Date;
}

export type BenefitType = 
  | 'discount'
  | 'free_access'
  | 'priority_booking'
  | 'exclusive_event'
  | 'concierge_service'
  | 'equipment_rental'
  | 'lesson_credit'
  | 'guest_pass'
  | 'merchandise_credit'
  | 'dining_credit';

export interface BenefitValue {
  type: 'percentage' | 'fixed_amount' | 'quantity' | 'boolean';
  amount?: number;
  currency?: string;
  description: string;
}

export interface BenefitCondition {
  type: 'time_restriction' | 'usage_limit' | 'tier_requirement' | 'event_specific' | 'location_specific';
  value: any;
  description: string;
}

export interface NFTStatus {
  active: boolean;
  suspended: boolean;
  transferable: boolean;
  stakeable: boolean;
  lastActivity: Date;
  verificationStatus: 'verified' | 'pending' | 'rejected';
  complianceStatus: 'compliant' | 'under_review' | 'non_compliant';
}

export interface TransferRecord {
  id: string;
  from: string;
  to: string;
  timestamp: Date;
  transactionHash: string;
  blockNumber: number;
  gasUsed: number;
  transferType: 'mint' | 'transfer' | 'burn' | 'stake' | 'unstake';
  reason?: string;
}

export interface LoyaltyToken {
  tokenId: string;
  contractAddress: string;
  owner: string;
  balance: number;
  tokenType: TokenType;
  earnedFrom: EarningSource[];
  spentOn: SpendingRecord[];
  metadata: TokenMetadata;
  status: TokenStatus;
  tenant: string;
}

export type TokenType = 
  | 'points'
  | 'credits'
  | 'rewards'
  | 'experience'
  | 'achievement'
  | 'governance';

export interface EarningSource {
  id: string;
  source: EarningSourceType;
  amount: number;
  timestamp: Date;
  description: string;
  multiplier?: number;
  bonusReason?: string;
}

export type EarningSourceType = 
  | 'booking'
  | 'playing'
  | 'referral'
  | 'review'
  | 'social_share'
  | 'tournament'
  | 'lesson'
  | 'merchandise'
  | 'dining'
  | 'special_event';

export interface SpendingRecord {
  id: string;
  spentOn: SpendingCategory;
  amount: number;
  timestamp: Date;
  description: string;
  transactionId: string;
}

export type SpendingCategory = 
  | 'booking_discount'
  | 'merchandise'
  | 'dining'
  | 'lessons'
  | 'equipment_rental'
  | 'guest_passes'
  | 'upgrades'
  | 'exclusive_access';

export interface TokenMetadata {
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: number;
  description: string;
  image?: string;
  properties: Record<string, any>;
}

export interface TokenStatus {
  active: boolean;
  frozen: boolean;
  lastTransaction: Date;
  stakingStatus: StakingStatus;
}

export interface StakingStatus {
  isStaked: boolean;
  stakedAmount: number;
  stakingPool: string;
  stakingStartDate?: Date;
  estimatedRewards: number;
  lockPeriod?: number;
}

export interface TournamentBadge {
  tokenId: string;
  contractAddress: string;
  owner: string;
  tournamentId: string;
  tournamentName: string;
  badgeType: BadgeType;
  achievement: Achievement;
  metadata: BadgeMetadata;
  rarity: BadgeRarity;
  mintedAt: Date;
  tenant: string;
}

export type BadgeType = 
  | 'participation'
  | 'winner'
  | 'runner_up'
  | 'top_10'
  | 'hole_in_one'
  | 'eagle'
  | 'birdie_streak'
  | 'longest_drive'
  | 'closest_to_pin'
  | 'most_improved'
  | 'sportsmanship';

export interface Achievement {
  name: string;
  description: string;
  criteria: AchievementCriteria;
  score?: number;
  rank?: number;
  totalParticipants?: number;
  date: Date;
}

export interface AchievementCriteria {
  type: 'score' | 'rank' | 'special' | 'participation';
  value: number | string;
  description: string;
}

export interface BadgeMetadata {
  name: string;
  description: string;
  image: string;
  animationUrl?: string;
  attributes: NFTAttribute[];
  tournamentData: TournamentData;
}

export interface TournamentData {
  date: Date;
  course: string;
  format: string;
  participants: number;
  weather: string;
  conditions: string;
}

export type BadgeRarity = 
  | 'common'
  | 'uncommon'
  | 'rare'
  | 'epic'
  | 'legendary'
  | 'mythic';

export interface NFTMarketplace {
  listingId: string;
  tokenId: string;
  contractAddress: string;
  seller: string;
  price: MarketPrice;
  listingType: ListingType;
  status: ListingStatus;
  createdAt: Date;
  expiresAt?: Date;
  bids: Bid[];
  metadata: ListingMetadata;
  tenant: string;
}

export interface MarketPrice {
  amount: number;
  currency: 'ETH' | 'MATIC' | 'USDC' | 'GOLF' | 'FIAT';
  usdValue: number;
}

export type ListingType = 
  | 'fixed_price'
  | 'auction'
  | 'dutch_auction'
  | 'bundle'
  | 'offer_only';

export interface ListingStatus {
  active: boolean;
  sold: boolean;
  cancelled: boolean;
  expired: boolean;
  underReview: boolean;
}

export interface Bid {
  bidId: string;
  bidder: string;
  amount: MarketPrice;
  timestamp: Date;
  status: 'active' | 'outbid' | 'accepted' | 'rejected' | 'withdrawn';
  expiresAt?: Date;
}

export interface ListingMetadata {
  title: string;
  description: string;
  images: string[];
  category: 'membership' | 'badge' | 'token' | 'utility';
  tags: string[];
  featured: boolean;
}

// Clase principal para NFT Membership
export class NFTMembershipSystem {
  private static instance: NFTMembershipSystem;
  private memberships: Map<string, MembershipNFT> = new Map();
  private loyaltyTokens: Map<string, LoyaltyToken> = new Map();
  private tournamentBadges: Map<string, TournamentBadge> = new Map();
  private marketplace: Map<string, NFTMarketplace> = new Map();
  private contractAddresses: Map<string, string> = new Map();

  private constructor() {
    this.initializeSystem();
  }

  public static getInstance(): NFTMembershipSystem {
    if (!NFTMembershipSystem.instance) {
      NFTMembershipSystem.instance = new NFTMembershipSystem();
    }
    return NFTMembershipSystem.instance;
  }

  private initializeSystem(): void {
    // Inicializar contratos
    this.initializeContracts();
    
    // Crear membresías de ejemplo
    this.createExampleMemberships();
    
    // Programar actualizaciones de beneficios
    setInterval(() => {
      this.updateMembershipBenefits();
    }, 60 * 60 * 1000); // Cada hora

    // Programar verificación de expiración
    setInterval(() => {
      this.checkMembershipExpirations();
    }, 24 * 60 * 60 * 1000); // Cada día
  }

  private initializeContracts(): void {
    // Direcciones de contratos simuladas
    this.contractAddresses.set('membership', '0x1234567890123456789012345678901234567890');
    this.contractAddresses.set('loyalty', '0x2345678901234567890123456789012345678901');
    this.contractAddresses.set('badges', '0x3456789012345678901234567890123456789012');
    this.contractAddresses.set('marketplace', '0x4567890123456789012345678901234567890123');
  }

  private createExampleMemberships(): void {
    // Membresía Gold de ejemplo
    const goldMembership: MembershipNFT = {
      tokenId: 'GOLF_MEMBER_001',
      contractAddress: this.contractAddresses.get('membership')!,
      owner: '0xabcdef1234567890abcdef1234567890abcdef12',
      membershipType: 'annual',
      tier: 'gold',
      metadata: {
        name: 'TeeReserve Gold Membership 2024',
        description: 'Premium golf membership with exclusive benefits and priority access',
        image: 'https://teereserve.com/nft/gold-membership.png',
        animationUrl: 'https://teereserve.com/nft/gold-membership.mp4',
        externalUrl: 'https://teereserve.com/membership/gold',
        attributes: [
          { traitType: 'Tier', value: 'Gold' },
          { traitType: 'Type', value: 'Annual' },
          { traitType: 'Year', value: 2024 },
          { traitType: 'Course Access', value: 'Premium' },
          { traitType: 'Guest Passes', value: 12, displayType: 'number' },
          { traitType: 'Discount', value: 20, displayType: 'boost_percentage' }
        ],
        properties: [
          { name: 'Transferable', value: 'Yes', category: 'utility' },
          { name: 'Stakeable', value: 'Yes', category: 'utility' },
          { name: 'Renewable', value: 'Yes', category: 'membership' }
        ],
        levels: [
          { name: 'Loyalty Level', value: 75, maxValue: 100, description: 'Member loyalty score' },
          { name: 'Activity Level', value: 85, maxValue: 100, description: 'Course activity level' }
        ],
        stats: [
          { name: 'Rounds Played', value: 45, description: 'Total rounds this year', category: 'golf' },
          { name: 'Referrals', value: 8, description: 'Members referred', category: 'social' },
          { name: 'Rewards Earned', value: 2500, description: 'Total loyalty points', category: 'rewards' }
        ]
      },
      benefits: [
        {
          id: 'gold_discount',
          name: 'Gold Member Discount',
          description: '20% discount on all green fees',
          type: 'discount',
          value: { type: 'percentage', amount: 20, description: '20% off green fees' },
          conditions: [
            { type: 'tier_requirement', value: 'gold', description: 'Gold tier or higher required' }
          ],
          active: true,
          usageCount: 0,
          validFrom: new Date(),
          validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
        },
        {
          id: 'priority_booking',
          name: 'Priority Booking',
          description: 'Book tee times 7 days in advance',
          type: 'priority_booking',
          value: { type: 'quantity', amount: 7, description: '7 days advance booking' },
          conditions: [],
          active: true,
          usageCount: 0,
          validFrom: new Date()
        },
        {
          id: 'guest_passes',
          name: 'Monthly Guest Passes',
          description: '1 complimentary guest pass per month',
          type: 'guest_pass',
          value: { type: 'quantity', amount: 1, description: '1 guest pass per month' },
          conditions: [
            { type: 'usage_limit', value: 12, description: 'Maximum 12 per year' }
          ],
          active: true,
          usageLimit: 12,
          usageCount: 3,
          validFrom: new Date()
        }
      ],
      status: {
        active: true,
        suspended: false,
        transferable: true,
        stakeable: true,
        lastActivity: new Date(),
        verificationStatus: 'verified',
        complianceStatus: 'compliant'
      },
      mintedAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      expiresAt: new Date(Date.now() + 275 * 24 * 60 * 60 * 1000),
      transferHistory: [
        {
          id: 'transfer_001',
          from: '0x0000000000000000000000000000000000000000',
          to: '0xabcdef1234567890abcdef1234567890abcdef12',
          timestamp: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
          transactionHash: '0xabc123def456789abc123def456789abc123def456789abc123def456789abc123',
          blockNumber: 18500000,
          gasUsed: 150000,
          transferType: 'mint',
          reason: 'Initial membership purchase'
        }
      ],
      tenant: 'default'
    };

    this.memberships.set('GOLF_MEMBER_001', goldMembership);

    // Token de lealtad de ejemplo
    const loyaltyToken: LoyaltyToken = {
      tokenId: 'GOLF_LOYALTY_001',
      contractAddress: this.contractAddresses.get('loyalty')!,
      owner: '0xabcdef1234567890abcdef1234567890abcdef12',
      balance: 2500,
      tokenType: 'points',
      earnedFrom: [
        {
          id: 'earn_001',
          source: 'booking',
          amount: 100,
          timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          description: 'Booking round at TeeReserve Premium',
          multiplier: 1.5,
          bonusReason: 'Gold member bonus'
        },
        {
          id: 'earn_002',
          source: 'referral',
          amount: 500,
          timestamp: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
          description: 'Referred new member: John Doe',
          multiplier: 2.0,
          bonusReason: 'Successful referral'
        }
      ],
      spentOn: [
        {
          id: 'spend_001',
          spentOn: 'booking_discount',
          amount: 200,
          timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          description: 'Applied discount to weekend booking',
          transactionId: 'tx_discount_001'
        }
      ],
      metadata: {
        name: 'TeeReserve Loyalty Points',
        symbol: 'GOLF',
        decimals: 0,
        totalSupply: 1000000,
        description: 'Loyalty points for TeeReserve golf platform',
        image: 'https://teereserve.com/tokens/loyalty-points.png',
        properties: {
          transferable: false,
          stakeable: true,
          burnable: true
        }
      },
      status: {
        active: true,
        frozen: false,
        lastTransaction: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        stakingStatus: {
          isStaked: false,
          stakedAmount: 0,
          stakingPool: '',
          estimatedRewards: 0
        }
      },
      tenant: 'default'
    };

    this.loyaltyTokens.set('GOLF_LOYALTY_001', loyaltyToken);
  }

  // Crear nueva membresía NFT
  async mintMembership(
    owner: string,
    membershipType: MembershipType,
    tier: MembershipTier,
    customBenefits?: MembershipBenefit[],
    tenant?: string
  ): Promise<MembershipNFT> {
    const tenantId = tenant || getTenantId();
    
    try {
      const tokenId = `GOLF_MEMBER_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Generar metadata
      const metadata = this.generateMembershipMetadata(membershipType, tier);
      
      // Generar beneficios por defecto
      const benefits = customBenefits || this.generateDefaultBenefits(tier);
      
      const membership: MembershipNFT = {
        tokenId,
        contractAddress: this.contractAddresses.get('membership')!,
        owner,
        membershipType,
        tier,
        metadata,
        benefits,
        status: {
          active: true,
          suspended: false,
          transferable: true,
          stakeable: true,
          lastActivity: new Date(),
          verificationStatus: 'pending',
          complianceStatus: 'under_review'
        },
        mintedAt: new Date(),
        expiresAt: this.calculateExpirationDate(membershipType),
        transferHistory: [
          {
            id: `transfer_${Date.now()}`,
            from: '0x0000000000000000000000000000000000000000',
            to: owner,
            timestamp: new Date(),
            transactionHash: this.generateTransactionHash(),
            blockNumber: this.getCurrentBlockNumber(),
            gasUsed: 150000,
            transferType: 'mint',
            reason: 'New membership purchase'
          }
        ],
        tenant: tenantId
      };
      
      // Guardar membresía
      this.memberships.set(tokenId, membership);
      
      // Crear token de lealtad asociado
      await this.createLoyaltyToken(owner, tenantId);
      
      // Registrar métricas
      monitoringService.recordMetric('nft.membership_minted', 1, {
        tier,
        type: membershipType,
        owner
      }, tenantId);
      
      console.log(`Membership NFT minted: ${tokenId} for ${owner}`);
      return membership;
      
    } catch (error) {
      console.error('Error minting membership NFT:', error);
      throw error;
    }
  }

  private generateMembershipMetadata(type: MembershipType, tier: MembershipTier): NFTMetadata {
    const tierColors = {
      bronze: '#CD7F32',
      silver: '#C0C0C0',
      gold: '#FFD700',
      platinum: '#E5E4E2',
      diamond: '#B9F2FF',
      founder: '#8A2BE2',
      vip: '#FF1493',
      ambassador: '#00FF7F'
    };
    
    const tierBenefits = {
      bronze: { discount: 5, guestPasses: 2, advanceBooking: 3 },
      silver: { discount: 10, guestPasses: 4, advanceBooking: 5 },
      gold: { discount: 20, guestPasses: 12, advanceBooking: 7 },
      platinum: { discount: 25, guestPasses: 24, advanceBooking: 14 },
      diamond: { discount: 30, guestPasses: 52, advanceBooking: 21 },
      founder: { discount: 40, guestPasses: 104, advanceBooking: 30 },
      vip: { discount: 50, guestPasses: 156, advanceBooking: 30 },
      ambassador: { discount: 60, guestPasses: 365, advanceBooking: 30 }
    };
    
    const benefits = tierBenefits[tier];
    
    return {
      name: `TeeReserve ${tier.charAt(0).toUpperCase() + tier.slice(1)} Membership`,
      description: `Premium ${tier} membership with exclusive golf benefits and priority access`,
      image: `https://teereserve.com/nft/${tier}-membership.png`,
      animationUrl: `https://teereserve.com/nft/${tier}-membership.mp4`,
      externalUrl: `https://teereserve.com/membership/${tier}`,
      attributes: [
        { traitType: 'Tier', value: tier.charAt(0).toUpperCase() + tier.slice(1) },
        { traitType: 'Type', value: type.charAt(0).toUpperCase() + type.slice(1) },
        { traitType: 'Year', value: new Date().getFullYear() },
        { traitType: 'Discount', value: benefits.discount, displayType: 'boost_percentage' },
        { traitType: 'Guest Passes', value: benefits.guestPasses, displayType: 'number' },
        { traitType: 'Advance Booking', value: benefits.advanceBooking, displayType: 'number' },
        { traitType: 'Color', value: tierColors[tier] }
      ],
      properties: [
        { name: 'Transferable', value: 'Yes', category: 'utility' },
        { name: 'Stakeable', value: 'Yes', category: 'utility' },
        { name: 'Renewable', value: type !== 'lifetime' ? 'Yes' : 'No', category: 'membership' }
      ],
      levels: [
        { name: 'Loyalty Level', value: 0, maxValue: 100, description: 'Member loyalty score' },
        { name: 'Activity Level', value: 0, maxValue: 100, description: 'Course activity level' }
      ],
      stats: [
        { name: 'Rounds Played', value: 0, description: 'Total rounds played', category: 'golf' },
        { name: 'Referrals', value: 0, description: 'Members referred', category: 'social' },
        { name: 'Rewards Earned', value: 0, description: 'Total loyalty points', category: 'rewards' }
      ]
    };
  }

  private generateDefaultBenefits(tier: MembershipTier): MembershipBenefit[] {
    const tierConfig = {
      bronze: { discount: 5, guestPasses: 2, advanceBooking: 3 },
      silver: { discount: 10, guestPasses: 4, advanceBooking: 5 },
      gold: { discount: 20, guestPasses: 12, advanceBooking: 7 },
      platinum: { discount: 25, guestPasses: 24, advanceBooking: 14 },
      diamond: { discount: 30, guestPasses: 52, advanceBooking: 21 },
      founder: { discount: 40, guestPasses: 104, advanceBooking: 30 },
      vip: { discount: 50, guestPasses: 156, advanceBooking: 30 },
      ambassador: { discount: 60, guestPasses: 365, advanceBooking: 30 }
    };
    
    const config = tierConfig[tier];
    const benefits: MembershipBenefit[] = [];
    
    // Descuento en green fees
    benefits.push({
      id: `${tier}_discount`,
      name: `${tier.charAt(0).toUpperCase() + tier.slice(1)} Member Discount`,
      description: `${config.discount}% discount on all green fees`,
      type: 'discount',
      value: { type: 'percentage', amount: config.discount, description: `${config.discount}% off green fees` },
      conditions: [
        { type: 'tier_requirement', value: tier, description: `${tier} tier or higher required` }
      ],
      active: true,
      usageCount: 0,
      validFrom: new Date()
    });
    
    // Reservas anticipadas
    benefits.push({
      id: `${tier}_priority_booking`,
      name: 'Priority Booking',
      description: `Book tee times ${config.advanceBooking} days in advance`,
      type: 'priority_booking',
      value: { type: 'quantity', amount: config.advanceBooking, description: `${config.advanceBooking} days advance booking` },
      conditions: [],
      active: true,
      usageCount: 0,
      validFrom: new Date()
    });
    
    // Pases de invitado
    if (config.guestPasses > 0) {
      benefits.push({
        id: `${tier}_guest_passes`,
        name: 'Guest Passes',
        description: `${config.guestPasses} complimentary guest passes per year`,
        type: 'guest_pass',
        value: { type: 'quantity', amount: config.guestPasses, description: `${config.guestPasses} guest passes per year` },
        conditions: [
          { type: 'usage_limit', value: config.guestPasses, description: `Maximum ${config.guestPasses} per year` }
        ],
        active: true,
        usageLimit: config.guestPasses,
        usageCount: 0,
        validFrom: new Date()
      });
    }
    
    // Beneficios especiales para tiers altos
    if (['platinum', 'diamond', 'founder', 'vip', 'ambassador'].includes(tier)) {
      benefits.push({
        id: `${tier}_concierge`,
        name: 'Concierge Service',
        description: 'Personal concierge service for bookings and special requests',
        type: 'concierge_service',
        value: { type: 'boolean', description: 'Full concierge service access' },
        conditions: [],
        active: true,
        usageCount: 0,
        validFrom: new Date()
      });
    }
    
    if (['diamond', 'founder', 'vip', 'ambassador'].includes(tier)) {
      benefits.push({
        id: `${tier}_exclusive_events`,
        name: 'Exclusive Events',
        description: 'Access to member-only tournaments and social events',
        type: 'exclusive_event',
        value: { type: 'boolean', description: 'Exclusive event access' },
        conditions: [],
        active: true,
        usageCount: 0,
        validFrom: new Date()
      });
    }
    
    return benefits;
  }

  private calculateExpirationDate(type: MembershipType): Date | undefined {
    const now = new Date();
    
    switch (type) {
      case 'annual':
        return new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
      case 'seasonal':
        // Expira al final de la temporada (octubre)
        return new Date(now.getFullYear(), 9, 31);
      case 'trial':
        return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 días
      case 'lifetime':
        return undefined; // Sin expiración
      default:
        return new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
    }
  }

  private async createLoyaltyToken(owner: string, tenant: string): Promise<void> {
    const tokenId = `GOLF_LOYALTY_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const loyaltyToken: LoyaltyToken = {
      tokenId,
      contractAddress: this.contractAddresses.get('loyalty')!,
      owner,
      balance: 0,
      tokenType: 'points',
      earnedFrom: [],
      spentOn: [],
      metadata: {
        name: 'TeeReserve Loyalty Points',
        symbol: 'GOLF',
        decimals: 0,
        totalSupply: 1000000,
        description: 'Loyalty points for TeeReserve golf platform',
        image: 'https://teereserve.com/tokens/loyalty-points.png',
        properties: {
          transferable: false,
          stakeable: true,
          burnable: true
        }
      },
      status: {
        active: true,
        frozen: false,
        lastTransaction: new Date(),
        stakingStatus: {
          isStaked: false,
          stakedAmount: 0,
          stakingPool: '',
          estimatedRewards: 0
        }
      },
      tenant
    };
    
    this.loyaltyTokens.set(tokenId, loyaltyToken);
  }

  // Crear badge de torneo
  async mintTournamentBadge(
    owner: string,
    tournamentId: string,
    tournamentName: string,
    badgeType: BadgeType,
    achievement: Achievement,
    tenant?: string
  ): Promise<TournamentBadge> {
    const tenantId = tenant || getTenantId();
    
    try {
      const tokenId = `GOLF_BADGE_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const rarity = this.calculateBadgeRarity(badgeType, achievement);
      const metadata = this.generateBadgeMetadata(tournamentName, badgeType, achievement, rarity);
      
      const badge: TournamentBadge = {
        tokenId,
        contractAddress: this.contractAddresses.get('badges')!,
        owner,
        tournamentId,
        tournamentName,
        badgeType,
        achievement,
        metadata,
        rarity,
        mintedAt: new Date(),
        tenant: tenantId
      };
      
      this.tournamentBadges.set(tokenId, badge);
      
      // Otorgar puntos de lealtad por el logro
      await this.awardLoyaltyPoints(owner, this.calculateBadgePoints(badgeType, rarity), 'tournament', tenantId);
      
      // Registrar métricas
      monitoringService.recordMetric('nft.badge_minted', 1, {
        type: badgeType,
        rarity,
        tournament: tournamentId
      }, tenantId);
      
      console.log(`Tournament badge minted: ${tokenId} for ${owner}`);
      return badge;
      
    } catch (error) {
      console.error('Error minting tournament badge:', error);
      throw error;
    }
  }

  private calculateBadgeRarity(badgeType: BadgeType, achievement: Achievement): BadgeRarity {
    // Algoritmo para determinar rareza basado en tipo y logro
    switch (badgeType) {
      case 'hole_in_one':
        return 'legendary';
      case 'winner':
        return achievement.totalParticipants && achievement.totalParticipants > 100 ? 'epic' : 'rare';
      case 'runner_up':
        return 'rare';
      case 'top_10':
        return 'uncommon';
      case 'eagle':
        return 'rare';
      case 'birdie_streak':
        return achievement.score && achievement.score >= 5 ? 'epic' : 'uncommon';
      case 'longest_drive':
      case 'closest_to_pin':
        return 'uncommon';
      case 'most_improved':
      case 'sportsmanship':
        return 'rare';
      case 'participation':
      default:
        return 'common';
    }
  }

  private generateBadgeMetadata(
    tournamentName: string,
    badgeType: BadgeType,
    achievement: Achievement,
    rarity: BadgeRarity
  ): BadgeMetadata {
    const rarityColors = {
      common: '#808080',
      uncommon: '#00FF00',
      rare: '#0080FF',
      epic: '#8000FF',
      legendary: '#FF8000',
      mythic: '#FF0080'
    };
    
    return {
      name: `${tournamentName} - ${badgeType.replace('_', ' ').toUpperCase()}`,
      description: `${achievement.description} - ${rarity.toUpperCase()} achievement badge`,
      image: `https://teereserve.com/badges/${badgeType}-${rarity}.png`,
      animationUrl: `https://teereserve.com/badges/${badgeType}-${rarity}.mp4`,
      attributes: [
        { traitType: 'Badge Type', value: badgeType.replace('_', ' ').toUpperCase() },
        { traitType: 'Rarity', value: rarity.toUpperCase() },
        { traitType: 'Tournament', value: tournamentName },
        { traitType: 'Date', value: achievement.date.toISOString().split('T')[0], displayType: 'date' },
        { traitType: 'Rarity Color', value: rarityColors[rarity] }
      ],
      tournamentData: {
        date: achievement.date,
        course: 'TeeReserve Premium Course',
        format: 'Stroke Play',
        participants: achievement.totalParticipants || 0,
        weather: 'Sunny, 22°C',
        conditions: 'Perfect playing conditions'
      }
    };
  }

  private calculateBadgePoints(badgeType: BadgeType, rarity: BadgeRarity): number {
    const basePoints = {
      participation: 50,
      top_10: 100,
      runner_up: 200,
      winner: 500,
      hole_in_one: 1000,
      eagle: 300,
      birdie_streak: 150,
      longest_drive: 100,
      closest_to_pin: 100,
      most_improved: 200,
      sportsmanship: 150
    };
    
    const rarityMultiplier = {
      common: 1,
      uncommon: 1.5,
      rare: 2,
      epic: 3,
      legendary: 5,
      mythic: 10
    };
    
    return Math.round((basePoints[badgeType] || 50) * rarityMultiplier[rarity]);
  }

  // Sistema de puntos de lealtad
  async awardLoyaltyPoints(
    owner: string,
    amount: number,
    source: EarningSourceType,
    tenant?: string,
    description?: string,
    multiplier?: number
  ): Promise<void> {
    const tenantId = tenant || getTenantId();
    
    try {
      // Buscar token de lealtad del usuario
      let loyaltyToken = Array.from(this.loyaltyTokens.values())
        .find(token => token.owner === owner && token.tenant === tenantId);
      
      if (!loyaltyToken) {
        // Crear nuevo token si no existe
        await this.createLoyaltyToken(owner, tenantId);
        loyaltyToken = Array.from(this.loyaltyTokens.values())
          .find(token => token.owner === owner && token.tenant === tenantId);
      }
      
      if (!loyaltyToken) {
        throw new Error('Failed to create loyalty token');
      }
      
      // Aplicar multiplicador si existe
      const finalAmount = multiplier ? Math.round(amount * multiplier) : amount;
      
      // Agregar puntos
      loyaltyToken.balance += finalAmount;
      
      // Registrar ganancia
      loyaltyToken.earnedFrom.push({
        id: `earn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        source,
        amount: finalAmount,
        timestamp: new Date(),
        description: description || `Earned from ${source}`,
        multiplier,
        bonusReason: multiplier && multiplier > 1 ? 'Member tier bonus' : undefined
      });
      
      // Actualizar estado
      loyaltyToken.status.lastTransaction = new Date();
      
      // Registrar métricas
      monitoringService.recordMetric('loyalty.points_awarded', finalAmount, {
        source,
        owner,
        multiplier: multiplier?.toString() || '1'
      }, tenantId);
      
      console.log(`Awarded ${finalAmount} loyalty points to ${owner} from ${source}`);
      
    } catch (error) {
      console.error('Error awarding loyalty points:', error);
      throw error;
    }
  }

  async spendLoyaltyPoints(
    owner: string,
    amount: number,
    category: SpendingCategory,
    description: string,
    transactionId: string,
    tenant?: string
  ): Promise<boolean> {
    const tenantId = tenant || getTenantId();
    
    try {
      const loyaltyToken = Array.from(this.loyaltyTokens.values())
        .find(token => token.owner === owner && token.tenant === tenantId);
      
      if (!loyaltyToken) {
        throw new Error('Loyalty token not found');
      }
      
      if (loyaltyToken.balance < amount) {
        throw new Error('Insufficient loyalty points');
      }
      
      if (!loyaltyToken.status.active || loyaltyToken.status.frozen) {
        throw new Error('Loyalty token is not active');
      }
      
      // Deducir puntos
      loyaltyToken.balance -= amount;
      
      // Registrar gasto
      loyaltyToken.spentOn.push({
        id: `spend_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        spentOn: category,
        amount,
        timestamp: new Date(),
        description,
        transactionId
      });
      
      // Actualizar estado
      loyaltyToken.status.lastTransaction = new Date();
      
      // Registrar métricas
      monitoringService.recordMetric('loyalty.points_spent', amount, {
        category,
        owner,
        transaction: transactionId
      }, tenantId);
      
      console.log(`${owner} spent ${amount} loyalty points on ${category}`);
      return true;
      
    } catch (error) {
      console.error('Error spending loyalty points:', error);
      throw error;
    }
  }

  // Marketplace de NFTs
  async listNFTForSale(
    tokenId: string,
    contractAddress: string,
    seller: string,
    price: MarketPrice,
    listingType: ListingType,
    expiresAt?: Date,
    tenant?: string
  ): Promise<NFTMarketplace> {
    const tenantId = tenant || getTenantId();
    
    try {
      // Verificar propiedad del NFT
      const nft = this.findNFTByTokenId(tokenId, contractAddress);
      if (!nft || nft.owner !== seller) {
        throw new Error('NFT not found or not owned by seller');
      }
      
      const listingId = `listing_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const listing: NFTMarketplace = {
        listingId,
        tokenId,
        contractAddress,
        seller,
        price,
        listingType,
        status: {
          active: true,
          sold: false,
          cancelled: false,
          expired: false,
          underReview: false
        },
        createdAt: new Date(),
        expiresAt,
        bids: [],
        metadata: {
          title: `${nft.metadata.name} for Sale`,
          description: nft.metadata.description,
          images: [nft.metadata.image],
          category: this.categorizeNFT(contractAddress),
          tags: this.generateNFTTags(nft),
          featured: false
        },
        tenant: tenantId
      };
      
      this.marketplace.set(listingId, listing);
      
      // Registrar métricas
      monitoringService.recordMetric('marketplace.listing_created', 1, {
        type: listingType,
        price: price.amount.toString(),
        currency: price.currency
      }, tenantId);
      
      console.log(`NFT listed for sale: ${tokenId} by ${seller}`);
      return listing;
      
    } catch (error) {
      console.error('Error listing NFT for sale:', error);
      throw error;
    }
  }

  async placeBid(
    listingId: string,
    bidder: string,
    bidAmount: MarketPrice,
    expiresAt?: Date,
    tenant?: string
  ): Promise<Bid> {
    const tenantId = tenant || getTenantId();
    
    try {
      const listing = this.marketplace.get(listingId);
      if (!listing || listing.tenant !== tenantId) {
        throw new Error('Listing not found');
      }
      
      if (!listing.status.active || listing.status.sold) {
        throw new Error('Listing is not active');
      }
      
      if (listing.listingType === 'fixed_price') {
        throw new Error('Fixed price listings do not accept bids');
      }
      
      const bidId = `bid_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const bid: Bid = {
        bidId,
        bidder,
        amount: bidAmount,
        timestamp: new Date(),
        status: 'active',
        expiresAt
      };
      
      // Marcar ofertas anteriores como superadas
      listing.bids.forEach(existingBid => {
        if (existingBid.status === 'active' && existingBid.amount.usdValue < bidAmount.usdValue) {
          existingBid.status = 'outbid';
        }
      });
      
      listing.bids.push(bid);
      
      // Registrar métricas
      monitoringService.recordMetric('marketplace.bid_placed', 1, {
        listing: listingId,
        amount: bidAmount.amount.toString(),
        currency: bidAmount.currency
      }, tenantId);
      
      console.log(`Bid placed: ${bidAmount.amount} ${bidAmount.currency} by ${bidder}`);
      return bid;
      
    } catch (error) {
      console.error('Error placing bid:', error);
      throw error;
    }
  }

  // Métodos auxiliares
  private findNFTByTokenId(tokenId: string, contractAddress: string): any {
    // Buscar en membresías
    if (contractAddress === this.contractAddresses.get('membership')) {
      return this.memberships.get(tokenId);
    }
    
    // Buscar en badges
    if (contractAddress === this.contractAddresses.get('badges')) {
      return this.tournamentBadges.get(tokenId);
    }
    
    return null;
  }

  private categorizeNFT(contractAddress: string): 'membership' | 'badge' | 'token' | 'utility' {
    if (contractAddress === this.contractAddresses.get('membership')) {
      return 'membership';
    }
    if (contractAddress === this.contractAddresses.get('badges')) {
      return 'badge';
    }
    if (contractAddress === this.contractAddresses.get('loyalty')) {
      return 'token';
    }
    return 'utility';
  }

  private generateNFTTags(nft: any): string[] {
    const tags: string[] = [];
    
    if (nft.tier) {
      tags.push(nft.tier);
    }
    
    if (nft.membershipType) {
      tags.push(nft.membershipType);
    }
    
    if (nft.badgeType) {
      tags.push(nft.badgeType);
    }
    
    if (nft.rarity) {
      tags.push(nft.rarity);
    }
    
    tags.push('golf', 'teereserve');
    
    return tags;
  }

  private generateTransactionHash(): string {
    return '0x' + Array.from({ length: 64 }, () => 
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
  }

  private getCurrentBlockNumber(): number {
    return 18500000 + Math.floor(Math.random() * 100000);
  }

  // Mantenimiento del sistema
  private async updateMembershipBenefits(): Promise<void> {
    console.log('Updating membership benefits...');
    
    for (const [tokenId, membership] of this.memberships.entries()) {
      try {
        // Actualizar niveles de lealtad y actividad
        await this.updateMembershipLevels(membership);
        
        // Verificar y renovar beneficios
        await this.renewMembershipBenefits(membership);
        
      } catch (error) {
        console.error(`Error updating benefits for membership ${tokenId}:`, error);
      }
    }
  }

  private async updateMembershipLevels(membership: MembershipNFT): Promise<void> {
    // Simular actualización de niveles basada en actividad
    const loyaltyLevel = membership.metadata.levels.find(l => l.name === 'Loyalty Level');
    const activityLevel = membership.metadata.levels.find(l => l.name === 'Activity Level');
    
    if (loyaltyLevel) {
      loyaltyLevel.value = Math.min(100, loyaltyLevel.value + Math.random() * 2);
    }
    
    if (activityLevel) {
      activityLevel.value = Math.min(100, activityLevel.value + Math.random() * 3);
    }
    
    // Actualizar estadísticas
    const roundsStat = membership.metadata.stats.find(s => s.name === 'Rounds Played');
    if (roundsStat && Math.random() < 0.1) { // 10% probabilidad de nueva ronda
      roundsStat.value++;
    }
  }

  private async renewMembershipBenefits(membership: MembershipNFT): Promise<void> {
    // Renovar beneficios mensuales (como guest passes)
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    
    for (const benefit of membership.benefits) {
      if (benefit.type === 'guest_pass' && benefit.usageLimit) {
        // Resetear uso mensual si es un nuevo mes
        const lastReset = new Date(benefit.validFrom);
        if (lastReset < monthStart) {
          benefit.usageCount = 0;
          benefit.validFrom = monthStart;
        }
      }
    }
  }

  private async checkMembershipExpirations(): Promise<void> {
    console.log('Checking membership expirations...');
    
    const now = new Date();
    
    for (const [tokenId, membership] of this.memberships.entries()) {
      if (membership.expiresAt && membership.expiresAt <= now && membership.status.active) {
        // Marcar como expirada
        membership.status.active = false;
        membership.status.suspended = true;
        
        console.log(`Membership expired: ${tokenId}`);
        
        // Registrar métrica
        monitoringService.recordMetric('nft.membership_expired', 1, {
          tier: membership.tier,
          type: membership.membershipType
        }, membership.tenant);
      }
    }
  }

  // API pública
  async getMembership(tokenId: string, tenant?: string): Promise<MembershipNFT | null> {
    const tenantId = tenant || getTenantId();
    const membership = this.memberships.get(tokenId);
    
    if (!membership || membership.tenant !== tenantId) {
      return null;
    }
    
    return membership;
  }

  async getLoyaltyToken(owner: string, tenant?: string): Promise<LoyaltyToken | null> {
    const tenantId = tenant || getTenantId();
    
    return Array.from(this.loyaltyTokens.values())
      .find(token => token.owner === owner && token.tenant === tenantId) || null;
  }

  async getTournamentBadges(owner: string, tenant?: string): Promise<TournamentBadge[]> {
    const tenantId = tenant || getTenantId();
    
    return Array.from(this.tournamentBadges.values())
      .filter(badge => badge.owner === owner && badge.tenant === tenantId);
  }

  async getMarketplaceListings(
    category?: 'membership' | 'badge' | 'token' | 'utility',
    tenant?: string
  ): Promise<NFTMarketplace[]> {
    const tenantId = tenant || getTenantId();
    
    let listings = Array.from(this.marketplace.values())
      .filter(listing => listing.tenant === tenantId && listing.status.active);
    
    if (category) {
      listings = listings.filter(listing => listing.metadata.category === category);
    }
    
    return listings.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  // Obtener estadísticas del servicio
  getServiceStats(tenant?: string): any {
    const tenantId = tenant || getTenantId();
    
    const membershipsForTenant = Array.from(this.memberships.values())
      .filter(membership => membership.tenant === tenantId);
    
    const loyaltyTokensForTenant = Array.from(this.loyaltyTokens.values())
      .filter(token => token.tenant === tenantId);
    
    const badgesForTenant = Array.from(this.tournamentBadges.values())
      .filter(badge => badge.tenant === tenantId);
    
    const listingsForTenant = Array.from(this.marketplace.values())
      .filter(listing => listing.tenant === tenantId);

    return {
      totalMemberships: membershipsForTenant.length,
      activeMemberships: membershipsForTenant.filter(m => m.status.active).length,
      totalLoyaltyTokens: loyaltyTokensForTenant.length,
      totalLoyaltyPoints: loyaltyTokensForTenant.reduce((sum, token) => sum + token.balance, 0),
      totalBadges: badgesForTenant.length,
      totalMarketplaceListings: listingsForTenant.length,
      activeListings: listingsForTenant.filter(l => l.status.active).length,
      membershipTiers: membershipsForTenant.reduce((acc, membership) => {
        acc[membership.tier] = (acc[membership.tier] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      badgeRarities: badgesForTenant.reduce((acc, badge) => {
        acc[badge.rarity] = (acc[badge.rarity] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    };
  }
}

// Exportar instancia
export const nftMembershipSystem = NFTMembershipSystem.getInstance();

