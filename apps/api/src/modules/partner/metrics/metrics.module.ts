import { Module } from '@nestjs/common';
import { StoreGuardsModule } from '../stores/guards/store-guards.module';
import { DashboardOverviewModule } from './dashboard-overview/dashboard-overview.module';
import { DashboardSalesModule } from './dashboard-sales/dashboard-sales.module';
import { DashboardOperationalModule } from './dashboard-operational/dashboard-operational.module';
import { DashboardCustomersModule } from './dashboard-customers/dashboard-customers.module';
import { MetricsController } from './metrics.controller';

@Module({
  imports: [
    StoreGuardsModule,
    DashboardOverviewModule,
    DashboardSalesModule,
    DashboardOperationalModule,
    DashboardCustomersModule,
  ],
  controllers: [MetricsController],
})
export class MetricsModule {}
