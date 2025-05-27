const BACKEND_URL = 'http://localhost:3000';
const gameBoard = document.getElementById('game-board');
const helpButton = document.getElementById('help-button');
const BOARD_SIZE = 9;
const CELL_SIZE = 50;

let currentBoardState = null;
let selectedBall = null;

async function fetchBoardState() {
    try {
        const response = await fetch(`${BACKEND_URL}/game/state`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        currentBoardState = await response.json();
        renderBoard(currentBoardState);
        console.log('Trạng thái bàn cờ đã được cập nhật:', currentBoardState);
    } catch (error) {
        console.error('Lỗi khi lấy trạng thái bàn cờ:', error);
    }
}

async function makeMove(startRow, startCol, targetRow, targetCol) {
    try {
        console.log(`Đang gửi yêu cầu di chuyển: từ (<span class="math-inline">\{startRow\},</span>{startCol}) đến (<span class="math-inline">\{targetRow\},</span>{targetCol})`);
        const response = await fetch(`${BACKEND_URL}/game/move`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ startRow, startCol, targetRow, targetCol }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        if (result.status === 'success') {
            await animateBallMovement(startRow, startCol, targetRow, targetCol);
            currentBoardState = result.newState;
            renderBoard(currentBoardState);
            console.log('Di chuyển thành công, trạng thái mới:', currentBoardState);
        } else {
            console.warn('Di chuyển không hợp lệ:', result.status, result.newState);
            currentBoardState = result.newState;
            renderBoard(currentBoardState);
        }
    } catch (error) {
        console.error('Lỗi khi thực hiện di chuyển:', error);
    } finally {
        clearSelection();
    }
}

async function getHelpfulMove() {
    try {
        console.log('Đang yêu cầu gợi ý từ AI...');
        const response = await fetch(`${BACKEND_URL}/game/help`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        if (result.status === 'success' && result.recommendedMove) {
            const { start, target } = result.recommendedMove;
            console.log(`AI gợi ý: Di chuyển bóng từ (<span class="math-inline">\{start\.row\},</span>{start.col}) đến (<span class="math-inline">\{target\.row\},</span>{target.col})`);

            const ballElement = document.querySelector(`.ball[data-row="<span class="math-inline">\{start\.row\}"\]\[data\-col\="</span>{start.col}"]`);
            if (ballElement) {
                ballElement.classList.add('selected');
            }
            const targetCell = document.querySelector(`.cell[data-row="<span class="math-inline">\{target\.row\}"\]\[data\-col\="</span>{target.col}"]`);
            if (targetCell) {
                targetCell.classList.add('target-highlight');
            }

            setTimeout(() => {
                if (ballElement) ballElement.classList.remove('selected');
                if (targetCell) targetCell.classList.remove('target-highlight');
                makeMove(start.row, start.col, target.row, target.col);
            }, 1000);
        } else {
            console.log('Không có gợi ý di chuyển nào từ AI.');
        }
    } catch (error) {
        console.error('Lỗi khi lấy gợi ý di chuyển:', error);
    }
}

function renderBoard(boardState) {
    gameBoard.innerHTML = '';
    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.dataset.row = r;
            cell.dataset.col = c;

            const ball = boardState.grid[r][c];
            if (ball) {
                const ballElement = document.createElement('div');
                ballElement.classList.add('ball', ball.color);
                ballElement.dataset.id = ball.id;
                ballElement.dataset.row = r;
                ballElement.dataset.col = c;
                ballElement.style.transform = `translate(${c * CELL_SIZE}px, ${r * CELL_SIZE}px)`;
                ballElement.style.transition = 'none';
                cell.appendChild(ballElement);
            }
            gameBoard.appendChild(cell);
        }
    }
    addEventListenersToCells();
}

function addEventListenersToCells() {
    document.querySelectorAll('.cell').forEach(cell => {
        cell.addEventListener('click', handleCellClick);
    });
}

function handleCellClick(event) {
    const clickedRow = parseInt(event.currentTarget.dataset.row);
    const clickedCol = parseInt(event.currentTarget.dataset.col);
    const clickedBallElement = event.currentTarget.querySelector('.ball');

    if (selectedBall) {
        if (selectedBall.row === clickedRow && selectedBall.col === clickedCol) {
            console.log('Bỏ chọn bóng.');
            clearSelection();
        } else if (clickedBallElement) {
            console.log(`Thay đổi bóng được chọn từ (<span class="math-inline">\{selectedBall\.row\},</span>{selectedBall.col}) sang (<span class="math-inline">\{clickedRow\},</span>{clickedCol}).`);
            clearSelection();
            selectBall(clickedRow, clickedCol, clickedBallElement);
        } else {
            console.log(`Di chuyển bóng từ (<span class="math-inline">\{selectedBall\.row\},</span>{selectedBall.col}) đến ô trống (<span class="math-inline">\{clickedRow\},</span>{clickedCol}).`);
            makeMove(selectedBall.row, selectedBall.col, clickedRow, clickedCol);
        }
    } else {
        if (clickedBallElement) {
            console.log(`Chọn bóng tại (<span class="math-inline">\{clickedRow\},</span>{clickedCol}).`);
            selectBall(clickedRow, clickedCol, clickedBallElement);
        }
    }
}

function selectBall(row, col, element) {
    clearSelection();
    selectedBall = { row, col, element };
    element.classList.add('selected');
}

function clearSelection() {
    if (selectedBall) {
        selectedBall.element.classList.remove('selected');
        selectedBall = null;
    }
    document.querySelectorAll('.cell.target-highlight').forEach(cell => {
        cell.classList.remove('target-highlight');
    });
}

function animateBallMovement(startRow, startCol, targetRow, targetCol) {
    return new Promise(resolve => {
        const ballElement = document.querySelector(`.ball[data-row="<span class="math-inline">\{startRow\}"\]\[data\-col\="</span>{startCol}"]`);

        if (!ballElement) {
            console.error('Không tìm thấy bóng để animate di chuyển!');
            resolve();
            return;
        }

        ballElement.style.transition = 'transform 0.3s ease-out';

        const targetX = targetCol * CELL_SIZE;
        const targetY = targetRow * CELL_SIZE;

        ballElement.style.transform = `translate(${targetX}px, ${targetY}px)`;

        const onTransitionEnd = () => {
            ballElement.removeEventListener('transitionend', onTransitionEnd);
            ballElement.dataset.row = targetRow;
            ballElement.dataset.col = targetCol;
            ballElement.style.transition = 'none';
            resolve();
        };

        ballElement.addEventListener('transitionend', onTransitionEnd);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    fetchBoardState();
    helpButton.addEventListener('click', getHelpfulMove);
});