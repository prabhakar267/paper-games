# Paper Games Project Guidelines

This document provides comprehensive guidelines for creating new game projects in the paper-games repository and maintaining consistency across all projects.

## Project Structure Overview

```
paper-games/
├── common/                      # Shared resources (DO NOT DUPLICATE)
│   ├── styles.css              # Common CSS styles
│   ├── utils.js                # Common JavaScript utilities
│   ├── assets/                 # Shared assets
│   │   └── colored-pencil.png
│   └── README.md
├── [project-name]/             # Individual game projects
│   ├── index.html
│   ├── style.css              # Project-specific styles ONLY
│   ├── script.js              # Project-specific JavaScript
│   └── assets/                # Project-specific assets
│       └── banner_image_generated.png
├── index.html                  # Landing page
└── landing-style.css
```

## Creating a New Project: Step-by-Step

### Step 1: Create Project Directory

```bash
mkdir [project-name]
mkdir [project-name]/assets
```

**Naming Convention:**
- Use lowercase with hyphens (kebab-case): `bouncing-balls`, `order-chaos`
- Keep names descriptive but concise
- Avoid spaces and special characters

### Step 2: Create HTML File

Create `[project-name]/index.html` with this structure:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    
    <!-- SEO Meta Tags -->
    <meta name="description" content="[Write compelling 150-160 char description]">
    <meta name="keywords" content="[game type], strategy game, board game, paper game">
    <meta name="author" content="Prabhakar Gupta">
    <meta name="robots" content="index, follow">
    <meta name="language" content="English">
    
    <!-- Open Graph / Social Media -->
    <meta property="og:title" content="[Game Name] - [Tagline]">
    <meta property="og:description" content="[Brief description for social sharing]">
    <meta property="og:type" content="website">
    <meta property="og:image" content="https://prabhakar267.github.io/paper-games/[project-name]/assets/banner_image_generated.png">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    
    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="[Game Name] - [Tagline]">
    <meta name="twitter:description" content="[Brief description]">
    <meta name="twitter:image" content="https://prabhakar267.github.io/paper-games/[project-name]/assets/banner_image_generated.png">
    
    <title>[Game Name] - [Tagline]</title>
    
    <!-- Favicon -->
    <link rel="icon" type="image/png" href="https://prabhakar267.github.io/paper-games/common/assets/colored-pencil.png">
    <link rel="apple-touch-icon" href="https://prabhakar267.github.io/paper-games/common/assets/colored-pencil.png">
    
    <!-- Google Fonts - Always use Open Sans -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,300..800;1,300..800&display=swap" rel="stylesheet">
    
    <!-- Stylesheets: CRITICAL ORDER -->
    <link rel="stylesheet" href="../common/styles.css">
    <link rel="stylesheet" href="style.css">
    
    <!-- Google Analytics -->
    <script>
        (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
        (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
        m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
        })(window,document,'script','//www.google-analytics.com/analytics.js','ga');
        
        ga('create', 'UA-57220954-1', 'auto');
        ga('send', 'pageview');
    </script>
</head>
<body>
    <div class="container">
        <h1>[Game Title with Emoji] 🎮</h1>
        
        <!-- OPTIONAL: Game Setup Section -->
        <div class="game-setup" id="gameSetup">
            <h2>Game Setup</h2>
            
            <div class="setup-section">
                <h3>[Setting Category]</h3>
                <div class="radio-group">
                    <label>
                        <input type="radio" name="[setting]" value="[value]" checked>
                        [Option 1 Description]
                    </label>
                    <label>
                        <input type="radio" name="[setting]" value="[value2]">
                        [Option 2 Description]
                    </label>
                </div>
            </div>
            
            <button id="startGame" class="btn-primary">Start Game</button>
            <div style="text-align: center; margin-top: 15px;">
                <a href="../" class="btn-secondary" style="display: inline-block; text-decoration: none;">Explore More Games</a>
            </div>
        </div>
        
        <!-- Game Area -->
        <div class="game-area" id="gameArea" style="display: none;">
            <div class="game-info">
                <div class="game-status" id="gameStatus">
                    [Status text]
                </div>
            </div>
            
            <!-- Your game board/canvas/grid here -->
            
            <div class="game-controls">
                <button id="resetGame" class="btn-secondary">New Game</button>
                <a href="../" class="btn-secondary" style="display: inline-block; text-decoration: none;">Explore More Games</a>
            </div>
        </div>
        
        <!-- Info Sections - REQUIRED -->
        <div class="info-sections">
            <div class="collapsible-section">
                <div class="section-header" onclick="toggleSection('rules')">
                    <h3>Rules</h3>
                    <span class="toggle-icon" id="rules-icon">▼</span>
                </div>
                <div class="section-content" id="rules-content">
                    <ul>
                        <li>[Rule 1]</li>
                        <li>[Rule 2]</li>
                        <li>[Rule 3]</li>
                    </ul>
                    
                    <div class="reference">
                        <p><strong>Game Reference:</strong> <a href="[url]" target="_blank" rel="noopener noreferrer">[Link Text]</a></p>
                    </div>
                </div>
            </div>
            
            <!-- Add more collapsible sections as needed -->
        </div>
    </div>
    
    <!-- Scripts: CRITICAL ORDER -->
    <script src="../common/utils.js"></script>
    <script src="script.js"></script>
