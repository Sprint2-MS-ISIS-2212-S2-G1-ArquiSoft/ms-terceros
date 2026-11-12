import { IsNotEmpty, IsNumberString, IsString } from 'class-validator';

/**
 * Cuerpo de POST /pagos/cobros.
 *
 * Son los dos argumentos de processPayment(documento, amount) del monolito.
 * El monto se valida como cadena numerica porque alla llegaba como
 * cotizacion.primaMensual, un decimal que TypeORM entrega como string.
 */
export class ProcesarCobroDto {
  @IsString()
  @IsNotEmpty()
  documento!: string;

  @IsNumberString()
  monto!: string;
}
