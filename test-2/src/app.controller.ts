import { Controller, Get, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { Response } from 'express';
import { join } from 'path';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('hello')
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('register')
  showRegister(@Res() res: Response) {
    return res.sendFile(join(__dirname, '..', 'public', 'register.html'));
  }

  @Get('login')
  showLogin(@Res() res: Response) {
    return res.sendFile(join(__dirname, '..', 'public', 'login.html'));
  }

  @Get('profile')
  showProfile(@Res() res: Response) {
    return res.sendFile(join(__dirname, '..', 'public', 'profile.html'));
  }
}
