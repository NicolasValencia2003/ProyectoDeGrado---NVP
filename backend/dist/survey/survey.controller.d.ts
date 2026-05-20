import { SurveyService } from './survey.service';
export declare class SurveyController {
    private readonly surveyService;
    constructor(surveyService: SurveyService);
    save(user: any, body: any): Promise<{
        ok: boolean;
    }>;
    get(user: any, type: string): Promise<any>;
    comparison(user: any): Promise<{
        pre: any;
        post: any;
    }>;
}
