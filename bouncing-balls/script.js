// Canvas and context
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const startBtn = document.getElementById('startBtn');
const resetBtn = document.getElementById('resetBtn');
const statusDiv = document.getElementById('status');

// Game state
let balls = [];
let lines = [];
let animationId = null;
let isRunning = false;
let bigBallRadius = 250;
let smallBallRadius = 7;
let speedMultiplier = 2.5; // Fast speed
let centerX = canvas.width / 2;
let centerY = canvas.height / 2;

// Function to resize canvas based on big ball radius
function resizeCanvas(radius) {
    const padding = 20; // Padding around the circle
    const size = Math.max(600, (radius * 2) + padding * 2);
    canvas.width = size;
    canvas.height = size;
    centerX = canvas.width / 2;
    centerY = canvas.height / 2;
}

// Generate random color
function randomColor() {
    const hue = Math.random() * 360;
    return `hsl(${hue}, 70%, 50%)`;
}

// Check if a point is inside the big ball
function isInsideBigBall(x, y, radius) {
    const dx = x - centerX;
    const dy = y - centerY;
    return Math.sqrt(dx * dx + dy * dy) + radius <= bigBallRadius;
}

// Ball class
class Ball {
    constructor(x, y, vx, vy, radius, color) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.radius = radius;
        this.color = color;
        this.lines = [];
        this.hasHadLines = false;
        this.prevX = x;
        this.prevY = y;
    }

    update() {
        // Store previous position for accurate trajectory tracking
        this.prevX = this.x;
        this.prevY = this.y;
        
        this.x += this.vx;
        this.y += this.vy;

        // Check collision with big ball wall
        const dx = this.x - centerX;
        const dy = this.y - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance + this.radius > bigBallRadius) {
            // Bounce off wall
            const angle = Math.atan2(dy, dx);
            this.x = centerX + (bigBallRadius - this.radius) * Math.cos(angle);
            this.y = centerY + (bigBallRadius - this.radius) * Math.sin(angle);

            // Reflect velocity
            const normalX = dx / distance;
            const normalY = dy / distance;
            const dotProduct = this.vx * normalX + this.vy * normalY;
            this.vx = this.vx - 2 * dotProduct * normalX;
            this.vy = this.vy - 2 * dotProduct * normalY;

            // Create line on bounce
            this.createLine();
        }
    }

    createLine() {
        // Calculate the point on the wall where the ball touches
        const dx = this.x - centerX;
        const dy = this.y - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const wallX = centerX + (bigBallRadius * dx) / distance;
        const wallY = centerY + (bigBallRadius * dy) / distance;
        
        const line = {
            x1: wallX,
            y1: wallY,
            x2: this.x,
            y2: this.y,
            color: this.color,
            ball: this
        };
        lines.push(line);
        this.lines.push(line);
        this.hasHadLines = true;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.lineWidth = 2;
        ctx.stroke();
    }
}

// Check collision between two balls
function checkBallCollision(ball1, ball2) {
    const dx = ball2.x - ball1.x;
    const dy = ball2.y - ball1.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < ball1.radius + ball2.radius) {
        // Collision detected
        const angle = Math.atan2(dy, dx);
        const sin = Math.sin(angle);
        const cos = Math.cos(angle);

        // Rotate velocities
        const vx1 = ball1.vx * cos + ball1.vy * sin;
        const vy1 = ball1.vy * cos - ball1.vx * sin;
        const vx2 = ball2.vx * cos + ball2.vy * sin;
        const vy2 = ball2.vy * cos - ball2.vx * sin;

        // Collision reaction (elastic collision)
        const vx1Final = vx2;
        const vx2Final = vx1;

        // Rotate back
        ball1.vx = vx1Final * cos - vy1 * sin;
        ball1.vy = vy1 * cos + vx1Final * sin;
        ball2.vx = vx2Final * cos - vy2 * sin;
        ball2.vy = vy2 * cos + vx2Final * sin;

        // Separate balls
        const overlap = ball1.radius + ball2.radius - distance;
        const separateX = (overlap / 2) * cos;
        const separateY = (overlap / 2) * sin;
        ball1.x -= separateX;
        ball1.y -= separateY;
        ball2.x += separateX;
        ball2.y += separateY;
    }
}

// Check if two line segments intersect
function lineSegmentsIntersect(x1, y1, x2, y2, x3, y3, x4, y4) {
    const denom = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1);
    if (denom === 0) return false;

    const ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denom;
    const ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denom;

    return ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1;
}

// Check if ball crosses a line (using circle-line segment distance)
function checkLineCrossing(ball, line) {
    // Don't check the ball's own line
    if (ball === line.ball) return false;
    
    // Calculate distance from ball center to line segment
    const dx = line.x2 - line.x1;
    const dy = line.y2 - line.y1;
    const lengthSquared = dx * dx + dy * dy;
    
    // If line has no length, check point distance
    if (lengthSquared === 0) {
        const distX = ball.x - line.x1;
        const distY = ball.y - line.y1;
        return Math.sqrt(distX * distX + distY * distY) <= ball.radius;
    }
    
    // Calculate projection of ball onto line segment
    const t = Math.max(0, Math.min(1, 
        ((ball.x - line.x1) * dx + (ball.y - line.y1) * dy) / lengthSquared
    ));
    
    const projX = line.x1 + t * dx;
    const projY = line.y1 + t * dy;
    
    const distX = ball.x - projX;
    const distY = ball.y - projY;
    const distance = Math.sqrt(distX * distX + distY * distY);
    
    return distance <= ball.radius;
}

