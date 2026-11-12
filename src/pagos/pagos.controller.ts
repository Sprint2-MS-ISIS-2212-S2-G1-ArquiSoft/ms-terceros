import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { PagosAdapter } from '../proveedores/pagos.adapter';
import { ProcesarCobroDto } from './dtos/procesar-cobro.dto';

@Controller('pagos')
export class PagosController {
  constructor(private readonly pagosAdapter: PagosAdapter) {}

  /** POST por el body con datos de pago (documento y monto). */
  @Post('cobros')
  @HttpCode(HttpStatus.OK)
  async procesarCobro(
    @Body() dto: ProcesarCobroDto,
  ): Promise<{ exitoso: boolean }> {
    const exitoso = await this.pagosAdapter.procesarCobro(
      dto.documento,
      dto.monto,
    );
    return { exitoso };
  }
}
