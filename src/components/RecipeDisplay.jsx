import React from 'react';

// Improved Markdown to HTML conversion
const markdownToHtml = (markdown) => {
    if (!markdown) return '';
    
    let html = '';
    const lines = markdown.split('\n');
    let i = 0;
    
    while (i < lines.length) {
        const line = lines[i].trim();
        
        // Skip empty lines
        if (line === '') {
            i++;
            continue;
        }
        
        // Headers
        if (line.startsWith('### ')) {
            html += `<h3 class="recipe-step-heading">${processInline(line.substring(4))}</h3>`;
            i++;
        } else if (line.startsWith('## ')) {
            html += `<h2 class="recipe-subtitle">${processInline(line.substring(3))}</h2>`;
            i++;
        } else if (line.startsWith('# ')) {
            html += `<h1 class="recipe-title">${processInline(line.substring(2))}</h1>`;
            i++;
        }
        // Unordered lists
        else if (line.startsWith('* ') || line.startsWith('- ')) {
            html += '<ul class="recipe-list">';
            while (i < lines.length && (lines[i].trim().startsWith('* ') || lines[i].trim().startsWith('- '))) {
                const itemText = lines[i].trim().substring(2);
                html += `<li>${processInline(itemText)}</li>`;
                i++;
            }
            html += '</ul>';
        }
        // Ordered lists
        else if (line.match(/^\d+\.\s/)) {
            html += '<ol class="recipe-list">';
            while (i < lines.length && lines[i].trim().match(/^\d+\.\s/)) {
                const itemText = lines[i].trim().replace(/^\d+\.\s/, '');
                html += `<li>${processInline(itemText)}</li>`;
                i++;
            }
            html += '</ol>';
        }
        // Paragraphs
        else {
            let paragraph = '';
            while (i < lines.length && lines[i].trim() !== '' && 
                   !lines[i].trim().startsWith('#') && 
                   !lines[i].trim().match(/^[\*\-]\s/) && 
                   !lines[i].trim().match(/^\d+\.\s/)) {
                paragraph += (paragraph ? ' ' : '') + lines[i].trim();
                i++;
            }
            if (paragraph) {
                html += `<p>${processInline(paragraph)}</p>`;
            }
        }
    }
    
    return html;
};

// Process inline markdown (bold, italic, etc.)
const processInline = (text) => {
    return text
        .replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>') // Bold + Italic
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
        .replace(/\*(.*?)\*/g, '<em>$1</em>') // Italic
        .replace(/`(.*?)`/g, '<code>$1</code>'); // Code
};

export default function RecipeDisplay({ markdown }) {
    return (
        <div 
            className="recipe-card-wrapper"
            dangerouslySetInnerHTML={{ __html: markdownToHtml(markdown) }} 
        />
    );
}