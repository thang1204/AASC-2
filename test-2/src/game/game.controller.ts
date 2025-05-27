// src/game/game.controller.ts
import { Controller, Get, Post, Body } from '@nestjs/common';
import { GameLogicService, BoardState } from './game.service'; // Import BoardState

// DTO (Data Transfer Object) cho yêu cầu di chuyển bóng
class MoveBallDto {
  startRow: number;
  startCol: number;
  targetRow: number;
  targetCol: number;
}

@Controller('game') // Định nghĩa tiền tố cho các route là /game
export class GameController {
  constructor(private readonly gameLogicService: GameLogicService) {}

  /**
   * GET /game/state
   * Lấy trạng thái hiện tại của bàn cờ.
   */
  @Get('state')
  getGameState(): BoardState {
    console.log('[API] Yêu cầu GET /game/state.');
    return this.gameLogicService.getBoardState();
  }

  /**
   * POST /game/move
   * Di chuyển một quả bóng.
   * Body: { startRow: number, startCol: number, targetRow: number, targetCol: number }
   */
  @Post('move')
  makeMove(@Body() moveDto: MoveBallDto): { status: string; newState: BoardState | null } {
    console.log(`[API] Yêu cầu POST /game/move từ (<span class="math-inline">\{moveDto\.startRow\},</span>{moveDto.startCol}) đến (<span class="math-inline">\{moveDto\.targetRow\},</span>{moveDto.targetCol}).`);
    const success = this.gameLogicService.moveBall(
      moveDto.startRow,
      moveDto.startCol,
      moveDto.targetRow,
      moveDto.targetCol,
    );

    if (success) {
      console.log('[API] Di chuyển thành công. Trả về trạng thái mới.');
      return { status: 'success', newState: this.gameLogicService.getBoardState() };
    } else {
      console.warn('[API] Di chuyển không hợp lệ. Trả về trạng thái hiện tại.');
      // Trả về trạng thái game hiện tại ngay cả khi di chuyển không hợp lệ
      return { status: 'invalid_move', newState: this.gameLogicService.getBoardState() };
    }
  }

  /**
   * GET /game/help
   * Nhận một gợi ý di chuyển từ AI.
   */
  @Get('help')
  getHelp(): { status: string; recommendedMove?: { start: { row: number, col: number }, target: { row: number, col: number } } | null } {
    console.log('[API] Yêu cầu GET /game/help.');
    const helpfulMove = this.gameLogicService.getHelpfulMove();
    if (helpfulMove) {
      console.log('[API] AI đã tìm thấy gợi ý di chuyển.');
      return { status: 'success', recommendedMove: helpfulMove };
    } else {
      console.log('[API] AI không tìm thấy gợi ý di chuyển nào.');
      return { status: 'no_suggested_move' };
    }
  }
}