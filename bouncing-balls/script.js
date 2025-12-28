// Canvas and context
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const startBtn = document.getElementById('startBtn');
const resetBtn = document.getElementById('resetBtn');

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
let isFullScreenMode = false;

// Function to resize canvas based on big ball radius or full screen mode
function resizeCanvas(radius) {
    if (isFullScreenMode) {
        // Full screen mode: use entire viewport
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        
        // Calculate 5% padding from all edges
        const paddingX = canvas.width * 0.05;
        const paddingY = canvas.height * 0.05;
        
        // Calculate the largest circle that fits in the viewport with 5% margins
        const availableWidth = canvas.width - paddingX * 2;
        const availableHeight = canvas.height - paddingY * 2;
        bigBallRadius = Math.min(availableWidth, availableHeight) / 2;
        
        centerX = canvas.width / 2;
        centerY = canvas.height / 2;
        
        // Apply full screen styling
        canvas.classList.add('fullscreen');
        document.body.classList.add('fullscreen-active');
    } else {
        // Normal mode
        const padding = 20;
        const size = Math.max(600, (radius * 2) + padding * 2);
        canvas.width = size;
        canvas.height = size;
        centerX = canvas.width / 2;
        centerY = canvas.height / 2;
        
        // Remove full screen styling
        canvas.classList.remove('fullscreen');
        document.body.classList.remove('fullscreen-active');
    }
}

