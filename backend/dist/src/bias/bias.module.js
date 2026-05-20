"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BiasModule = void 0;
const common_1 = require("@nestjs/common");
const bias_controller_1 = require("./bias.controller");
const bias_detection_service_1 = require("./bias-detection.service");
const mock_auth_guard_1 = require("../common/mock-auth.guard");
let BiasModule = class BiasModule {
};
exports.BiasModule = BiasModule;
exports.BiasModule = BiasModule = __decorate([
    (0, common_1.Module)({
        controllers: [bias_controller_1.BiasController],
        providers: [bias_detection_service_1.BiasDetectionService, mock_auth_guard_1.MockAuthGuard],
        exports: [bias_detection_service_1.BiasDetectionService],
    })
], BiasModule);
//# sourceMappingURL=bias.module.js.map