# Common Resources Directory

This directory contains shared resources used across all sub-projects to eliminate duplication and maintain consistency.

## Structure

```
common/
├── styles.css      # Common CSS styles (base layout, typography, buttons, etc.)
├── utils.js        # Common JavaScript utilities (toggleSection function)
├── assets/         # Shared assets
│   └── colored-pencil.png
└── README.md       # This file
```

## Usage

### In HTML files
Add these lines in the `<head>` section, before project-specific stylesheets:

```html
<link rel="stylesheet" href="../common/styles.css">
<link rel="stylesheet" href="style.css">
```

Add these lines before the closing `</body>` tag, before project-specific scripts:

```html
<script src="../common/utils.js"></script>
<script src="script.js"></script>
```

### In CSS files
Project-specific CSS files should only contain styles unique to that project. Common styles are already handled by `common/styles.css`.

## What's Included

### styles.css
- CSS Reset
- Body & Container layouts
- Typography (h1, h2, h3)
- Button styles (.btn-primary, .btn-secondary)
- Setup sections and radio groups
- Collapsible sections styling
- Reference links styling
- Game info and status displays
- Common animations (pulse)
- Responsive design breakpoints

### utils.js
- `toggleSection(sectionId)`: Function to toggle collapsible sections

### assets/
- `colored-pencil.png`: Common favicon/icon used across all projects

## Projects Using Common Resources

1. bouncing-balls
2. order-chaos
3. infinite-tic-tac-toe
4. pic-a-pix

## Benefits

✅ **DRY Principle**: No code duplication across projects
✅ **Consistency**: All projects share the same look and feel
✅ **Maintainability**: Update once, apply everywhere
✅ **Reduced File Size**: Individual project CSS files are much smaller
✅ **Easier Updates**: Common features can be enhanced centrally
