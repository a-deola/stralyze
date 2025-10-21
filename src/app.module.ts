import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { StringsModule } from './strings/strings.module';

@Module({
  imports: [StringsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
