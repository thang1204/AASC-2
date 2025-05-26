import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { FibonacciService } from './fibonacci.service';

@Controller('fibonacci')
export class FibonacciController {
  constructor(private readonly fibonacciService: FibonacciService) {}

  @Get(':n')
  getFibonacci(@Param('n', ParseIntPipe) n: number) {
    return this.fibonacciService.getFibonacci(n);
  }
}
