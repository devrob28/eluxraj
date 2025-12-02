// services/user-tier.js
const db = require('../database/db');

const UserTierService = {
  // Local fallback order if tiers table fails
  TIER_RANKS: {
    free: 0,
    pro: 1,
    elite: 2,
  },

  /**
   * Fetch tier details from DB (tiers table).
   * Falls back to local if table is missing.
   */
  async getTierDefinition(tierName) {
    try {
      const result = await db.query(
        'SELECT * FROM tiers WHERE name = $1 LIMIT 1',
        [tierName]
      );
      return result.rows[0] || null;
    } catch (err) {
      console.warn('Tier table unavailable, falling back to internal map.');
      return { name: tierName, rank: this.TIER_RANKS[tierName] || 0 };
    }
  },

  /**
   * Get user tier with expiration logic + fallback to free
   */
  async getUserTier(userId) {
    try {
      const result = await db.query(
        `SELECT id, tier, tier_expires_at, subscription_status
         FROM users WHERE id = $1`,
        [userId]
      );

      if (result.rows.length === 0) {
        return { tier: 'free', expiresAt: null, isExpired: false };
      }

      const user = result.rows[0];
      const now = new Date();
      const expired =
        user.tier_expires_at && new Date(user.tier_expires_at) < now;

      // Auto-downgrade when expired
      if (expired && user.tier !== 'free') {
        await this.setUserTier(userId, 'free', null);
        await this.logEvent(userId, 'tier_expired', user.tier, 'free');
        return { tier: 'free', isExpired: true };
      }

      return {
        tier: user.tier || 'free',
        expiresAt: user.tier_expires_at,
        subscriptionStatus: user.subscription_status,
        isExpired: expired,
      };
    } catch (err) {
      console.error('Error in getUserTier:', err);
      return { tier: 'free', expiresAt: null, isExpired: false };
    }
  },

  /**
   * Update user's tier + audit log
   */
  async setUserTier(userId, tier, expiresAt) {
    try {
      const oldInfo = await this.getUserTier(userId);
      await db.query(
        `UPDATE users 
         SET tier = $1, tier_expires_at = $2, updated_at = NOW() 
         WHERE id = $3`,
        [tier, expiresAt, userId]
      );

      await this.logEvent(userId, 'tier_updated', oldInfo.tier, tier);

      return { success: true };
    } catch (err) {
      console.error('Error setting user tier:', err);
      return { success: false, error: err.message };
    }
  },

  /**
   * Tier hierarchy check (using DB rank if available)
   */
  async hasTierAccess(userTier, requiredTier) {
    const userDef = await this.getTierDefinition(userTier);
    const requiredDef = await this.getTierDefinition(requiredTier);
    return (userDef.rank || 0) >= (requiredDef.rank || 0);
  },

  isElite(tier) {
    return tier === 'elite';
  },

  isPro(tier) {
    return tier === 'pro';
  },

  isProOrHigher(tier) {
    return tier === 'pro' || tier === 'elite';
  },

  canAccessOracle(tier) {
    return tier === 'elite';
  },

  getSignalLimit(tier) {
    switch (tier) {
      case 'elite': return Infinity;
      case 'pro': return 50;
      default: return 3;
    }
  },

  /**
   * Stripe customer + subscription sync
   */
  async updateStripeInfo(userId, customerId, subscriptionId, status) {
    try {
      await db.query(
        `UPDATE users 
         SET stripe_customer_id = $1,
             stripe_subscription_id = $2,
             subscription_status = $3,
             updated_at = NOW()
         WHERE id = $4`,
        [customerId, subscriptionId, status, userId]
      );

      await this.logEvent(
        userId,
        'stripe_subscription_updated',
        null,
        status,
        { customerId, subscriptionId }
      );

      return { success: true };
    } catch (err) {
      console.error('Error updating Stripe info:', err);
      return { success: false, error: err.message };
    }
  },

  /**
   * Reverse-lookup user from Stripe webhook
   */
  async getUserByStripeCustomer(customerId) {
    try {
      const result = await db.query(
        `SELECT id, email, tier, subscription_status 
         FROM users WHERE stripe_customer_id = $1 LIMIT 1`,
        [customerId]
      );

      return result.rows[0] || null;
    } catch (err) {
      console.error('Error getUserByStripeCustomer:', err);
      return null;
    }
  },

  /**
   * Subscription event audit logger
   */
  async logEvent(userId, event, before, after, payload = {}) {
    try {
      await db.query(
        `INSERT INTO subscription_events 
         (user_id, event, tier_before, tier_after, payload, created_at)
         VALUES ($1, $2, $3, $4, $5, NOW())`,
        [userId, event, before, after, JSON.stringify(payload)]
      );
    } catch (err) {
      console.error('Error logging subscription event:', err);
    }
  }
};

module.exports = UserTierService;
