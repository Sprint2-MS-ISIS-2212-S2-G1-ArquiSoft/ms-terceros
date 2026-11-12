import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  /**
   * Sin chequeo de base de datos: Terceros no tiene ninguna. Tampoco consulta
   * a los proveedores, para que la salud del contenedor no dependa de ellos ni
   * la simulacion de caida tumbe el health check.
   */
  @Get()
  check(): { status: string } {
    return { status: 'ok' };
  }
}
