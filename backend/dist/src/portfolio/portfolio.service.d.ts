import { RiskEngineService } from './risk-engine.service';
import { UniverseFilterService } from './universe-filter.service';
export declare class PortfolioService {
    private riskEngine;
    private universeFilter;
    constructor(riskEngine: RiskEngineService, universeFilter: UniverseFilterService);
    buildPortfolio(user: any, pricesMap?: Record<string, any>, sentiment?: any): any[];
    private getBand;
}
