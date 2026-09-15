import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // USER PROFILE ENDPOINTS
  @Patch('profile')
  async updateProfile(
    @Request() req: any,
    @Body()
    body: Partial<{
      name: string;
      lastName: string;
      artistName: string;
      location: string;
      bio: string;
      avatarUrl: string;
    }>,
  ) {
    return this.usersService.updateProfile(req.user.id, body);
  }

  @Post('profile/avatar')
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req: any, file: any, cb: (error: Error | null, filename: string) => void) => {
          const randomName = Array(16)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          cb(null, `avatar-${randomName}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  async uploadAvatar(@Request() req: any, @UploadedFile() file: any) {
    const avatarUrl = file ? `/uploads/${file.filename}` : '';
    return this.usersService.updateProfile(req.user.id, { avatarUrl });
  }

  // FAVORITES ENDPOINTS
  @Get('favorites')
  async getFavorites(@Request() req: any) {
    return this.usersService.getUserFavorites(req.user.id);
  }

  @Post('favorites/:trackId')
  async toggleFavorite(@Request() req: any, @Param('trackId') trackId: string) {
    return this.usersService.toggleFavorite(req.user.id, trackId);
  }

  // ADMIN ENDPOINTS
  @Get('stats')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  async getAdminStats() {
    return this.usersService.getAdminStats();
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  async findAll(@Query('search') search?: string) {
    return this.usersService.findAll(search);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  async create(@Body() body: { name: string; email: string; password: string; role?: string }) {
    return this.usersService.createUser(body);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  async update(
    @Param('id') id: string,
    @Body() body: Partial<{ name: string; lastName: string; artistName: string; location: string; role: string; isActive: boolean; bio: string; avatarUrl: string }>,
  ) {
    return this.usersService.updateUser(id, body);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  async remove(@Param('id') id: string) {
    return this.usersService.deleteUser(id);
  }
}
