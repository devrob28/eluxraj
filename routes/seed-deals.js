const express = require('express');
const router = express.Router();
const db = require('../database/db');
const crypto = require('crypto');

router.get('/seed', async (req, res) => {
  const deals = [
    {
      title: 'SpaceX Series F Secondary',
      dealType: 'pre-ipo',
      assetClass: 'Technology',
      description: 'Secondary shares in SpaceX at $180B valuation. Access to pre-IPO equity in the leading private space company.',
      minimumInvestment: 100000,
      targetRaise: 5000000,
      currentRaised: 2750000,
      expectedReturn: '40-60% IRR',
      termMonths: 36
    },
    {
      title: 'Miami Luxury Condo Development',
      dealType: 'real-estate',
      assetClass: 'Real Estate',
      description: 'Ground-up development of 48-unit luxury condominium in Brickell. Pre-construction pricing with 70% pre-sold.',
      minimumInvestment: 50000,
      targetRaise: 12000000,
      currentRaised: 8400000,
      expectedReturn: '22-28% IRR',
      termMonths: 24
    },
    {
      title: 'Stripe Pre-IPO Shares',
      dealType: 'pre-ipo',
      assetClass: 'Fintech',
      description: 'Direct secondary in Stripe at $50B valuation. Company expected to IPO within 18 months.',
      minimumInvestment: 250000,
      targetRaise: 10000000,
      currentRaised: 6000000,
      expectedReturn: '35-50% IRR',
      termMonths: 24
    },
    {
      title: 'Blue-Chip NFT Vault Fund',
      dealType: 'crypto-fund',
      assetClass: 'Digital Assets',
      description: 'Diversified fund holding CryptoPunks, BAYC, and Art Blocks. Cold storage custody with insurance.',
      minimumInvestment: 25000,
      targetRaise: 2000000,
      currentRaised: 890000,
      expectedReturn: '50-100%',
      termMonths: 12
    },
    {
      title: 'Vintage Rolex Collection',
      dealType: 'collectibles',
      assetClass: 'Luxury Watches',
      description: 'Curated collection of 12 investment-grade vintage Rolex including Paul Newman Daytona and Submariner refs.',
      minimumInvestment: 75000,
      targetRaise: 3000000,
      currentRaised: 1500000,
      expectedReturn: '15-25% Annual',
      termMonths: 60
    },
    {
      title: 'Series A - AI Healthcare Startup',
      dealType: 'venture',
      assetClass: 'Healthcare Tech',
      description: 'Leading AI diagnostics company with FDA clearance. $8M ARR growing 200% YoY.',
      minimumInvestment: 50000,
      targetRaise: 8000000,
      currentRaised: 4200000,
      expectedReturn: '10x Target',
      termMonths: 60
    }
  ];
  
  try {
    for (const d of deals) {
      const dealId = 'deal_' + Date.now() + '_' + crypto.randomBytes(4).toString('hex');
      await db.query(`
        INSERT INTO deals (deal_id, originator_id, title, description, deal_type, asset_class, minimum_investment, target_raise, current_raised, expected_return, term_months, status, visibility)
        VALUES ($1, 'system', $2, $3, $4, $5, $6, $7, $8, $9, $10, 'active', 'members')
      `, [dealId, d.title, d.description, d.dealType, d.assetClass, d.minimumInvestment, d.targetRaise, d.currentRaised, d.expectedReturn, d.termMonths]);
      
      // Small delay to ensure unique IDs
      await new Promise(r => setTimeout(r, 50));
    }
    
    res.json({ ok: true, message: '6 sample deals created!' });
  } catch (e) {
    res.json({ ok: false, error: e.message });
  }
});

module.exports = router;
