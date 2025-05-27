import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';


export enum BallColor {
  RED = 'red',
  GREEN = 'green',
  BLUE = 'blue',
  YELLOW = 'yellow',
  ORANGE = 'orange',
  PURPLE = 'purple',
  CYAN = 'cyan',
}


export interface Ball {
  id: string;
  color: BallColor;
  row: number;
  col: number;
}


export interface BoardState {
  grid: (Ball | null)[][];
  score: number;
}

@Injectable()
export class GameLogicService {
  private board: BoardState;
  private readonly BOARD_SIZE = 9;
  private readonly MIN_LINE_LENGTH = 5;

  constructor() {
    this.initializeBoard();
  }


  private initializeBoard(): void {
    this.board = {
      grid: Array(this.BOARD_SIZE)
        .fill(null)
        .map(() => Array(this.BOARD_SIZE).fill(null)),
      score: 0,
    };
    this.generateRandomBalls(5);
    console.log('[GameLogic] Bàn cờ được khởi tạo với 5 bóng ban đầu.');
  }


  getBoardState(): BoardState {
    return this.board;
  }


  moveBall(startRow: number, startCol: number, targetRow: number, targetCol: number): boolean {
    console.log(`[GameLogic] Yêu cầu di chuyển: từ (${startRow},${startCol}) đến (${targetRow},${targetCol})`);


    if (startRow < 0 || startRow >= this.BOARD_SIZE || startCol < 0 || startCol >= this.BOARD_SIZE ||
        targetRow < 0 || targetRow >= this.BOARD_SIZE || targetCol < 0 || targetCol >= this.BOARD_SIZE) {
        console.error(`[GameLogic ERROR] Tọa độ bắt đầu (${startRow},${startCol}) hoặc kết thúc (${targetRow},${targetCol}) nằm ngoài bàn cờ.`);
        return false;
    }

    const ballToMove = this.board.grid[startRow][startCol];


    if (!ballToMove) {
      console.error(`[GameLogic ERROR] Không có bóng tại vị trí bắt đầu (${startRow},${startCol}).`);
      return false;
    }


    if (this.board.grid[targetRow][targetCol]) {
      console.error(`[GameLogic ERROR] Ô đích (${targetRow},${targetCol}) không trống. Không thể di chuyển.`);
      return false;
    }


    const path = this.findPath(startRow, startCol, targetRow, targetCol);
    if (!path) {
      console.error(`[GameLogic ERROR] Không có đường đi hợp lệ từ (${startRow},${startCol}) đến (${targetRow},${targetCol}).`);
      return false;
    }
    console.log(`[GameLogic INFO] Đường đi tìm thấy:`, path.map(p => `(${p.row},${p.col})`).join(' -> '));



    ballToMove.row = targetRow;
    ballToMove.col = targetCol;

    this.board.grid[targetRow][targetCol] = ballToMove;

    this.board.grid[startRow][startCol] = null;

    console.log(`[GameLogic INFO] Bóng đã được di chuyển thực sự trên backend.`);


    const linesCleared = this.checkForLines();
    if (linesCleared) {
      console.log('[GameLogic INFO] Đã dọn dẹp các hàng bóng.');
    }


    if (!linesCleared) {
      this.generateRandomBalls(3);
      console.log('[GameLogic INFO] Đã sinh thêm 3 bóng mới.');
    } else {
        console.log('[GameLogic INFO] Không sinh bóng mới vì có hàng bị dọn dẹp.');
    }

    return true;
  }




  private findPath(startRow: number, startCol: number, endRow: number, endCol: number): { row: number, col: number }[] | null {
    console.log(`[Pathfinding] Bắt đầu tìm đường đi từ (${startRow},${startCol}) đến (${endRow},${endCol})...`);
    const queue: { row: number, col: number, path: { row: number, col: number }[] }[] = [];
    const visited = new Set<string>();

    queue.push({ row: startRow, col: startCol, path: [{ row: startRow, col: startCol }] });
    visited.add(`${startRow},${startCol}`);


    const directions = [
      { dr: -1, dc: 0 },
      { dr: 1, dc: 0 },
      { dr: 0, dc: -1 },
      { dr: 0, dc: 1 },
    ];

    while (queue.length > 0) {
      const current = queue.shift();
      if (!current) continue;

      const { row, col, path } = current;


      if (row === endRow && col === endCol) {
        console.log(`[Pathfinding INFO] Đã tìm thấy đường đi kết thúc tại (${row},${col}).`);
        return path;
      }


      for (const dir of directions) {
        const newRow = row + dir.dr;
        const newCol = col + dir.dc;
        const newPosKey = `${newRow},${newCol}`;


        if (
          newRow >= 0 && newRow < this.BOARD_SIZE &&
          newCol >= 0 && newCol < this.BOARD_SIZE &&
          !visited.has(newPosKey)
        ) {

          if (this.board.grid[newRow][newCol] === null || (newRow === endRow && newCol === endCol)) {
            visited.add(newPosKey);

            queue.push({ row: newRow, col: newCol, path: [...path, { row: newRow, col: newCol }] });
          } else {

          }
        }
      }
    }
    console.error('[Pathfinding ERROR] Không tìm thấy đường đi khả dụng.');
    return null;
  }




