import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PaginationQueryDto } from '../../../../utils/dto/pagination.dto';
import { RequireStoreRoles, StoreRoleGuard } from '../guards';
import {
  CreateCustomerDto,
  CustomerQueryDto,
  UpdateCustomerDto,
} from './customer.dto';
import { CustomerService } from './customer.service';

/**
 * Cadastro de clientes da loja. Só dono e gerente: a base inteira (com
 * telefones) não fica aberta para cada profissional, que vê o cliente no
 * próprio atendimento.
 */
@Controller('partner/stores/:storeId/customers')
@RequireStoreRoles('owner', 'manager')
@UseGuards(StoreRoleGuard)
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Get()
  findAll(
    @Param('storeId') storeId: string,
    @Query() query: CustomerQueryDto,
  ) {
    return this.customerService.findAll(storeId, query);
  }

  @Get('tags')
  findTags(@Param('storeId') storeId: string) {
    return this.customerService.findTags(storeId);
  }

  @Get(':userId')
  findOne(
    @Param('storeId') storeId: string,
    @Param('userId', ParseUUIDPipe) userId: string,
  ) {
    return this.customerService.findOne(storeId, userId);
  }

  @Get(':userId/history')
  findHistory(
    @Param('storeId') storeId: string,
    @Param('userId', ParseUUIDPipe) userId: string,
    @Query() query: PaginationQueryDto,
  ) {
    return this.customerService.findHistory(storeId, userId, query);
  }

  @Post()
  create(@Param('storeId') storeId: string, @Body() body: CreateCustomerDto) {
    return this.customerService.create(storeId, body);
  }

  @Patch(':userId')
  update(
    @Param('storeId') storeId: string,
    @Param('userId', ParseUUIDPipe) userId: string,
    @Body() body: UpdateCustomerDto,
  ) {
    return this.customerService.update(storeId, userId, body);
  }
}
