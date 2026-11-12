import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { KycAdapter } from '../proveedores/kyc.adapter';
import { VerificarKycDto } from './dtos/verificar-kyc.dto';

@Controller('kyc')
export class KycController {
  constructor(private readonly kycAdapter: KycAdapter) {}

  /**
   * POST por el body con datos personales (documento y nombre).
   *
   * La forma de la respuesta, { valido }, y el 200 explicito (Nest devolveria
   * 201 por defecto en un POST) son parte del contrato que ms-identidad ya
   * consume.
   */
  @Post('verificaciones')
  @HttpCode(HttpStatus.OK)
  async verificar(@Body() dto: VerificarKycDto): Promise<{ valido: boolean }> {
    const valido = await this.kycAdapter.verificar(dto.documento, dto.nombre);
    return { valido };
  }
}
