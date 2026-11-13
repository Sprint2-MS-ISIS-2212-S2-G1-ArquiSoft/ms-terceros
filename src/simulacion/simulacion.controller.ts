import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  Post,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Proveedor, Simulador } from '../proveedores/simulador';
import { FijarModoDto } from './dtos/fijar-modo.dto';

const PROVEEDORES: Record<string, Proveedor> = {
  kyc: Proveedor.KYC,
  'open-data': Proveedor.OPEN_DATA,
  pagos: Proveedor.PAGOS,
};


@Controller('simulacion')
export class SimulacionController {
  constructor(
    private readonly simulador: Simulador,
    private readonly config: ConfigService,
  ) {}

  @Get()
  estado(): Record<string, string> {
    this.verificarHabilitado();
    return this.simulador.estado();
  }

  @Post(':proveedor')
  fijarModo(
    @Param('proveedor') nombre: string,
    @Body() dto: FijarModoDto,
  ): Record<string, string> {
    this.verificarHabilitado();
    const proveedor = PROVEEDORES[nombre];
    if (!proveedor) {
      throw new NotFoundException(
        `Proveedor ${nombre} no existe (kyc, open-data, pagos)`,
      );
    }
    this.simulador.fijarModo(proveedor, dto.modo, dto.latenciaMs);
    return this.simulador.estado();
  }

  private verificarHabilitado(): void {
    if (this.config.get<string>('SIMULACION_ADMIN_HABILITADA') !== 'true') {
      throw new ForbiddenException('Simulacion deshabilitada');
    }
  }
}