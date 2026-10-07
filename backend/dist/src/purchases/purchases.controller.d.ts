import { PurchasesService, SimulatedPurchaseDto } from './purchases.service';
export declare class PurchasesController {
    private readonly purchasesService;
    constructor(purchasesService: PurchasesService);
    simulatePayment(req: any, dto: SimulatedPurchaseDto): Promise<{
        success: boolean;
        message: string;
        transactionId: string;
        paymentMethod: string;
        licenseType: string;
        purchasedAt: string;
        purchases: any[];
    }>;
    getMyPurchases(req: any): Promise<any[]>;
    checkStatus(req: any, trackId: string): Promise<{
        purchased: boolean;
        purchaseId: any;
        transactionId: any;
        paymentMethod: any;
        licenseType: any;
        purchasedAt: any;
        downloadCount: any;
        lastDownloadedAt: any;
        downloadUrl: string;
    } | {
        purchased: boolean;
        purchaseId?: undefined;
        transactionId?: undefined;
        paymentMethod?: undefined;
        licenseType?: undefined;
        purchasedAt?: undefined;
        downloadCount?: undefined;
        lastDownloadedAt?: undefined;
        downloadUrl?: undefined;
    }>;
    downloadBeat(req: any, trackId: string, res: any): Promise<void | import("express").Response<any, Record<string, any>>>;
}
