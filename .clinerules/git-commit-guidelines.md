# Git Commit Guidelines

This document provides guidelines for creating meaningful git commits in the paper-games repository.

## Default Commit Behavior

When asked to create a git commit, unless explicitly instructed otherwise:

### 1. Include All Changes
- **Stage all modified files**: Use `git add -A` or `git add .`
- **Include new files**: Ensure all newly created files are staged
- **Include deletions**: If files were removed, include those changes
- **Check status first**: Always run `git status` to verify what will be committed

### 2. Meaningful Commit Messages
Commit messages should be:
- **Descriptive**: Clearly explain what was changed and why
- **Concise**: Keep it simple and to the point
- **Action-oriented**: Use imperative mood (Add, Fix, Update, etc.)

## Commit Message Format

### Structure
```
<Short imperative summary of the change>

- <Bullet point describing change 1>
- <Bullet point describing change 2>
- <Bullet point describing change 3>
- <Additional details as needed>
```

**Key Points:**
- **No type prefixes** (no "feat:", "fix:", "chore:", etc.)
- Start with a verb in imperative mood (Add, Fix, Update, Improve)
- Use simple bullet points with dashes
- Keep it concise and focused on what changed
- No formal sections like "Changes:", "Files modified:", "Benefits:"

## Examples

### Example 1: Adding a New Game
```bash
git add -A
git commit -m "Add Pic-a-Pix nonogram game with 15x15 and 20x20 grid options

- Created complete Pic-a-Pix (Nonogram) game with random puzzle generation
- Added grid size options: 15x15 and 20x20
- Implemented difficulty levels: Easy, Medium, Hard
- Features left-click to fill cells, right-click to mark empty cells
- Added solution checking and reveal functionality
- Integrated game into landing page alongside existing games
- Includes comprehensive game instructions and solving tips
- Responsive design for mobile and desktop
- References Wikipedia nonogram article for game rules"
```

### Example 2: Simple Update
```bash
git add -A
git commit -m "Add Bouncing Balls game to homepage and improve navigation

- Added Bouncing Balls to the games list on the main landing page
- Updated navigation button text from 'Explore More Games' to 'Back to Games' in bouncing-balls page for better clarity
- Included all bouncing-balls game files (HTML, CSS, JavaScript, and assets)"
```

### Example 3: Bug Fix
```bash
git add -A
git commit -m "Fix hard AI in Order-Chaos to properly consider both X and O symbols

- Modified AI logic to evaluate both X and O placement options
- Improved decision-making for optimal gameplay
- AI now makes better strategic choices"
```

### Example 4: Minor Update
```bash
git add -A
git commit -m "Add last move highlighting to Order & Chaos game

- Added visual highlight to show the most recent move
- Helps players track game progression
- Improves user experience"
```

### Example 5: Multiple File Changes
```bash
git add -A
git commit -m "Extract common styles and utilities to shared directory

- Created common/ directory with shared CSS, JavaScript, and assets
- Updated all game projects to reference common resources
- Reduced code duplication across projects
- Added documentation for common resources in .clinerules/"
```

## Git Workflow

### Before Committing

1. **Check status**
   ```bash
   git status
   ```

2. **Review changes**
   ```bash
   git diff
   ```

3. **Test the changes**
   - Verify all games still work
   - Check for console errors
   - Test on mobile devices
   - Validate HTML/CSS

### Creating the Commit

1. **Stage all changes** (default behavior)
   ```bash
   git add -A
   ```

2. **Or stage specific files** (when instructed)
   ```bash
   git add path/to/file1.html path/to/file2.css
   ```

3. **Create commit with detailed message**
   ```bash
   git commit -m "type: short summary

   Detailed description...
   
   Changes:
   - change 1
   - change 2"
   ```

4. **Verify commit**
   ```bash
   git log -1 --stat
   ```

### After Committing

1. **Push to remote** (if appropriate)
   ```bash
   git push origin main
   ```

2. **Verify on GitHub** (if pushed)
   - Check that all files were uploaded
   - Review commit message display
   - Ensure no sensitive information was included

## What NOT to Commit

❌ **Never commit:**
- Temporary files (.DS_Store, Thumbs.db, *.swp)
- IDE/editor config files (unless project-specific)
- Node modules or dependencies (if applicable)
- Sensitive information (API keys, passwords)
- Large binary files (compress images first)
- Build artifacts (unless intended for GitHub Pages)

## Special Cases

### Partial Commits
If explicitly instructed to commit only specific files:
```bash
git add path/to/specific/file.html
git commit -m "fix: Update specific file only

Only modifying [file] because [reason].

Files modified:
- path/to/specific/file.html"
```

### Amending Previous Commit
If instructed to amend the last commit:
```bash
git add -A
git commit --amend -m "Updated commit message"
```

### Breaking Changes
If changes break existing functionality:
```bash
git commit -m "refactor!: Major restructuring of project

BREAKING CHANGE: Project structure has been reorganized.
All projects must update their import paths.

See migration guide in common/README.md"
```

## Commit Message Best Practices

### DO ✅
- Use present tense ("Add feature" not "Added feature")
- Be specific about what changed
- Include context about why changes were made
- List all significant files affected
- Group related changes together
- Keep the summary under 50 characters
- Wrap detailed description at 72 characters
- Use bullet points for multiple changes

### DON'T ❌
- Write vague messages ("Updated files", "Fixed stuff")
- Forget to mention important changes
- Commit without testing first
- Mix unrelated changes in one commit
- Use past tense in summary
- Write overly long summaries
- Omit the "why" behind changes

## Quick Reference

```bash
# Standard commit workflow (DEFAULT)
git status                    # Check what changed
git add -A                    # Stage all changes
git commit -m "type: summary

Detailed description

Changes:
- item 1
- item 2"
git push origin main         # Push to remote

# Verify commit
git log -1 --stat            # View last commit with files
git show                     # View last commit details
```

## Automation

When asked to "create a git commit" or "commit these changes":
1. Always use `git add -A` unless told otherwise
2. Generate a meaningful commit message that:
   - Identifies the type of change
   - Summarizes all changes clearly
   - Lists specific modifications made
   - Includes files affected
3. Follow the format and examples in this document

## Version History

- **v1.0** (2025-12-28): Initial git commit guidelines created
