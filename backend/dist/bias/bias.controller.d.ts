import { BiasDetectionService } from './bias-detection.service';
export declare class BiasController {
    private biasService;
    constructor(biasService: BiasDetectionService);
    getAnalysis(req: any): Promise<any>;
}
