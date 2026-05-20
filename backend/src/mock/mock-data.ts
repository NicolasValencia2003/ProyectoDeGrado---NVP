export const MOCK_USER = {
  id: 'mock-user-001',
  email: 'demo@example.com',
  risk_score: 7,
  monthly_budget: 2000,
  horizon: '5-10y',
  excluded_sectors: [],
  email_alerts: true,
  event_count: 14,
};

export const MOCK_PRICES: Record<string, any> = {
  SPY:     { ticker: 'SPY',     name: 'S&P 500 ETF',            price: 524.10,  change_1d_pct:  0.42, asset_class: 'etf',       sector: 'broad_market', risk_level: 5 },
  QQQ:     { ticker: 'QQQ',     name: 'Nasdaq 100 ETF',          price: 445.32,  change_1d_pct:  0.87, asset_class: 'etf',       sector: 'technology',   risk_level: 7 },
  VTI:     { ticker: 'VTI',     name: 'Mercado Total EE.UU.',    price: 268.44,  change_1d_pct:  0.38, asset_class: 'etf',       sector: 'broad_market', risk_level: 5 },
  VXUS:    { ticker: 'VXUS',    name: 'ETF Internacional',       price:  62.18,  change_1d_pct: -0.21, asset_class: 'etf',       sector: 'international',risk_level: 6 },
  BND:     { ticker: 'BND',     name: 'Bonos Total EE.UU.',      price:  73.40,  change_1d_pct: -0.08, asset_class: 'bond',      sector: 'bonds',        risk_level: 2 },
  TLT:     { ticker: 'TLT',     name: 'Bonos del Tesoro 20A+',  price:  91.20,  change_1d_pct: -0.34, asset_class: 'bond',      sector: 'bonds',        risk_level: 3 },
  GLD:     { ticker: 'GLD',     name: 'ETF de Oro',             price: 224.85,  change_1d_pct:  0.61, asset_class: 'commodity', sector: 'commodities',  risk_level: 4 },
  XLK:     { ticker: 'XLK',     name: 'Sector Tecnología',       price: 218.60,  change_1d_pct:  1.12, asset_class: 'etf',       sector: 'technology',   risk_level: 7 },
  VNQ:     { ticker: 'VNQ',     name: 'REIT Bienes Raíces',     price:  84.32,  change_1d_pct: -0.18, asset_class: 'reit',      sector: 'real_estate',  risk_level: 5 },
  AAPL:    { ticker: 'AAPL',    name: 'Apple Inc.',              price: 189.30,  change_1d_pct:  0.55, asset_class: 'stock',     sector: 'technology',   risk_level: 6 },
  MSFT:    { ticker: 'MSFT',    name: 'Microsoft Corp.',         price: 415.80,  change_1d_pct:  0.72, asset_class: 'stock',     sector: 'technology',   risk_level: 6 },
  NVDA:    { ticker: 'NVDA',    name: 'NVIDIA Corp.',            price: 875.40,  change_1d_pct:  2.14, asset_class: 'stock',     sector: 'technology',   risk_level: 8 },
  SCHD:    { ticker: 'SCHD',    name: 'ETF Dividendos',          price:  78.92,  change_1d_pct:  0.28, asset_class: 'etf',       sector: 'dividend',     risk_level: 4 },
  'BTC-USD': { ticker: 'BTC-USD', name: 'Bitcoin',              price: 68420,   change_1d_pct: -1.23, asset_class: 'crypto',    sector: 'crypto',       risk_level: 9 },
  'ETH-USD': { ticker: 'ETH-USD', name: 'Ethereum',             price:  3840,   change_1d_pct: -0.87, asset_class: 'crypto',    sector: 'crypto',       risk_level: 9 },
  'SOL-USD': { ticker: 'SOL-USD', name: 'Solana',               price:  162.40, change_1d_pct: -2.10, asset_class: 'crypto',    sector: 'crypto',       risk_level: 10 },
  SGOV:    { ticker: 'SGOV',    name: 'Letras del Tesoro 3M',   price: 100.42,  change_1d_pct:  0.01, asset_class: 'cash',      sector: 'cash',         risk_level: 1 },
};

