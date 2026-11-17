import {
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

/**
 * Traduce errores conocidos de Prisma a excepciones HTTP.
 * Cualquier otro error se relanza tal cual (→ 500) en vez de ocultarse.
 */
export function rethrowPrisma(
  e: unknown,
  notFoundMsg = 'Registro no encontrado.',
): never {
  const code = (e as { code?: string })?.code;
  if (code === 'P2002') {
    throw new ConflictException('Ya existe un registro con esos datos.');
  }
  if (code === 'P2025') throw new NotFoundException(notFoundMsg);
  if (code === 'P2003') {
    throw new BadRequestException('Referencia a un registro que no existe.');
  }
  throw e;
}
