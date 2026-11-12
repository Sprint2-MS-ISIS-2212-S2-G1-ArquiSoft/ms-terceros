import { Injectable, Logger } from '@nestjs/common';
import { Proveedor, Simulador } from './simulador';

/**
 * Adaptador hacia la pasarela de pagos.
 *
 * Reemplaza TercerosService.processPayment() del monolito, que siempre
 * aprobaba el cobro sin mirar el documento ni el monto. El monto viaja como
 * string porque en el monolito era cotizacion.primaMensual, un decimal de
 * TypeORM.
 */
@Injectable()
export class PagosAdapter {
  private readonly logger = new Logger(PagosAdapter.name);

  constructor(private readonly simulador: Simulador) {}

  async procesarCobro(documento: string, monto: string): Promise<boolean> {
    this.logger.log(`Procesando cobro de ${monto} a ${documento}...`);
    return this.simulador.llamar(Proveedor.PAGOS, 'procesarCobro', true);
  }
}