  private checkForLines(): boolean {
    let linesRemoved = false;
    const ballsToRemove = new Set<string>();


    const checkDirection = (r: number, c: number, dr: number, dc: number, board: BoardState) => {
      const currentBall = board.grid[r][c];
      if (!currentBall) return;

      const line: { row: number, col: number }[] = [{ row: r, col: c }];

      for (let i = 1; i < this.BOARD_SIZE; i++) {
        const nextR = r + i * dr;
        const nextC = c + i * dc;


        if (
          nextR >= 0 && nextR < this.BOARD_SIZE &&
          nextC >= 0 && nextC < this.BOARD_SIZE &&
          board.grid[nextR][nextC]?.color === currentBall.color
        ) {
          line.push({ row: nextR, col: nextC });
        } else {
          break;
        }
      }


      if (line.length >= this.MIN_LINE_LENGTH) {
        line.forEach(pos => ballsToRemove.add(`${pos.row},${pos.col}`));
        linesRemoved = true;
      }
    };


    for (let r = 0; r < this.BOARD_SIZE; r++) {
      for (let c = 0; c < this.BOARD_SIZE; c++) {
        if (this.board.grid[r][c]) {

          checkDirection(r, c, 0, 1, this.board);

          checkDirection(r, c, 1, 0, this.board);

          checkDirection(r, c, 1, 1, this.board);

          checkDirection(r, c, 1, -1, this.board);
        }
      }
    }


    if (ballsToRemove.size > 0) {
        console.log(`[GameLogic INFO] Đang xóa ${ballsToRemove.size} bóng.`);
        ballsToRemove.forEach(posKey => {
          const [row, col] = posKey.split(',').map(Number);
          this.board.grid[row][col] = null;
        });
    }
    return linesRemoved;
  }



  private generateRandomBalls(count: number): void {
    const availableCells: { row: number, col: number }[] = [];
    for (let r = 0; r < this.BOARD_SIZE; r++) {
      for (let c = 0; c < this.BOARD_SIZE; c++) {
        if (this.board.grid[r][c] === null) {
          availableCells.push({ row: r, col: c });
        }
      }
    }

    const colors = Object.values(BallColor);

    for (let i = 0; i < count; i++) {
      if (availableCells.length === 0) {
        console.log('[GameLogic INFO] Không còn ô trống để sinh bóng mới.');
        break;
      }

      const randomIndex = Math.floor(Math.random() * availableCells.length);
      const { row, col } = availableCells.splice(randomIndex, 1)[0];

      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      const newBall: Ball = {
        id: uuidv4(),
        color: randomColor,
        row: row,
        col: col,
      };
      this.board.grid[row][col] = newBall;
      console.log(`[GameLogic INFO] Sinh bóng mới: ${randomColor} tại (${row},${col})`);
    }
  }


