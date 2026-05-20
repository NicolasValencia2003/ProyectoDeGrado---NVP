"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatService = void 0;
const common_1 = require("@nestjs/common");
const sdk_1 = __importDefault(require("@anthropic-ai/sdk"));
const SYSTEM_PROMPT = `Eres FinVise, un asistente educativo de inversiones de la Pontificia Universidad Javeriana Cali.

Tu misión es enseñar conceptos financieros y de inversión de manera clara, completa y accesible. Respondes ÚNICAMENTE en español.

REGLAS:
1. Respondes cualquier pregunta relacionada con finanzas, inversiones, economía, mercados, activos, instrumentos financieros, criptomonedas, bienes raíces, sesgos cognitivos en inversión, regulación financiera, o temas económicos en general.
2. Si te preguntan algo completamente ajeno a finanzas o economía, redirige amablemente hacia temas financieros educativos.
3. Puedes analizar y explicar activos específicos (acciones, ETFs, bonos, criptomonedas, etc.), comparar opciones, explicar su funcionamiento y sus riesgos históricos — siempre con enfoque educativo.
4. NUNCA le digas al usuario exactamente cuánto dinero invertir ni cuándo comprar/vender un activo específico para su situación personal. Eso lo diferencia de asesoramiento financiero regulado.
5. Usa ejemplos concretos, analogías cotidianas y datos reales cuando estén disponibles.
6. Adapta la longitud y profundidad de tu respuesta a la complejidad de la pregunta: preguntas simples merecen respuestas concisas; preguntas complejas merecen explicaciones detalladas con estructura clara (puedes usar listas, secciones, etc.).
7. Cuando sea relevante, menciona el contexto colombiano o latinoamericano (mercados locales, regulación de la Superfinanciera, TES, acciones en la BVC, etc.).
8. Mantén un tono cercano, pedagógico y motivador — el usuario está aprendiendo.

Al final de respuestas sobre activos o estrategias específicas, agrega: "⚠️ Recuerda: esto es material educativo, no asesoramiento financiero regulado."

Puedes responder preguntas sobre: diversificación, riesgo-retorno, horizontes de inversión, valoración de activos, análisis técnico y fundamental (en términos educativos), inflación, tasas de interés, política monetaria, fondos mutuos, ETFs, acciones, bonos, REITs, criptomonedas, commodities, divisas, mercados emergentes, psicología del inversor, historia de los mercados, crisis financieras, y cualquier otro tema de educación financiera.`;
const MOCK_RESPONSES = {
    default: 'Esa es una excelente pregunta sobre inversiones. En FinVise te enseñamos que toda decisión de inversión debe considerar tu horizonte de tiempo, tolerancia al riesgo y objetivos financieros personales. Te recomiendo explorar las recomendaciones personalizadas en tu dashboard para ver ejemplos prácticos adaptados a tu perfil. ⚠️ Recuerda: esto es material educativo, no asesoramiento financiero.',
    diversificacion: 'La diversificación es uno de los principios más importantes en inversión: consiste en distribuir tu capital entre diferentes activos para reducir el riesgo. Imagínalo como no poner todos los huevos en una misma canasta — si un activo cae, los demás pueden compensar. Un portafolio diversificado típicamente incluye acciones, bonos, materias primas y efectivo en proporciones acordes a tu perfil de riesgo. ⚠️ Recuerda: esto es material educativo, no asesoramiento financiero.',
    riesgo: 'En finanzas, el riesgo representa la posibilidad de que un activo tenga un rendimiento diferente al esperado, tanto positivo como negativo. La relación riesgo-retorno nos dice que mayores rendimientos potenciales generalmente vienen acompañados de mayor riesgo. Los activos se clasifican desde muy bajo riesgo (letras del Tesoro) hasta muy alto riesgo (criptomonedas). Tu perfil de riesgo determina qué proporción de cada tipo conviene estudiar. ⚠️ Recuerda: esto es material educativo, no asesoramiento financiero.',
    etf: 'Un ETF (Exchange Traded Fund) es un fondo que cotiza en bolsa y replica el comportamiento de un índice, sector o activo. Por ejemplo, el SPY replica el S&P 500, dándote exposición a las 500 empresas más grandes de EE.UU. con una sola compra. Son populares por su diversificación inmediata, bajos costos de gestión y facilidad de compra/venta. Para un inversionista principiante, son un excelente vehículo educativo para entender los mercados. ⚠️ Recuerda: esto es material educativo, no asesoramiento financiero.',
    bitcoin: 'Bitcoin es una criptomoneda descentralizada creada en 2009 que opera sin banco central ni intermediarios. Desde el punto de vista educativo, es interesante estudiar porque introduce conceptos como blockchain, escasez digital (solo habrá 21 millones de BTC) y activos sin correlación con los mercados tradicionales. Sin embargo, su alta volatilidad — caídas del 50-80% han ocurrido varias veces — lo hace apropiado solo para perfiles con alta tolerancia al riesgo y horizonte largo. ⚠️ Recuerda: esto es material educativo, no asesoramiento financiero.',
};
let ChatService = class ChatService {
    anthropic = null;
    constructor() {
        const apiKey = (process.env.ANTHROPIC_API_KEY ?? '').trim();
        if (apiKey && !apiKey.includes('your-anthropic')) {
            this.anthropic = new sdk_1.default({ apiKey });
        }
    }
    async chat(messages) {
        if (!this.anthropic) {
            return { reply: this.getMockReply(messages[messages.length - 1]?.content ?? '') };
        }
        try {
            const response = await this.anthropic.messages.create({
                model: 'claude-sonnet-4-6',
                max_tokens: 2048,
                system: SYSTEM_PROMPT,
                messages,
            });
            const reply = response.content[0].type === 'text' ? response.content[0].text : '';
            return { reply };
        }
        catch (err) {
            console.error('[ChatService] Claude error:', err.message);
            return { reply: this.getMockReply(messages[messages.length - 1]?.content ?? '') };
        }
    }
    getMockReply(question) {
        const q = question.toLowerCase();
        if (q.includes('diversif'))
            return MOCK_RESPONSES.diversificacion;
        if (q.includes('riesgo') || q.includes('risk'))
            return MOCK_RESPONSES.riesgo;
        if (q.includes('etf') || q.includes('fondo'))
            return MOCK_RESPONSES.etf;
        if (q.includes('bitcoin') || q.includes('cripto'))
            return MOCK_RESPONSES.bitcoin;
        return MOCK_RESPONSES.default;
    }
};
exports.ChatService = ChatService;
exports.ChatService = ChatService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], ChatService);
//# sourceMappingURL=chat.service.js.map