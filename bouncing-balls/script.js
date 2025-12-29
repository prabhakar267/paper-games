// Canvas and context - Main drawing surface and controls
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const playBtn = document.getElementById('playBtn');
const speedSelect = document.getElementById('speedSelect');
const infoBtn = document.getElementById('infoBtn');
const modal = document.getElementById('infoModal');
const modalClose = document.getElementById('modalClose');

// Game state - Tracks current game status and ball collection
let balls = [];
let lines = [];
let dustParticles = [];
let animationId = null;
let isRunning = false;
let isPaused = false;
let smallBallRadius = 7;
let speedMultiplier = 2.5;

// Physics constants - Fine-tuned for engaging gameplay
const GRAVITY = 0.15;                    // Downward acceleration per frame
const VELOCITY_DAMPING = 0.9995;         // Air resistance (very small to keep balls moving)
const BOUNCE_ENERGY_LOSS = 0.99;         // Energy retained after wall collision (1% loss)
const MIN_VELOCITY_BOOST = 1.5;          // Minimum speed to prevent balls from getting stuck
const MAX_SPEED = 12;                    // Maximum speed to prevent balls from going too fast
const RANDOM_BOOST_CHANCE = 0.25;        // 25% chance of random boost on bounce
const RANDOM_BOOST_MIN = 1.15;           // Minimum boost multiplier (15% increase)
const RANDOM_BOOST_MAX = 1.35;           // Maximum boost multiplier (35% increase)
const MAX_LINES = 10;                    // Maximum number of lines to keep on screen

// Dust particle class for line removal effects
class DustParticle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 4;
        this.vy = (Math.random() - 0.5) * 4;
        this.size = 2 + Math.random() * 3;
        this.color = color;
        this.life = 1.0;  // 1.0 = full life, 0.0 = dead
        this.decay = 0.02 + Math.random() * 0.03;  // How fast it fades
    }
    
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vx *= 0.95;  // Slow down
        this.vy *= 0.95;
        this.life -= this.decay;
    }
    
    draw() {
        if (this.life <= 0) return;
        
        ctx.save();
        ctx.globalAlpha = this.life * 0.8;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
    
    isDead() {
        return this.life <= 0;
    }
}

// Create dust particles along a line
function createDustEffect(line) {
    const numParticles = 8 + Math.floor(Math.random() * 8);  // 8-15 particles
    
    for (let i = 0; i < numParticles; i++) {
        // Random position along the line
        const t = Math.random();
        const x = line.x1 + (line.x2 - line.x1) * t;
        const y = line.y1 + (line.y2 - line.y1) * t;
        
        dustParticles.push(new DustParticle(x, y, line.color));
    }
}

// Ball emoji collection with their representative colors
const ballEmojis = [
    { emoji: '🏀', color: '#FF6B35' },
    { emoji: '🏈', color: '#D2691E' },
    { emoji: '⚾', color: '#F0E68C' },
    { emoji: '🎾', color: '#CCFF00' },
    { emoji: '🏐', color: '#F0E68C' },
    { emoji: '🏉', color: '#D2691E' },
    { emoji: '🥎', color: '#FFEB3B' },
    { emoji: '🔴', color: '#FF0000' },
    { emoji: '🟠', color: '#FF9500' },
    { emoji: '🟡', color: '#FFEB3B' },
    { emoji: '🟢', color: '#34C759' },
    { emoji: '🔵', color: '#007AFF' },
    { emoji: '🟣', color: '#AF52DE' },
    { emoji: '🟤', color: '#D2691E' },
    { emoji: '⚪', color: '#F0E68C' },
    { emoji: '🌕', color: '#F4E8C1' },
    { emoji: '🌍', color: '#4A90E2' },
    { emoji: '🌎', color: '#5AC8FA' },
    { emoji: '🌏', color: '#30B0C7' },
    { emoji: '🪀', color: '#FF3B30' }
];

// Get random ball emoji with its color
// Returns: {emoji: string, color: string}
function randomBallEmoji() {
    return ballEmojis[Math.floor(Math.random() * ballEmojis.length)];
}

// Resize canvas to fill available space
// Called on initialization and window resize
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight - 70; // Reserve space for navigation bar
}