</body>
</html>
```

### Step 3: Create CSS File

Create `[project-name]/style.css` - **ONLY include project-specific styles:**

```css
/* [Project Name] Specific Styles */

/* RULES:
 * 1. DO NOT redefine common styles (body, .container, h1, h2, h3, buttons, etc.)
 * 2. Only add styles unique to this project
 * 3. Use the same color scheme: #667eea, #764ba2, #e74c3c, #3498db
 * 4. Follow the existing naming conventions
 */

/* Example: Game-specific board styles */
.game-board {
    /* Your unique styles here */
}

/* Example: Game-specific cell styles */
.cell {
    /* Your unique styles here */
}

/* Always include responsive design */
@media (max-width: 768px) {
    /* Mobile-specific adjustments */
}

@media (max-width: 600px) {
    /* Small mobile adjustments */
}
```

### Step 4: Create JavaScript File

Create `[project-name]/script.js`:

```javascript
// [Project Name] Game Logic

// IMPORTANT: Do not redefine toggleSection() - it's in common/utils.js

// Game state variables
let gameState = {
    // Your state here
};

// Initialize game
function initGame() {
    // Setup code
}

// Game logic functions
// ...

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    // Setup event listeners
});
```

### Step 5: Add Assets

1. **Banner Image** (REQUIRED): Create `assets/banner_image_generated.png`
   - Size: 1200x630px
   - Format: PNG
   - Purpose: Social media sharing (Open Graph)

2. **Favicon**: Always use the shared favicon from `common/assets/colored-pencil.png`
   - DO NOT copy colored-pencil.png to individual project directories
   - Reference it from common directory in HTML: `https://prabhakar267.github.io/paper-games/common/assets/colored-pencil.png`
   - Projects can create custom favicons if needed, but the default colored-pencil.png should remain only in common/assets/

### Step 6: Update Landing Page

Add your project to the main `index.html`:

```html
<div class="game-tile" style="background-image: url('[project-name]/assets/banner_image_generated.png');">
    <a href="[project-name]/">
        <div class="tile-overlay">
            <h3>[Game Name]</h3>
            <p>[One-line description from your game]</p>
        </div>
    </a>
</div>
```

### Step 7: Update README.md

Add your project to the main `README.md` file in the games table:

```markdown
| [<img src="[project-name]/assets/banner_image_generated.png" width="400" alt="[Game Name]">](https://prabhakar267.github.io/paper-games/[project-name]/) | **[[Game Name]](https://prabhakar267.github.io/paper-games/[project-name]/)**<br>[One-line description from your game] |
```

**Important:**
- Add the new game entry as a new row in the table
- Use the same one-line description as used in the landing page
- Images are fixed at 400px width using HTML img tags
- The banner image should be clickable and link to the live game URL
- The game name should also be a clickable link

## Common Resources - DO NOT DUPLICATE

### Available from common/styles.css

**DO NOT redefine these in your project CSS:**

- CSS Reset (`* { margin: 0; padding: 0; box-sizing: border-box; }`)
- `body` styling (gradient background, flexbox layout)
- `.container` (white card with shadow)
- Typography: `h1`, `h2`, `h3`
- Buttons: `.btn-primary`, `.btn-secondary`
- `.setup-section`
- `.radio-group` and radio button styling
- `.info-sections` and collapsible sections
- `.collapsible-section`, `.section-header`, `.toggle-icon`, `.section-content`
- `.reference` links styling
- `.game-info`, `.game-status`, `.game-controls`
- `@keyframes pulse` animation
- Base responsive breakpoints (@media queries)

