import { Module } from '@nestjs/common';
import { ProveedoresModule } from '../proveedores/proveedores.module';
import { SimulacionController } from './simulacion.controller';


@Module({
  imports: [ProveedoresModule],
  controllers: [SimulacionController],
})
export class SimulacionModule {}