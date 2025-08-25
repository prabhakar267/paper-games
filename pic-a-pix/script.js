class PicAPixGame {
    constructor() {
        this.gridSize = 15;
        this.difficulty = 'easy';
        this.solution = [];
        this.playerGrid = [];
        this.rowClues = [];
        this.colClues = [];
        this.gameStarted = false;
        
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        document.getElementById('startGame').addEventListener('click', () => this.startGame());
        document.getElementById('newPuzzle').addEventListener('click', () => this.generateNewPuzzle());
        document.getElementById('backToSetup').addEventListener('click', () => this.backToSetup());
        document.getElementById('checkSolution').addEventListener('click', () => this.checkSolution());
        document.getElementById('showSolution').addEventListener('click', () => this.showSolution());
    }

    startGame() {
        this.getGameSettings();
        this.generatePuzzle();
        this.showGameArea();
    }

    getGameSettings() {
        const gridSizeRadio = document.querySelector('input[name="gridSize"]:checked');
        const difficultyRadio = document.querySelector('input[name="difficulty"]:checked');
        
        this.gridSize = parseInt(gridSizeRadio.value);
        this.difficulty = difficultyRadio.value;
    }

    generatePuzzle() {
        this.solution = this.createRandomSolution();
        this.generateClues();
        this.initializePlayerGrid();
        this.renderPuzzle();
        this.gameStarted = true;
    }

    createRandomSolution() {
        const solution = [];
        let fillProbability;
        
        // Set fill probability based on difficulty
        switch (this.difficulty) {
            case 'easy':
                fillProbability = 0.6;
                break;
            case 'medium':
                fillProbability = 0.45;
                break;
            case 'hard':
                fillProbability = 0.3;
                break;
        }

        // Generate random pattern with some structure
        for (let row = 0; row < this.gridSize; row++) {
            solution[row] = [];
            for (let col = 0; col < this.gridSize; col++) {
                // Add some clustering to make more interesting patterns
                let probability = fillProbability;
                
                // Check neighbors to encourage clustering
                if (row > 0 && solution[row-1][col]) probability += 0.2;
                if (col > 0 && solution[row][col-1]) probability += 0.2;
                if (row > 0 && col > 0 && solution[row-1][col-1]) probability += 0.1;
                
                solution[row][col] = Math.random() < probability;
            }
        }

        // Ensure there's at least some pattern by adding a few guaranteed shapes
        this.addGuaranteedShapes(solution);
        
        return solution;
    }

    addGuaranteedShapes(solution) {
        const shapes = [
            // Small cross
            [[1,0,1], [1,1,1], [1,0,1]],
            // Small square
            [[1,1], [1,1]],
            // Line
            [[1,1,1,1]],
            // L-shape
            [[1,0], [1,0], [1,1]]
        ];

        const numShapes = Math.floor(this.gridSize / 8) + 1;
        
        for (let i = 0; i < numShapes; i++) {
            const shape = shapes[Math.floor(Math.random() * shapes.length)];
            const startRow = Math.floor(Math.random() * (this.gridSize - shape.length));
            const startCol = Math.floor(Math.random() * (this.gridSize - shape[0].length));
            
            for (let r = 0; r < shape.length; r++) {
                for (let c = 0; c < shape[r].length; c++) {
                    if (shape[r][c]) {
                        solution[startRow + r][startCol + c] = true;
                    }
                }
            }
        }
    }

    generateClues() {
        this.rowClues = [];
        this.colClues = [];

        // Generate row clues
        for (let row = 0; row < this.gridSize; row++) {
            this.rowClues[row] = this.getLineClues(this.solution[row]);
        }

        // Generate column clues
        for (let col = 0; col < this.gridSize; col++) {
            const column = [];
            for (let row = 0; row < this.gridSize; row++) {
                column.push(this.solution[row][col]);
            }
            this.colClues[col] = this.getLineClues(column);
        }
    }

    getLineClues(line) {
        const clues = [];
        let currentGroup = 0;

        for (let i = 0; i < line.length; i++) {
            if (line[i]) {
                currentGroup++;
            } else {
                if (currentGroup > 0) {
                    clues.push(currentGroup);
                    currentGroup = 0;
                }
            }
        }

        if (currentGroup > 0) {
            clues.push(currentGroup);
        }

        return clues.length > 0 ? clues : [0];
    }

    initializePlayerGrid() {
        this.playerGrid = [];
        for (let row = 0; row < this.gridSize; row++) {
            this.playerGrid[row] = [];
            for (let col = 0; col < this.gridSize; col++) {
                this.playerGrid[row][col] = 'empty'; // 'empty', 'filled', 'marked'
            }
        }
    }

    renderPuzzle() {
        this.renderClues();
        this.renderGrid();
    }

    renderClues() {
        const rowCluesContainer = document.getElementById('rowClues');
        const colCluesContainer = document.getElementById('colClues');

        // Clear existing clues
        rowCluesContainer.innerHTML = '';
        colCluesContainer.innerHTML = '';

        // Set grid classes
        rowCluesContainer.className = `row-clues row-clues-${this.gridSize}`;
        colCluesContainer.className = `col-clues clues-${this.gridSize}`;

        // Render row clues
        for (let row = 0; row < this.gridSize; row++) {
            const clueCell = document.createElement('div');
            clueCell.className = 'clue-cell row-clue';
            clueCell.textContent = this.rowClues[row].join(' ');
            rowCluesContainer.appendChild(clueCell);
        }

        // Render column clues
        for (let col = 0; col < this.gridSize; col++) {
            const clueCell = document.createElement('div');
            clueCell.className = 'clue-cell col-clue';
            clueCell.innerHTML = this.colClues[col].join('<br>');
            colCluesContainer.appendChild(clueCell);
        }
    }

    renderGrid() {
        const gameBoard = document.getElementById('gameBoard');
        gameBoard.innerHTML = '';
        gameBoard.className = `game-board grid-${this.gridSize}`;

        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.row = row;
                cell.dataset.col = col;

                cell.addEventListener('click', (e) => this.handleCellClick(e, row, col));
                cell.addEventListener('contextmenu', (e) => this.handleCellRightClick(e, row, col));

                this.updateCellDisplay(cell, row, col);
                gameBoard.appendChild(cell);
            }
        }
    }

    handleCellClick(e, row, col) {
        e.preventDefault();
        if (!this.gameStarted) return;

        const currentState = this.playerGrid[row][col];
        
        if (currentState === 'empty') {
            this.playerGrid[row][col] = 'filled';
        } else if (currentState === 'filled') {
            this.playerGrid[row][col] = 'empty';
        } else if (currentState === 'marked') {
            this.playerGrid[row][col] = 'filled';
        }

        this.updateCellDisplay(e.target, row, col);
        this.checkCompletion();
    }

    handleCellRightClick(e, row, col) {
        e.preventDefault();
        if (!this.gameStarted) return;

        const currentState = this.playerGrid[row][col];
        
        if (currentState === 'empty') {
            this.playerGrid[row][col] = 'marked';
        } else if (currentState === 'marked') {
            this.playerGrid[row][col] = 'empty';
        } else if (currentState === 'filled') {
            this.playerGrid[row][col] = 'marked';
        }

        this.updateCellDisplay(e.target, row, col);
    }

    updateCellDisplay(cell, row, col) {
        const state = this.playerGrid[row][col];
        
        cell.className = 'cell';
        cell.textContent = '';

        if (state === 'filled') {
            cell.classList.add('filled');
        } else if (state === 'marked') {
            cell.classList.add('marked');
            cell.textContent = '×';
        }
    }

    checkCompletion() {
        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                const playerFilled = this.playerGrid[row][col] === 'filled';
                const solutionFilled = this.solution[row][col];
                
                if (playerFilled !== solutionFilled) {
                    return false;
                }
            }
        }

        this.showCompletionMessage();
        return true;
    }

    checkSolution() {
        let correct = 0;
        let incorrect = 0;

        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
                const playerFilled = this.playerGrid[row][col] === 'filled';
                const solutionFilled = this.solution[row][col];
                
                // Remove previous check classes
                cell.classList.remove('correct', 'incorrect');
                
                if (this.playerGrid[row][col] !== 'empty') {
                    if (playerFilled === solutionFilled) {
                        cell.classList.add('correct');
                        correct++;
                    } else {
                        cell.classList.add('incorrect');
                        incorrect++;
                    }
                }
            }
        }

        const total = correct + incorrect;
        if (total === 0) {
            this.updateGameStatus('Fill in some cells first!');
        } else {
            const percentage = Math.round((correct / total) * 100);
            this.updateGameStatus(`${correct}/${total} correct (${percentage}%)`);
        }

        // Clear the visual feedback after 3 seconds
        setTimeout(() => {
            document.querySelectorAll('.cell.correct, .cell.incorrect').forEach(cell => {
                cell.classList.remove('correct', 'incorrect');
            });
        }, 3000);
    }

    showSolution() {
        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
                
                if (this.solution[row][col]) {
                    cell.classList.add('solution');
                    cell.classList.remove('filled', 'marked');
                    cell.textContent = '';
                }
            }
        }

        this.updateGameStatus('Solution revealed! Generate a new puzzle to play again.');
        this.gameStarted = false;

        // Clear solution display after 5 seconds
        setTimeout(() => {
            document.querySelectorAll('.cell.solution').forEach(cell => {
                cell.classList.remove('solution');
            });
            this.renderGrid();
        }, 5000);
    }

    showCompletionMessage() {
        const overlay = document.createElement('div');
        overlay.className = 'completion-message';
        
        const content = document.createElement('div');
        content.className = 'completion-content';
        
        content.innerHTML = `
            <h2>🎉 Congratulations!</h2>
            <p>You've successfully solved the ${this.gridSize}×${this.gridSize} Pic-a-Pix puzzle!</p>
            <button class="btn-primary" onclick="this.parentElement.parentElement.remove(); game.generateNewPuzzle();">
                Generate New Puzzle
            </button>
            <button class="btn-secondary" onclick="this.parentElement.parentElement.remove();">
                Close
            </button>
        `;
        
        overlay.appendChild(content);
        document.body.appendChild(overlay);
        
        this.gameStarted = false;
    }

    generateNewPuzzle() {
        this.getGameSettings();
        this.generatePuzzle();
        this.updateGameStatus('New puzzle generated! Left click to fill, right click to mark X');
    }

    updateGameStatus(message) {
        document.getElementById('gameStatus').textContent = message;
    }

    showGameArea() {
        document.getElementById('gameSetup').style.display = 'none';
        document.getElementById('gameArea').style.display = 'block';
    }

    backToSetup() {
        document.getElementById('gameArea').style.display = 'none';
        document.getElementById('gameSetup').style.display = 'block';
        this.gameStarted = false;
    }
}

// Collapsible sections functionality
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
let game;
document.addEventListener('DOMContentLoaded', () => {
    game = new PicAPixGame();
});
