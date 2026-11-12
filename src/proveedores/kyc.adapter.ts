import { Injectable, Logger } from '@nestjs/common';
import { Proveedor, Simulador } from './simulador';

/**
 * Adaptador hacia el proveedor KYC.
 *
 * Reemplaza TercerosService.verifyKyc() del monolito, que siempre aprobaba la
 * verificacion sin mirar el documento ni el nombre. Se conserva ese
 * comportamiento tal cual: la respuesta simulada es la constante true.
 */
@Injectable()
export class KycAdapter {
  private readonly logger = new Logger(KycAdapter.name);

  constructor(private readonly simulador: Simulador) {}

  /** Ojo con el orden: la firma del monolito es verifyKyc(documento, nombre). */
  async verificar(documento: string, nombre: string): Promise<boolean> {
    this.logger.log(`Verificando KYC de ${nombre} (${documento})...`);
    return this.simulador.llamar(Proveedor.KYC, 'verificarKyc', true);
  }
}