// Ball class - Represents a single ball with physics, trail, and line management
class Ball {
    constructor(x, y, vx, vy, radius, color, emoji) {
        this.x = x;                     // Current X position
        this.y = y;                     // Current Y position
        this.vx = vx;                   // X velocity
        this.vy = vy;                   // Y velocity
        this.radius = radius;           // Ball size
        this.color = color;             // Trail and line color
        this.emoji = emoji;             // Display emoji
        this.lines = [];                // Lines attached to this ball
        this.hasHadLines = false;       // Flag to track if ball ever had lines
        this.prevX = x;                 // Previous X for collision detection
        this.prevY = y;                 // Previous Y for collision detection
        this.trail = [];                // Trail effect positions
        this.maxTrailLength = 15;       // Max trail segments to display
    }

    update() {
        // Store previous position for smooth interpolation
        this.prevX = this.x;
        this.prevY = this.y;
        
        // Add current position to trail for visual effect
        this.trail.push({ x: this.x, y: this.y });
        
        if (this.trail.length > this.maxTrailLength) {
            this.trail.shift();
        }
        
        // Apply gravity to vertical velocity
        this.vy += GRAVITY;
        
        // Apply air resistance to slow down balls slightly
        this.vx *= VELOCITY_DAMPING;
        this.vy *= VELOCITY_DAMPING;
        
        // Speed management - prevent balls from being too slow or too fast
        const currentSpeed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        
        // Minimum speed boost - prevents balls from getting too slow and stuck
        if (currentSpeed < MIN_VELOCITY_BOOST && currentSpeed > 0.1) {
            const boostFactor = MIN_VELOCITY_BOOST / currentSpeed;
            this.vx *= boostFactor;
            this.vy *= boostFactor;
        }
        
        // Maximum speed cap - prevents balls from going too fast
        if (currentSpeed > MAX_SPEED) {
            const capFactor = MAX_SPEED / currentSpeed;
            this.vx *= capFactor;
            this.vy *= capFactor;
        }
        
        // Update position based on velocity
        this.x += this.vx;
        this.y += this.vy;

        // Wall collision detection and bounce physics
        let bounced = false;
        
        // Left wall
        if (this.x - this.radius < 0) {
            this.x = this.radius;
            this.vx = Math.abs(this.vx) * BOUNCE_ENERGY_LOSS;
            bounced = true;
        }
        
        // Right wall
        if (this.x + this.radius > canvas.width) {
            this.x = canvas.width - this.radius;
            this.vx = -Math.abs(this.vx) * BOUNCE_ENERGY_LOSS;
            bounced = true;
        }
        
        // Top wall
        if (this.y - this.radius < 0) {
            this.y = this.radius;
            this.vy = Math.abs(this.vy) * BOUNCE_ENERGY_LOSS;
            bounced = true;
        }
        
        // Bottom wall
        if (this.y + this.radius > canvas.height) {
            this.y = canvas.height - this.radius;
            this.vy = -Math.abs(this.vy) * BOUNCE_ENERGY_LOSS;
            bounced = true;
        }
        
        // Random boost on bounce - adds unpredictability and excitement
        if (bounced) {
            if (Math.random() < RANDOM_BOOST_CHANCE) {
                const boostFactor = RANDOM_BOOST_MIN + Math.random() * (RANDOM_BOOST_MAX - RANDOM_BOOST_MIN);
                this.vx *= boostFactor;
                this.vy *= boostFactor;
            }
            
            // Create a new line from wall to ball position
            this.createLine();
        }
    }

    createLine() {
        // Determine which wall was hit by finding minimum distance
        // Creates line from nearest wall edge to ball center
        let wallX = this.x;
        let wallY = this.y;
        
        const distToLeft = Math.abs(this.x - this.radius);
        const distToRight = Math.abs(this.x - (canvas.width - this.radius));
        const distToTop = Math.abs(this.y - this.radius);
        const distToBottom = Math.abs(this.y - (canvas.height - this.radius));
        
        const minDist = Math.min(distToLeft, distToRight, distToTop, distToBottom);
        
        if (minDist === distToLeft) {
            wallX = 0;
        } else if (minDist === distToRight) {
            wallX = canvas.width;
        } else if (minDist === distToTop) {
            wallY = 0;
        } else {
            wallY = canvas.height;
        }
        
        const line = {
            x1: wallX,
            y1: wallY,
            x2: this.x,
            y2: this.y,
            color: this.color,
            ball: this,
            timestamp: Date.now()  // Track creation time for removal
        };
        lines.push(line);
        this.lines.push(line);
        this.hasHadLines = true;
        
        // Enforce maximum line limit - remove oldest lines
        if (lines.length > MAX_LINES) {
            // Sort by timestamp to find oldest lines
            const sortedLines = [...lines].sort((a, b) => a.timestamp - b.timestamp);
            const linesToRemove = sortedLines.slice(0, lines.length - MAX_LINES);
            
            for (const oldLine of linesToRemove) {
                // Create dust effect before removing
                createDustEffect(oldLine);
                
                // Remove from ball's line array
                const ballLineIndex = oldLine.ball.lines.indexOf(oldLine);
                if (ballLineIndex > -1) {
                    oldLine.ball.lines.splice(ballLineIndex, 1);
                }
                
                // Remove from global lines array
                const globalIndex = lines.indexOf(oldLine);
                if (globalIndex > -1) {
                    lines.splice(globalIndex, 1);
                }
            }
        }
    }

