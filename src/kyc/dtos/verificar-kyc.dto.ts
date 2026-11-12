import { IsNotEmpty, IsString } from 'class-validator';

/**
 * Cuerpo de POST /kyc/verificaciones.
 *
 * Contrato fijo: ms-identidad ya lo consume (src/clients/terceros.client.ts) y
 * no puede cambiar. Son los dos argumentos de verifyKyc(documento, nombre).
 */
export class VerificarKycDto {
  @IsString()
  @IsNotEmpty()
  documento!: string;

  @IsString()
  @IsNotEmpty()
  nombre!: string;
}
