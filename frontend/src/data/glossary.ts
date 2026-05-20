export interface GlossaryTerm {
  term: string;
  category: 'renta_variable' | 'renta_fija' | 'alternativos' | 'conceptos' | 'sesgos' | 'indicadores';
  definition: string;
  example: string;
  related: string[];
}

export const CATEGORIES: Record<GlossaryTerm['category'], { label: string; color: string }> = {
  renta_variable: { label: 'Renta Variable',    color: '#3b82f6' },
  renta_fija:     { label: 'Renta Fija',        color: '#8b5cf6' },
  alternativos:   { label: 'Activos Alternativos', color: '#f59e0b' },
  conceptos:      { label: 'Conceptos Clave',   color: '#10b981' },
  sesgos:         { label: 'Sesgos Cognitivos', color: '#ef4444' },
  indicadores:    { label: 'Indicadores',        color: '#6b7280' },
};

export const GLOSSARY: GlossaryTerm[] = [
  // Renta Variable
  {
    term: 'Acción',
    category: 'renta_variable',
    definition: 'Título que representa una fracción de la propiedad de una empresa. Al comprar una acción, te conviertes en socio parcial de esa compañía y participas en sus ganancias y pérdidas.',
    example: 'Comprar 1 acción de Apple (AAPL) te da derecho a una fracción de las ganancias de Apple proporcional a tu participación.',
    related: ['Dividendo', 'ETF', 'Capitalización de mercado'],
  },
  {
    term: 'ETF',
    category: 'renta_variable',
    definition: 'Fondo cotizado en bolsa (Exchange Traded Fund) que agrupa múltiples activos y se negocia como una acción. Permite diversificación instantánea con una sola compra.',
    example: 'El SPY es un ETF que replica el S&P 500: al comprarlo obtienes exposición a las 500 empresas más grandes de EE.UU.',
    related: ['Acción', 'Diversificación', 'Índice bursátil'],
  },
  {
    term: 'Dividendo',
    category: 'renta_variable',
    definition: 'Parte de las ganancias que una empresa distribuye periódicamente entre sus accionistas. Es una forma de retorno sin necesidad de vender la acción.',
    example: 'Si una empresa paga $2 de dividendo anual y tienes 10 acciones, recibirás $20 al año solo por ser propietario.',
    related: ['Acción', 'Rentabilidad por dividendo', 'REIT'],
  },
  {
    term: 'Capitalización de mercado',
    category: 'renta_variable',
    definition: 'Valor total de mercado de una empresa, calculado multiplicando el precio de la acción por el número de acciones en circulación.',
    example: 'Si Apple tiene 15.000 millones de acciones a $189 cada una, su capitalización de mercado es ~$2,8 billones de dólares.',
    related: ['Acción', 'Índice bursátil'],
  },
  {
    term: 'REIT',
    category: 'renta_variable',
    definition: 'Fideicomiso de inversión en bienes raíces (Real Estate Investment Trust). Permite invertir en propiedades inmobiliarias sin comprar un inmueble directamente, y están obligados a distribuir el 90% de sus ingresos.',
    example: 'El VNQ es un ETF de REITs que da exposición a cientos de propiedades comerciales e industriales en EE.UU.',
    related: ['Dividendo', 'Diversificación', 'Bienes raíces'],
  },
  {
    term: 'S&P 500',
    category: 'renta_variable',
    definition: 'Índice bursátil que agrupa las 500 empresas de mayor capitalización listadas en bolsas estadounidenses. Es el referente más seguido del desempeño del mercado de acciones de EE.UU.',
    example: 'Cuando los noticieros dicen "la bolsa subió 1% hoy", generalmente se refieren al desempeño del S&P 500.',
    related: ['ETF', 'Índice bursátil', 'SPY'],
  },
  // Renta Fija
  {
    term: 'Bono',
    category: 'renta_fija',
    definition: 'Instrumento de deuda emitido por gobiernos o empresas para financiarse. El comprador presta dinero y recibe pagos de interés (cupón) periódicos más la devolución del capital al vencimiento.',
    example: 'Un bono del Tesoro de EE.UU. a 10 años al 4,5% paga $45 anuales por cada $1.000 prestados durante 10 años.',
    related: ['Cupón', 'Rendimiento', 'Riesgo de duración'],
  },
  {
    term: 'Cupón',
    category: 'renta_fija',
    definition: 'Pago de intereses periódico que recibe el tenedor de un bono. Se expresa como porcentaje del valor nominal del bono.',
    example: 'Un bono con cupón del 5% y valor nominal de $1.000 paga $50 anuales, generalmente en cuotas semestrales de $25.',
    related: ['Bono', 'Rendimiento', 'Renta fija'],
  },
  {
    term: 'Rendimiento al vencimiento',
    category: 'renta_fija',
    definition: 'Tasa de retorno total de un bono si se mantiene hasta su fecha de vencimiento, considerando el precio actual, cupones y valor nominal.',
    example: 'Si compras un bono a $950 con valor nominal $1.000 y cupón 5%, tu rendimiento al vencimiento será mayor al 5% porque obtienes ganancia de capital adicional.',
    related: ['Bono', 'Cupón', 'Precio del bono'],
  },
  {
    term: 'Riesgo de duración',
    category: 'renta_fija',
    definition: 'Sensibilidad del precio de un bono a cambios en las tasas de interés. Los bonos de mayor plazo tienen mayor duración y por tanto reaccionan más fuertemente a cambios en tasas.',
    example: 'Si las tasas suben 1%, un bono a 30 años puede caer ~15% en precio, mientras uno a 2 años cae ~2%.',
    related: ['Bono', 'Tasas de interés', 'TLT'],
  },
  {
    term: 'Letra del Tesoro',
    category: 'renta_fija',
    definition: 'Deuda de corto plazo emitida por el gobierno de EE.UU. con vencimientos de 4, 8, 13, 26 o 52 semanas. Consideradas las inversiones más seguras del mundo.',
    example: 'El SGOV es un ETF de letras del Tesoro a 3 meses que ofrece rendimientos cercanos a la tasa de la Fed con riesgo mínimo.',
    related: ['Bono', 'Tasa libre de riesgo', 'Liquidez'],
  },
  // Alternativos
  {
    term: 'Bitcoin',
    category: 'alternativos',
    definition: 'Primera criptomoneda descentralizada, creada en 2009. Opera sin banco central, tiene un límite de 21 millones de unidades y usa tecnología blockchain para registrar transacciones.',
    example: 'A diferencia del peso colombiano, ningún gobierno puede crear más Bitcoin. Su escasez digital es una de sus propiedades más estudiadas.',
    related: ['Criptomoneda', 'Blockchain', 'Volatilidad'],
  },
  {
    term: 'Oro como activo',
    category: 'alternativos',
    definition: 'Metales preciosos usados históricamente como reserva de valor y cobertura contra inflación. El GLD es el ETF más grande que replica el precio del oro físico.',
    example: 'En períodos de alta inflación o crisis geopolítica, el oro tiende a subir de precio porque se percibe como refugio seguro de valor.',
    related: ['ETF', 'Cobertura', 'Inflación'],
  },
  {
    term: 'Blockchain',
    category: 'alternativos',
    definition: 'Tecnología de registro distribuido e inmutable que sustenta las criptomonedas. Es una cadena de bloques de transacciones verificadas por una red descentralizada de computadores.',
    example: 'Cada transacción de Bitcoin queda registrada permanentemente en la blockchain, visible para cualquier persona en el mundo.',
    related: ['Bitcoin', 'Criptomoneda', 'Descentralización'],
  },
  {
    term: 'Materia prima',
    category: 'alternativos',
    definition: 'Bienes físicos básicos (oro, petróleo, cobre, maíz) que se negocian en mercados especializados. Su precio depende de oferta y demanda global.',
    example: 'El petróleo es una materia prima: si hay tensiones en el Medio Oriente, su precio puede subir rápidamente afectando a toda la economía.',
    related: ['Oro', 'Diversificación', 'Cobertura'],
  },
  // Conceptos Clave
  {
    term: 'Diversificación',
    category: 'conceptos',
    definition: 'Estrategia de distribuir inversiones entre diferentes activos para reducir el riesgo total. Si un activo cae, otros pueden compensar. Es el único "almuerzo gratis" en finanzas según Harry Markowitz.',
    example: 'Un portafolio con 50% acciones, 30% bonos y 20% oro está más diversificado que uno 100% en acciones tecnológicas.',
    related: ['Riesgo', 'Correlación', 'Portafolio'],
  },
  {
    term: 'Riesgo-Retorno',
    category: 'conceptos',
    definition: 'Principio fundamental que establece que mayores retornos potenciales generalmente requieren asumir mayor riesgo. No existe retorno alto garantizado sin riesgo proporcional.',
    example: 'Las letras del Tesoro rinden ~5% con riesgo mínimo, mientras Bitcoin puede subir 300% o caer 70% en el mismo período.',
    related: ['Volatilidad', 'Diversificación', 'Perfil de riesgo'],
  },
  {
    term: 'Horizonte de inversión',
    category: 'conceptos',
    definition: 'Período de tiempo durante el cual planeas mantener una inversión antes de necesitar el dinero. Determina qué nivel de riesgo y qué tipos de activos son apropiados.',
    example: 'Con horizonte de 20 años, las caídas temporales del mercado importan menos. Con horizonte de 1 año, conviene menos volatilidad.',
    related: ['Perfil de riesgo', 'Liquidez', 'Portafolio'],
  },
  {
    term: 'Inflación',
    category: 'conceptos',
    definition: 'Aumento sostenido del nivel general de precios que reduce el poder adquisitivo del dinero. Un peso hoy comprará menos bienes en el futuro si hay inflación.',
    example: 'Si la inflación es 6% anual y tu cuenta de ahorros rinde 3%, estás perdiendo poder adquisitivo en términos reales.',
    related: ['Tasa de interés', 'Bonos', 'Oro'],
  },
  {
    term: 'Liquidez',
    category: 'conceptos',
    definition: 'Facilidad con que un activo puede convertirse en efectivo sin pérdida significativa de valor. Las acciones de grandes empresas son muy líquidas; una casa es poco líquida.',
    example: 'Vender acciones de Apple tarda segundos. Vender un apartamento puede tomar meses y requiere negociación de precio.',
    related: ['Riesgo', 'Activo', 'Mercado'],
  },
  {
    term: 'Portafolio',
    category: 'conceptos',
    definition: 'Conjunto total de inversiones de una persona o entidad. Un portafolio bien construido combina activos con diferentes perfiles de riesgo-retorno para alcanzar objetivos financieros.',
    example: 'Tu portafolio educativo en FinVise muestra cómo se vería una distribución de activos adaptada a tu perfil de riesgo y contexto de vida.',
    related: ['Diversificación', 'Asignación de activos', 'Perfil de riesgo'],
  },
  {
    term: 'Tasa de interés',
    category: 'conceptos',
    definition: 'Precio del dinero en el tiempo. La tasa de la Reserva Federal (Fed) de EE.UU. influye en todos los mercados financieros globales al afectar el costo del crédito.',
    example: 'Cuando la Fed sube tasas, los bonos caen de precio pero generan más interés. Las acciones suelen sentir presión porque el costo de capital sube.',
    related: ['Bono', 'Inflación', 'Riesgo de duración'],
  },
  {
    term: 'Correlación',
    category: 'conceptos',
    definition: 'Medida estadística (de -1 a +1) que indica cómo se mueven dos activos en relación entre sí. Activos con baja o negativa correlación mejoran la diversificación del portafolio.',
    example: 'El oro y el S&P 500 tienen correlación negativa: cuando las acciones caen fuertemente, el oro suele subir. Esto hace al oro un buen diversificador.',
    related: ['Diversificación', 'Volatilidad', 'Riesgo'],
  },
  // Sesgos
  {
    term: 'Sesgo de recencia',
    category: 'sesgos',
    definition: 'Tendencia cognitiva a darle mayor peso a eventos recientes al tomar decisiones, ignorando el historial más largo. En inversiones, hace que compremos tras subidas y vendamos tras caídas.',
    example: 'Después de que Bitcoin sube 200%, muchos sienten que "siempre sube" y compran en máximos. Después de una caída del 50%, sienten que "seguirá cayendo" y venden en mínimos.',
    related: ['Sesgo de familiaridad', 'Aversión a la pérdida', 'Comportamiento inversor'],
  },
  {
    term: 'Aversión a la pérdida',
    category: 'sesgos',
    definition: 'Sesgo descrito por Kahneman y Tversky: el dolor de perder $100 es psicológicamente casi el doble que el placer de ganar $100. Lleva a decisiones irracionales en momentos de caída.',
    example: 'Un inversionista que vende en pánico durante una caída del 20% para "evitar más pérdidas" cristaliza la pérdida y se pierde la recuperación posterior.',
    related: ['Sesgo de recencia', 'Efecto de disposición', 'Finanzas conductuales'],
  },
  {
    term: 'Efecto de disposición',
    category: 'sesgos',
    definition: 'Tendencia a vender activos ganadores demasiado pronto (para "asegurar ganancias") y mantener activos perdedores demasiado tiempo (esperando recuperación).',
    example: 'Vender NVDA después de una subida del 30% "antes de que baje", mientras mantienes una acción en -40% "porque va a rebotar", es el efecto de disposición clásico.',
    related: ['Aversión a la pérdida', 'Sesgo de recencia', 'Psicología del inversor'],
  },
  {
    term: 'Sesgo de familiaridad',
    category: 'sesgos',
    definition: 'Preferir invertir en activos conocidos (empresa local, marca reconocida) por ser familiares, no por sus fundamentos financieros. Puede llevar a concentración excesiva y bajo rendimiento.',
    example: 'Invertir todo en acciones de la empresa donde trabajas porque "la conoces bien" concentra riesgo laboral y financiero en el mismo lugar.',
    related: ['Diversificación', 'Sesgo de recencia', 'Finanzas conductuales'],
  },
  // Indicadores
  {
    term: 'Índice Miedo/Codicia',
    category: 'indicadores',
    definition: 'Indicador de sentimiento del mercado (0-100) que mide si los inversores están impulsados por el miedo (mercado infravalorado potencialmente) o la codicia (mercado sobrevalorado potencialmente).',
    example: 'Un índice de 20 (miedo extremo) sugiere que muchos están vendiendo en pánico. Históricamente, comprar en estos momentos ha sido rentable a largo plazo.',
    related: ['Volatilidad', 'VIX', 'Sentimiento de mercado'],
  },
  {
    term: 'VIX',
    category: 'indicadores',
    definition: 'Índice de volatilidad implícita del S&P 500, conocido como "índice del miedo". Mide la volatilidad esperada del mercado en los próximos 30 días.',
    example: 'Cuando el VIX supera 30, indica que el mercado espera grandes movimientos. Durante la crisis de 2020 llegó a 85, el más alto en décadas.',
    related: ['Volatilidad', 'Índice Miedo/Codicia', 'Opciones'],
  },
  {
    term: 'Rendimiento del Tesoro 10 años',
    category: 'indicadores',
    definition: 'Tasa de interés que paga el bono del gobierno de EE.UU. a 10 años. Es el indicador de referencia para tasas de largo plazo y afecta valuaciones de acciones, hipotecas y otros activos.',
    example: 'Cuando el rendimiento a 10 años sube del 3% al 5%, las acciones de alto crecimiento tienden a caer porque el dinero "libre de riesgo" se vuelve más atractivo.',
    related: ['Bono', 'Tasa de interés', 'Fed'],
  },
  {
    term: 'Volatilidad',
    category: 'indicadores',
    definition: 'Medida de la variación del precio de un activo en el tiempo. Mayor volatilidad significa mayores oscilaciones de precio, tanto al alza como a la baja.',
    example: 'Bitcoin tiene volatilidad anualizada ~80%, el S&P 500 ~15% y las letras del Tesoro ~1%. A mayor volatilidad, mayor incertidumbre y potencial de ganancia/pérdida.',
    related: ['Riesgo', 'VIX', 'Desviación estándar'],
  },
  {
    term: 'P/E (Precio/Ganancia)',
    category: 'indicadores',
    definition: 'Relación entre el precio de una acción y las ganancias por acción de la empresa. Indica cuánto pagan los inversores por cada peso de ganancia. Un P/E alto sugiere expectativas de alto crecimiento futuro.',
    example: 'Si NVIDIA tiene P/E de 50, los inversores pagan $50 por cada $1 de ganancia actual, apostando a que crecerá mucho más.',
    related: ['Valuación', 'Acción', 'Crecimiento'],
  },
];
