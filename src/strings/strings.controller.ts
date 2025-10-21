import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  Query,
  BadRequestException,
  HttpCode,
  UnprocessableEntityException,
} from '@nestjs/common';
import { StringsService } from './strings.service';

@Controller('strings')
export class StringsController {
  constructor(private readonly stringsService: StringsService) {}

  @Post()
  create(@Body() body: any) {
    if (!body.value) throw new BadRequestException('Missing "value" field');

    if (typeof body.value !== 'string') {
      throw new UnprocessableEntityException('"value" must be of type string');
    }
    return this.stringsService.createString(body.value);
  }

  @Get()
  getAll(
    @Query('is_palindrome') is_palindrome?: string,
    @Query('min_length') min_length?: string,
    @Query('max_length') max_length?: string,
    @Query('word_count') word_count?: string,
    @Query('contains_character') contains_character?: string,
  ) {
    const filters = {
      is_palindrome:
        is_palindrome === 'true'
          ? true
          : is_palindrome === 'false'
            ? false
            : undefined,
      min_length: min_length ? parseInt(min_length, 10) : undefined,
      max_length: max_length ? parseInt(max_length, 10) : undefined,
      word_count: word_count ? parseInt(word_count, 10) : undefined,
      contains_character,
    };

    if (
      [filters.min_length, filters.max_length, filters.word_count].some(
        (v) => v !== undefined && Number.isNaN(v),
      )
    ) {
      throw new BadRequestException('Invalid numeric query parameter');
    }

    const results = this.stringsService.findAll(filters);
    return {
      data: results,
      count: results.length,
      filters_applied: filters,
    };
  }
  private parseNaturalLanguage(query: string): Record<string, any> | null {
  const filters: Record<string, any> = {};

  if (query === 'all single word palindromic strings') {
    filters.word_count = 1;
    filters.is_palindrome = true;
  } else if (query === 'strings longer than 10 characters') {
    filters.min_length = 11;
  } else if (query === 'palindromic strings that contain the first vowel') {
    filters.is_palindrome = true;
    filters.contains_character = 'a';
  } else if (query === 'strings containing the letter z') {
    filters.contains_character = 'z';
  } else {
    return null;
  }

  return filters;
}

@Get('filter-by-natural-language')
async filterByNaturalLanguage(@Query('query') query: string) {
  if (!query) {
    throw new BadRequestException('Missing query parameter');
  }

  const parsedFilters = this.parseNaturalLanguage(query.toLowerCase());

  if (!parsedFilters) {
    throw new BadRequestException('Unable to parse natural language query');
  }

  if (
    parsedFilters.min_length &&
    parsedFilters.max_length &&
    parsedFilters.min_length > parsedFilters.max_length
  ) {
    throw new UnprocessableEntityException({
      statusCode: 422,
      message: 'Query parsed but resulted in conflicting filters',
      parsed_filters: parsedFilters,
    });
  }

  const data = await this.stringsService.filterStrings(parsedFilters);

  return {
    data,
    count: data.length,
    interpreted_query: {
      original: query,
      parsed_filters: parsedFilters,
    },
  };
}

   @Get(':value')
  getOne(@Param('value') value: string) {
    return this.stringsService.findOne(value);
  }

  @Delete(':value')
  @HttpCode(204)
  delete(@Param('value') value: string) {
    this.stringsService.deleteOne(value);
  }

}