    drawTrail() {
        // Skip if not enough trail points for a line
        if (this.trail.length < 2) return;
        
        // Draw trail segments with fading opacity and thickness
        for (let i = 0; i < this.trail.length - 1; i++) {
            const segment = this.trail[i];
            const nextSegment = this.trail[i + 1];
            
            const opacity = (i / this.trail.length) * 0.6;
            const thickness = this.radius * 2 * (0.3 + (i / this.trail.length) * 0.7);
            
            let r, g, b;
            if (this.color.startsWith('#')) {
                const hex = this.color.substring(1);
                r = parseInt(hex.substring(0, 2), 16);
                g = parseInt(hex.substring(2, 4), 16);
                b = parseInt(hex.substring(4, 6), 16);
            } else if (this.color.startsWith('hsl')) {
                ctx.strokeStyle = this.color.replace(')', `, ${opacity})`).replace('hsl', 'hsla');
                ctx.lineWidth = thickness;
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';
                
                ctx.beginPath();
                ctx.moveTo(segment.x, segment.y);
                ctx.lineTo(nextSegment.x, nextSegment.y);
                ctx.stroke();
                continue;
            }
            
            ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`;
            ctx.lineWidth = thickness;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            
            ctx.beginPath();
            ctx.moveTo(segment.x, segment.y);
            ctx.lineTo(nextSegment.x, nextSegment.y);
            ctx.stroke();
        }
    }

    draw() {
        // Draw emoji with shadow for depth effect
        ctx.font = `${this.radius * 2.8}px "Open Sans", sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Add subtle shadow for 3D effect
        ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;
        
        ctx.fillText(this.emoji, this.x, this.y);
        
        // Reset shadow to avoid affecting other drawings
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
    }
}

// Elastic collision between two balls using conservation of momentum
// Uses rotation matrix to simplify collision in the contact direction
function checkBallCollision(ball1, ball2) {
    // Calculate distance between ball centers
    const dx = ball2.x - ball1.x;
    const dy = ball2.y - ball1.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Check if balls are overlapping
    if (distance < ball1.radius + ball2.radius) {
        // Collision angle between the two balls
        const angle = Math.atan2(dy, dx);
        const sin = Math.sin(angle);
        const cos = Math.cos(angle);

        // Store initial speeds to maintain total energy
        const speed1 = Math.sqrt(ball1.vx * ball1.vx + ball1.vy * ball1.vy);
        const speed2 = Math.sqrt(ball2.vx * ball2.vx + ball2.vy * ball2.vy);

        // Rotate velocities to collision coordinate system
        const vx1 = ball1.vx * cos + ball1.vy * sin;
        const vy1 = ball1.vy * cos - ball1.vx * sin;
        const vx2 = ball2.vx * cos + ball2.vy * sin;
        const vy2 = ball2.vy * cos - ball2.vx * sin;

        // Exchange velocities along collision axis (elastic collision)
        const vx1Final = vx2;
        const vx2Final = vx1;

        // Rotate velocities back to world coordinate system
        ball1.vx = vx1Final * cos - vy1 * sin;
        ball1.vy = vy1 * cos + vx1Final * sin;
        ball2.vx = vx2Final * cos - vy2 * sin;
        ball2.vy = vy2 * cos + vx2Final * sin;

        // Normalize speeds to average to prevent energy buildup
        const avgSpeed = (speed1 + speed2) / 2;
        const newSpeed1 = Math.sqrt(ball1.vx * ball1.vx + ball1.vy * ball1.vy);
        const newSpeed2 = Math.sqrt(ball2.vx * ball2.vx + ball2.vy * ball2.vy);
        
        if (newSpeed1 > 0) {
            ball1.vx = (ball1.vx / newSpeed1) * avgSpeed;
            ball1.vy = (ball1.vy / newSpeed1) * avgSpeed;
        }
        if (newSpeed2 > 0) {
            ball2.vx = (ball2.vx / newSpeed2) * avgSpeed;
            ball2.vy = (ball2.vy / newSpeed2) * avgSpeed;
        }

        // Separate balls to prevent sticking together
        const overlap = ball1.radius + ball2.radius - distance;
        const separateX = (overlap / 2) * cos;
        const separateY = (overlap / 2) * sin;
        ball1.x -= separateX;
        ball1.y -= separateY;
        ball2.x += separateX;
        ball2.y += separateY;
    }
}

// Line-circle intersection using point-to-line-segment distance
// Returns true if ball's circle intersects with the line segment
function checkLineCrossing(ball, line) {
    // Ball can't cross its own lines
    if (ball.lines.length > 0 && ball === line.ball) return false;
    
    const dx = line.x2 - line.x1;
    const dy = line.y2 - line.y1;
    const lengthSquared = dx * dx + dy * dy;
    
    // Handle degenerate case where line is a point
    if (lengthSquared === 0) {
        const distX = ball.x - line.x1;
        const distY = ball.y - line.y1;
        return Math.sqrt(distX * distX + distY * distY) <= ball.radius;
    }
    
    // Project ball center onto line segment (clamped to [0,1])
    // t=0 means projection at line start, t=1 at line end
    const t = Math.max(0, Math.min(1, 
        ((ball.x - line.x1) * dx + (ball.y - line.y1) * dy) / lengthSquared
    ));
    
    // Calculate closest point on line segment to ball center
    const projX = line.x1 + t * dx;
    const projY = line.y1 + t * dy;
    
    // Calculate distance from ball center to closest point
    const distX = ball.x - projX;
    const distY = ball.y - projY;
    const distance = Math.sqrt(distX * distX + distY * distY);
    
    // Ball crosses line if distance is less than radius
    return distance <= ball.radius;
}

// Initialize balls with random positions and velocities
function initBalls() {
    balls = [];
    lines = [];
    dustParticles = [];  // Clear dust particles on restart
    const numBalls = parseInt(document.getElementById('numBalls').value);
    
    smallBallRadius = 7;
    
    resizeCanvas();

    for (let i = 0; i < numBalls; i++) {
        // Random position within canvas bounds with margin
        const margin = smallBallRadius * 2;
        const x = margin + Math.random() * (canvas.width - margin * 2);
        const y = margin + Math.random() * (canvas.height - margin * 2);

        const speed = (1.1 + Math.random() * 0.4) * speedMultiplier;
        const angle = Math.random() * Math.PI * 2;
        const vx = speed * Math.cos(angle);
        const vy = speed * Math.sin(angle);
        const ballData = randomBallEmoji();
        const emoji = ballData.emoji;
        const color = ballData.color;

        balls.push(new Ball(x, y, vx, vy, smallBallRadius, color, emoji));
    }
}

// Main animation loop - runs at ~60fps via requestAnimationFrame
function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Update line endpoints to follow attached balls
    for (const line of lines) {
        line.x2 = line.ball.x;
        line.y2 = line.ball.y;
    }
    
