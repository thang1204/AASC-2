import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FibonacciController } from './fibonacci/fibonacci.controller';
import { FibonacciService } from './fibonacci/fibonacci.service';

@Module({
  imports: [],
  controllers: [AppController, FibonacciController],
  providers: [AppService, FibonacciService],
})
export class AppModule {}