// Generate random color from a curated palette
function randomColor() {
    if (isFullScreenMode) {
        // Vibrant neon-style colors for fullscreen mode
        const colors = [
            '#00f5ff', // Cyan
            '#ff006e', // Hot pink
            '#ffbe0b', // Yellow
            '#8338ec', // Purple
            '#3a86ff', // Blue
            '#fb5607', // Orange
            '#06ffa5', // Mint green
            '#ff006e', // Magenta
            '#00bbf9', // Sky blue
            '#f72585'  // Pink
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    } else {
        // Original random colors for normal mode
        const hue = Math.random() * 360;
        return `hsl(${hue}, 70%, 50%)`;
    }
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

            // Increase speed on bounce
            const currentSpeed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
            const speedIncreaseFactor = 1.03; // 3% speed increase per bounce
            const newSpeed = currentSpeed * speedIncreaseFactor;
            const speedRatio = newSpeed / currentSpeed;
            this.vx *= speedRatio;
            this.vy *= speedRatio;

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
async function initBalls() {
    balls = [];
    lines = [];
    const numBalls = parseInt(document.getElementById('numBalls').value);
    
    // Keep ball size consistent at 7px for all arena sizes
    smallBallRadius = 7;
    
    // Enter fullscreen if Full Screen mode is selected
    if (isFullScreenMode) {
        try {
            if (document.documentElement.requestFullscreen) {
                await document.documentElement.requestFullscreen();
            } else if (document.documentElement.webkitRequestFullscreen) {
                await document.documentElement.webkitRequestFullscreen();
            } else if (document.documentElement.mozRequestFullScreen) {
                await document.documentElement.mozRequestFullScreen();
            } else if (document.documentElement.msRequestFullscreen) {
                await document.documentElement.msRequestFullscreen();
            }
        } catch (err) {
            console.error('Error attempting to enable full screen:', err);
        }
    }
    
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
    ctx.strokeStyle = isFullScreenMode ? '#00f5ff' : '#667eea';
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

    // Check if only one ball remains with 20 lines - stop simulation
    if (balls.length === 1 && balls[0].lines.length >= 20) {
        isRunning = false;
        if (animationId) {
            cancelAnimationFrame(animationId);
        }
        updateStartButton();
        // Continue to draw the final state
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw big ball
        ctx.beginPath();
        ctx.arc(centerX, centerY, bigBallRadius, 0, Math.PI * 2);
        ctx.strokeStyle = isFullScreenMode ? '#00f5ff' : '#667eea';
        ctx.lineWidth = 5;
        ctx.stroke();
        
        // Draw all lines
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
        
        // Draw the final ball
        balls[0].draw();
        
        return; // Exit animation loop
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

    // Update button
    updateStartButton();

    if (isRunning) {
        animationId = requestAnimationFrame(animate);
    }
}

// Update start button text based on simulation state
function updateStartButton() {
    if (isRunning) {
        startBtn.textContent = `⏸️ Stop (${balls.length} balls remaining)`;
        fullscreenStartBtn.textContent = '⏸️';
        fullscreenStartBtn.title = 'Stop';
        // Disable arena size buttons when running
        mediumArenaBtn.disabled = true;
        fullScreenArenaBtn.disabled = true;
    } else {
        startBtn.textContent = '▶️ Start Simulation';
        fullscreenStartBtn.textContent = '▶️';
        fullscreenStartBtn.title = 'Start';
        // Enable arena size buttons when stopped
        mediumArenaBtn.disabled = false;
        fullScreenArenaBtn.disabled = false;
    }
}

// Start/Stop simulation toggle
startBtn.addEventListener('click', async () => {
    if (!isRunning) {
        await initBalls();
        isRunning = true;
        updateStartButton();
        animate();
    } else {
        // Stop simulation
        isRunning = false;
        if (animationId) {
            cancelAnimationFrame(animationId);
        }
        updateStartButton();
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
    
    updateStartButton();
});

// Arena size controls
const mediumArenaBtn = document.getElementById('mediumArenaBtn');
const fullScreenArenaBtn = document.getElementById('fullScreenArenaBtn');

mediumArenaBtn.addEventListener('click', () => {
    if (!isRunning) {
        isFullScreenMode = false;
        bigBallRadius = 250;
        mediumArenaBtn.classList.add('active');
        fullScreenArenaBtn.classList.remove('active');
        resizeCanvas(bigBallRadius);
        
        // Redraw the arena
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.beginPath();
        ctx.arc(centerX, centerY, bigBallRadius, 0, Math.PI * 2);
        ctx.strokeStyle = '#667eea';
        ctx.lineWidth = 5;
        ctx.stroke();
    }
});

fullScreenArenaBtn.addEventListener('click', () => {
    if (!isRunning) {
        isFullScreenMode = true;
        mediumArenaBtn.classList.remove('active');
        fullScreenArenaBtn.classList.add('active');
    }
});

// Handle fullscreen change events
document.addEventListener('fullscreenchange', handleFullscreenChange);
document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
document.addEventListener('mozfullscreenchange', handleFullscreenChange);
document.addEventListener('MSFullscreenChange', handleFullscreenChange);

function handleFullscreenChange() {
    const isCurrentlyFullscreen = document.fullscreenElement || 
                                   document.webkitFullscreenElement || 
                                   document.mozFullScreenElement || 
                                   document.msFullscreenElement;
    
    if (!isCurrentlyFullscreen && isFullScreenMode) {
        // User exited fullscreen (e.g., pressed ESC) - reset to medium
        if (!isRunning) {
            isFullScreenMode = false;
            bigBallRadius = 250;
            mediumArenaBtn.classList.add('active');
            fullScreenArenaBtn.classList.remove('active');
            resizeCanvas(bigBallRadius);
            
            // Redraw the arena
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.beginPath();
            ctx.arc(centerX, centerY, bigBallRadius, 0, Math.PI * 2);
            ctx.strokeStyle = '#667eea';
            ctx.lineWidth = 5;
            ctx.stroke();
        }
    }
}

// Handle window resize in full screen mode
window.addEventListener('resize', () => {
    if (isFullScreenMode && !isRunning) {
        resizeCanvas(0);
        // Redraw the arena
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.beginPath();
        ctx.arc(centerX, centerY, bigBallRadius, 0, Math.PI * 2);
        ctx.strokeStyle = '#667eea';
        ctx.lineWidth = 5;
        ctx.stroke();
    }
});

// Full screen overlay controls
const fullscreenStartBtn = document.getElementById('fullscreenStartBtn');
const fullscreenResetBtn = document.getElementById('fullscreenResetBtn');
const fullscreenExitBtn = document.getElementById('fullscreenExitBtn');

fullscreenStartBtn.addEventListener('click', () => {
    startBtn.click(); // Trigger the main start button
});

fullscreenResetBtn.addEventListener('click', () => {
    resetBtn.click(); // Trigger the main reset button
});

fullscreenExitBtn.addEventListener('click', () => {
    // Exit fullscreen mode
    if (document.exitFullscreen) {
        document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
    } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
    } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
    }
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
