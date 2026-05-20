"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlertsService = void 0;
const common_1 = require("@nestjs/common");
const mock_data_1 = require("../mock/mock-data");
let AlertsService = class AlertsService {
    alerts = JSON.parse(JSON.stringify(mock_data_1.MOCK_ALERTS));
    getAll() { return this.alerts; }
    markRead(id, userId) {
        const alert = this.alerts.find((a) => a.id === id);
        if (alert && !alert.read_by.includes(userId)) {
            alert.read_by.push(userId);
        }
        return alert;
    }
};
exports.AlertsService = AlertsService;
exports.AlertsService = AlertsService = __decorate([
    (0, common_1.Injectable)()
], AlertsService);
//# sourceMappingURL=alerts.service.js.map