    // Check for line crossings - lines disappear when any ball touches them
    const linesToRemove = new Set();
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        if (linesToRemove.has(line)) continue;
        
        // Check if any ball crosses this line
        for (const ball of balls) {
            if (checkLineCrossing(ball, line)) {
                linesToRemove.add(line);
                break;
            }
        }
    }
    
    // Remove crossed lines from ball's line array and global lines array
    for (const lineToRemove of linesToRemove) {
        // Create dust effect when line is crossed by a ball
        createDustEffect(lineToRemove);
        
        const lineIndex = lineToRemove.ball.lines.indexOf(lineToRemove);
        if (lineIndex > -1) {
            lineToRemove.ball.lines.splice(lineIndex, 1);
        }
        
        const globalIndex = lines.indexOf(lineToRemove);
        if (globalIndex > -1) {
            lines.splice(globalIndex, 1);
        }
    }
    
    // Update and draw dust particles
    for (let i = dustParticles.length - 1; i >= 0; i--) {
        dustParticles[i].update();
        
        if (dustParticles[i].isDead()) {
            dustParticles.splice(i, 1);
        }
    }
    
    for (const particle of dustParticles) {
        particle.draw();
    }
    
    // Draw remaining lines with light styling
    for (const line of lines) {
        // Draw single colored line without dark outline
        ctx.beginPath();
        ctx.moveTo(line.x1, line.y1);
        ctx.lineTo(line.x2, line.y2);
        ctx.strokeStyle = line.color;
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.globalAlpha = 0.7;
        ctx.stroke();
        ctx.globalAlpha = 1.0;
    }

    // Remove balls that have lost all their lines (elimination mechanic)
    // Only remove if ball has had lines before and there's more than one ball
    for (let i = balls.length - 1; i >= 0; i--) {
        if (balls[i].hasHadLines && balls[i].lines.length === 0 && balls.length > 1) {
            // Clean up any orphaned lines belonging to this ball
            for (let j = lines.length - 1; j >= 0; j--) {
                if (lines[j].ball === balls[i]) {
                    lines.splice(j, 1);
                }
            }
            balls.splice(i, 1);
        }
    }

    // Game over: only one ball remains - the winner!
    if (balls.length === 1) {
        isRunning = false;
        isPaused = true;
        if (animationId) {
            cancelAnimationFrame(animationId);
        }
        updatePlayButton();
        
        // Draw final state
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
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
        
        balls[0].drawTrail();
        balls[0].draw();
        
        drawResetButton();
        
        return;
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

    // Draw balls with trails
    for (const ball of balls) {
        ball.drawTrail();
        ball.draw();
    }

    updatePlayButton();

    if (isRunning) {
        animationId = requestAnimationFrame(animate);
    }
}

