class OrderChaosGame {
    constructor() {
        this.board = Array(6).fill().map(() => Array(6).fill(''));
        this.currentPlayer = 'order';
        this.selectedSymbol = 'X';
        this.gameMode = 'human-vs-human';
        this.playerRole = 'order';
        this.gameActive = false;
        this.moveCount = 0;
        this.lastMove = null; // Track the last move for highlighting
        
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
        this.lastMove = null; // Reset last move tracking
        
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
        
        // Remove highlight from previous move
        if (this.lastMove) {
            const prevCell = document.querySelector(`[data-row="${this.lastMove.row}"][data-col="${this.lastMove.col}"]`);
            if (prevCell) {
                prevCell.classList.remove('last-move');
            }
        }
        
        // Update the visual board
        const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        cell.textContent = symbol;
        cell.classList.add('occupied', symbol.toLowerCase());
        
        // Highlight the current move as the last move
        cell.classList.add('last-move');
        this.lastMove = { row, col };
        
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
            // AI is Order: use advanced winning strategy
            return this.getAdvancedOrderAIMove();
        } else {
            // AI is Chaos: use pairing strategy and advanced blocking
            return this.getAdvancedChaosAIMove();
        }
    }

    getAdvancedOrderAIMove() {
        // Advanced Order Strategy based on research:
        // 1. Control the center 4x4 area (proven winning strategy)
        // 2. Use edge pairing to counter Chaos edge moves
        // 3. Create multiple threats simultaneously
        // 4. Force open-four situations
        
        // Check for immediate wins first
        for (let symbol of ['X', 'O']) {
            const winMove = this.findWinningMove(symbol);
            if (winMove) return { ...winMove, symbol };
        }
        
        // Implement center 4x4 control strategy
        const centerMove = this.getCenterControlMove();
        if (centerMove) return centerMove;
        
        // Create multiple threats
        const multiThreatMove = this.createMultipleThreats();
        if (multiThreatMove) return multiThreatMove;
        
        // Force open-four situations
        const openFourMove = this.createOpenFour();
        if (openFourMove) return openFourMove;
        
        // Edge pairing counter-strategy
        const edgeCounterMove = this.getEdgeCounterMove();
        if (edgeCounterMove) return edgeCounterMove;
        
        // Fallback to strategic positioning
        return this.getAdvancedStrategicMove() || this.getRandomAIMove();
    }

    getAdvancedChaosAIMove() {
        // Advanced Chaos Strategy based on pairing strategy research:
        // 1. Use pairing strategy to guarantee blocking all lines
        // 2. Block immediate threats with priority
        // 3. Disrupt Order's center control
        // 4. Prevent open-four formations
        // 5. Force Order into disadvantageous positions
        
        // Block immediate threats (highest priority)
        for (let symbol of ['X', 'O']) {
            const criticalBlock = this.findCriticalBlockingMove(symbol);
            if (criticalBlock) {
                // Use the opposite symbol to block the threat
                const blockSymbol = symbol === 'X' ? 'O' : 'X';
                return { ...criticalBlock, symbol: blockSymbol };
            }
        }
        
        // Prevent open-four formations
        const openFourBlock = this.preventOpenFour();
        if (openFourBlock) return openFourBlock;
        
        // Use pairing strategy
        const pairingMove = this.getPairingStrategyMove();
        if (pairingMove) return pairingMove;
        
        // Disrupt center control
        const centerDisruptMove = this.disruptCenterControl();
        if (centerDisruptMove) return centerDisruptMove;
        
        // Advanced disruption tactics
        const advancedDisruptMove = this.getAdvancedDisruptionMove();
        if (advancedDisruptMove) return advancedDisruptMove;
        
        return this.getRandomAIMove();
    }

    findWinningMove(symbol) {
        for (let row = 0; row < 6; row++) {
            for (let col = 0; col < 6; col++) {
                if (this.board[row][col] === '') {
                    // Try placing the symbol here
                    this.board[row][col] = symbol;
                    const winner = this.checkWinCondition();
                    if (winner === 'order') {
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
                    // Check if placing this symbol here creates a win (which we need to block)
                    this.board[row][col] = symbol;
                    const winner = this.checkWinCondition();
                    if (winner === 'order') {
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

    // Advanced Order AI Methods
    getCenterControlMove() {
        // Focus on controlling the center 4x4 area (rows 1-4, cols 1-4)
        // This is the proven winning strategy from research
        const centerPositions = [];
        for (let row = 1; row <= 4; row++) {
            for (let col = 1; col <= 4; col++) {
                if (this.board[row][col] === '') {
                    centerPositions.push({ row, col });
                }
            }
        }
        
        if (centerPositions.length === 0) return null;
        
        // Prioritize positions that can create multiple lines
        const scoredMoves = centerPositions.map(pos => {
            let score = 0;
            for (let symbol of ['X', 'O']) {
                score += this.evaluateCenterPosition(pos.row, pos.col, symbol);
            }
            return { ...pos, score, symbol: this.chooseBestSymbol(pos.row, pos.col) };
        });
        
        scoredMoves.sort((a, b) => b.score - a.score);
        return scoredMoves[0];
    }
    
    evaluateCenterPosition(row, col, symbol) {
        let score = 0;
        const directions = [[0, 1], [1, 0], [1, 1], [1, -1]];
        
        for (let [dx, dy] of directions) {
            // Check potential for creating lines through this position
            let lineScore = this.evaluateLineDirection(row, col, dx, dy, symbol);
            score += lineScore;
            
            // Bonus for positions that can create intersecting lines
            if (lineScore > 2) {
                score += 5;
            }
        }
        
        // Extra bonus for central positions
        if (row >= 2 && row <= 3 && col >= 2 && col <= 3) {
            score += 10;
        }
        
        return score;
    }
    
    evaluateLineDirection(row, col, dx, dy, symbol) {
        let count = 1;
        let openEnds = 0;
        
        // Check positive direction
        let i = 1;
        while (i < 5) {
            const newRow = row + dx * i;
            const newCol = col + dy * i;
            if (!this.isValidPosition({ row: newRow, col: newCol })) break;
            
            if (this.board[newRow][newCol] === symbol) {
                count++;
            } else if (this.board[newRow][newCol] === '') {
                openEnds++;
                break;
            } else {
                break;
            }
            i++;
        }
        
        // Check negative direction
        i = 1;
        while (i < 5) {
            const newRow = row - dx * i;
            const newCol = col - dy * i;
            if (!this.isValidPosition({ row: newRow, col: newCol })) break;
            
            if (this.board[newRow][newCol] === symbol) {
                count++;
            } else if (this.board[newRow][newCol] === '') {
                openEnds++;
                break;
            } else {
                break;
            }
            i++;
        }
        
        // Score based on count and open ends
        let score = count * count;
        if (openEnds >= 2) score *= 2; // Open line bonus
        if (count >= 3) score *= 3; // Long sequence bonus
        
        return score;
    }
    
    createMultipleThreats() {
        // Look for moves that create multiple winning threats simultaneously
        const moves = [];
        
        for (let row = 0; row < 6; row++) {
            for (let col = 0; col < 6; col++) {
                if (this.board[row][col] === '') {
                    for (let symbol of ['X', 'O']) {
                        const threatCount = this.countThreats(row, col, symbol);
                        if (threatCount >= 2) {
                            moves.push({ row, col, symbol, threats: threatCount });
                        }
                    }
                }
            }
        }
        
        if (moves.length === 0) return null;
        
        moves.sort((a, b) => b.threats - a.threats);
        return moves[0];
    }
    
    countThreats(row, col, symbol) {
        let threats = 0;
        const directions = [[0, 1], [1, 0], [1, 1], [1, -1]];
        
        for (let [dx, dy] of directions) {
            if (this.wouldCreateThreat(row, col, dx, dy, symbol)) {
                threats++;
            }
        }
        
        return threats;
    }
    
    wouldCreateThreat(row, col, dx, dy, symbol) {
        // Check if placing symbol at (row, col) creates a 3+ in a row with open ends
        this.board[row][col] = symbol;
        
        let count = 1;
        let openEnds = 0;
        
        // Check both directions
        for (let dir of [1, -1]) {
            for (let i = 1; i < 5; i++) {
                const newRow = row + dx * i * dir;
                const newCol = col + dy * i * dir;
                
                if (!this.isValidPosition({ row: newRow, col: newCol })) break;
                
                if (this.board[newRow][newCol] === symbol) {
                    count++;
                } else if (this.board[newRow][newCol] === '') {
                    openEnds++;
                    break;
                } else {
                    break;
                }
            }
        }
        
        this.board[row][col] = ''; // Undo
        
        return count >= 3 && openEnds >= 1;
    }
    
    createOpenFour() {
        // Look for moves that create an open four (unstoppable threat)
        for (let row = 0; row < 6; row++) {
            for (let col = 0; col < 6; col++) {
                if (this.board[row][col] === '') {
                    for (let symbol of ['X', 'O']) {
                        if (this.wouldCreateOpenFour(row, col, symbol)) {
                            return { row, col, symbol };
                        }
                    }
                }
            }
        }
        return null;
    }
    
    wouldCreateOpenFour(row, col, symbol) {
        const directions = [[0, 1], [1, 0], [1, 1], [1, -1]];
        
        for (let [dx, dy] of directions) {
            this.board[row][col] = symbol;
            
            let count = 1;
            let leftOpen = false, rightOpen = false;
            
            // Check positive direction
            for (let i = 1; i < 5; i++) {
                const newRow = row + dx * i;
                const newCol = col + dy * i;
                if (!this.isValidPosition({ row: newRow, col: newCol })) break;
                
                if (this.board[newRow][newCol] === symbol) {
                    count++;
                } else if (this.board[newRow][newCol] === '' && i === count) {
                    rightOpen = true;
                    break;
                } else {
                    break;
                }
            }
            
            // Check negative direction
            for (let i = 1; i < 5; i++) {
                const newRow = row - dx * i;
                const newCol = col - dy * i;
                if (!this.isValidPosition({ row: newRow, col: newCol })) break;
                
                if (this.board[newRow][newCol] === symbol) {
                    count++;
                } else if (this.board[newRow][newCol] === '' && i === count - (count - 1)) {
                    leftOpen = true;
                    break;
                } else {
                    break;
                }
            }
            
            this.board[row][col] = ''; // Undo
            
            if (count === 4 && leftOpen && rightOpen) {
                return true;
            }
        }
        
        return false;
    }
    
    getEdgeCounterMove() {
        // Implement edge pairing strategy to counter Chaos edge moves
        const edgePairs = [
            // Corners
            [[0, 0], [5, 5]], [[0, 5], [5, 0]],
            // Edges
            [[0, 1], [5, 4]], [[0, 2], [5, 3]], [[0, 3], [5, 2]], [[0, 4], [5, 1]],
            [[1, 0], [4, 5]], [[2, 0], [3, 5]], [[3, 0], [2, 5]], [[4, 0], [1, 5]],
            [[1, 5], [4, 0]], [[2, 5], [3, 0]], [[3, 5], [2, 0]], [[4, 5], [1, 0]]
        ];
        
        for (let [[r1, c1], [r2, c2]] of edgePairs) {
            if (this.board[r1][c1] !== '' && this.board[r2][c2] === '') {
                // Counter the opponent's edge move
                const symbol = this.isCorner(r1, c1) ? this.board[r1][c1] : 
                              (this.board[r1][c1] === 'X' ? 'O' : 'X');
                return { row: r2, col: c2, symbol };
            }
            if (this.board[r2][c2] !== '' && this.board[r1][c1] === '') {
                const symbol = this.isCorner(r2, c2) ? this.board[r2][c2] : 
                              (this.board[r2][c2] === 'X' ? 'O' : 'X');
                return { row: r1, col: c1, symbol };
            }
        }
        
        return null;
    }
    
    isCorner(row, col) {
        return (row === 0 || row === 5) && (col === 0 || col === 5);
    }
    
    getAdvancedStrategicMove() {
        // Advanced strategic positioning with multiple criteria
        const moves = [];
        
        for (let row = 0; row < 6; row++) {
            for (let col = 0; col < 6; col++) {
                if (this.board[row][col] === '') {
                    const score = this.evaluateStrategicPosition(row, col);
                    if (score > 0) {
                        moves.push({ 
                            row, col, 
                            symbol: this.chooseBestSymbol(row, col),
                            score 
                        });
                    }
                }
            }
        }
        
        if (moves.length === 0) return null;
        
        moves.sort((a, b) => b.score - a.score);
        return moves[0];
    }
    
    evaluateStrategicPosition(row, col) {
        let score = 0;
        
        // Center control bonus
        if (row >= 1 && row <= 4 && col >= 1 && col <= 4) {
            score += 15;
            if (row >= 2 && row <= 3 && col >= 2 && col <= 3) {
                score += 10; // Extra bonus for true center
            }
        }
        
        // Line intersection bonus
        const intersections = this.countLineIntersections(row, col);
        score += intersections * 5;
        
        // Flexibility bonus (number of directions with potential)
        const flexibility = this.evaluateFlexibility(row, col);
        score += flexibility * 3;
        
        return score;
    }
    
    countLineIntersections(row, col) {
        let intersections = 0;
        const directions = [[0, 1], [1, 0], [1, 1], [1, -1]];
        
        for (let [dx, dy] of directions) {
            if (this.hasLinePotential(row, col, dx, dy)) {
                intersections++;
            }
        }
        
        return intersections;
    }
    
    hasLinePotential(row, col, dx, dy) {
        let spaces = 1;
        
        // Count available spaces in both directions
        for (let dir of [1, -1]) {
            for (let i = 1; i < 5; i++) {
                const newRow = row + dx * i * dir;
                const newCol = col + dy * i * dir;
                
                if (!this.isValidPosition({ row: newRow, col: newCol })) break;
                if (this.board[newRow][newCol] !== '') break;
                
                spaces++;
            }
        }
        
        return spaces >= 5;
    }
    
    evaluateFlexibility(row, col) {
        let flexibility = 0;
        const directions = [[0, 1], [1, 0], [1, 1], [1, -1]];
        
        for (let [dx, dy] of directions) {
            let openSpaces = 0;
            
            for (let dir of [1, -1]) {
                for (let i = 1; i <= 2; i++) {
                    const newRow = row + dx * i * dir;
                    const newCol = col + dy * i * dir;
                    
                    if (this.isValidPosition({ row: newRow, col: newCol }) && 
                        this.board[newRow][newCol] === '') {
                        openSpaces++;
                    }
                }
            }
            
            if (openSpaces >= 2) flexibility++;
        }
        
        return flexibility;
    }
    
    chooseBestSymbol(row, col) {
        let xScore = 0, oScore = 0;
        
        for (let symbol of ['X', 'O']) {
            const score = this.evaluatePosition(row, col, symbol);
            if (symbol === 'X') xScore = score;
            else oScore = score;
        }
        
        return xScore >= oScore ? 'X' : 'O';
    }

    // Advanced Chaos AI Methods
    findCriticalBlockingMove(symbol) {
        // Find critical blocking moves with higher priority than basic blocking
        const criticalMoves = [];
        
        for (let row = 0; row < 6; row++) {
            for (let col = 0; col < 6; col++) {
                if (this.board[row][col] === '') {
                    // Check if placing this symbol would create a win (threat to block)
                    this.board[row][col] = symbol;
                    const winner = this.checkWinCondition();
                    this.board[row][col] = ''; // Undo immediately
                    
                    if (winner === 'order') {
                        const urgency = this.evaluateBlockingUrgency(row, col, symbol);
                        criticalMoves.push({ row, col, urgency });
                    }
                }
            }
        }
        
        if (criticalMoves.length === 0) return null;
        
        criticalMoves.sort((a, b) => b.urgency - a.urgency);
        return criticalMoves[0];
    }
    
    evaluateBlockingUrgency(row, col, symbol) {
        this.board[row][col] = symbol;
        
        let urgency = 0;
        const directions = [[0, 1], [1, 0], [1, 1], [1, -1]];
        
        for (let [dx, dy] of directions) {
            let count = 1;
            
            // Count in both directions
            for (let dir of [1, -1]) {
                for (let i = 1; i < 5; i++) {
                    const newRow = row + dx * i * dir;
                    const newCol = col + dy * i * dir;
                    
                    if (!this.isValidPosition({ row: newRow, col: newCol })) break;
                    if (this.board[newRow][newCol] === symbol) {
                        count++;
                    } else {
                        break;
                    }
                }
            }
            
            // Higher urgency for longer sequences
            if (count >= 5) urgency += 1000; // Immediate win
            else if (count >= 4) urgency += 100; // Critical threat
            else if (count >= 3) urgency += 10; // Moderate threat
        }
        
        this.board[row][col] = ''; // Undo
        return urgency;
    }
    
    preventOpenFour() {
        // Prevent Order from creating open-four situations
        for (let row = 0; row < 6; row++) {
            for (let col = 0; col < 6; col++) {
                if (this.board[row][col] === '') {
                    for (let symbol of ['X', 'O']) {
                        if (this.wouldPreventOpenFour(row, col, symbol)) {
                            const blockSymbol = symbol === 'X' ? 'O' : 'X';
                            return { row, col, symbol: blockSymbol };
                        }
                    }
                }
            }
        }
        return null;
    }
    
    wouldPreventOpenFour(row, col, symbol) {
        // Check if this position would prevent an open four formation
        const directions = [[0, 1], [1, 0], [1, 1], [1, -1]];
        
        for (let [dx, dy] of directions) {
            let threat = this.analyzeLineThreat(row, col, dx, dy, symbol);
            if (threat >= 3) return true;
        }
        
        return false;
    }
    
    analyzeLineThreat(row, col, dx, dy, symbol) {
        let maxThreat = 0;
        
        // Check if blocking this position prevents a threat
        for (let dir of [1, -1]) {
            let count = 0;
            let openEnds = 0;
            
            for (let i = 1; i < 5; i++) {
                const newRow = row + dx * i * dir;
                const newCol = col + dy * i * dir;
                
                if (!this.isValidPosition({ row: newRow, col: newCol })) break;
                
                if (this.board[newRow][newCol] === symbol) {
                    count++;
                } else if (this.board[newRow][newCol] === '') {
                    openEnds++;
                    break;
                } else {
                    break;
                }
            }
            
            if (count >= 2 && openEnds > 0) {
                maxThreat = Math.max(maxThreat, count);
            }
        }
        
        return maxThreat;
    }
    
    getPairingStrategyMove() {
        // Implement the pairing strategy from research
        // Pair positions to guarantee blocking all possible 5-in-a-rows
        const pairingMap = this.initializePairingMap();
        
        // Find if opponent has played in any paired position
        for (let [pos1, pos2] of pairingMap) {
            const [r1, c1] = pos1;
            const [r2, c2] = pos2;
            
            if (this.board[r1][c1] !== '' && this.board[r2][c2] === '') {
                // Play the paired position
                const symbol = this.choosePairingSymbol(r1, c1, r2, c2);
                return { row: r2, col: c2, symbol };
            }
            
            if (this.board[r2][c2] !== '' && this.board[r1][c1] === '') {
                const symbol = this.choosePairingSymbol(r2, c2, r1, c1);
                return { row: r1, col: c1, symbol };
            }
        }
        
        return null;
    }
    
    initializePairingMap() {
        // Create pairing map based on research - each pair blocks potential 5-in-a-rows
        return [
            // Diagonal pairs
            [[0, 0], [5, 5]], [[0, 1], [5, 4]], [[0, 2], [5, 3]], [[0, 3], [5, 2]], [[0, 4], [5, 1]], [[0, 5], [5, 0]],
            // Horizontal pairs
            [[1, 0], [1, 5]], [[2, 0], [2, 5]], [[3, 0], [3, 5]], [[4, 0], [4, 5]],
            // Vertical pairs
            [[0, 1], [5, 1]], [[0, 2], [5, 2]], [[0, 3], [5, 3]], [[0, 4], [5, 4]],
            // Center pairs
            [[1, 1], [4, 4]], [[1, 2], [4, 3]], [[1, 3], [4, 2]], [[1, 4], [4, 1]],
            [[2, 1], [3, 4]], [[2, 2], [3, 3]], [[2, 3], [3, 2]], [[2, 4], [3, 1]]
        ];
    }
    
    choosePairingSymbol(opponentRow, opponentCol, myRow, myCol) {
        const opponentSymbol = this.board[opponentRow][opponentCol];
        
        // For corners, use same symbol; for others, use opposite
        if (this.isCorner(myRow, myCol)) {
            return opponentSymbol;
        } else {
            return opponentSymbol === 'X' ? 'O' : 'X';
        }
    }
    
    disruptCenterControl() {
        // Disrupt Order's center control strategy
        const centerDisruptions = [];
        
        for (let row = 1; row <= 4; row++) {
            for (let col = 1; col <= 4; col++) {
                if (this.board[row][col] === '') {
                    const disruptionValue = this.evaluateCenterDisruption(row, col);
                    if (disruptionValue > 0) {
                        centerDisruptions.push({
                            row, col,
                            symbol: this.chooseBestDisruptionSymbol(row, col),
                            value: disruptionValue
                        });
                    }
                }
            }
        }
        
        if (centerDisruptions.length === 0) return null;
        
        centerDisruptions.sort((a, b) => b.value - a.value);
        return centerDisruptions[0];
    }
    
    evaluateCenterDisruption(row, col) {
        let disruptionValue = 0;
        
        // Higher value for positions that disrupt multiple potential lines
        const directions = [[0, 1], [1, 0], [1, 1], [1, -1]];
        
        for (let [dx, dy] of directions) {
            const lineDisruption = this.evaluateLineDisruption(row, col, dx, dy);
            disruptionValue += lineDisruption;
        }
        
        // Bonus for disrupting central positions
        if (row >= 2 && row <= 3 && col >= 2 && col <= 3) {
            disruptionValue += 5;
        }
        
        return disruptionValue;
    }
    
    evaluateLineDisruption(row, col, dx, dy) {
        let disruption = 0;
        
        // Check how many potential Order sequences this position disrupts
        for (let symbol of ['X', 'O']) {
            let potentialSequences = 0;
            
            for (let dir of [1, -1]) {
                let sameSymbols = 0;
                let emptySpaces = 0;
                
                for (let i = 1; i < 5; i++) {
                    const newRow = row + dx * i * dir;
                    const newCol = col + dy * i * dir;
                    
                    if (!this.isValidPosition({ row: newRow, col: newCol })) break;
                    
                    if (this.board[newRow][newCol] === symbol) {
                        sameSymbols++;
                    } else if (this.board[newRow][newCol] === '') {
                        emptySpaces++;
                    } else {
                        break;
                    }
                }
                
                if (sameSymbols >= 1 && emptySpaces >= 2) {
                    potentialSequences++;
                }
            }
            
            disruption += potentialSequences;
        }
        
        return disruption;
    }
    
    chooseBestDisruptionSymbol(row, col) {
        // Choose symbol that maximally disrupts Order's plans
        let bestSymbol = 'X';
        let maxDisruption = 0;
        
        for (let symbol of ['X', 'O']) {
            let disruption = 0;
            
            // Test placing this symbol
            this.board[row][col] = symbol;
            
            const directions = [[0, 1], [1, 0], [1, 1], [1, -1]];
            for (let [dx, dy] of directions) {
                disruption += this.countDisruptedSequences(row, col, dx, dy, symbol);
            }
            
            this.board[row][col] = ''; // Undo
            
            if (disruption > maxDisruption) {
                maxDisruption = disruption;
                bestSymbol = symbol;
            }
        }
        
        return bestSymbol;
    }
    
    countDisruptedSequences(row, col, dx, dy, symbol) {
        let disrupted = 0;
        const oppositeSymbol = symbol === 'X' ? 'O' : 'X';
        
        // Check if this placement breaks potential sequences
        for (let dir of [1, -1]) {
            let oppositeCount = 0;
            
            for (let i = 1; i < 5; i++) {
                const newRow = row + dx * i * dir;
                const newCol = col + dy * i * dir;
                
                if (!this.isValidPosition({ row: newRow, col: newCol })) break;
                
                if (this.board[newRow][newCol] === oppositeSymbol) {
                    oppositeCount++;
                } else {
                    break;
                }
            }
            
            if (oppositeCount >= 2) {
                disrupted++;
            }
        }
        
        return disrupted;
    }
    
    getAdvancedDisruptionMove() {
        // Advanced disruption tactics beyond basic pairing
        const disruptionMoves = [];
        
        for (let row = 0; row < 6; row++) {
            for (let col = 0; col < 6; col++) {
                if (this.board[row][col] === '') {
                    const disruptionScore = this.calculateAdvancedDisruption(row, col);
                    if (disruptionScore > 0) {
                        disruptionMoves.push({
                            row, col,
                            symbol: this.chooseBestDisruptionSymbol(row, col),
                            score: disruptionScore
                        });
                    }
                }
            }
        }
        
        if (disruptionMoves.length === 0) return null;
        
        disruptionMoves.sort((a, b) => b.score - a.score);
        return disruptionMoves[0];
    }
    
    calculateAdvancedDisruption(row, col) {
        let score = 0;
        
        // Disrupt potential forks (multiple threats)
        score += this.evaluateForkDisruption(row, col) * 10;
        
        // Disrupt long-term strategic positions
        score += this.evaluateStrategicDisruption(row, col) * 5;
        
        // Force Order into reactive play
        score += this.evaluateForceReactive(row, col) * 3;
        
        return score;
    }
    
    evaluateForkDisruption(row, col) {
        // Check if this position disrupts potential forks
        let forkDisruption = 0;
        
        for (let symbol of ['X', 'O']) {
            this.board[row][col] = symbol === 'X' ? 'O' : 'X'; // Place opposite
            
            const threatsBefore = this.countAllThreats(symbol);
            
            this.board[row][col] = ''; // Undo
            
            const threatsAfter = this.countAllThreats(symbol);
            
            forkDisruption += Math.max(0, threatsAfter - threatsBefore);
        }
        
        return forkDisruption;
    }
    
    countAllThreats(symbol) {
        let threats = 0;
        
        for (let row = 0; row < 6; row++) {
            for (let col = 0; col < 6; col++) {
                if (this.board[row][col] === '') {
                    threats += this.countThreats(row, col, symbol);
                }
            }
        }
        
        return threats;
    }
    
    evaluateStrategicDisruption(row, col) {
        // Evaluate how much this move disrupts Order's strategic plans
        let disruption = 0;
        
        // Disrupt center control
        if (row >= 1 && row <= 4 && col >= 1 && col <= 4) {
            disruption += 3;
        }
        
        // Disrupt key intersection points
        const intersections = this.countLineIntersections(row, col);
        disruption += intersections;
        
        return disruption;
    }
    
    evaluateForceReactive(row, col) {
        // Evaluate if this move forces Order to react defensively
        let forceValue = 0;
        
        for (let symbol of ['X', 'O']) {
            this.board[row][col] = symbol;
            
            // Check if this creates threats that Order must respond to
            const threats = this.countThreats(row, col, symbol);
            if (threats > 0) {
                forceValue += threats * 2;
            }
            
            this.board[row][col] = ''; // Undo
        }
        
        return forceValue;
    }

    isValidPosition(pos) {
        return pos.row >= 0 && pos.row < 6 && pos.col >= 0 && pos.col < 6;
    }

    checkWinCondition() {
        // Check for 5 in a row of the SAME symbol (either all X's or all O's)
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
                    
                    // Check in positive direction only (to avoid double counting)
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
                    
                    // Only count as a win if we have 5 of the SAME symbol in a row
                    if (count >= 5) {
                        this.highlightWinningCells(winningCells);
                        return 'order'; // Order wins with 5 of the same symbol in a row
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
            statusText = `Choose symbol and click`;
        } else {
            const isHumanTurn = (this.playerRole === 'order' && this.currentPlayer === 'order') ||
                               (this.playerRole === 'chaos' && this.currentPlayer === 'chaos');
            if (isHumanTurn) {
                statusText = 'Your turn';
            } else {
                statusText = 'AI thinking...';
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
        this.lastMove = null; // Reset last move tracking
        
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
    new OrderChaosGame();
    
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
