import { PrismaService } from '../prisma/prisma.service';
import { TracksService } from '../tracks/tracks.service';
import { Response } from 'express';
export declare class SimulatedPurchaseDto {
    trackId?: string;
    trackIds?: string[];
    paymentMethod?: string;
    licenseType?: string;
    amount?: number;
    payerName?: string;
    payerEmail?: string;
    payerPhone?: string;
    payerDocument?: string;
    bankName?: string;
    personType?: string;
    cardHolder?: string;
    cardLastFour?: string;
    phoneNumber?: string;
    metadata?: any;
}
export declare class PurchasesService {
    private readonly prisma;
    private readonly tracksService;
    private inMemoryPurchases;
    private inMemorySimulations;
    private inMemoryDownloads;
    constructor(prisma: PrismaService, tracksService: TracksService);
    simulatePayment(userId: string, userRole: string, dto: SimulatedPurchaseDto): Promise<{
        success: boolean;
        message: string;
        transactionId: string;
        paymentMethod: string;
        licenseType: string;
        purchasedAt: string;
        purchases: any[];
    }>;
    getUserPurchases(userId: string): Promise<any[]>;
    checkPurchaseStatus(userId: string, trackId: string): Promise<{
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
    handleDownload(userId: string, userRole: string, trackId: string, res: Response, meta?: {
        ipAddress?: string;
        userAgent?: string;
    }): Promise<void | Response<any, Record<string, any>>>;
}
