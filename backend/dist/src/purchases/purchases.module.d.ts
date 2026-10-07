import { PurchasesService, SimulatedPurchaseDto } from './purchases.service';
export declare class PaymentsController {
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
}
export declare class PurchasesModule {
}
