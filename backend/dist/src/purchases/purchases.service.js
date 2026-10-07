"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PurchasesService = exports.SimulatedPurchaseDto = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const tracks_service_1 = require("../tracks/tracks.service");
const path_1 = require("path");
const fs_1 = require("fs");
class SimulatedPurchaseDto {
    trackId;
    trackIds;
    paymentMethod;
    licenseType;
    amount;
    payerName;
    payerEmail;
    payerPhone;
    payerDocument;
    bankName;
    personType;
    cardHolder;
    cardLastFour;
    phoneNumber;
    metadata;
}
exports.SimulatedPurchaseDto = SimulatedPurchaseDto;
let PurchasesService = class PurchasesService {
    prisma;
    tracksService;
    inMemoryPurchases = [];
    inMemorySimulations = [];
    inMemoryDownloads = [];
    constructor(prisma, tracksService) {
        this.prisma = prisma;
        this.tracksService = tracksService;
    }
    async simulatePayment(userId, userRole, dto) {
        const trackIdsToProcess = dto.trackIds && dto.trackIds.length > 0
            ? dto.trackIds
            : dto.trackId
                ? [dto.trackId]
                : [];
        if (trackIdsToProcess.length === 0) {
            throw new common_1.BadRequestException('Debes proporcionar al menos un Beat (trackId o trackIds).');
        }
        const paymentMethod = dto.paymentMethod || 'PSE';
        const licenseType = dto.licenseType || 'ESTÁNDAR COMERCIAL (MP3 HQ)';
        const transactionId = `OZ-SIM-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
        const completedPurchases = [];
        for (const trackId of trackIdsToProcess) {
            let track = null;
            try {
                track = await this.tracksService.findOne(trackId);
            }
            catch (err) {
                throw new common_1.NotFoundException(`El beat con ID ${trackId} no fue encontrado.`);
            }
            const amount = dto.amount || track.price || 29.99;
            try {
                const existing = await this.prisma.purchase.findFirst({
                    where: {
                        userId,
                        trackId,
                        status: 'COMPLETED',
                    },
                });
                if (existing) {
                    completedPurchases.push({
                        id: existing.id,
                        trackId,
                        trackTitle: track.title,
                        amount: existing.amount,
                        status: existing.status,
                        paymentMethod: existing.paymentMethod || paymentMethod,
                        licenseType: existing.licenseType || licenseType,
                        transactionId: existing.transactionId || transactionId,
                        createdAt: existing.createdAt,
                        downloadUrl: `/purchases/download/${trackId}`,
                        alreadyOwned: true,
                    });
                    continue;
                }
                const created = await this.prisma.purchase.create({
                    data: {
                        userId,
                        trackId,
                        amount,
                        status: 'COMPLETED',
                        paymentMethod,
                        licenseType,
                        transactionId,
                        payerName: dto.payerName || null,
                        payerEmail: dto.payerEmail || null,
                        payerPhone: dto.payerPhone || null,
                        payerDocument: dto.payerDocument || null,
                        paymentProvider: dto.bankName || (paymentMethod === 'Tarjeta' ? 'Tarjeta de Crédito/Débito' : paymentMethod),
                        simulation: {
                            create: {
                                transactionId: `${transactionId}-${trackId.substring(0, 6)}`,
                                method: paymentMethod,
                                amount,
                                currency: 'USD',
                                status: 'APPROVED',
                                payerName: dto.payerName || null,
                                payerEmail: dto.payerEmail || null,
                                payerPhone: dto.payerPhone || null,
                                payerDocument: dto.payerDocument || null,
                                bankName: dto.bankName || null,
                                personType: dto.personType || null,
                                cardHolder: dto.cardHolder || null,
                                cardLastFour: dto.cardLastFour || null,
                                phoneNumber: dto.phoneNumber || null,
                                metadata: dto.metadata ? dto.metadata : undefined,
                                userId,
                            },
                        },
                    },
                    include: {
                        track: true,
                        simulation: true,
                    },
                });
                completedPurchases.push({
                    id: created.id,
                    trackId: created.trackId,
                    trackTitle: track.title,
                    amount: created.amount,
                    status: created.status,
                    paymentMethod: created.paymentMethod,
                    licenseType: created.licenseType,
                    transactionId: created.transactionId,
                    createdAt: created.createdAt,
                    downloadUrl: `/purchases/download/${trackId}`,
                    alreadyOwned: false,
                });
            }
            catch (dbError) {
                console.error('Error guardando en PostgreSQL (fallback en memoria):', dbError);
                const fallbackPurchase = {
                    id: `sim-purch-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
                    userId,
                    trackId,
                    trackTitle: track.title,
                    amount,
                    status: 'COMPLETED',
                    paymentMethod,
                    licenseType,
                    transactionId,
                    createdAt: new Date().toISOString(),
                    downloadUrl: `/purchases/download/${trackId}`,
                    alreadyOwned: false,
                };
                this.inMemoryPurchases.push(fallbackPurchase);
                completedPurchases.push(fallbackPurchase);
            }
        }
        return {
            success: true,
            message: '¡Pago simulado con éxito! Tu licencia ha sido generada y el beat está disponible para descarga.',
            transactionId,
            paymentMethod,
            licenseType,
            purchasedAt: new Date().toISOString(),
            purchases: completedPurchases,
        };
    }
    async getUserPurchases(userId) {
        try {
            const dbPurchases = await this.prisma.purchase.findMany({
                where: {
                    userId,
                    status: 'COMPLETED',
                },
                include: {
                    track: {
                        include: {
                            producer: {
                                select: {
                                    id: true,
                                    name: true,
                                    email: true,
                                    artistName: true,
                                    avatarUrl: true,
                                },
                            },
                        },
                    },
                    simulation: true,
                },
                orderBy: {
                    createdAt: 'desc',
                },
            });
            if (dbPurchases && dbPurchases.length > 0) {
                return dbPurchases.map((p) => ({
                    id: p.id,
                    trackId: p.trackId,
                    amount: p.amount,
                    status: p.status,
                    paymentMethod: p.paymentMethod || 'PSE',
                    licenseType: p.licenseType || 'ESTÁNDAR COMERCIAL',
                    transactionId: p.transactionId,
                    downloadCount: p.downloadCount,
                    lastDownloadedAt: p.lastDownloadedAt,
                    payerName: p.payerName,
                    payerEmail: p.payerEmail,
                    paymentProvider: p.paymentProvider,
                    createdAt: p.createdAt,
                    track: p.track,
                    downloadUrl: `/purchases/download/${p.trackId}`,
                }));
            }
        }
        catch (err) {
            console.error('Error consultando compras en DB (usando in-memory fallback):', err);
        }
        const userMemoryPurchases = this.inMemoryPurchases.filter((p) => p.userId === userId);
        const result = [];
        for (const p of userMemoryPurchases) {
            try {
                const track = await this.tracksService.findOne(p.trackId);
                result.push({
                    ...p,
                    trackId: p.trackId,
                    track,
                });
            }
            catch {
                result.push(p);
            }
        }
        return result;
    }
    async checkPurchaseStatus(userId, trackId) {
        try {
            const purchase = await this.prisma.purchase.findFirst({
                where: {
                    userId,
                    trackId,
                    status: 'COMPLETED',
                },
            });
            if (purchase) {
                return {
                    purchased: true,
                    purchaseId: purchase.id,
                    transactionId: purchase.transactionId,
                    paymentMethod: purchase.paymentMethod,
                    licenseType: purchase.licenseType,
                    purchasedAt: purchase.createdAt,
                    downloadCount: purchase.downloadCount,
                    lastDownloadedAt: purchase.lastDownloadedAt,
                    downloadUrl: `/purchases/download/${trackId}`,
                };
            }
        }
        catch (err) {
        }
        const inMem = this.inMemoryPurchases.find((p) => p.userId === userId && p.trackId === trackId && p.status === 'COMPLETED');
        if (inMem) {
            return {
                purchased: true,
                purchaseId: inMem.id,
                transactionId: inMem.transactionId,
                paymentMethod: inMem.paymentMethod,
                licenseType: inMem.licenseType,
                purchasedAt: inMem.createdAt,
                downloadCount: inMem.downloadCount || 0,
                lastDownloadedAt: inMem.lastDownloadedAt || null,
                downloadUrl: `/purchases/download/${trackId}`,
            };
        }
        return {
            purchased: false,
        };
    }
    async handleDownload(userId, userRole, trackId, res, meta) {
        let track = null;
        try {
            track = await this.tracksService.findOne(trackId);
        }
        catch {
            throw new common_1.NotFoundException(`El Beat con ID ${trackId} no existe.`);
        }
        if (!track) {
            throw new common_1.NotFoundException(`El Beat con ID ${trackId} no existe.`);
        }
        const isProducer = track.producerId === userId;
        const isAdmin = userRole === 'ADMIN';
        const purchaseStatus = await this.checkPurchaseStatus(userId, trackId);
        if (!purchaseStatus.purchased && !isProducer && !isAdmin) {
            throw new common_1.ForbiddenException('Acceso denegado. Debes simular el pago y adquirir la licencia del Beat antes de poder descargarlo.');
        }
        try {
            await this.prisma.downloadLog.create({
                data: {
                    userId,
                    trackId,
                    purchaseId: purchaseStatus.purchaseId || null,
                    ipAddress: meta?.ipAddress || null,
                    userAgent: meta?.userAgent || null,
                    fileFormat: 'MP3',
                },
            });
            if (purchaseStatus.purchaseId) {
                await this.prisma.purchase.update({
                    where: { id: purchaseStatus.purchaseId },
                    data: {
                        downloadCount: { increment: 1 },
                        lastDownloadedAt: new Date(),
                    },
                });
            }
            await this.prisma.track.update({
                where: { id: trackId },
                data: {
                    downloadsCount: { increment: 1 },
                },
            });
        }
        catch (logError) {
            console.warn('Advertencia al registrar log de descarga en DB:', logError?.message || logError);
            this.inMemoryDownloads.push({
                userId,
                trackId,
                purchaseId: purchaseStatus.purchaseId,
                downloadedAt: new Date().toISOString(),
            });
        }
        const rawAudioUrl = track.fullAudioUrl || track.audioUrl;
        if (!rawAudioUrl) {
            throw new common_1.NotFoundException('Este beat no tiene un archivo de audio disponible para descarga.');
        }
        const safeTitle = (track.title || 'beat')
            .replace(/[^a-zA-Z0-9_-]/g, '_')
            .toLowerCase();
        const downloadFilename = `OZIRIS_${safeTitle}_HQ.mp3`;
        let localRelativePath = null;
        if (rawAudioUrl.startsWith('/uploads/') || rawAudioUrl.startsWith('uploads/')) {
            localRelativePath = rawAudioUrl.startsWith('/') ? rawAudioUrl.slice(1) : rawAudioUrl;
        }
        else if (rawAudioUrl.includes('/uploads/')) {
            const parts = rawAudioUrl.split('/uploads/');
            if (parts[1]) {
                localRelativePath = `uploads/${parts[1]}`;
            }
        }
        if (localRelativePath) {
            const candidates = [
                (0, path_1.join)(process.cwd(), localRelativePath),
                (0, path_1.join)(process.cwd(), 'backend', localRelativePath),
                (0, path_1.join)(__dirname, '..', '..', localRelativePath),
            ];
            for (const p of candidates) {
                if ((0, fs_1.existsSync)(p)) {
                    res.setHeader('Content-Disposition', `attachment; filename="${downloadFilename}"`);
                    res.setHeader('Content-Type', 'audio/mpeg');
                    res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');
                    const fileStream = (0, fs_1.createReadStream)(p);
                    return fileStream.pipe(res);
                }
            }
        }
        if (rawAudioUrl.startsWith('http://') || rawAudioUrl.startsWith('https://')) {
            try {
                const remoteRes = await fetch(rawAudioUrl);
                if (!remoteRes.ok) {
                    throw new Error(`Remote audio returned status ${remoteRes.status}`);
                }
                const arrayBuffer = await remoteRes.arrayBuffer();
                const buffer = Buffer.from(arrayBuffer);
                res.setHeader('Content-Disposition', `attachment; filename="${downloadFilename}"`);
                res.setHeader('Content-Type', remoteRes.headers.get('content-type') || 'audio/mpeg');
                res.setHeader('Content-Length', buffer.length);
                res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');
                return res.end(buffer);
            }
            catch (proxyError) {
                console.error('Error al hacer proxy/streaming del audio remoto:', proxyError);
                return res.redirect(rawAudioUrl);
            }
        }
        throw new common_1.NotFoundException('No se pudo localizar el archivo físico de audio del beat.');
    }
};
exports.PurchasesService = PurchasesService;
exports.PurchasesService = PurchasesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        tracks_service_1.TracksService])
], PurchasesService);
//# sourceMappingURL=purchases.service.js.map