import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FibonacciController } from './fibonacci/fibonacci.controller';
import { FibonacciService } from './fibonacci/fibonacci.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { User } from './users/user.entity';
import { AuthModule } from './auth/auth.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { GameLogicService } from './game/game.service';
import { GameController } from './game/game.controller';
import { GameModule } from './game/game.module';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
    }),
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'db.sqlite',
      entities: [User],
      synchronize: true,
    }),
    UsersModule,
    AuthModule,
    GameModule
  ],
  controllers: [AppController, FibonacciController, GameController],
  providers: [AppService, FibonacciService, GameLogicService],
})
export class AppModule {}
