import { RecommendationsService } from './recommendations.service';
export declare class RecommendationsController {
    private readonly recommendationsService;
    constructor(recommendationsService: RecommendationsService);
    generate(user: any, body: {
        risk_override?: number;
        excluded_tickers?: string[];
    }): Promise<any>;
}
