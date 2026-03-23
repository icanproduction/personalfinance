// ============================================
// Auto-categorization Engine
// ============================================
// Pattern matching on transaction descriptions

interface CategoryRule {
  category: string
  patterns: RegExp[]
  confidence: number
}

const RULES: CategoryRule[] = [
  {
    category: 'food_beverage',
    patterns: [
      /grab\s*food/i, /gofood/i, /shopee\s*food/i,
      /mcd|mcdonald/i, /kfc/i, /pizza/i, /burger/i,
      /resto|restaurant/i, /warung/i, /bakso/i, /nasi/i,
      /sate|soto|mie\s*ayam/i, /padang/i, /geprek/i,
      /hokben|yoshinoya|marugame/i, /chatime|boba/i,
      /fore\s*coffee/i, /janji\s*jiwa/i, /kopi\s*kenangan/i,
      /indomaret|alfamart/i, /superindo|hypermart/i,
      /farmers\s*market/i, /ranch\s*market/i,
    ],
    confidence: 0.85,
  },
  {
    category: 'coffee',
    patterns: [
      /starbucks/i, /sbux/i, /coffee\s*bean/i,
      /kopi/i, /cafe|café/i, /kopitiam/i,
      /tomoro/i, /flash\s*coffee/i, /point\s*coffee/i,
    ],
    confidence: 0.9,
  },
  {
    category: 'transport',
    patterns: [
      /grab(?!food)/i, /gojek|goride|gocar/i,
      /uber/i, /taxi|taksi/i, /bluebird/i,
      /shell|pertamina|bp\s/i, /bensin|fuel/i,
      /parkir|parking/i, /tol|toll/i, /e-toll|etoll/i,
      /transjakarta|mrt|lrt|krl/i,
    ],
    confidence: 0.85,
  },
  {
    category: 'subscription',
    patterns: [
      /spotify/i, /netflix/i, /youtube\s*prem/i,
      /disney/i, /hbo/i, /vidio/i, /viu/i,
      /adobe/i, /canva/i, /figma/i, /notion/i,
      /google\s*(one|workspace|storage)/i,
      /icloud/i, /apple/i, /microsoft\s*365/i,
      /zoom/i, /slack/i, /dropbox/i,
      /biznet|indihome|internet/i, /wifi/i,
      /pixieset/i, /lightroom/i,
    ],
    confidence: 0.9,
  },
  {
    category: 'shopping',
    patterns: [
      /tokopedia/i, /shopee(?!\s*food)/i, /lazada/i,
      /blibli/i, /bukalapak/i, /zalora/i,
      /uniqlo/i, /h&m|h\s*and\s*m/i, /zara/i,
      /nike|adidas|puma/i, /miniso/i, /daiso/i,
      /ikea/i, /ace\s*hardware/i, /mr\s*diy/i,
    ],
    confidence: 0.7,
  },
  {
    category: 'entertainment',
    patterns: [
      /cinema|bioskop|cgv|xxi/i, /steam|playstation|xbox/i,
      /padel|futsal|gym|fitness/i, /badminton|tennis/i,
      /karaoke/i, /bowling/i, /escape\s*room/i,
    ],
    confidence: 0.85,
  },
  {
    category: 'payment',
    patterns: [
      /pln|listrik|electric/i, /pdam|air|water/i,
      /pajak|tax/i, /bpjs/i, /insurance|asuransi/i,
      /cicilan|installment/i, /angsuran/i,
      /biaya\s*adm/i, /admin\s*fee/i,
    ],
    confidence: 0.85,
  },
  {
    category: 'transfer_out',
    patterns: [
      /trsf\s*(e-banking|m-banking)/i,
      /transfer\s*(ke|to)/i, /kirim/i,
      /payment\s*to/i, /db\s*trsf/i,
    ],
    confidence: 0.6,
  },
  {
    category: 'transfer_in',
    patterns: [
      /trsf\s*cr/i, /transfer\s*(dari|from)/i,
      /cr\s*trsf/i, /masuk\s*dari/i,
    ],
    confidence: 0.6,
  },
  {
    category: 'salary',
    patterns: [
      /gaji|salary/i, /payroll/i,
    ],
    confidence: 0.9,
  },
]

export interface CategorizeResult {
  category: string
  confidence: number
  auto_categorized: boolean
}

export function categorizeTransaction(description: string): CategorizeResult {
  const desc = description.toLowerCase()

  for (const rule of RULES) {
    for (const pattern of rule.patterns) {
      if (pattern.test(desc)) {
        return {
          category: rule.category,
          confidence: rule.confidence,
          auto_categorized: true,
        }
      }
    }
  }

  return {
    category: 'uncategorized',
    confidence: 0,
    auto_categorized: false,
  }
}

export function getAllCategories(): string[] {
  return [
    'food_beverage', 'coffee', 'transport', 'subscription',
    'shopping', 'entertainment', 'payment', 'transfer_out',
    'transfer_in', 'salary', 'talent_fee', 'business_equipment',
    'other', 'uncategorized',
  ]
}
