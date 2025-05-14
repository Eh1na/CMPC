import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { BooksService } from './books.service';
import { BooksController } from './books.controller';
import { StorageService } from './storage.service';

@Module({
  imports: [DatabaseModule],
  controllers: [BooksController],
  providers: [BooksService, StorageService],
  exports: [BooksService],
})
export class BooksModule { }