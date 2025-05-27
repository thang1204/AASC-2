const BOARD_SIZE = 10;
const WIN_LENGTH = 5;

const boardElement = document.getElementById('game-board');
const statusElement = document.getElementById('status');
const restartButton = document.getElementById('restart-button');

let board = [];
let currentPlayer = 'X';
let gameActive = true;

function createBoard() {
    boardElement.innerHTML = '';
    board = [];
    for (let row = 0; row < BOARD_SIZE; row++) {
        const rowArr = [];
        for (let col = 0; col < BOARD_SIZE; col++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.dataset.row = row;
            cell.dataset.col = col;
            cell.addEventListener('click', handleCellClick);
            boardElement.appendChild(cell);
            rowArr.push('');
        }
        board.push(rowArr);
    }
    boardElement.style.gridTemplateRows = `repeat(${BOARD_SIZE}, 1fr)`;
    boardElement.style.gridTemplateColumns = `repeat(${BOARD_SIZE}, 1fr)`;
}

function handleCellClick(e) {
    if (!gameActive) return;
    const row = parseInt(e.target.dataset.row);
    const col = parseInt(e.target.dataset.col);
    if (board[row][col] !== '') return;

    board[row][col] = currentPlayer;
    e.target.textContent = currentPlayer;
    e.target.classList.add(currentPlayer.toLowerCase());

    if (checkWin(row, col, currentPlayer)) {
        statusElement.textContent = `Người chơi ${currentPlayer} thắng!`;
        gameActive = false;
        return;
    }

    if (isBoardFull()) {
        statusElement.textContent = 'Hòa!';
        gameActive = false;
        return;
    }

    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    statusElement.textContent = `Người chơi hiện tại: ${currentPlayer}`;
}

function isBoardFull() {
    for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
            if (board[row][col] === '') return false;
        }
    }
    return true;
}

function checkWin(row, col, player) {
    const directions = [
        [0, 1],
        [1, 0],
        [1, 1],
        [1, -1],
    ];

    for (let [dr, dc] of directions) {
        let count = 1;

        let r = row + dr, c = col + dc;
        while (isValid(r, c) && board[r][c] === player) {
            count++;
            r += dr;
            c += dc;
        }

        r = row - dr;
        c = col - dc;
        while (isValid(r, c) && board[r][c] === player) {
            count++;
            r -= dr;
            c -= dc;
        }

        if (count >= WIN_LENGTH) return true;
    }
    return false;
}

function isValid(row, col) {
    return row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE;
}

function restartGame() {
    currentPlayer = 'X';
    gameActive = true;
    statusElement.textContent = `Người chơi hiện tại: ${currentPlayer}`;
    createBoard();
}

restartButton.addEventListener('click', restartGame);

createBoard();
