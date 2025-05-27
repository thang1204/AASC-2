// src/game/game.module.ts
import { Module } from '@nestjs/common';
import { GameController } from './game.controller';
import { GameLogicService } from './game.service';

@Module({
  imports: [],
  controllers: [GameController],
  providers: [GameLogicService],
})
export class GameModule {}