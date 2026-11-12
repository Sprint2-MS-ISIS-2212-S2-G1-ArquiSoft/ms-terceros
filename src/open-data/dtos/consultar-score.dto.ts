import { IsNotEmpty, IsString } from 'class-validator';

/**
 * Cuerpo de POST /open-data/scores.
 *
 * Es el unico argumento de getOpenDataScore(documento) del monolito.
 */
export class ConsultarScoreDto {
  @IsString()
  @IsNotEmpty()
  documento!: string;
}
