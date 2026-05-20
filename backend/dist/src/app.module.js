"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const supabase_module_1 = require("./supabase/supabase.module");
const market_module_1 = require("./market/market.module");
const recommendations_module_1 = require("./recommendations/recommendations.module");
const events_module_1 = require("./events/events.module");
const alerts_module_1 = require("./alerts/alerts.module");
const history_module_1 = require("./history/history.module");
const survey_module_1 = require("./survey/survey.module");
const chat_module_1 = require("./chat/chat.module");
const bias_module_1 = require("./bias/bias.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            supabase_module_1.SupabaseModule,
            market_module_1.MarketModule,
            recommendations_module_1.RecommendationsModule,
            events_module_1.EventsModule,
            alerts_module_1.AlertsModule,
            history_module_1.HistoryModule,
            survey_module_1.SurveyModule,
            chat_module_1.ChatModule,
            bias_module_1.BiasModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map