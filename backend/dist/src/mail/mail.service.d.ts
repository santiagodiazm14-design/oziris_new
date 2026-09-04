export declare class MailService {
    private transporter;
    private readonly logger;
    constructor();
    sendPasswordResetEmail(to: string, code: string): Promise<void>;
}
