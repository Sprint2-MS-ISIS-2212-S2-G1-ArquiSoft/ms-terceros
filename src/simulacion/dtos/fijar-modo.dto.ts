import { IsIn, IsInt, IsOptional, Max, Min } from 'class-validator';
import type { ModoSimulacion } from '../../proveedores/simulador';


export class FijarModoDto {
  @IsIn(['normal', 'caido', 'lento'])
  modo!: ModoSimulacion;


  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(60000)
  latenciaMs?: number;
}