export const MOCK_SENTIMENT = {
  fear_greed: 62,
  fear_greed_label: 'Codicia',
  treasury_10y: 4.42,
  top_headlines: [
    'La Fed mantiene tasas estables mientras la inflación se acerca al 2%',
    'Acciones tecnológicas suben con fuertes resultados trimestrales',
    'El oro alcanza nuevos máximos ante incertidumbre global y debilidad del dólar',
  ],
  updated_at: new Date().toISOString(),
};

export const MOCK_RECOMMENDATIONS: Record<string, any> = {
  conservative: {
    recommendations: [
      {
        ticker: 'BND', name: 'Bonos Total EE.UU.', allocation_pct: 40,
        current_price: 73.40, change_1d_pct: -0.08, asset_class: 'bond', sector: 'bonds',
        rationale: 'Para un perfil conservador, la exposición amplia a bonos proporciona ingresos estables y menor volatilidad que las acciones. Los rendimientos actuales cercanos al 4,5% son especialmente atractivos frente a normas históricas.',
        key_risk: 'Un aumento de tasas de interés presionaría los precios de los bonos a la baja en el corto plazo.',
      },
      {
        ticker: 'SGOV', name: 'Letras del Tesoro 3M', allocation_pct: 25,
        current_price: 100.42, change_1d_pct: 0.01, asset_class: 'cash', sector: 'cash',
        rationale: 'Las letras del tesoro ofrecen rendimientos casi libres de riesgo superiores al 5% anual, ideales para preservar capital. Son perfectas para quienes priorizan la seguridad y necesitan liquidez ante nuevas oportunidades.',
        key_risk: 'Los rendimientos pueden no superar la inflación si las tasas caen significativamente.',
      },
      {
        ticker: 'SPY', name: 'S&P 500 ETF', allocation_pct: 20,
        current_price: 524.10, change_1d_pct: 0.42, asset_class: 'etf', sector: 'broad_market',
        rationale: 'Una pequeña asignación a renta variable estadounidense diversificada aporta potencial de crecimiento sin concentración excesiva. La diversificación del S&P 500 en 500 empresas reduce significativamente el riesgo de un solo activo.',
        key_risk: 'Las caídas del mercado podrían reducir temporalmente este componente del portafolio.',
      },
      {
        ticker: 'GLD', name: 'ETF de Oro', allocation_pct: 15,
        current_price: 224.85, change_1d_pct: 0.61, asset_class: 'commodity', sector: 'commodities',
        rationale: 'El oro actúa como cobertura frente a la inflación y la debilidad cambiaria, relevantes en el contexto macroeconómico actual. Típicamente se mueve de forma independiente frente a acciones y bonos, mejorando la diversificación.',
        key_risk: 'El oro no paga dividendos y puede quedar rezagado durante mercados alcistas de renta variable.',
      },
    ],
    market_summary: 'Los mercados muestran optimismo moderado con el índice Miedo/Codicia en 62, aunque los rendimientos elevados del Tesoro favorecen asignaciones conservadoras.',
    educational_insight: 'La diversificación entre bonos, acciones y activos alternativos como el oro es el principio fundamental de la teoría moderna de portafolios de Harry Markowitz.',
    disclaimer: 'Este contenido es material educativo generado por FinVise, plataforma académica de la Pontificia Universidad Javeriana Cali. No constituye asesoramiento financiero personalizado bajo ninguna norma legal o regulatoria.',
  },
  balanced: {
    recommendations: [
      {
        ticker: 'SPY', name: 'S&P 500 ETF', allocation_pct: 35,
        current_price: 524.10, change_1d_pct: 0.42, asset_class: 'etf', sector: 'broad_market',
        rationale: 'Un perfil balanceado se beneficia de la exposición amplia a renta variable estadounidense como motor principal de crecimiento. El S&P 500 ha entregado retornos sólidos a largo plazo con una volatilidad manejable a través del tiempo.',
        key_risk: 'Los mercados de renta variable pueden caer entre 20-40% durante recesiones, requiriendo paciencia para recuperarse.',
      },
      {
        ticker: 'BND', name: 'Bonos Total EE.UU.', allocation_pct: 25,
        current_price: 73.40, change_1d_pct: -0.08, asset_class: 'bond', sector: 'bonds',
        rationale: 'La asignación a bonos estabiliza el portafolio durante caídas de la renta variable y genera ingresos consistentes. Los rendimientos actuales son atractivos en niveles históricamente elevados, lo que representa una buena oportunidad educativa.',
        key_risk: 'El riesgo de duración implica que los bonos de largo plazo pierden valor cuando las tasas siguen subiendo.',
      },
      {
        ticker: 'QQQ', name: 'Nasdaq 100 ETF', allocation_pct: 20,
        current_price: 445.32, change_1d_pct: 0.87, asset_class: 'etf', sector: 'technology',
        rationale: 'La tecnología sigue siendo el motor dominante del crecimiento económico, y el QQQ da exposición a los 100 principales innovadores no financieros. Un horizonte de 5-10 años hace manejable la volatilidad de corto plazo.',
        key_risk: 'La concentración en tecnología implica caídas mayores durante rotaciones sectoriales.',
      },
      {
        ticker: 'GLD', name: 'ETF de Oro', allocation_pct: 12,
        current_price: 224.85, change_1d_pct: 0.61, asset_class: 'commodity', sector: 'commodities',
        rationale: 'Una asignación a oro proporciona cobertura frente a riesgos extremos e inflación. En los niveles actuales de incertidumbre macroeconómica, añade una diversificación valiosa al portafolio.',
        key_risk: 'El costo de oportunidad es alto si las acciones continúan superando al oro.',
      },
      {
        ticker: 'VNQ', name: 'REIT Bienes Raíces', allocation_pct: 8,
        current_price: 84.32, change_1d_pct: -0.18, asset_class: 'reit', sector: 'real_estate',
        rationale: 'Los REITs ofrecen exposición a bienes raíces e ingresos por dividendos sin requerir grandes capitales. Tienden a rendir bien en períodos de tasas estables o decrecientes.',
        key_risk: 'Los REITs son sensibles a cambios en tasas de interés y pueden ser volátiles.',
      },
    ],
    market_summary: 'El sentimiento favorable y los sólidos resultados tecnológicos apoyan un enfoque de crecimiento moderado, equilibrado con renta fija ante los altos rendimientos actuales.',
    educational_insight: 'El modelo de asignación 60/40 (acciones/bonos) ha sido uno de los portafolios más estudiados en finanzas académicas por su relación riesgo-retorno históricamente eficiente.',
    disclaimer: 'Este contenido es material educativo generado por FinVise, plataforma académica de la Pontificia Universidad Javeriana Cali. No constituye asesoramiento financiero personalizado bajo ninguna norma legal o regulatoria.',
  },
  aggressive: {
    recommendations: [
      {
        ticker: 'NVDA', name: 'NVIDIA Corp.', allocation_pct: 25,
        current_price: 875.40, change_1d_pct: 2.14, asset_class: 'stock', sector: 'technology',
        rationale: 'NVIDIA es el principal beneficiario de la infraestructura de inteligencia artificial, con ingresos en centros de datos creciendo a triple dígito. Un perfil agresivo y un horizonte largo pueden absorber su volatilidad a cambio de un potencial de crecimiento superior.',
        key_risk: 'La valoración está muy extendida — cualquier desaceleración en el gasto en IA podría provocar una corrección brusca.',
      },
      {
        ticker: 'QQQ', name: 'Nasdaq 100', allocation_pct: 25,
        current_price: 445.32, change_1d_pct: 0.87, asset_class: 'etf', sector: 'technology',
        rationale: 'El QQQ ofrece exposición diversificada a tecnología: IA, nube y semiconductores, el segmento de mayor crecimiento de la economía. El fuerte impulso de resultados empresariales apoya la continuidad del rendimiento superior.',
        key_risk: 'Un shock de tasas o un ciclo de decepciones de resultados podría desencadenar caídas importantes en nombres con P/E elevados.',
      },
      {
        ticker: 'BTC-USD', name: 'Bitcoin', allocation_pct: 20,
        current_price: 68420, change_1d_pct: -1.23, asset_class: 'crypto', sector: 'crypto',
        rationale: 'La adopción institucional de Bitcoin aún está madurando, con flujos hacia ETFs que aportan demanda estructural. Una tolerancia al riesgo agresiva permite absorber su volatilidad a cambio de un potencial de retorno asimétrico.',
        key_risk: 'Las criptomonedas siguen siendo muy volátiles y los cambios regulatorios pueden provocar dislocaciones de precio repentinas.',
      },
      {
        ticker: 'SPY', name: 'S&P 500 ETF', allocation_pct: 20,
        current_price: 524.10, change_1d_pct: 0.42, asset_class: 'etf', sector: 'broad_market',
        rationale: 'Un ancla de mercado amplio evita la sobreconcentración en un solo tema. La diversificación del SPY suaviza las caídas específicas de cada sector mientras mantiene el potencial alcista de la renta variable.',
        key_risk: 'El riesgo de mercado amplio significa que este activo cae junto con todo lo demás en un escenario recesivo.',
      },
      {
        ticker: 'ETH-USD', name: 'Ethereum', allocation_pct: 10,
        current_price: 3840, change_1d_pct: -0.87, asset_class: 'crypto', sector: 'crypto',
        rationale: 'El rol de Ethereum como plataforma principal de contratos inteligentes le otorga una demanda impulsada por utilidad más allá de la especulación. Los rendimientos de staking proporcionan retorno adicional sobre la apreciación del precio.',
        key_risk: 'Ethereum enfrenta competencia de blockchains Layer 1 más rápidas y riesgo de ejecución a nivel de protocolo.',
      },
    ],
    market_summary: 'El impulso tecnológico y la recuperación de criptomonedas desde la caída reciente crean oportunidades de entrada para una asignación de crecimiento agresiva.',
    educational_insight: 'Los activos de alto riesgo como criptomonedas o acciones de alto crecimiento pueden amplificar tanto ganancias como pérdidas — el concepto de apalancamiento operativo es clave para entender su volatilidad.',
    disclaimer: 'Este contenido es material educativo generado por FinVise, plataforma académica de la Pontificia Universidad Javeriana Cali. No constituye asesoramiento financiero personalizado bajo ninguna norma legal o regulatoria.',
  },
};

