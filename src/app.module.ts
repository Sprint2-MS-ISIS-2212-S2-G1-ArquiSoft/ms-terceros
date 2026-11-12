import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthModule } from './health/health.module';
import { KycModule } from './kyc/kyc.module';
import { OpenDataModule } from './open-data/open-data.module';
import { PagosModule } from './pagos/pagos.module';

/**
 * Terceros es un servicio sin estado: no hay TypeOrmModule porque no tiene
 * base de datos (ver CLAUDE.md, "Base de datos: Sin base de datos").
 */
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
  ],
})
export class AppModule {}
