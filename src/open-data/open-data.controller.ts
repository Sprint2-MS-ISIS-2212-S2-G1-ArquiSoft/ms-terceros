import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { OpenDataAdapter } from '../proveedores/open-data.adapter';
import { ConsultarScoreDto } from './dtos/consultar-score.dto';

@Controller('open-data')
export class OpenDataController {
  constructor(private readonly openDataAdapter: OpenDataAdapter) {}

  /** POST y no GET porque el documento es un dato personal y va en el body. */
  @Post('scores')
  @HttpCode(HttpStatus.OK)
  async consultarScore(
    @Body() dto: ConsultarScoreDto,
  ): Promise<{ score: number }> {
    const score = await this.openDataAdapter.obtenerScore(dto.documento);
    return { score };
  }
}
