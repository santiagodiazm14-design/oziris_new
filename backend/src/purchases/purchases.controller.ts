import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  UseGuards,
  Request,
  Response,
} from '@nestjs/common';
import { PurchasesService, SimulatedPurchaseDto } from './purchases.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('purchases')
export class PurchasesController {
  constructor(private readonly purchasesService: PurchasesService) {}

  /**
   * Endpoint para simular el pago y adquirir un beat o lote de beats.
   * Requiere JWT y restringe al rol ADMIN.
   */
  @UseGuards(JwtAuthGuard)
  @Post('simulate')
  async simulatePayment(
    @Request() req: any,
    @Body() dto: SimulatedPurchaseDto,
  ) {
    const userId = req.user.id;
    const userRole = req.user.role;
    return this.purchasesService.simulatePayment(userId, userRole, dto);
  }

  /**
   * Endpoint para obtener el historial de compras del usuario autenticado.
   */
  @UseGuards(JwtAuthGuard)
  @Get('my-purchases')
  async getMyPurchases(@Request() req: any) {
    const userId = req.user.id;
    return this.purchasesService.getUserPurchases(userId);
  }

  /**
   * Endpoint para verificar si el usuario actual ha adquirido un Beat en particular.
   */
  @UseGuards(JwtAuthGuard)
  @Get('check/:trackId')
  async checkStatus(
    @Request() req: any,
    @Param('trackId') trackId: string,
  ) {
    const userId = req.user.id;
    return this.purchasesService.checkPurchaseStatus(userId, trackId);
  }

  /**
   * Endpoint para descargar el archivo de audio del beat.
   * Valida JWT, rol común (no admin) y comprobante de compra o autoría.
   */
  @UseGuards(JwtAuthGuard)
  @Get('download/:trackId')
  async downloadBeat(
    @Request() req: any,
    @Param('trackId') trackId: string,
    @Response() res: any,
  ) {
    const userId = req.user.id;
    const userRole = req.user.role;
    const ipAddress = req.ip || req.connection?.remoteAddress;
    const userAgent = req.headers ? req.headers['user-agent'] : undefined;
    return this.purchasesService.handleDownload(userId, userRole, trackId, res, {
      ipAddress,
      userAgent,
    });
  }
}
