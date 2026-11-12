import { Module } from '@nestjs/common';
import { KycAdapter } from './kyc.adapter';
import { OpenDataAdapter } from './open-data.adapter';
import { PagosAdapter } from './pagos.adapter';
import { Simulador } from './simulador';

/**
 * Adaptadores hacia los proveedores externos. Hoy los tres son simulados; cada
 * uno esta aislado en su propio archivo para poder reemplazarlo por un
 * proveedor real sin tocar los controladores.
 */
@Module({
  providers: [Simulador, KycAdapter, OpenDataAdapter, PagosAdapter],
  exports: [KycAdapter, OpenDataAdapter, PagosAdapter],
})
export class ProveedoresModule {}
