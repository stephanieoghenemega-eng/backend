import { Controller, Get, Post, Param, Body, UseGuards, Logger } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('PLATFORM_ADMIN')
export class AdminController {
  private readonly logger = new Logger('AdminController');

  @Get('events')
  async listAllEvents() {
    this.logger.log('Admin: Listing all events');
    return { events: [], total: 0 };
  }

  @Post('events/:id/cancel')
  async forceCancel(@Param('id') eventId: string, @Body() body: { reason: string }) {
    this.logger.log(`Admin: Force-cancelling event ${eventId}`);
    return { eventId, status: 'cancelled', cancelledAt: new Date().toISOString(), reason: body.reason };
  }
}
