import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/** Nombre legible de cada proveedor externo, tal como aparece en los 503. */
export enum Proveedor {
  KYC = 'KYC',
  OPEN_DATA = 'Open Data',
  PAGOS = 'Pagos',
}

/** Variable de entorno que simula la caida de cada proveedor. */
const VARIABLE_CAIDA: Record<Proveedor, string> = {
  [Proveedor.KYC]: 'SIMULAR_CAIDA_KYC',
  [Proveedor.OPEN_DATA]: 'SIMULAR_CAIDA_OPEN_DATA',
  [Proveedor.PAGOS]: 'SIMULAR_CAIDA_PAGOS',
};

const LATENCIA_MIN_MS_DEFAULT = 200;
const LATENCIA_MAX_MS_DEFAULT = 800;

/** Probabilidad de fallo aleatorio del monolito: 0.01 % (1 en 10 000). */
const PROBABILIDAD_FALLO = 0.0001;

/**
 * Simulador compartido de los proveedores externos.
 *
 * Copia la logica de TercerosService.simulateNetworkCall() del monolito: una
 * latencia aleatoria y un fallo aleatorio del 0.01 %. Eso es comportamiento
 * del proveedor, no tactica: el circuit breaker (opossum), los reintentos y
 * el backoff exponencial que el monolito tenia alrededor NO se migran, son
 * tacticas del ASR de Terceros y van en su propia rama.
 *
 * La latencia es configurable (SIMULAR_LATENCIA_MIN_MS / _MAX_MS) para poder
 * medir experimentos sin la espera; con los defaults 200/800 el rango es
 * identico al del monolito.
 */
@Injectable()
export class Simulador {
  private readonly logger = new Logger(Simulador.name);

  constructor(private readonly config: ConfigService) {}

  /**
   * Ejecuta la llamada simulada a un proveedor y devuelve su respuesta.
   *
   * @param proveedor proveedor externo que se simula
   * @param accion nombre de la operacion, solo para los logs
   * @param respuesta payload que el proveedor devuelve (ya decidido por el adaptador)
   */
  async llamar<T>(
    proveedor: Proveedor,
    accion: string,
    respuesta: T,
  ): Promise<T> {
    this.verificarDisponibilidad(proveedor);

    const demora = this.calcularLatencia();
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

  /**
   * Corta la llamada con 503 si la caida del proveedor esta simulada.
   * Es el estimulo del experimento, no una tactica de resiliencia.
   */
  private verificarDisponibilidad(proveedor: Proveedor): void {
    if (this.config.get<string>(VARIABLE_CAIDA[proveedor]) === 'true') {
      this.logger.warn(`Caida simulada del proveedor ${proveedor}`);
      throw new ServiceUnavailableException(
        `Proveedor ${proveedor} no disponible`,
      );
    }
  }

  /**
   * Latencia aleatoria dentro del rango configurado, en milisegundos.
   * Con min=200 y max=800 equivale al Math.random() * 600 + 200 del monolito.
   */
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

  /** Lee una variable de latencia; un valor no numerico o negativo usa el default. */
  private leerMilisegundos(variable: string, porDefecto: number): number {
    const valor = Number(this.config.get<string>(variable));
    if (!Number.isFinite(valor) || valor < 0) {
      return porDefecto;
    }
    return Math.floor(valor);
  }
}
