import { Injectable, Logger } from '@nestjs/common';
import { Proveedor, Simulador } from './simulador';

/**
 * Adaptador hacia el proveedor Open Data.
 *
 * Reemplaza TercerosService.getOpenDataScore() del monolito. El score es un
 * entero aleatorio entre 0 y 100, igual que alla; Cotizacion lo usa como
 * (score / 100) * 0.3 para ajustar la prima, asi que el rango no puede cambiar.
 */
@Injectable()
export class OpenDataAdapter {
  private readonly logger = new Logger(OpenDataAdapter.name);

  constructor(private readonly simulador: Simulador) {}

  async obtenerScore(documento: string): Promise<number> {
    this.logger.log(`Consultando score de Open Data de ${documento}...`);
    const score = Math.floor(Math.random() * 101);
    return this.simulador.llamar(
      Proveedor.OPEN_DATA,
      'obtenerScoreOpenData',
      score,
    );
  }
}