// Draw reset button on canvas
function drawResetButton() {
    const buttonRadius = 60;
    const buttonX = canvas.width / 2;
    const buttonY = canvas.height / 2;
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 15;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 4;
    
    ctx.beginPath();
    ctx.arc(buttonX, buttonY, buttonRadius, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    
    ctx.fillStyle = '#333';
    ctx.font = '48px "Open Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🔄', buttonX, buttonY);
    
    canvas.resetButtonBounds = {
        centerX: buttonX,
        centerY: buttonY,
        radius: buttonRadius,
        isCircular: true
    };
}

// Update play button text
function updatePlayButton() {
    if (isRunning) {
        playBtn.innerHTML = `<i class="fas fa-pause"></i> Pause (${balls.length} balls)`;
    } else if (isPaused) {
        playBtn.innerHTML = '<i class="fas fa-redo"></i> Restart';
    } else {
        playBtn.innerHTML = '<i class="fas fa-play"></i> Play';
    }
}

// Play/Pause/Reset button handler - state machine with three states
playBtn.addEventListener('click', () => {
    if (!isRunning && !isPaused) {
        // State 1: Start new game
        initBalls();
        isRunning = true;
        isPaused = false;
        updatePlayButton();
        animate();
    } else if (isRunning) {
        // State 2: Pause current game
        isRunning = false;
        isPaused = true;
        if (animationId) {
            cancelAnimationFrame(animationId);
        }
        updatePlayButton();
    } else if (isPaused) {
        // State 3: Restart - immediately start a new game
        canvas.resetButtonBounds = null;
        initBalls();
        isRunning = true;
        isPaused = false;
        updatePlayButton();
        animate();
    }
});

// Speed control
speedSelect.addEventListener('change', (e) => {
    speedMultiplier = parseFloat(e.target.value);
});

// Modal controls
infoBtn.addEventListener('click', () => {
    modal.classList.add('active');
});

modalClose.addEventListener('click', () => {
    modal.classList.remove('active');
});

modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.classList.remove('active');
    }
});

// Canvas click handler for reset button
canvas.addEventListener('click', (event) => {
    if (!isRunning && isPaused && canvas.resetButtonBounds) {
        const rect = canvas.getBoundingClientRect();
        const clickX = event.clientX - rect.left;
        const clickY = event.clientY - rect.top;
        
        const bounds = canvas.resetButtonBounds;
        const dx = clickX - bounds.centerX;
        const dy = clickY - bounds.centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance <= bounds.radius) {
            playBtn.click();
        }
    }
});

// Hover effect for reset button
canvas.addEventListener('mousemove', (event) => {
    if (!isRunning && isPaused && canvas.resetButtonBounds) {
        const rect = canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;
        
        const bounds = canvas.resetButtonBounds;
        const dx = mouseX - bounds.centerX;
        const dy = mouseY - bounds.centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        canvas.style.cursor = distance <= bounds.radius ? 'pointer' : 'default';
    } else {
        canvas.style.cursor = 'default';
    }
});

// Handle window resize - only resize when game is not running to avoid disruption
window.addEventListener('resize', () => {
    if (!isRunning) {
        resizeCanvas();
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
});

// Initialize canvas and UI on page load
resizeCanvas();
ctx.clearRect(0, 0, canvas.width, canvas.height);
updatePlayButton();
