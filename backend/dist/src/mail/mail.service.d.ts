export declare class MailService {
    private readonly logger;
    private getTransporter;
    sendPasswordResetEmail(to: string, code: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
