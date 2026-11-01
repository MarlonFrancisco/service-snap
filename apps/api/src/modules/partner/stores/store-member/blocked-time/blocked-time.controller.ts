import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { StoreAccessGuard } from '../../guards';
import { BlockedTimeService } from './blocked-time.service';
import {
  BlockedTimeDto,
  CreateBulkBlockedTimeDto,
  DeleteBulkBlockedTimeDto,
} from './dto/blocked-time.dto';

@Controller('partner/stores/:storeId/members/:storeMemberId/blocked-times')
@UseGuards(StoreAccessGuard)
export class BlockedTimeController {
  constructor(private readonly blockedTimeService: BlockedTimeService) {}

  @Get()
  findAll(
    @Param('storeId') storeId: string,
    @Param('storeMemberId') storeMemberId: string,
  ) {
    return this.blockedTimeService.findAll(storeId, storeMemberId);
  }

  @Post()
  create(
    @Param('storeId') storeId: string,
    @Param('storeMemberId') storeMemberId: string,
    @Body() blockedTime: BlockedTimeDto,
  ) {
    return this.blockedTimeService.create(
      storeId,
      plainToInstance(BlockedTimeDto, {
        ...blockedTime,
        storeMember: { id: storeMemberId },
      }),
    );
  }

  @Post('bulk')
  createBulk(
    @Param('storeId') storeId: string,
    @Param('storeMemberId') storeMemberId: string,
    @Body() createBulkDto: CreateBulkBlockedTimeDto,
  ) {
    return this.blockedTimeService.createBulk(
      storeId,
      storeMemberId,
      createBulkDto,
    );
  }

  @Post('bulk/delete')
  deleteBulk(
    @Param('storeId') storeId: string,
    @Param('storeMemberId') storeMemberId: string,
    @Body() deleteBulkDto: DeleteBulkBlockedTimeDto,
  ) {
    return this.blockedTimeService.deleteBulk(
      storeId,
      storeMemberId,
      deleteBulkDto,
    );
  }

  @Put(':id')
  update(
    @Param('storeId') storeId: string,
    @Param('storeMemberId') storeMemberId: string,
    @Param('id') id: string,
    @Body() blockedTime: BlockedTimeDto,
  ) {
    return this.blockedTimeService.update(
      storeId,
      plainToInstance(BlockedTimeDto, {
        ...blockedTime,
        id,
        storeMember: { id: storeMemberId },
      }),
    );
  }

  @Delete(':id')
  async delete(
    @Param('storeId') storeId: string,
    @Param('id') id: string,
    @Param('storeMemberId') storeMemberId: string,
  ) {
    await this.blockedTimeService.delete(storeId, storeMemberId, id);
    return { id, storeMember: { id: storeMemberId } };
  }
}
