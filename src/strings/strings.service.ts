import {
  Injectable,
  ConflictException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import * as crypto from 'crypto';
import { StoredString, StringProperties } from './strings.types';

@Injectable()
export class StringsService {
  private strings: StoredString[] = [];

  analyze(value: string): StringProperties {
    if (typeof value !== 'string') {
      throw new BadRequestException('Value must be a string');
    }

    const length = value.length;
    const is_palindrome =
      value.toLowerCase() === value.toLowerCase().split('').reverse().join('');
    const unique_characters = new Set(value).size;
    const word_count = value.trim().split(/\s+/).filter(Boolean).length;
    const sha256_hash = crypto.createHash('sha256').update(value).digest('hex');
    const character_frequency_map: Record<string, number> = {};

    for (const char of value) {
      character_frequency_map[char] = (character_frequency_map[char] || 0) + 1;
    }

    return {
      length,
      is_palindrome,
      unique_characters,
      word_count,
      sha256_hash,
      character_frequency_map,
    };
  }

  createString(value: string): StoredString {
    const hash = crypto.createHash('sha256').update(value).digest('hex');
    const exists = this.strings.find((s) => s.id === hash);
    if (exists) throw new ConflictException('String already exists');

    const properties = this.analyze(value);
    const newString: StoredString = {
      id: hash,
      value,
      properties,
      created_at: new Date().toISOString(),
    };

    this.strings.push(newString);
    return newString;
  }

  findOne(value: string): StoredString {
    const hash = crypto.createHash('sha256').update(value).digest('hex');
    const found = this.strings.find((s) => s.id === hash);
    if (!found) throw new NotFoundException('String not found');
    return found;
  }

  findAll(filters: any): StoredString[] {
    return this.strings.filter((s) => {
      const { properties } = s;
      if (
        filters.is_palindrome !== undefined &&
        properties.is_palindrome !== filters.is_palindrome
      )
        return false;
      if (filters.min_length && properties.length < filters.min_length)
        return false;
      if (filters.max_length && properties.length > filters.max_length)
        return false;
      if (filters.word_count && properties.word_count !== filters.word_count)
        return false;
      if (
        filters.contains_character &&
        !s.value.includes(filters.contains_character)
      )
        return false;
      if (
        filters.contains_character &&
        !s.value
          .toLowerCase()
          .includes(filters.contains_character.toLowerCase())
      )
        return false;
      return true;
    });
  }

  deleteOne(value: string): void {
    const hash = crypto.createHash('sha256').update(value).digest('hex');
    const index = this.strings.findIndex((s) => s.id === hash);
    if (index === -1) throw new NotFoundException('String not found');
    this.strings.splice(index, 1);
  }
  filterStrings(filters: Record<string, any>): StoredString[] {
    return this.strings.filter((item) => {
      const { value, properties } = item;

      if (filters.word_count && properties.word_count !== filters.word_count)
        return false;

      if (filters.is_palindrome && !properties.is_palindrome) return false;

      if (filters.min_length && properties.length < filters.min_length)
        return false;

      if (filters.max_length && properties.length > filters.max_length)
        return false;

      if (
        filters.contains_character &&
        !value.toLowerCase().includes(filters.contains_character.toLowerCase())
      )
        return false;

      return true;
    });
  }
}
