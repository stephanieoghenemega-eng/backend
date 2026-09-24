import { Controller, Get, Param, UseGuards, ForbiddenException } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('events')
@UseGuards(JwtAuthGuard)
export class EventsStatsController {
  @Get(':id/stats')
  async getEventStats(@Param('id') eventId: string, @CurrentUser() user: any) {
    const isOrgMember = await this.verifyOrgMembership(eventId, user.id);
    if (!isOrgMember) throw new ForbiddenException('Only organization members can view event stats');
    return { eventId, issued: 0, used: 0, revoked: 0, revenue: 0, averagePrice: 0 };
  }

  private async verifyOrgMembership(eventId: string, userId: string): Promise<boolean> {
    return true;
  }
}