  getHelpfulMove(): { start: { row: number, col: number }, target: { row: number, col: number } } | null {
    console.log('[AI Help] Đang tìm kiếm nước đi trợ giúp...');
    const allPossibleMoves: { start: { row: number, col: number }, target: { row: number, col: number } }[] = [];


    for (let r = 0; r < this.BOARD_SIZE; r++) {
      for (let c = 0; c < this.BOARD_SIZE; c++) {
        const ball = this.board.grid[r][c];
        if (ball) {

          for (let tr = 0; tr < this.BOARD_SIZE; tr++) {
            for (let tc = 0; tc < this.BOARD_SIZE; tc++) {

              if (this.board.grid[tr][tc] === null) {


                const path = this.findPathOnTempBoard(this.board, r, c, tr, tc);
                if (path) {
                  allPossibleMoves.push({ start: { row: r, col: c }, target: { row: tr, col: tc } });
                }
              }
            }
          }
        }
      }
    }


    for (const move of allPossibleMoves) {

        const simulatedBoard: BoardState = JSON.parse(JSON.stringify(this.board));
        const ballToSimulate = simulatedBoard.grid[move.start.row][move.start.col];


        if (!ballToSimulate) continue;


        ballToSimulate.row = move.target.row;
        ballToSimulate.col = move.target.col;
        simulatedBoard.grid[move.target.row][move.target.col] = ballToSimulate;
        simulatedBoard.grid[move.start.row][move.start.col] = null;


        if (this.checkForLinesOnTempBoard(simulatedBoard)) {
            console.log(`[AI Help INFO] Tìm thấy nước đi tối ưu (tạo hàng nổ): từ (${move.start.row},${move.start.col}) đến (${move.target.row},${move.target.col})`);
            return move;
        }
    }


    if (allPossibleMoves.length > 0) {
        const randomIndex = Math.floor(Math.random() * allPossibleMoves.length);
        const randomMove = allPossibleMoves[randomIndex];
        console.log(`[AI Help INFO] Không có nước đi tạo hàng nổ ngay lập tức, gợi ý nước đi ngẫu nhiên: từ (${randomMove.start.row},${randomMove.start.col}) đến (${randomMove.target.row},${randomMove.target.col})`);
        return randomMove;
    }

    console.log('[AI Help INFO] Không có nước đi khả dụng nào.');
    return null;
  }

  private findPathOnTempBoard(tempBoard: BoardState, startRow: number, startCol: number, endRow: number, endCol: number): { row: number, col: number }[] | null {


    const queue: { row: number, col: number, path: { row: number, col: number }[] }[] = [];
    const visited = new Set<string>();

    queue.push({ row: startRow, col: startCol, path: [{ row: startRow, col: startCol }] });
    visited.add(`${startRow},${startCol}`);

    const directions = [
      { dr: -1, dc: 0 },
      { dr: 1, dc: 0 },
      { dr: 0, dc: -1 },
      { dr: 0, dc: 1 },
    ];

    while (queue.length > 0) {
      const current = queue.shift();
      if (!current) continue;

      const { row, col, path } = current;

      if (row === endRow && col === endCol) {

        return path;
      }

      for (const dir of directions) {
        const newRow = row + dir.dr;
        const newCol = col + dir.dc;
        const newPosKey = `${newRow},${newCol}`;

        if (
          newRow >= 0 && newRow < this.BOARD_SIZE &&
          newCol >= 0 && newCol < this.BOARD_SIZE &&
          !visited.has(newPosKey)
        ) {

          if (tempBoard.grid[newRow][newCol] === null || (newRow === endRow && newCol === endCol)) {
            visited.add(newPosKey);
            queue.push({ row: newRow, col: newCol, path: [...path, { row: newRow, col: newCol }] });
          }
        }
      }
    }

    return null;
  }


  private checkForLinesOnTempBoard(tempBoard: BoardState): boolean {
    let linesFormed = false;

    const checkDirection = (r: number, c: number, dr: number, dc: number, board: BoardState) => {
      const currentBall = board.grid[r][c];
      if (!currentBall) return;

      const line: { row: number, col: number }[] = [{ row: r, col: c }];
      for (let i = 1; i < this.BOARD_SIZE; i++) {
        const nextR = r + i * dr;
        const nextC = c + i * dc;
        if (
          nextR >= 0 && nextR < this.BOARD_SIZE &&
          nextC >= 0 && nextC < this.BOARD_SIZE &&
          board.grid[nextR][nextC]?.color === currentBall.color
        ) {
          line.push({ row: nextR, col: nextC });
        } else {
          break;
        }
      }
      if (line.length >= this.MIN_LINE_LENGTH) {
        linesFormed = true;
      }
    };

    for (let r = 0; r < this.BOARD_SIZE; r++) {
      for (let c = 0; c < this.BOARD_SIZE; c++) {
        if (tempBoard.grid[r][c]) {

          checkDirection(r, c, 0, 1, tempBoard);

          checkDirection(r, c, 1, 0, tempBoard);

          checkDirection(r, c, 1, 1, tempBoard);

          checkDirection(r, c, 1, -1, tempBoard);
        }
      }
    }
    return linesFormed;
  }
}