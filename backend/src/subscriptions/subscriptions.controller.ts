import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SimulateSubscriptionDto } from './dto/simulate-subscription.dto';
import { SubscriptionsService } from './subscriptions.service';

@ApiTags('Subscriptions')
@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Get('plans')
  @ApiOperation({ summary: 'Catálogo de planes (público)' })
  getPlans() {
    return this.subscriptionsService.getPlans();
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-Auth')
  @ApiOperation({ summary: 'Plan actual del usuario y su cupo de beats' })
  getMine(@Request() req: any) {
    return this.subscriptionsService.getMine(req.user.id);
  }

  @Post('simulate')
  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiBearerAuth('JWT-Auth')
  @ApiOperation({ summary: 'Simular el pago de una suscripción' })
  simulate(@Request() req: any, @Body() dto: SimulateSubscriptionDto) {
    return this.subscriptionsService.simulate(req.user.id, dto);
  }

  @Delete('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-Auth')
  @ApiOperation({ summary: 'Cancelar la suscripción vigente (vuelve a Free)' })
  cancel(@Request() req: any) {
    return this.subscriptionsService.cancel(req.user.id);
  }
}
