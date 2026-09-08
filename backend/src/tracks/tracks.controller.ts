import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  Body,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { TracksService, Track } from './tracks.service';

@Controller('tracks')
export class TracksController {
  constructor(private readonly tracksService: TracksService) {}

  @Get()
  async findAll(@Query('genre') genre?: string): Promise<Track[]> {
    return this.tracksService.findAll(genre);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Track> {
    return this.tracksService.findOne(id);
  }

  @Post()
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'audio', maxCount: 1 },
        { name: 'audioFile', maxCount: 1 },
        { name: 'cover', maxCount: 1 },
        { name: 'coverImage', maxCount: 1 },
      ],
      {
        storage: diskStorage({
          destination: './uploads',
          filename: (req: any, file: any, cb: (error: Error | null, filename: string) => void) => {
            const randomName = Array(16)
              .fill(null)
              .map(() => Math.round(Math.random() * 16).toString(16))
              .join('');
            cb(null, `${randomName}${extname(file.originalname)}`);
          },
        }),
      },
    ),
  )
  async create(
    @Body() body: any,
    @UploadedFiles()
    files: {
      audio?: any[];
      audioFile?: any[];
      cover?: any[];
      coverImage?: any[];
    },
  ): Promise<Track> {
    const uploadedAudio = files?.audioFile?.[0] || files?.audio?.[0];
    const uploadedCover = files?.coverImage?.[0] || files?.cover?.[0];

    const audioUrl = uploadedAudio
      ? `/uploads/${uploadedAudio.filename}`
      : body?.audioUrl || '';
    const coverUrl = uploadedCover
      ? `/uploads/${uploadedCover.filename}`
      : body?.coverUrl || '';

    const tagsArray =
      typeof body?.tags === 'string'
        ? body.tags.split(',').map((t: string) => t.trim()).filter(Boolean)
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

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ success: boolean }> {
    return this.tracksService.remove(id);
  }
}
