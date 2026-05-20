"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BanditModule = void 0;
const common_1 = require("@nestjs/common");
const bandit_service_1 = require("./bandit.service");
const bandit_controller_1 = require("./bandit.controller");
const supabase_module_1 = require("../supabase/supabase.module");
let BanditModule = class BanditModule {
};
exports.BanditModule = BanditModule;
exports.BanditModule = BanditModule = __decorate([
    (0, common_1.Module)({
        imports: [supabase_module_1.SupabaseModule],
        controllers: [bandit_controller_1.BanditController],
        providers: [bandit_service_1.BanditService],
        exports: [bandit_service_1.BanditService],
    })
], BanditModule);
//# sourceMappingURL=bandit.module.js.map