// Initialize balls
function initBalls() {
    balls = [];
    lines = [];
    const numBalls = parseInt(document.getElementById('numBalls').value);
    
    // Keep ball size consistent at 7px for all arena sizes
    smallBallRadius = 7;
    
    // Resize canvas to fit the big ball
    resizeCanvas(bigBallRadius);

    for (let i = 0; i < numBalls; i++) {
        let x, y;
        let attempts = 0;
        
        // Find a valid position inside the big ball
        do {
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * (bigBallRadius - smallBallRadius * 2);
            x = centerX + distance * Math.cos(angle);
            y = centerY + distance * Math.sin(angle);
            attempts++;
        } while (!isInsideBigBall(x, y, smallBallRadius) && attempts < 100);

        const speed = (0.8 + Math.random() * 0.7) * speedMultiplier;
        const angle = Math.random() * Math.PI * 2;
        const vx = speed * Math.cos(angle);
        const vy = speed * Math.sin(angle);
        const color = randomColor();

        balls.push(new Ball(x, y, vx, vy, smallBallRadius, color));
    }
}

// Animation loop
function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw big ball
    ctx.beginPath();
    ctx.arc(centerX, centerY, bigBallRadius, 0, Math.PI * 2);
    ctx.strokeStyle = '#667eea';
    ctx.lineWidth = 5;
    ctx.stroke();

    // First, update all line endpoints
    for (const line of lines) {
        line.x2 = line.ball.x;
        line.y2 = line.ball.y;
    }
    
    // Check for line crossings and mark lines for removal
    const linesToRemove = new Set();
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        // Skip if already marked for removal
        if (linesToRemove.has(line)) continue;
        
        // Check if any ball crosses this line
        for (const ball of balls) {
            if (checkLineCrossing(ball, line)) {
                linesToRemove.add(line);
                break;
            }
        }
    }
    
    // Remove marked lines
    for (const lineToRemove of linesToRemove) {
        // Remove from ball's lines array
        const lineIndex = lineToRemove.ball.lines.indexOf(lineToRemove);
        if (lineIndex > -1) {
            lineToRemove.ball.lines.splice(lineIndex, 1);
        }
        
        // Remove from global lines array
        const globalIndex = lines.indexOf(lineToRemove);
        if (globalIndex > -1) {
            lines.splice(globalIndex, 1);
        }
    }
    
    // Draw remaining lines
    for (const line of lines) {
        ctx.beginPath();
        ctx.moveTo(line.x1, line.y1);
        ctx.lineTo(line.x2, line.y2);
        ctx.strokeStyle = line.color;
        ctx.lineWidth = 3;
        ctx.globalAlpha = 0.6;
        ctx.stroke();
        ctx.globalAlpha = 1.0;
    }

    // Remove balls with no lines (only if they previously had lines)
    for (let i = balls.length - 1; i >= 0; i--) {
        if (balls[i].hasHadLines && balls[i].lines.length === 0 && balls.length > 1) {
            // Remove all lines associated with this ball
            for (let j = lines.length - 1; j >= 0; j--) {
                if (lines[j].ball === balls[i]) {
                    lines.splice(j, 1);
                }
            }
            balls.splice(i, 1);
        }
    }

    // Update balls
    for (const ball of balls) {
        ball.update();
    }

    // Check collisions between balls
    for (let i = 0; i < balls.length; i++) {
        for (let j = i + 1; j < balls.length; j++) {
            checkBallCollision(balls[i], balls[j]);
        }
    }

    // Draw balls
    for (const ball of balls) {
        ball.draw();
    }

    // Update status
    statusDiv.textContent = `Balls remaining: ${balls.length}`;

    // Check win condition
    if (balls.length === 1) {
        statusDiv.innerHTML = `<span class="winner">🎉 Winner! Ball color: ${balls[0].color} 🎉</span>`;
        isRunning = false;
        return;
    }

    if (isRunning) {
        animationId = requestAnimationFrame(animate);
    }
}

// Start simulation
startBtn.addEventListener('click', () => {
    if (!isRunning) {
        initBalls();
        isRunning = true;
        statusDiv.textContent = 'Simulation running...';
        animate();
    }
});

// Reset simulation
resetBtn.addEventListener('click', () => {
    isRunning = false;
    if (animationId) {
        cancelAnimationFrame(animationId);
    }
    balls = [];
    lines = [];
    
    // bigBallRadius is set by arena size buttons, no need to update here
    resizeCanvas(bigBallRadius);
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw big ball
    ctx.beginPath();
    ctx.arc(centerX, centerY, bigBallRadius, 0, Math.PI * 2);
    ctx.strokeStyle = '#667eea';
    ctx.lineWidth = 5;
    ctx.stroke();
    
    statusDiv.textContent = 'Ready to start';
});

// Arena size controls
const mediumArenaBtn = document.getElementById('mediumArenaBtn');
const bigArenaBtn = document.getElementById('bigArenaBtn');

mediumArenaBtn.addEventListener('click', () => {
    bigBallRadius = 250;
    mediumArenaBtn.classList.add('active');
    bigArenaBtn.classList.remove('active');
});

bigArenaBtn.addEventListener('click', () => {
    bigBallRadius = 400;
    mediumArenaBtn.classList.remove('active');
    bigArenaBtn.classList.add('active');
});

// Speed controls
const fastBtn = document.getElementById('fastBtn');
const superFastBtn = document.getElementById('superFastBtn');

fastBtn.addEventListener('click', () => {
    speedMultiplier = 2.5;
    fastBtn.classList.add('active');
    superFastBtn.classList.remove('active');
});

superFastBtn.addEventListener('click', () => {
    speedMultiplier = 5;
    fastBtn.classList.remove('active');
    superFastBtn.classList.add('active');
});

// Initial draw
resetBtn.click();

// Auto-start simulation
setTimeout(() => {
    startBtn.click();
}, 1000);
