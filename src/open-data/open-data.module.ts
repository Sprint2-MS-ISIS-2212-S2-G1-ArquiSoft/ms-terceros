import { Module } from '@nestjs/common';
import { ProveedoresModule } from '../proveedores/proveedores.module';
import { OpenDataController } from './open-data.controller';

/** Proveedor Open Data: score del cliente. Lo consumira cotizacion. */
@Module({
  imports: [ProveedoresModule],
  controllers: [OpenDataController],
})
export class OpenDataModule {}