### Available from common/utils.js

**DO NOT redefine these in your project JavaScript:**

- `toggleSection(sectionId)` - Handles collapsible section toggling

### Available from common/assets/

- `colored-pencil.png` - Default favicon/icon

## Design Guidelines

### Color Palette (Use Consistently)

```css
--primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
--primary-color: #667eea;
--secondary-color: #764ba2;
--error-red: #e74c3c;
--info-blue: #3498db;
--success-green: #27ae60;
--warning-yellow: #f1c40f;
--text-dark: #333;
--text-medium: #555;
--text-light: #666;
--bg-light: #f8f9fa;
--border-color: #ddd;
```

### Typography

- **Font**: Open Sans (already loaded via Google Fonts)
- **H1**: 2.5em, center-aligned
- **H2**: 1.5-2em, center-aligned
- **H3**: 1.2em
- **Body**: 1em, line-height 1.6

### Spacing

- Use consistent padding/margin: 10px, 15px, 20px, 30px, 40px
- Container padding: 30px (20px on mobile)
- Section margins: 20-25px

### Interactive Elements

- **Hover effects**: Use `transform: translateY(-2px)` or `transform: scale(1.05)`
- **Transitions**: Keep under 0.3s (`transition: all 0.3s ease`)
- **Cursor**: Always use `cursor: pointer` on clickable elements

## File Naming Conventions

- **Directories**: `lowercase-with-hyphens`
- **HTML files**: `index.html` (always)
- **CSS files**: `style.css` (project-specific)
- **JS files**: `script.js` (project-specific)
- **Images**: `descriptive-name.png` or `descriptive-name.jpg`
- **Banner images**: Always `banner_image_generated.png`

## Code Style Guidelines

### HTML
- Use 4-space indentation
- Include semantic HTML5 elements
- Always include proper meta tags
- Use meaningful IDs and class names
- Close all tags properly

### CSS
- Use 4-space indentation
- Group related styles together
- Comment major sections
- Mobile-first responsive design
- Use class selectors over IDs for styling

### JavaScript
- Use 4-space indentation or 2-space (be consistent within file)
- Use `const` and `let`, avoid `var`
- Use descriptive variable/function names
- Comment complex logic
- Use modern ES6+ features where appropriate

## Testing Checklist

Before committing a new project:

- [ ] All HTML validates (no errors)
- [ ] CSS doesn't override common styles unnecessarily
- [ ] JavaScript works without console errors
- [ ] Responsive design works on mobile (test at 320px, 768px, 1024px)
- [ ] All buttons and interactive elements work
- [ ] Collapsible sections toggle correctly
- [ ] "Back to Games" links work
- [ ] Meta tags are complete and accurate
- [ ] Banner image exists and displays correctly
- [ ] Game is playable end-to-end
- [ ] Browser console has no errors
- [ ] Landing page updated with new game card
- [ ] README.md updated with new game entry

## Common Pitfalls to Avoid

1. **❌ Redefining common styles** - Always check `common/styles.css` first
2. **❌ Wrong stylesheet order** - common/styles.css MUST come before style.css
3. **❌ Wrong script order** - common/utils.js MUST come before script.js
4. **❌ Hardcoding paths** - Use relative paths (`../common/...`)
5. **❌ Inconsistent color schemes** - Stick to the defined palette
6. **❌ Missing responsive design** - Always include mobile breakpoints
7. **❌ Forgetting analytics** - Include Google Analytics script
8. **❌ Missing meta tags** - SEO and social sharing require complete meta tags
9. **❌ Not testing mobile** - Always test on small screens
10. **❌ Forgetting to update landing page** - Add your game to index.html

## Quick Reference Commands

```bash
# Create new project structure
mkdir [project-name]
mkdir [project-name]/assets

# Copy common files as templates (don't use these directly!)
# Create your own versions based on guidelines above

# Test locally
open [project-name]/index.html

# Test landing page
open index.html
```

## Questions or Issues?

If you encounter inconsistencies or need clarification:

1. Check existing projects for examples (bouncing-balls, order-chaos, etc.)
2. Review `common/README.md` for shared resources documentation
3. Ensure you're following the structure of successful existing projects

## Version History

- **v1.0** (2025-12-28): Initial guidelines created after refactoring common resources
