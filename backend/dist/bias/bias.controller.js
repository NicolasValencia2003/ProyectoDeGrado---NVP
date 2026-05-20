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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BiasController = void 0;
const common_1 = require("@nestjs/common");
const mock_auth_guard_1 = require("../common/mock-auth.guard");
const bias_detection_service_1 = require("./bias-detection.service");
let BiasController = class BiasController {
    biasService;
    constructor(biasService) {
        this.biasService = biasService;
    }
    async getAnalysis(req) {
        return this.biasService.analyzeUser(req.user?.id, req.user);
    }
};
exports.BiasController = BiasController;
__decorate([
    (0, common_1.Get)('analysis'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BiasController.prototype, "getAnalysis", null);
exports.BiasController = BiasController = __decorate([
    (0, common_1.Controller)('bias'),
    (0, common_1.UseGuards)(mock_auth_guard_1.MockAuthGuard),
    __metadata("design:paramtypes", [bias_detection_service_1.BiasDetectionService])
], BiasController);
//# sourceMappingURL=bias.controller.js.map