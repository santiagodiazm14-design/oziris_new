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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TracksController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const path_1 = require("path");
const tracks_service_1 = require("./tracks.service");
let TracksController = class TracksController {
    tracksService;
    constructor(tracksService) {
        this.tracksService = tracksService;
    }
    async findAll(genre) {
        return this.tracksService.findAll(genre);
    }
    async findOne(id) {
        return this.tracksService.findOne(id);
    }
    async create(body, files) {
        const uploadedAudio = files?.audioFile?.[0] || files?.audio?.[0];
        const uploadedCover = files?.coverImage?.[0] || files?.cover?.[0];
        const audioUrl = uploadedAudio
            ? `/uploads/${uploadedAudio.filename}`
            : body?.audioUrl || '';
        const coverUrl = uploadedCover
            ? `/uploads/${uploadedCover.filename}`
            : body?.coverUrl || '';
        const tagsArray = typeof body?.tags === 'string'
            ? body.tags.split(',').map((t) => t.trim()).filter(Boolean)
            : body?.tags || [];
        return this.tracksService.create({
            title: body?.title,
            description: body?.description,
            price: body?.price ? parseFloat(body.price) : 29.99,
            genre: body?.genre,
            bpm: body?.bpm ? parseInt(body.bpm) : 120,
            key: body?.key,
            tags: tagsArray,
            audioUrl,
            fullAudioUrl: audioUrl,
            coverUrl,
        });
    }
    async remove(id) {
        return this.tracksService.remove(id);
    }
};
exports.TracksController = TracksController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('genre')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TracksController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TracksController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileFieldsInterceptor)([
        { name: 'audio', maxCount: 1 },
        { name: 'audioFile', maxCount: 1 },
        { name: 'cover', maxCount: 1 },
        { name: 'coverImage', maxCount: 1 },
    ], {
        storage: (0, multer_1.diskStorage)({
            destination: './uploads',
            filename: (req, file, cb) => {
                const randomName = Array(16)
                    .fill(null)
                    .map(() => Math.round(Math.random() * 16).toString(16))
                    .join('');
                cb(null, `${randomName}${(0, path_1.extname)(file.originalname)}`);
            },
        }),
    })),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.UploadedFiles)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], TracksController.prototype, "create", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TracksController.prototype, "remove", null);
exports.TracksController = TracksController = __decorate([
    (0, common_1.Controller)('tracks'),
    __metadata("design:paramtypes", [tracks_service_1.TracksService])
], TracksController);
//# sourceMappingURL=tracks.controller.js.map