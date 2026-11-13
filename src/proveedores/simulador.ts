import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';


export enum Proveedor {
  KYC = 'KYC',
  OPEN_DATA = 'Open Data',
  PAGOS = 'Pagos',
}


const VARIABLE_CAIDA: Record<Proveedor, string> = {
  [Proveedor.KYC]: 'SIMULAR_CAIDA_KYC',
  [Proveedor.OPEN_DATA]: 'SIMULAR_CAIDA_OPEN_DATA',
  [Proveedor.PAGOS]: 'SIMULAR_CAIDA_PAGOS',
};


export type ModoSimulacion = 'normal' | 'caido' | 'lento';

const LATENCIA_LENTA_MS_DEFAULT = 2000;

const LATENCIA_MIN_MS_DEFAULT = 200;
const LATENCIA_MAX_MS_DEFAULT = 800;


const PROBABILIDAD_FALLO = 0.0001;


@Injectable()
export class Simulador {
  private readonly logger = new Logger(Simulador.name);


  private readonly modos = new Map<Proveedor, ModoSimulacion>();
  private latenciaLentaMs = LATENCIA_LENTA_MS_DEFAULT;

  constructor(private readonly config: ConfigService) {}

 
  fijarModo(
    proveedor: Proveedor,
    modo: ModoSimulacion,
    latenciaLentaMs?: number,
  ): void {
    this.modos.set(proveedor, modo);
    if (latenciaLentaMs !== undefined) {
      this.latenciaLentaMs = latenciaLentaMs;
    }
    this.logger.warn(
      `[SIMULACION] ${proveedor} pasa a modo ${modo}` +
        (modo === 'lento' ? ` (${this.latenciaLentaMs} ms)` : ''),
    );
  }


  estado(): Record<string, ModoSimulacion> {
    const resultado: Record<string, ModoSimulacion> = {};
    for (const proveedor of Object.values(Proveedor)) {
      resultado[proveedor] = this.modoDe(proveedor);
    }
    return resultado;
  }

  private modoDe(proveedor: Proveedor): ModoSimulacion {
    const fijado = this.modos.get(proveedor);
    if (fijado) {
      return fijado;
    }
    return this.config.get<string>(VARIABLE_CAIDA[proveedor]) === 'true'
      ? 'caido'
      : 'normal';
  }

  async llamar<T>(
    proveedor: Proveedor,
    accion: string,
    respuesta: T,
  ): Promise<T> {
    this.verificarDisponibilidad(proveedor);

    const demora =
      this.modoDe(proveedor) === 'lento'
        ? this.latenciaLentaMs
        : this.calcularLatencia();
    if (demora > 0) {
      await new Promise((resolve) => setTimeout(resolve, demora));
    }

    if (Math.random() < PROBABILIDAD_FALLO) {
      this.logger.error(
        `[${accion}] Fallo aleatorio simulado del proveedor ${proveedor}`,
      );
      throw new ServiceUnavailableException(
        `Proveedor ${proveedor} no disponible`,
      );
    }

    this.logger.log(
      `[${accion}] Llamada a ${proveedor} exitosa despues de ${demora}ms`,
    );
    return respuesta;
  }


  private verificarDisponibilidad(proveedor: Proveedor): void {
    if (this.modoDe(proveedor) === 'caido') {
      this.logger.warn(`Caida simulada del proveedor ${proveedor}`);
      throw new ServiceUnavailableException(
        `Proveedor ${proveedor} no disponible`,
      );
    }
  }

  private calcularLatencia(): number {
    const min = this.leerMilisegundos(
      'SIMULAR_LATENCIA_MIN_MS',
      LATENCIA_MIN_MS_DEFAULT,
    );
    const max = this.leerMilisegundos(
      'SIMULAR_LATENCIA_MAX_MS',
      LATENCIA_MAX_MS_DEFAULT,
    );
    if (max <= min) {
      return min;
    }
    return min + Math.floor(Math.random() * (max - min + 1));
  }

  private leerMilisegundos(variable: string, porDefecto: number): number {
    const valor = Number(this.config.get<string>(variable));
    if (!Number.isFinite(valor) || valor < 0) {
      return porDefecto;
    }
    return Math.floor(valor);
  }
}