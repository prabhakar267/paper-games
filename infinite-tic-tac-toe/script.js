class InfiniteTicTacToeGame {
    constructor() {
        this.board = new Map(); // Use Map for infinite grid: "row,col" -> symbol
        this.currentPlayer = 'X';
        this.gameMode = 'human-vs-human';
        this.playerSymbol = 'X';
        this.gameActive = false;
        this.moveCount = 0;
        this.lastMove = null;
        
        // Board display properties
        this.gridSize = 15; // Visible grid size (15x15)
        this.centerRow = 7; // Center of visible grid
        this.centerCol = 7;
        this.zoomLevel = 3; // Default zoom level (1-5)
        this.boardOffset = { x: 0, y: 0 }; // For panning
        
        // Dragging properties
        this.isDragging = false;
        this.dragStart = { x: 0, y: 0 };
        this.dragOffset = { x: 0, y: 0 };
        
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // Setup phase
        document.getElementById('startGame').addEventListener('click', () => this.startGame());
        document.getElementById('resetGame').addEventListener('click', () => this.resetGame());
        document.getElementById('backToSetup').addEventListener('click', () => this.backToSetup());
        
        // Board controls
        document.getElementById('zoomIn').addEventListener('click', () => this.zoomIn());
        document.getElementById('zoomOut').addEventListener('click', () => this.zoomOut());
        document.getElementById('centerBoard').addEventListener('click', () => this.centerBoard());
        
        // Board dragging
        const boardWrapper = document.getElementById('gameBoardWrapper');
        boardWrapper.addEventListener('mousedown', (e) => this.startDrag(e));
        boardWrapper.addEventListener('mousemove', (e) => this.drag(e));
        boardWrapper.addEventListener('mouseup', () => this.endDrag());
        boardWrapper.addEventListener('mouseleave', () => this.endDrag());
        
        // Touch events for mobile
        boardWrapper.addEventListener('touchstart', (e) => this.startDrag(e.touches[0]));
        boardWrapper.addEventListener('touchmove', (e) => {
            e.preventDefault();
            this.drag(e.touches[0]);
        });
        boardWrapper.addEventListener('touchend', () => this.endDrag());
    }

    startGame() {
        // Get selected game mode and player symbol
        this.gameMode = document.querySelector('input[name="gameMode"]:checked').value;
        this.playerSymbol = document.querySelector('input[name="playerSymbol"]:checked').value;
        
        // Initialize game state
        this.board = new Map();
        this.currentPlayer = 'X';
        this.gameActive = true;
        this.moveCount = 0;
        this.lastMove = null;
        this.boardOffset = { x: 0, y: 0 };
        
        // Show game area and hide setup
        document.getElementById('gameSetup').style.display = 'none';
        document.getElementById('gameArea').style.display = 'block';
        
        // Create the game board
        this.createBoard();
        this.updateUI();
        
        // If AI goes first (when player is O and AI is X)
        if (this.gameMode !== 'human-vs-human' && this.playerSymbol === 'O') {
            setTimeout(() => this.makeAIMove(), 500);
        }
    }

    createBoard() {
        const gameBoard = document.getElementById('gameBoard');
        gameBoard.innerHTML = '';
        gameBoard.className = `game-board zoom-${this.zoomLevel}`;
        gameBoard.style.gridTemplateColumns = `repeat(${this.gridSize}, 1fr)`;
        gameBoard.style.gridTemplateRows = `repeat(${this.gridSize}, 1fr)`;
        
        // Calculate the range of cells to display
        const startRow = this.centerRow - Math.floor(this.gridSize / 2);
        const startCol = this.centerCol - Math.floor(this.gridSize / 2);
        
        for (let row = startRow; row < startRow + this.gridSize; row++) {
            for (let col = startCol; col < startCol + this.gridSize; col++) {
                const cell = document.createElement('button');
                cell.className = 'cell';
                cell.dataset.row = row;
                cell.dataset.col = col;
                
                const key = `${row},${col}`;
                const symbol = this.board.get(key);
                
                if (symbol) {
                    cell.textContent = symbol;
                    cell.classList.add('occupied', symbol.toLowerCase());
                }
                
                // Check if this is the last move
                if (this.lastMove && this.lastMove.row === row && this.lastMove.col === col) {
                    cell.classList.add('last-move');
                }
                
                cell.addEventListener('click', () => this.handleCellClick(row, col));
                gameBoard.appendChild(cell);
            }
        }
        
        // Apply board offset for panning
        this.applyBoardTransform();
    }

    applyBoardTransform() {
        const gameBoard = document.getElementById('gameBoard');
        gameBoard.style.transform = `translate(calc(-50% + ${this.boardOffset.x}px), calc(-50% + ${this.boardOffset.y}px))`;
    }

    handleCellClick(row, col) {
        if (!this.gameActive) return;
        
        const key = `${row},${col}`;
        if (this.board.has(key)) return; // Cell already occupied
        
        // Check if it's human player's turn
        if (this.gameMode !== 'human-vs-human') {
            const isHumanTurn = this.currentPlayer === this.playerSymbol;
            if (!isHumanTurn) return;
        }
        
        this.makeMove(row, col, this.currentPlayer);
    }

    makeMove(row, col, symbol) {
        const key = `${row},${col}`;
        this.board.set(key, symbol);
        this.moveCount++;
        this.lastMove = { row, col };
        
        // Update the visual board
        this.updateCellDisplay(row, col, symbol);
        
        // Check for win condition
        const winner = this.checkWinCondition(row, col, symbol);
        if (winner) {
            this.endGame(winner);
            return;
        }
        
        // Switch players
        this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
        this.updateUI();
        
        // Expand board if needed (when move is near edge)
        this.expandBoardIfNeeded(row, col);
        
        // Make AI move if needed
        if (this.gameMode !== 'human-vs-human') {
            const isAITurn = this.currentPlayer !== this.playerSymbol;
            if (isAITurn) {
                setTimeout(() => this.makeAIMove(), 500);
            }
        }
    }

    updateCellDisplay(row, col, symbol) {
        const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        if (cell) {
            cell.textContent = symbol;
            cell.classList.add('occupied', symbol.toLowerCase());
            
            // Remove last-move class from previous move
            const prevLastMove = document.querySelector('.cell.last-move');
            if (prevLastMove) {
                prevLastMove.classList.remove('last-move');
            }
            
            // Add last-move class to current move
            cell.classList.add('last-move');
        }
    }

    expandBoardIfNeeded(row, col) {
        const startRow = this.centerRow - Math.floor(this.gridSize / 2);
        const endRow = startRow + this.gridSize - 1;
        const startCol = this.centerCol - Math.floor(this.gridSize / 2);
        const endCol = startCol + this.gridSize - 1;
        
        let needsExpansion = false;
        
        // Check if move is near the edges and expand accordingly
        if (row <= startRow + 2) {
            this.centerRow -= 3;
            needsExpansion = true;
        } else if (row >= endRow - 2) {
            this.centerRow += 3;
            needsExpansion = true;
        }
        
        if (col <= startCol + 2) {
            this.centerCol -= 3;
            needsExpansion = true;
        } else if (col >= endCol - 2) {
            this.centerCol += 3;
            needsExpansion = true;
        }
        
        if (needsExpansion) {
            this.createBoard();
        }
    }

    makeAIMove() {
        if (!this.gameActive) return;
        
        let move;
        if (this.gameMode === 'human-vs-ai-smart') {
            move = this.getSmartAIMove();
        } else {
            move = this.getRandomAIMove();
        }
        
        if (move) {
            this.makeMove(move.row, move.col, this.currentPlayer);
        }
    }

    getRandomAIMove() {
        // Get all empty cells near existing moves
        const emptyCells = this.getNearbyEmptyCells();
        
        if (emptyCells.length === 0) {
            // If no nearby cells, play near center
            return { row: 0, col: 0 };
        }
        
        const randomIndex = Math.floor(Math.random() * emptyCells.length);
        return emptyCells[randomIndex];
    }

    getSmartAIMove() {
        const aiSymbol = this.currentPlayer;
        const opponentSymbol = aiSymbol === 'X' ? 'O' : 'X';
        
        // 1. Check for immediate wins
        const winMove = this.findWinningMove(aiSymbol);
        if (winMove) return winMove;
        
        // 2. Block opponent wins
        const blockMove = this.findWinningMove(opponentSymbol);
        if (blockMove) return blockMove;
        
        // 3. Create multiple threats
        const threatMove = this.findBestThreatMove(aiSymbol);
        if (threatMove) return threatMove;
        
        // 4. Block opponent threats
        const blockThreatMove = this.findBestBlockMove(opponentSymbol);
        if (blockThreatMove) return blockThreatMove;
        
        // 5. Strategic positioning
        const strategicMove = this.findStrategicMove(aiSymbol);
        if (strategicMove) return strategicMove;
        
        // 6. Fallback to random
        return this.getRandomAIMove();
    }

    findWinningMove(symbol) {
        const candidates = this.getNearbyEmptyCells();
        
        for (const { row, col } of candidates) {
            if (this.wouldWin(row, col, symbol)) {
                return { row, col };
            }
        }
        
        return null;
    }

    findBestThreatMove(symbol) {
        const candidates = this.getNearbyEmptyCells();
        let bestMove = null;
        let bestScore = 0;
        
        for (const { row, col } of candidates) {
            const score = this.evaluateThreatMove(row, col, symbol);
            if (score > bestScore) {
                bestScore = score;
                bestMove = { row, col };
            }
        }
        
        return bestMove;
    }

    findBestBlockMove(opponentSymbol) {
        const candidates = this.getNearbyEmptyCells();
        let bestMove = null;
        let bestScore = 0;
        
        for (const { row, col } of candidates) {
            const score = this.evaluateBlockMove(row, col, opponentSymbol);
            if (score > bestScore) {
                bestScore = score;
                bestMove = { row, col };
            }
        }
        
        return bestMove;
    }

    findStrategicMove(symbol) {
        const candidates = this.getNearbyEmptyCells();
        let bestMove = null;
        let bestScore = 0;
        
        for (const { row, col } of candidates) {
            const score = this.evaluatePosition(row, col, symbol);
            if (score > bestScore) {
                bestScore = score;
                bestMove = { row, col };
            }
        }
        
        return bestMove;
    }

    evaluateThreatMove(row, col, symbol) {
        let score = 0;
        const directions = [
            [0, 1], [1, 0], [1, 1], [1, -1] // horizontal, vertical, diagonal
        ];
        
        for (const [dx, dy] of directions) {
            const lineScore = this.evaluateLineDirection(row, col, dx, dy, symbol);
            score += lineScore;
            
            // Bonus for creating multiple threats
            if (lineScore >= 3) {
                score += 10;
            }
        }
        
        return score;
    }

    evaluateBlockMove(row, col, opponentSymbol) {
        let score = 0;
        const directions = [
            [0, 1], [1, 0], [1, 1], [1, -1]
        ];
        
        for (const [dx, dy] of directions) {
            const threatLevel = this.evaluateOpponentThreat(row, col, dx, dy, opponentSymbol);
            score += threatLevel;
        }
        
        return score;
    }

    evaluatePosition(row, col, symbol) {
        let score = 0;
        const directions = [
            [0, 1], [1, 0], [1, 1], [1, -1]
        ];
        
        for (const [dx, dy] of directions) {
            score += this.evaluateLineDirection(row, col, dx, dy, symbol);
        }
        
        // Bonus for central positions
        const distanceFromCenter = Math.abs(row) + Math.abs(col);
        score += Math.max(0, 10 - distanceFromCenter);
        
        return score;
    }

    evaluateLineDirection(row, col, dx, dy, symbol) {
        let count = 1; // Count the placed symbol
        let openEnds = 0;
        
        // Check positive direction
        let blocked = false;
        for (let i = 1; i < 5; i++) {
            const newRow = row + dx * i;
            const newCol = col + dy * i;
            const key = `${newRow},${newCol}`;
            
            if (this.board.has(key)) {
                if (this.board.get(key) === symbol) {
                    count++;
                } else {
                    blocked = true;
                    break;
                }
            } else {
                if (!blocked) openEnds++;
                break;
            }
        }
        
        // Check negative direction
        blocked = false;
        for (let i = 1; i < 5; i++) {
            const newRow = row - dx * i;
            const newCol = col - dy * i;
            const key = `${newRow},${newCol}`;
            
            if (this.board.has(key)) {
                if (this.board.get(key) === symbol) {
                    count++;
                } else {
                    blocked = true;
                    break;
                }
            } else {
                if (!blocked) openEnds++;
                break;
            }
        }
        
        // Score based on count and open ends
        let score = count * count;
        if (openEnds >= 2) score *= 2; // Open line bonus
        if (count >= 3) score *= 3; // Long sequence bonus
        
        return score;
    }

    evaluateOpponentThreat(row, col, dx, dy, opponentSymbol) {
        let maxThreat = 0;
        
        // Check if blocking this position prevents a threat
        for (let dir of [1, -1]) {
            let count = 0;
            let openEnds = 0;
            
            for (let i = 1; i < 5; i++) {
                const newRow = row + dx * i * dir;
                const newCol = col + dy * i * dir;
                const key = `${newRow},${newCol}`;
                
                if (this.board.has(key)) {
                    if (this.board.get(key) === opponentSymbol) {
                        count++;
                    } else {
                        break;
                    }
                } else {
                    openEnds++;
                    break;
                }
            }
            
            if (count >= 2 && openEnds > 0) {
                maxThreat = Math.max(maxThreat, count * count);
            }
        }
        
        return maxThreat;
    }

    getNearbyEmptyCells() {
        const emptyCells = [];
        const checked = new Set();
        
        // If no moves yet, start from center
        if (this.board.size === 0) {
            return [{ row: 0, col: 0 }];
        }
        
        // Get all occupied positions
        for (const [key] of this.board) {
            const [row, col] = key.split(',').map(Number);
            
            // Check all adjacent positions (including diagonals)
            for (let dr = -2; dr <= 2; dr++) {
                for (let dc = -2; dc <= 2; dc++) {
                    if (dr === 0 && dc === 0) continue;
                    
                    const newRow = row + dr;
                    const newCol = col + dc;
                    const newKey = `${newRow},${newCol}`;
                    
                    if (!this.board.has(newKey) && !checked.has(newKey)) {
                        emptyCells.push({ row: newRow, col: newCol });
                        checked.add(newKey);
                    }
                }
            }
        }
        
        return emptyCells;
    }

    wouldWin(row, col, symbol) {
        const directions = [
            [0, 1], [1, 0], [1, 1], [1, -1]
        ];
        
        for (const [dx, dy] of directions) {
            let count = 1; // Count the placed symbol
            
            // Check positive direction
            for (let i = 1; i < 5; i++) {
                const newRow = row + dx * i;
                const newCol = col + dy * i;
                const key = `${newRow},${newCol}`;
                
                if (this.board.has(key) && this.board.get(key) === symbol) {
                    count++;
                } else {
                    break;
                }
            }
            
            // Check negative direction
            for (let i = 1; i < 5; i++) {
                const newRow = row - dx * i;
                const newCol = col - dy * i;
                const key = `${newRow},${newCol}`;
                
                if (this.board.has(key) && this.board.get(key) === symbol) {
                    count++;
                } else {
                    break;
                }
            }
            
            if (count >= 5) {
                return true;
            }
        }
        
        return false;
    }

    checkWinCondition(row, col, symbol) {
        const directions = [
            [0, 1], [1, 0], [1, 1], [1, -1]
        ];
        
        for (const [dx, dy] of directions) {
            let count = 1;
            const winningCells = [{ row, col }];
            
            // Check positive direction
            for (let i = 1; i < 5; i++) {
                const newRow = row + dx * i;
                const newCol = col + dy * i;
                const key = `${newRow},${newCol}`;
                
                if (this.board.has(key) && this.board.get(key) === symbol) {
                    count++;
                    winningCells.push({ row: newRow, col: newCol });
                } else {
                    break;
                }
            }
            
            // Check negative direction
            for (let i = 1; i < 5; i++) {
                const newRow = row - dx * i;
                const newCol = col - dy * i;
                const key = `${newRow},${newCol}`;
                
                if (this.board.has(key) && this.board.get(key) === symbol) {
                    count++;
                    winningCells.unshift({ row: newRow, col: newCol });
                } else {
                    break;
                }
            }
            
            if (count >= 5) {
                this.highlightWinningCells(winningCells.slice(0, 5)); // Only highlight first 5
                return symbol;
            }
        }
        
        return null;
    }

    highlightWinningCells(cells) {
        cells.forEach(({ row, col }) => {
            const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
            if (cell) {
                cell.classList.add('winning');
            }
        });
    }

    // Board control methods
    zoomIn() {
        if (this.zoomLevel < 5) {
            this.zoomLevel++;
            this.createBoard();
        }
    }

    zoomOut() {
        if (this.zoomLevel > 1) {
            this.zoomLevel--;
            this.createBoard();
        }
    }

    centerBoard() {
        this.boardOffset = { x: 0, y: 0 };
        
        // Center on the last move if available
        if (this.lastMove) {
            this.centerRow = this.lastMove.row;
            this.centerCol = this.lastMove.col;
        } else {
            this.centerRow = 7;
            this.centerCol = 7;
        }
        
        this.createBoard();
    }

    // Dragging methods
    startDrag(e) {
        this.isDragging = true;
        this.dragStart = { x: e.clientX, y: e.clientY };
        this.dragOffset = { ...this.boardOffset };
    }

    drag(e) {
        if (!this.isDragging) return;
        
        const deltaX = e.clientX - this.dragStart.x;
        const deltaY = e.clientY - this.dragStart.y;
        
        this.boardOffset = {
            x: this.dragOffset.x + deltaX,
            y: this.dragOffset.y + deltaY
        };
        
        this.applyBoardTransform();
    }

    endDrag() {
        this.isDragging = false;
    }

    updateUI() {
        document.getElementById('currentPlayerSymbol').textContent = this.currentPlayer;
        document.getElementById('moveCount').textContent = this.moveCount;
        
        let statusText = '';
        if (this.gameMode === 'human-vs-human') {
            statusText = 'Click on the board to make your move';
        } else {
            const isHumanTurn = this.currentPlayer === this.playerSymbol;
            if (isHumanTurn) {
                statusText = 'Your turn - click on the board';
            } else {
                statusText = 'AI is thinking...';
            }
        }
        
        document.getElementById('gameStatus').textContent = statusText;
    }

    endGame(winner) {
        this.gameActive = false;
        
        let message = '';
        
        if (this.gameMode !== 'human-vs-human') {
            const playerWon = winner === this.playerSymbol;
            
            if (playerWon) {
                message = `🎉 You Win! 🎉<br>You got 5 ${winner}'s in a row!`;
            } else {
                message = `😔 You Lose! 😔<br>AI got 5 ${winner}'s in a row!`;
            }
        } else {
            message = `🎉 ${winner} Wins! 🎉<br>5 in a row achieved!`;
        }
        
        this.showGameOverModal(message);
    }

    showGameOverModal(message) {
        const modal = document.createElement('div');
        modal.className = 'game-over';
        modal.innerHTML = `
            <div class="game-over-content">
                <h2>Game Over!</h2>
                <p>${message}</p>
                <button class="btn-primary" onclick="this.parentElement.parentElement.remove()">Close</button>
            </div>
        `;
        document.body.appendChild(modal);
    }

    resetGame() {
        this.board = new Map();
        this.currentPlayer = 'X';
        this.gameActive = true;
        this.moveCount = 0;
        this.lastMove = null;
        this.boardOffset = { x: 0, y: 0 };
        this.centerRow = 7;
        this.centerCol = 7;
        
        this.createBoard();
        this.updateUI();
        
        // Remove any existing game over modals
        const existingModals = document.querySelectorAll('.game-over');
        existingModals.forEach(modal => modal.remove());
        
        // If AI goes first
        if (this.gameMode !== 'human-vs-human' && this.playerSymbol === 'O') {
            setTimeout(() => this.makeAIMove(), 500);
        }
    }

    backToSetup() {
        document.getElementById('gameArea').style.display = 'none';
        document.getElementById('gameSetup').style.display = 'block';
        
        // Remove any existing game over modals
        const existingModals = document.querySelectorAll('.game-over');
        existingModals.forEach(modal => modal.remove());
    }
}

// Function to toggle collapsible sections
function toggleSection(sectionId) {
    const content = document.getElementById(sectionId + '-content');
    const icon = document.getElementById(sectionId + '-icon');
    
    if (content.classList.contains('collapsed')) {
        content.classList.remove('collapsed');
        icon.classList.remove('collapsed');
        icon.textContent = '▼';
    } else {
        content.classList.add('collapsed');
        icon.classList.add('collapsed');
        icon.textContent = '▶';
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new InfiniteTicTacToeGame();
    
    // Initialize all sections as collapsed by default
    const sections = ['rules', 'strategy'];
    sections.forEach(sectionId => {
        const content = document.getElementById(sectionId + '-content');
        const icon = document.getElementById(sectionId + '-icon');
        
        content.classList.add('collapsed');
        icon.classList.add('collapsed');
        icon.textContent = '▶';
    });
});
