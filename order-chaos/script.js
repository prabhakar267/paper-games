class OrderChaosGame {
    constructor() {
        this.board = Array(6).fill().map(() => Array(6).fill(''));
        this.currentPlayer = 'order';
        this.selectedSymbol = 'X';
        this.gameMode = 'human-vs-human';
        this.playerRole = 'order';
        this.gameActive = false;
        this.moveCount = 0;
        
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // Setup phase
        document.getElementById('startGame').addEventListener('click', () => this.startGame());
        document.getElementById('resetGame').addEventListener('click', () => this.resetGame());
        document.getElementById('backToSetup').addEventListener('click', () => this.backToSetup());
        
        // Symbol selection
        document.getElementById('selectX').addEventListener('click', () => this.selectSymbol('X'));
        document.getElementById('selectO').addEventListener('click', () => this.selectSymbol('O'));
    }

    startGame() {
        // Get selected game mode and player role
        this.gameMode = document.querySelector('input[name="gameMode"]:checked').value;
        this.playerRole = document.querySelector('input[name="playerRole"]:checked').value;
        
        // Initialize game state
        this.board = Array(6).fill().map(() => Array(6).fill(''));
        this.currentPlayer = 'order';
        this.selectedSymbol = 'X';
        this.gameActive = true;
        this.moveCount = 0;
        
        // Show game area and hide setup
        document.getElementById('gameSetup').style.display = 'none';
        document.getElementById('gameArea').style.display = 'block';
        
        // Create the game board
        this.createBoard();
        this.updateUI();
        
        // If AI goes first (when player is Chaos and AI is Order)
        if (this.gameMode !== 'human-vs-human' && this.playerRole === 'chaos') {
            setTimeout(() => this.makeAIMove(), 500);
        }
    }

    createBoard() {
        const gameBoard = document.getElementById('gameBoard');
        gameBoard.innerHTML = '';
        
        for (let row = 0; row < 6; row++) {
            for (let col = 0; col < 6; col++) {
                const cell = document.createElement('button');
                cell.className = 'cell';
                cell.dataset.row = row;
                cell.dataset.col = col;
                cell.addEventListener('click', () => this.handleCellClick(row, col));
                gameBoard.appendChild(cell);
            }
        }
    }

    selectSymbol(symbol) {
        this.selectedSymbol = symbol;
        document.getElementById('selectX').classList.toggle('active', symbol === 'X');
        document.getElementById('selectO').classList.toggle('active', symbol === 'O');
    }

    handleCellClick(row, col) {
        if (!this.gameActive || this.board[row][col] !== '') {
            return;
        }

        // Check if it's human player's turn
        if (this.gameMode !== 'human-vs-human') {
            const isHumanTurn = (this.playerRole === 'order' && this.currentPlayer === 'order') ||
                               (this.playerRole === 'chaos' && this.currentPlayer === 'chaos');
            if (!isHumanTurn) {
                return;
            }
        }

        this.makeMove(row, col, this.selectedSymbol);
    }

    makeMove(row, col, symbol) {
        this.board[row][col] = symbol;
        this.moveCount++;
        
        // Update the visual board
        const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        cell.textContent = symbol;
        cell.classList.add('occupied', symbol.toLowerCase());
        
        // Check for win condition
        const winner = this.checkWinCondition();
        if (winner) {
            this.endGame(winner);
            return;
        }
        
        // Check for draw (board full)
        if (this.moveCount === 36) {
            this.endGame('chaos'); // Chaos wins if board is full without 5 in a row
            return;
        }
        
        // Switch players
        this.currentPlayer = this.currentPlayer === 'order' ? 'chaos' : 'order';
        this.updateUI();
        
        // Make AI move if needed
        if (this.gameMode !== 'human-vs-human') {
            const isAITurn = (this.playerRole === 'order' && this.currentPlayer === 'chaos') ||
                            (this.playerRole === 'chaos' && this.currentPlayer === 'order');
            if (isAITurn) {
                setTimeout(() => this.makeAIMove(), 500);
            }
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
            this.makeMove(move.row, move.col, move.symbol);
        }
    }

    getRandomAIMove() {
        const emptyCells = [];
        for (let row = 0; row < 6; row++) {
            for (let col = 0; col < 6; col++) {
                if (this.board[row][col] === '') {
                    emptyCells.push({ row, col });
                }
            }
        }
        
        if (emptyCells.length === 0) return null;
        
        const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        const randomSymbol = Math.random() < 0.5 ? 'X' : 'O';
        
        return { ...randomCell, symbol: randomSymbol };
    }

    getSmartAIMove() {
        const aiRole = this.playerRole === 'order' ? 'chaos' : 'order';
        
        if (aiRole === 'order') {
            // AI is Order: try to create 5 in a row
            return this.getOrderAIMove();
        } else {
            // AI is Chaos: try to prevent 5 in a row
            return this.getChaosAIMove();
        }
    }

    getOrderAIMove() {
        // Strategy for Order AI:
        // 1. Try to complete a 5-in-a-row
        // 2. Try to extend existing sequences
        // 3. Start new sequences in good positions
        
        // Check for immediate wins
        for (let symbol of ['X', 'O']) {
            const winMove = this.findWinningMove(symbol);
            if (winMove) return { ...winMove, symbol };
        }
        
        // Try to extend existing sequences
        const extendMove = this.findExtensionMove();
        if (extendMove) return extendMove;
        
        // Make a strategic move
        return this.getStrategicMove() || this.getRandomAIMove();
    }

    getChaosAIMove() {
        // Strategy for Chaos AI:
        // 1. Block immediate threats (4 in a row)
        // 2. Disrupt long sequences
        // 3. Make moves that don't help Order
        
        // Block immediate threats
        for (let symbol of ['X', 'O']) {
            const blockMove = this.findBlockingMove(symbol);
            if (blockMove) {
                // Use opposite symbol to block
                const blockSymbol = symbol === 'X' ? 'O' : 'X';
                return { ...blockMove, symbol: blockSymbol };
            }
        }
        
        // Disrupt sequences
        const disruptMove = this.findDisruptionMove();
        if (disruptMove) return disruptMove;
        
        return this.getRandomAIMove();
    }

    findWinningMove(symbol) {
        for (let row = 0; row < 6; row++) {
            for (let col = 0; col < 6; col++) {
                if (this.board[row][col] === '') {
                    // Try placing the symbol here
                    this.board[row][col] = symbol;
                    if (this.checkWinCondition() === 'order') {
                        this.board[row][col] = ''; // Undo
                        return { row, col };
                    }
                    this.board[row][col] = ''; // Undo
                }
            }
        }
        return null;
    }

    findBlockingMove(symbol) {
        // Look for 4 in a row that needs blocking
        for (let row = 0; row < 6; row++) {
            for (let col = 0; col < 6; col++) {
                if (this.board[row][col] === '') {
                    // Check if placing opposite symbol here prevents a win
                    this.board[row][col] = symbol;
                    if (this.checkWinCondition() === 'order') {
                        this.board[row][col] = ''; // Undo
                        return { row, col };
                    }
                    this.board[row][col] = ''; // Undo
                }
            }
        }
        return null;
    }

    findExtensionMove() {
        // Find moves that extend existing sequences
        const moves = [];
        
        for (let row = 0; row < 6; row++) {
            for (let col = 0; col < 6; col++) {
                if (this.board[row][col] === '') {
                    for (let symbol of ['X', 'O']) {
                        const score = this.evaluatePosition(row, col, symbol);
                        if (score > 0) {
                            moves.push({ row, col, symbol, score });
                        }
                    }
                }
            }
        }
        
        if (moves.length === 0) return null;
        
        // Sort by score and return best move
        moves.sort((a, b) => b.score - a.score);
        return moves[0];
    }

    findDisruptionMove() {
        // Find moves that disrupt opponent sequences
        const moves = [];
        
        for (let row = 0; row < 6; row++) {
            for (let col = 0; col < 6; col++) {
                if (this.board[row][col] === '') {
                    for (let symbol of ['X', 'O']) {
                        const disruptionScore = this.evaluateDisruption(row, col, symbol);
                        if (disruptionScore > 0) {
                            moves.push({ row, col, symbol, score: disruptionScore });
                        }
                    }
                }
            }
        }
        
        if (moves.length === 0) return null;
        
        moves.sort((a, b) => b.score - a.score);
        return moves[0];
    }

    evaluatePosition(row, col, symbol) {
        // Evaluate how good a position is for extending sequences
        let score = 0;
        const directions = [
            [0, 1], [1, 0], [1, 1], [1, -1] // horizontal, vertical, diagonal
        ];
        
        for (let [dx, dy] of directions) {
            let count = 1; // Count the placed symbol
            
            // Count in positive direction
            for (let i = 1; i < 5; i++) {
                const newRow = row + dx * i;
                const newCol = col + dy * i;
                if (newRow >= 0 && newRow < 6 && newCol >= 0 && newCol < 6 && 
                    this.board[newRow][newCol] === symbol) {
                    count++;
                } else {
                    break;
                }
            }
            
            // Count in negative direction
            for (let i = 1; i < 5; i++) {
                const newRow = row - dx * i;
                const newCol = col - dy * i;
                if (newRow >= 0 && newRow < 6 && newCol >= 0 && newCol < 6 && 
                    this.board[newRow][newCol] === symbol) {
                    count++;
                } else {
                    break;
                }
            }
            
            if (count >= 2) {
                score += count * count; // Exponential scoring for longer sequences
            }
        }
        
        return score;
    }

    evaluateDisruption(row, col, symbol) {
        // Evaluate how much this move disrupts opponent sequences
        let score = 0;
        const directions = [
            [0, 1], [1, 0], [1, 1], [1, -1]
        ];
        
        for (let [dx, dy] of directions) {
            // Check if this position is between same symbols
            const pos1 = { row: row + dx, col: col + dy };
            const pos2 = { row: row - dx, col: col - dy };
            
            if (this.isValidPosition(pos1) && this.isValidPosition(pos2)) {
                const symbol1 = this.board[pos1.row][pos1.col];
                const symbol2 = this.board[pos2.row][pos2.col];
                
                if (symbol1 === symbol2 && symbol1 !== '' && symbol1 !== symbol) {
                    score += 3; // Good disruption
                }
            }
        }
        
        return score;
    }

    getStrategicMove() {
        // Get a move in a strategic position (center, corners, etc.)
        const strategicPositions = [
            [2, 2], [2, 3], [3, 2], [3, 3], // Center
            [1, 1], [1, 4], [4, 1], [4, 4], // Near corners
            [0, 0], [0, 5], [5, 0], [5, 5]  // Corners
        ];
        
        for (let [row, col] of strategicPositions) {
            if (this.board[row][col] === '') {
                const symbol = Math.random() < 0.5 ? 'X' : 'O';
                return { row, col, symbol };
            }
        }
        
        return null;
    }

    isValidPosition(pos) {
        return pos.row >= 0 && pos.row < 6 && pos.col >= 0 && pos.col < 6;
    }

    checkWinCondition() {
        // Check for 5 in a row of either X or O
        const directions = [
            [0, 1], // horizontal
            [1, 0], // vertical
            [1, 1], // diagonal \
            [1, -1] // diagonal /
        ];
        
        for (let row = 0; row < 6; row++) {
            for (let col = 0; col < 6; col++) {
                const symbol = this.board[row][col];
                if (symbol === '') continue;
                
                for (let [dx, dy] of directions) {
                    let count = 1;
                    const winningCells = [{ row, col }];
                    
                    // Check in positive direction
                    for (let i = 1; i < 5; i++) {
                        const newRow = row + dx * i;
                        const newCol = col + dy * i;
                        
                        if (newRow >= 0 && newRow < 6 && newCol >= 0 && newCol < 6 && 
                            this.board[newRow][newCol] === symbol) {
                            count++;
                            winningCells.push({ row: newRow, col: newCol });
                        } else {
                            break;
                        }
                    }
                    
                    if (count >= 5) {
                        this.highlightWinningCells(winningCells);
                        return 'order'; // Order wins with 5 in a row
                    }
                }
            }
        }
        
        return null; // No winner yet
    }

    highlightWinningCells(cells) {
        cells.forEach(({ row, col }) => {
            const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
            cell.classList.add('winning');
        });
    }

    updateUI() {
        document.getElementById('currentPlayerRole').textContent = 
            this.currentPlayer.charAt(0).toUpperCase() + this.currentPlayer.slice(1);
        
        let statusText = '';
        if (this.gameMode === 'human-vs-human') {
            statusText = `${this.currentPlayer === 'order' ? 'Order' : 'Chaos'}'s turn - Choose X or O and click on the board`;
        } else {
            const isHumanTurn = (this.playerRole === 'order' && this.currentPlayer === 'order') ||
                               (this.playerRole === 'chaos' && this.currentPlayer === 'chaos');
            if (isHumanTurn) {
                statusText = 'Your turn - Choose X or O and click on the board';
            } else {
                statusText = 'AI is thinking...';
            }
        }
        
        document.getElementById('gameStatus').textContent = statusText;
    }

    endGame(winner) {
        this.gameActive = false;
        
        let message = '';
        if (winner === 'order') {
            message = 'Order wins! 5 in a row achieved!';
        } else {
            message = 'Chaos wins! Order failed to get 5 in a row!';
        }
        
        // Show game over modal
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
        this.board = Array(6).fill().map(() => Array(6).fill(''));
        this.currentPlayer = 'order';
        this.selectedSymbol = 'X';
        this.gameActive = true;
        this.moveCount = 0;
        
        this.createBoard();
        this.updateUI();
        
        // Remove any existing game over modals
        const existingModals = document.querySelectorAll('.game-over');
        existingModals.forEach(modal => modal.remove());
        
        // If AI goes first
        if (this.gameMode !== 'human-vs-human' && this.playerRole === 'chaos') {
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

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new OrderChaosGame();
});
