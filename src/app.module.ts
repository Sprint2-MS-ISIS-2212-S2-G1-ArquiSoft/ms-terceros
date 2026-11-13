import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthModule } from './health/health.module';
import { KycModule } from './kyc/kyc.module';
import { OpenDataModule } from './open-data/open-data.module';
import { PagosModule } from './pagos/pagos.module';
import { SimulacionModule } from './simulacion/simulacion.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    HealthModule,
    KycModule,
    OpenDataModule,
    PagosModule,
    SimulacionModule,
  ],
})
export class AppModule {}
