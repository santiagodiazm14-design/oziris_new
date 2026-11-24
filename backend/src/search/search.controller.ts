import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { SearchService } from './search.service';

/** Busqueda publica para el autocompletado de la barra del catalogo. */
@ApiTags('Search')
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  // Se llama mientras el usuario escribe (con debounce en el cliente)
  @Throttle({ default: { limit: 120, ttl: 60000 } })
  @ApiOperation({
    summary: 'Sugerencias de artistas y beats',
    description:
      'Devuelve artistas y beats que coinciden con el texto, los que empiezan por lo escrito primero.',
  })
  @ApiQuery({ name: 'q', required: true, example: 'dar' })
  @ApiQuery({ name: 'limit', required: false, example: 5 })
  @ApiResponse({ status: 200, description: 'Artistas y beats sugeridos.' })
  suggest(@Query('q') q?: string, @Query('limit') limit?: string) {
    return this.searchService.suggest(q, limit);
  }
}
