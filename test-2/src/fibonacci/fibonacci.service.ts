import { Injectable } from '@nestjs/common';

@Injectable()
export class FibonacciService {
  getFibonacci(n: number): { value: string; timeMs: number } {
    const start = performance.now();

    let a = 0n, b = 1n;
    for (let i = 2; i <= n; i++) {
      const temp = a + b;
      a = b;
      b = temp;
    }

    const result = n === 0 ? 0n : n === 1 ? 1n : b;
    const end = performance.now();

    return {
      value: result.toString(),
      timeMs: +(end - start).toFixed(4),
    };
  }
}
