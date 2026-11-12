import { Module } from '@nestjs/common';
import { ProveedoresModule } from '../proveedores/proveedores.module';
import { KycController } from './kyc.controller';

/** Proveedor KYC: verificacion de identidad. Lo consume identidad. */
@Module({
  imports: [ProveedoresModule],
  controllers: [KycController],
})
export class KycModule {}
