// Common Utility Functions for All Projects

/**
 * Toggle collapsible sections
 * @param {string} sectionId - The ID of the section to toggle
 */
function toggleSection(sectionId) {
    const content = document.getElementById(`${sectionId}-content`);
    const icon = document.getElementById(`${sectionId}-icon`);
    
    if (content && icon) {
        content.classList.toggle('collapsed');
        icon.classList.toggle('collapsed');
    }
}
