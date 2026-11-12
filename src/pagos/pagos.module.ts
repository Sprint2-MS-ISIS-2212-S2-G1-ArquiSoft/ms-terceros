import { Module } from '@nestjs/common';
import { ProveedoresModule } from '../proveedores/proveedores.module';
import { PagosController } from './pagos.controller';

/** Pasarela de pagos: cobro de la prima. Lo consumira suscripciones. */
@Module({
  imports: [ProveedoresModule],
  controllers: [PagosController],
})
export class PagosModule {}
