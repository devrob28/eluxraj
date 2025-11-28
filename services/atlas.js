const OpenAI = require('openai');
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ATLAS™ - Unified Asset Graph
// Canonical graph linking every asset, entity, provenance, custody, transactions, performance

const ATLAS = {
  // Core graph structure (in production: Neo4j or similar)
  graph: {
    nodes: {},
    edges: []
  },

  // Build comprehensive asset profile
  async buildAssetGraph(asset) {
    const prompt = `You are ATLAS™, a unified asset intelligence graph used by sovereign wealth funds.

Build a comprehensive knowledge graph for: ${asset}

Return ONLY this JSON:
{
  "asset": {
    "symbol": "${asset}",
    "type": "Equity | Crypto | Commodity | Real Estate | Private | Collectible",
    "full_name": "Full legal/official name",
    "identifiers": {
      "cusip": "XXXXXXXXX",
      "isin": "XXXXXXXXXXXX",
      "contract_address": "0x... (if crypto)",
      "lei": "Legal Entity Identifier"
    }
  },
  "entity_graph": {
    "issuer": {
      "name": "Company/Protocol name",
      "jurisdiction": "Country",
      "founded": "Year",
      "type": "Corporation | Foundation | DAO | Trust"
    },
    "key_people": [
      {"name": "Name", "role": "CEO/Founder", "background": "Brief bio", "stake": "X%"}
    ],
    "major_holders": [
      {"entity": "Fund/Institution", "type": "Institution | Insider | VC", "stake": "X%", "value": "$XB"}
    ],
    "subsidiaries": ["Entity 1", "Entity 2"],
    "competitors": ["Competitor 1", "Competitor 2"]
  },
  "provenance": {
    "origin_date": "When created/founded",
    "genesis_event": "IPO / Token Launch / Founding",
    "major_events": [
      {"date": "YYYY-MM-DD", "event": "What happened", "impact": "How it changed things"}
    ],
    "ownership_chain": ["Original owner → Current state"]
  },
  "custody_info": {
    "custodians": ["Where it can be held safely"],
    "trading_venues": ["Where it trades"],
    "settlement": "T+X / Instant / etc",
    "regulatory_status": "SEC registered / Commodity / Unregulated"
  },
  "transaction_flows": {
    "avg_daily_volume": "$XM",
    "liquidity_score": 0-100,
    "whale_concentration": "X% held by top 10",
    "recent_large_transactions": [
      {"date": "Recent", "type": "Buy/Sell", "size": "$XM", "entity": "Who"}
    ]
  },
  "performance_metrics": {
    "price_current": "$XXX",
    "market_cap": "$XB",
    "52w_high": "$XXX",
    "52w_low": "$XXX",
    "ytd_return": "+/-XX%",
    "volatility_30d": "XX%",
    "sharpe_1y": "X.XX",
    "max_drawdown_1y": "-XX%",
    "correlation_spy": "X.XX",
    "correlation_btc": "X.XX"
  },
  "risk_factors": {
    "regulatory": "Description of regulatory risk",
    "concentration": "Ownership concentration risk",
    "liquidity": "Liquidity risk assessment",
    "operational": "Operational/custody risks",
    "market": "Market/volatility risks"
  },
  "connected_assets": [
    {"asset": "Related ticker", "relationship": "Competitor | Supplier | Derivative | Correlated", "strength": 0-100}
  ],
  "data_sources": ["Bloomberg", "On-chain", "SEC", "etc"],
  "last_updated": "ISO timestamp",
  "confidence_score": 0-100
}`;

    try {
      const res = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 2000,
        temperature: 0.7
      });
      const graph = JSON.parse(res.choices[0].message.content);
      
      // Store in local graph
      this.graph.nodes[asset] = graph;
      
      // Create edges for connected assets
      if (graph.connected_assets) {
        graph.connected_assets.forEach(conn => {
          this.graph.edges.push({
            from: asset,
            to: conn.asset,
            relationship: conn.relationship,
            strength: conn.strength
          });
        });
      }
      
      return graph;
    } catch (e) {
      return { error: e.message };
    }
  },

  // Query relationships between assets
  async queryRelationship(asset1, asset2) {
    const prompt = `You are ATLAS™ analyzing the relationship between ${asset1} and ${asset2}.

Return ONLY this JSON:
{
  "asset1": "${asset1}",
  "asset2": "${asset2}",
  "relationship": {
    "type": "Competitor | Partner | Supplier | Customer | Derivative | Index Component | Correlated | Inverse",
    "strength": 0-100,
    "description": "How they're connected",
    "causality": "Does one drive the other? How?"
  },
  "correlation": {
    "price_correlation_30d": "X.XX",
    "price_correlation_1y": "X.XX",
    "volume_correlation": "X.XX",
    "regime_dependent": "Does correlation change in different market conditions?"
  },
  "capital_flows": {
    "substitutes": "Do investors swap between them?",
    "complements": "Do investors hold both together?",
    "flow_pattern": "When money moves, which direction?"
  },
  "trading_implications": {
    "pair_trade_opportunity": "Yes/No and why",
    "hedge_ratio": "X shares of A per 1 share of B",
    "arbitrage_potential": "Any pricing inefficiencies?"
  },
  "shared_risk_factors": ["Risk 1 both face", "Risk 2 both face"],
  "divergence_catalysts": ["What would make them decouple"]
}`;

    try {
      const res = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 800,
        temperature: 0.7
      });
      return JSON.parse(res.choices[0].message.content);
    } catch (e) {
      return { error: e.message };
    }
  },

  // Build entity profile (person, company, fund)
  async buildEntityGraph(entity) {
    const prompt = `You are ATLAS™ building an entity graph for: ${entity}

Return ONLY this JSON:
{
  "entity": {
    "name": "${entity}",
    "type": "Person | Company | Fund | DAO | Government",
    "jurisdiction": "Country",
    "founded": "Year"
  },
  "identity": {
    "legal_name": "Full legal name",
    "aliases": ["Other names used"],
    "identifiers": {
      "lei": "Legal Entity Identifier",
      "cik": "SEC CIK number",
      "ein": "Tax ID (if public)"
    }
  },
  "hierarchy": {
    "parent": "Parent entity if any",
    "subsidiaries": ["Subsidiary 1", "Subsidiary 2"],
    "affiliates": ["Related entity 1"]
  },
  "key_people": [
    {"name": "Name", "role": "Title", "since": "Year", "background": "Brief"}
  ],
  "holdings": {
    "public_equity": [
      {"asset": "Ticker", "value": "$XM", "pct_portfolio": "X%", "change_qoq": "+/-X%"}
    ],
    "private_investments": ["Company 1", "Company 2"],
    "crypto": [{"asset": "Token", "value": "$XM"}],
    "real_assets": ["Description of real asset holdings"]
  },
  "aum_history": [
    {"date": "YYYY", "aum": "$XB", "change": "+/-X%"}
  ],
  "investment_style": {
    "strategy": "Value | Growth | Quant | Macro | etc",
    "holding_period": "Typical hold time",
    "concentration": "Concentrated | Diversified",
    "notable_traits": ["What they're known for"]
  },
  "track_record": {
    "flagship_fund_return": "+XX% annualized",
    "vs_benchmark": "+/-X% alpha",
    "notable_wins": ["Famous winning trade"],
    "notable_losses": ["Famous losing trade"]
  },
  "network": {
    "co_investors": ["Who they invest alongside"],
    "service_providers": ["Prime broker", "Administrator"],
    "board_seats": ["Companies where they have board seats"]
  },
  "regulatory_filings": {
    "13f_filing": "Most recent date",
    "form_d": "Recent private placements",
    "13d_13g": "Activist positions"
  }
}`;

    try {
      const res = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1500,
        temperature: 0.7
      });
      return JSON.parse(res.choices[0].message.content);
    } catch (e) {
      return { error: e.message };
    }
  },

  // Search across the graph
  async search(query) {
    const prompt = `You are ATLAS™ searching the unified asset graph.

Query: ${query}

Return ONLY this JSON:
{
  "query": "${query}",
  "results": [
    {
      "type": "Asset | Entity | Event | Transaction",
      "name": "Name of result",
      "relevance": 0-100,
      "summary": "Why this matches",
      "key_facts": ["Fact 1", "Fact 2"],
      "connections": ["Related to X", "Connected via Y"]
    }
  ],
  "suggested_queries": ["Related query 1", "Related query 2"],
  "graph_insights": "What the graph reveals about this query"
}`;

    try {
      const res = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 800,
        temperature: 0.7
      });
      return JSON.parse(res.choices[0].message.content);
    } catch (e) {
      return { error: e.message };
    }
  }
};

module.exports = ATLAS;
