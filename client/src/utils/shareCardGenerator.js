/**
 * NotesVilla Canvas Note Card Generator
 * Generates an ultra-crisp, cyberpunk styled PNG card for any note
 * with the subject, folder, title, category, and direct access link written on it.
 */

import { resolveNoteCategory } from './categoryUtils';

export function getCleanNoteTitle(note) {
  if (!note || !note.title) return note?.filename || 'Untitled Note';
  return note.title.replace(/^\[(?:Folder:\s*)?[^\]]+\]\s*/i, '').trim() || note.title;
}

/**
 * Renders the note card onto an HTML5 canvas and returns a Promise<Blob>
 */
export async function createNoteCardBlob(note, folderName) {
  const width = 1200;
  const height = 630;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not create canvas 2d context');

  const cleanTitle = getCleanNoteTitle(note);
  const subjectName = note.subjectName || 'NotesVilla Subject';
  const category = resolveNoteCategory(note);
  const folder = folderName || note.folderName;
  const noteUrl = note.customUrl || note.url || (note._id || note.id ? `${window.location.origin}/note/${note._id || note.id}` : window.location.href);

  // 1. Background
  ctx.fillStyle = '#070b10';
  ctx.fillRect(0, 0, width, height);

  // 2. Subtle Cyberpunk Grid
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.035)';
  ctx.lineWidth = 1;
  const gridSize = 40;
  for (let x = 0; x < width; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = 0; y < height; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  // 3. Ambient Glow Gradients
  const grad = ctx.createRadialGradient(150, 150, 20, 150, 150, 450);
  grad.addColorStop(0, 'rgba(251, 54, 64, 0.14)');
  grad.addColorStop(1, 'transparent');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  const grad2 = ctx.createRadialGradient(width - 150, height - 150, 20, width - 150, height - 150, 450);
  grad2.addColorStop(0, 'rgba(16, 185, 129, 0.08)');
  grad2.addColorStop(1, 'transparent');
  ctx.fillStyle = grad2;
  ctx.fillRect(0, 0, width, height);

  // 4. Outer Cyber Frame with Neon Accents
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
  ctx.lineWidth = 2;
  roundRect(ctx, 28, 28, width - 56, height - 56, 18);
  ctx.stroke();

  // Corner highlights
  ctx.strokeStyle = '#fb3640';
  ctx.lineWidth = 3.5;
  // Top-left
  ctx.beginPath();
  ctx.moveTo(28, 70);
  ctx.lineTo(28, 28);
  ctx.lineTo(70, 28);
  ctx.stroke();
  // Top-right
  ctx.beginPath();
  ctx.moveTo(width - 70, 28);
  ctx.lineTo(width - 28, 28);
  ctx.lineTo(width - 28, 70);
  ctx.stroke();
  // Bottom-left
  ctx.beginPath();
  ctx.moveTo(28, height - 70);
  ctx.lineTo(28, height - 28);
  ctx.lineTo(70, height - 28);
  ctx.stroke();
  // Bottom-right
  ctx.beginPath();
  ctx.moveTo(width - 70, height - 28);
  ctx.lineTo(width - 28, height - 28);
  ctx.lineTo(width - 28, height - 70);
  ctx.stroke();

  // 5. Header Brand Bar
  // Glowing Red Dot
  ctx.fillStyle = '#fb3640';
  ctx.beginPath();
  ctx.arc(68, 68, 6, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 20px "Courier New", monospace, sans-serif';
  ctx.fillText('KNOWLEDGE DOCK // NOTESVILLA', 86, 75);

  ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
  ctx.font = '16px "Courier New", monospace, sans-serif';
  ctx.fillText('ACADEMIC RESOURCE ARCHIVE', width - 330, 75);

  // 6. Badges Row (Subject, Folder, Category)
  let curX = 68;
  const badgeY = 120;
  const badgeH = 42;

  // Subject Badge
  const subjText = `📚 ${subjectName.toUpperCase()}`;
  ctx.font = 'bold 17px Inter, system-ui, sans-serif';
  let tw = ctx.measureText(subjText).width;
  ctx.fillStyle = 'rgba(251, 54, 64, 0.15)';
  roundRect(ctx, curX, badgeY, tw + 28, badgeH, 8);
  ctx.fill();
  ctx.strokeStyle = 'rgba(251, 54, 64, 0.45)';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.fillStyle = '#ff6b72';
  ctx.fillText(subjText, curX + 14, badgeY + 27);
  curX += tw + 42;

  // Folder Badge (if present)
  if (folder) {
    const fldText = `📁 ${folder.toUpperCase()}`;
    tw = ctx.measureText(fldText).width;
    ctx.fillStyle = 'rgba(234, 179, 8, 0.15)';
    roundRect(ctx, curX, badgeY, tw + 28, badgeH, 8);
    ctx.fill();
    ctx.strokeStyle = 'rgba(234, 179, 8, 0.45)';
    ctx.stroke();
    ctx.fillStyle = '#facc15';
    ctx.fillText(fldText, curX + 14, badgeY + 27);
    curX += tw + 42;
  }

  // Category Badge
  const catText = `${category.toUpperCase()} NOTES`;
  tw = ctx.measureText(catText).width;
  ctx.fillStyle = category === 'Lab' ? 'rgba(59, 130, 246, 0.15)' : (category === 'Suggestions' ? 'rgba(168, 85, 247, 0.15)' : 'rgba(16, 185, 129, 0.15)');
  roundRect(ctx, curX, badgeY, tw + 28, badgeH, 8);
  ctx.fill();
  ctx.strokeStyle = category === 'Lab' ? 'rgba(59, 130, 246, 0.45)' : (category === 'Suggestions' ? 'rgba(168, 85, 247, 0.45)' : 'rgba(16, 185, 129, 0.45)');
  ctx.stroke();
  ctx.fillStyle = category === 'Lab' ? '#60a5fa' : (category === 'Suggestions' ? '#c084fc' : '#10b981');
  ctx.fillText(catText, curX + 14, badgeY + 27);

  // 7. Note Title (Large, wrapped)
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 44px Inter, system-ui, sans-serif';
  
  const titleY = 230;
  const maxTitleW = width - 136;
  let lines = wrapText(ctx, cleanTitle, maxTitleW);
  if (lines.length > 2) {
    let secondLine = lines[1];
    while (ctx.measureText(secondLine + '...').width > maxTitleW && secondLine.length > 0) {
      secondLine = secondLine.slice(0, -1);
    }
    lines = [lines[0], secondLine + '...'];
  }
  lines.slice(0, 2).forEach((line, idx) => {
    ctx.fillText(line, 68, titleY + (idx * 54));
  });

  // 8. Verified Resource Callout Card
  const infoBoxY = 360;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.035)';
  roundRect(ctx, 68, infoBoxY, width - 136, 100, 12);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.stroke();

  ctx.fillStyle = '#10b981';
  ctx.font = 'bold 18px Inter, system-ui, sans-serif';
  ctx.fillText('✓ VERIFIED ACADEMIC RESOURCE', 96, infoBoxY + 40);

  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.font = '16px Inter, system-ui, sans-serif';
  ctx.fillText('Free instant document streaming, lecture slides & PDF printables in continuity.', 96, infoBoxY + 72);

  // 9. Footer Link Bar
  const footerY = 500;
  ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
  roundRect(ctx, 68, footerY, width - 136, 68, 12);
  ctx.fill();
  ctx.strokeStyle = 'rgba(251, 54, 64, 0.35)';
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 19px "Courier New", monospace, sans-serif';
  let displayUrl = `🔗 ${noteUrl}`;
  while (ctx.measureText(displayUrl).width > width - 390 && displayUrl.length > 25) {
    displayUrl = displayUrl.slice(0, -4) + '...';
  }
  ctx.fillText(displayUrl, 96, footerY + 42);

  ctx.fillStyle = '#10b981';
  ctx.font = 'bold 14px "Courier New", monospace, sans-serif';
  ctx.fillText('ONLINE ACCESS', width - 230, footerY + 41);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Canvas blob generation failed'));
    }, 'image/png');
  });
}

function roundRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function wrapText(ctx, text, maxWidth) {
  const words = text.split(' ');
  const lines = [];
  let currentLine = words[0] || '';

  for (let i = 1; i < words.length; i++) {
    const word = words[i];
    const width = ctx.measureText(currentLine + ' ' + word).width;
    if (width < maxWidth) {
      currentLine += ' ' + word;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  lines.push(currentLine);
  return lines;
}