export const MOCK_HISTORY = [
  {
    id: 1,
    risk_score_used: 7,
    created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
    market_snapshot: { fear_greed: 45, fear_greed_label: 'Miedo', treasury_10y: 4.61 },
    payload: {
      recommendations: [
        { ticker: 'SPY',     name: 'S&P 500 ETF',    allocation_pct: 35, price_at_rec: 509.20, change_1d_pct: -0.8, asset_class: 'etf',       sector: 'broad_market', rationale: 'Exposición amplia a renta variable como motor de crecimiento.', key_risk: 'El mercado puede caer significativamente en recesiones.' },
        { ticker: 'QQQ',     name: 'Nasdaq 100',      allocation_pct: 25, price_at_rec: 430.10, change_1d_pct: -1.2, asset_class: 'etf',       sector: 'technology',   rationale: 'El sector tecnológico lidera el crecimiento económico moderno.', key_risk: 'La concentración tecnológica aumenta la volatilidad.' },
        { ticker: 'GLD',     name: 'ETF de Oro',      allocation_pct: 20, price_at_rec: 218.40, change_1d_pct:  0.9, asset_class: 'commodity', sector: 'commodities',  rationale: 'El oro cubre frente a la inflación e incertidumbre.', key_risk: 'Bajo rendimiento en mercados alcistas de acciones.' },
        { ticker: 'BTC-USD', name: 'Bitcoin',         allocation_pct: 20, price_at_rec:  61200, change_1d_pct: -2.1, asset_class: 'crypto',    sector: 'crypto',       rationale: 'Potencial asimétrico con adopción institucional creciente.', key_risk: 'Extremadamente volátil con riesgo regulatorio.' },
      ],
      market_summary: 'Los mercados mostraron miedo elevado ante la incertidumbre sobre tasas de interés.',
      disclaimer: 'Este contenido es material educativo de FinVise — Pontificia Universidad Javeriana Cali.',
    },
  },
  {
    id: 2,
    risk_score_used: 7,
    created_at: new Date(Date.now() - 21 * 86400000).toISOString(),
    market_snapshot: { fear_greed: 71, fear_greed_label: 'Codicia', treasury_10y: 4.38 },
    payload: {
      recommendations: [
        { ticker: 'NVDA',    name: 'NVIDIA Corp.',    allocation_pct: 30, price_at_rec: 820.00, change_1d_pct:  3.2, asset_class: 'stock', sector: 'technology',   rationale: 'Líder en infraestructura de IA con crecimiento de triple dígito.', key_risk: 'Valoración extendida, vulnerable a desaceleración en IA.' },
        { ticker: 'QQQ',     name: 'Nasdaq 100',      allocation_pct: 30, price_at_rec: 425.80, change_1d_pct:  1.4, asset_class: 'etf',   sector: 'technology',   rationale: 'Exposición diversificada a IA y computación en la nube.', key_risk: 'P/E elevados vulnerables a shocks de tasas.' },
        { ticker: 'BTC-USD', name: 'Bitcoin',         allocation_pct: 25, price_at_rec:  64800, change_1d_pct:  1.8, asset_class: 'crypto',sector: 'crypto',       rationale: 'Flujos hacia ETFs aportando demanda estructural sostenida.', key_risk: 'Cambios regulatorios pueden generar dislocaciones rápidas.' },
        { ticker: 'SPY',     name: 'S&P 500 ETF',     allocation_pct: 15, price_at_rec: 512.40, change_1d_pct:  0.6, asset_class: 'etf',   sector: 'broad_market', rationale: 'Ancla de mercado amplio para evitar sobreconcentración.', key_risk: 'Cae junto con todo lo demás en recesión.' },
      ],
      market_summary: 'La codicia dominó los mercados con fuerte impulso tecnológico e institucional.',
      disclaimer: 'Este contenido es material educativo de FinVise — Pontificia Universidad Javeriana Cali.',
    },
  },
];

export const MOCK_ALERTS = [
  {
    id: 1,
    condition_name: 'spy_move',
    severity: 'warning',
    message: 'El S&P 500 se movió más del 3% hoy — las asignaciones recomendadas podrían verse afectadas.',
    created_at: new Date(Date.now() - 2 * 3600000).toISOString(),
    read_by: [],
  },
  {
    id: 2,
    condition_name: 'extreme_greed',
    severity: 'info',
    message: 'El índice Miedo/Codicia cruzó 75 (Codicia Extrema). Históricamente esto precede volatilidad en el corto plazo.',
    created_at: new Date(Date.now() - 18 * 3600000).toISOString(),
    read_by: [],
  },
  {
    id: 3,
    condition_name: 'btc_move',
    severity: 'warning',
    message: 'Bitcoin cayó más del 10% en 24h. Tu asignación a criptomonedas puede verse impactada.',
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    read_by: ['mock-user-001'],
  },
];
