export function buildLifeProfileContext(user: any, prefs: any): string {
  const lines: string[] = [];

  const ageContexts: Record<string, string> = {
    '18-24': 'Young adult, likely student or early career. Has long investment horizon (30+ years). Prioritize explaining long-term compounding and growth assets. May have limited income — explain concepts with small amounts.',
    '25-34': 'Young professional. Building career and possibly starting family. Horizon 25-35 years. Balance between growth and starting to diversify. Likely has student debt or rent — acknowledge real financial context.',
    '35-44': 'Established professional. May have mortgage, children, peak earning years. Horizon 20-25 years. Emphasize diversification and protecting gains. Risk tolerance may be lower than declared due to family obligations.',
    '45-54': 'Pre-retirement planning phase. Horizon 10-20 years. Shift narrative toward capital preservation without sacrificing growth. Pension and retirement accounts become more relevant context.',
    '55+':   'Near or at retirement. Capital preservation is primary. Horizon may be 5-15 years. Income-generating assets most relevant. Volatility tolerance is genuinely low regardless of declared score.',
  };
  if (user.age_group && ageContexts[user.age_group]) {
    lines.push(`AGE CONTEXT: ${ageContexts[user.age_group]}`);
  }

  const occupationContexts: Record<string, string> = {
    student:        'Student with likely irregular or limited income. Always mention that building an emergency fund comes before investing. Use relatable examples with small amounts (50-100 USD/month).',
    employed_fixed: 'Fixed salary worker. Stable income allows consistent investing. Can consider dollar-cost averaging strategies.',
    freelance:      'Variable/freelance income. CRITICAL: always emphasize emergency fund of 6 months expenses BEFORE any investment allocation. Liquidity is essential — weight SGOV and BND explanations accordingly.',
    entrepreneur:   'Business owner. May have irregular income and concentrated business risk. Diversification away from their business sector is especially important.',
    unemployed:     'Currently without stable income. Focus entirely on education concepts. Do NOT suggest any allocation that requires monthly contributions.',
    retired:        'Retired. Focus on capital preservation and income generation. Growth assets are secondary to stability.',
  };
  if (user.occupation_type && occupationContexts[user.occupation_type]) {
    lines.push(`OCCUPATION CONTEXT: ${occupationContexts[user.occupation_type]}`);
  }

  const educationContexts: Record<string, string> = {
    high_school: 'VOCABULARY: Very simple language only. No financial jargon whatsoever. Define EVERY technical term in parentheses the first time it appears. Use analogies from everyday life. Example: "ETF (a basket of many stocks that you buy as one)"',
    technical:   'VOCABULARY: Simple but can handle basic terms. Define terms like "yield" or "volatility" briefly in context. Practical, concrete explanations preferred.',
    university:  'VOCABULARY: Standard financial terminology is acceptable. Terms like ETF, bond yield, diversification need no definition. Can reference risk-return tradeoff without explaining from scratch.',
    postgrad:    'VOCABULARY: Advanced financial terminology is appropriate. May reference Sharpe ratio, annualized volatility, correlation, duration. Assume familiarity with Modern Portfolio Theory basics.',
  };
  if (user.education_level && educationContexts[user.education_level]) {
    lines.push(educationContexts[user.education_level]);
  }

  const familyContexts: Record<string, string> = {
    single_no_deps:   'No financial dependents. Full flexibility in risk-taking.',
    single_with_deps: 'Has dependents despite being single. Real risk tolerance is lower than declared score suggests. Mention insurance and emergency fund.',
    couple_no_kids:   'Dual income likely. Can tolerate moderate risk. Shared financial goals may extend the effective horizon.',
    couple_with_kids: 'Has children. Education funding is likely a future goal. Real risk tolerance is meaningfully lower than declared. Stability deserves explicit mention.',
    large_family:     'Large family obligations. Liquidity and capital preservation are paramount regardless of declared risk score.',
  };
  if (user.family_context && familyContexts[user.family_context]) {
    lines.push(`FAMILY CONTEXT: ${familyContexts[user.family_context]}`);
  }

  const goalContexts: Record<string, string> = {
    emergency_fund:  'PRIMARY GOAL IS BUILDING EMERGENCY FUND. All explanations should connect to why liquid, low-risk assets matter first.',
    buy_home:        'Saving to buy a home. Timeline is likely 3-7 years. Capital preservation is critical — cannot afford big drawdowns near purchase date.',
    education:       'Funding education (own or children). Balance growth with capital protection as deadline approaches.',
    retirement:      'Long-term retirement goal. Connect every asset explanation to how it contributes to retirement security.',
    wealth_growth:   'General wealth accumulation. Diversification and compounding are the core educational themes.',
    general_learning:'User is here to learn. Focus on foundational concepts: what each asset class is and why it exists.',
  };
  if (user.primary_goal && goalContexts[user.primary_goal]) {
    lines.push(`PRIMARY GOAL: ${goalContexts[user.primary_goal]}`);
  }

  const motivationContexts: Record<string, string> = {
    curiosity:          'User is exploring out of curiosity. Keep tone light and engaging.',
    learn_before_invest:'User intends to invest soon but wants to understand first. Be thorough — this person will act on this knowledge.',
    already_invest:     'User already invests. Focus on what they might not know yet, not basics.',
    academic:           'Academic/student project. Conceptual rigor matters. References to MPT, Prospect Theory are welcome.',
    other:              'General interest in learning about finance.',
  };
  if (user.motivation && motivationContexts[user.motivation]) {
    lines.push(`MOTIVATION: ${motivationContexts[user.motivation]}`);
  }

  const eventCount: number = prefs?.event_count ?? 0;
  const mlStrength = eventCount >= 20 ? 0.8 : eventCount >= 5 ? 0.8 * (eventCount - 5) / 15 : 0;

  if (mlStrength > 0 && prefs?.sector_weights) {
    const topSectors = Object.entries(prefs.sector_weights as Record<string, number>)
      .filter(([, w]) => w > 0.3)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([s]) => s);
    if (topSectors.length > 0) {
      lines.push(`DEMONSTRATED INTERESTS: User has shown strong interest in ${topSectors.join(', ')} sectors.`);
    }
    const avoided: string[] = prefs.avoided_tickers ?? [];
    if (avoided.length > 0) {
      lines.push(`AVOIDED ASSETS: User consistently avoids ${avoided.join(', ')}.`);
    }
  }

  return lines.length > 0
    ? `\nUSER LIFE PROFILE CONTEXT (use this to personalize ALL explanations):\n${lines.join('\n')}\n`
    : '';
}

export function buildBiasInstructions(detectedBiases: Record<string, any>): string {
  if (!detectedBiases || Object.keys(detectedBiases).length === 0) return '';
  const instructions = Object.values(detectedBiases)
    .filter((b: any) => b?.detected && b?.prompt_instruction)
    .map((b: any) => b.prompt_instruction as string)
    .join('\n');
  return instructions ? `\nBEHAVIORAL BIAS INSTRUCTIONS:\n${instructions}\n` : '';
}
