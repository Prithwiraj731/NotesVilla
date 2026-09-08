/**
 * Category Utility for NotesVilla
 * Standardizes categorization across Theory, Lab, and Suggestions.
 * Prevents any misinterpretation between categories.
 */

const LAB_PATTERNS = [
  /\blab\b/i,
  /\blabs\b/i,
  /\bpractical\b/i,
  /\bpracticals\b/i,
  /\bexperiment\b/i,
  /\bexperiments\b/i,
  /\bmanual\b/i,
  /\bmanuals\b/i,
  /\bviva\b/i,
  /\bobservation\b/i,
  /\bcode\s*submission\b/i,
  /lab\s*[-_]?\s*\d+/i
];

const SUGGESTIONS_PATTERNS = [
  /\bpyq\b/i,
  /\bpyqs\b/i,
  /\bsuggestion\b/i,
  /\bsuggestions\b/i,
  /\bimportant\s*questions?\b/i,
  /\bquestion\s*bank\b/i,
  /\bmodel\s*paper\b/i,
  /\bquestion\s*paper\b/i,
  /\bexam\s*tips\b/i,
  /\bguess\s*paper\b/i,
  /\bprevious\s*year\b/i
];

/**
 * Resolves the note category ('Theory' | 'Lab' | 'Suggestions') with zero misinterpretation.
 * Priority order:
 * 1. Direct explicit category field ('Theory', 'Lab', 'Suggestions')
 * 2. Associated metadata tags or description
 * 3. Semantic keyword matching in title, filename, and attached files
 * 4. Default: 'Theory'
 */
export function resolveNoteCategory(note) {
  if (!note) return 'Theory';

  // 1. Direct explicit category string
  const raw = note.category;
  if (raw && typeof raw === 'string') {
    const trimmed = raw.trim().toLowerCase();
    if (trimmed === 'lab') return 'Lab';
    if (trimmed === 'suggestions' || trimmed === 'suggestion' || trimmed === 'pyq' || trimmed === 'pyqs') return 'Suggestions';
    if (trimmed === 'theory') return 'Theory';
  }

  // 2. Metadata properties (description, topicName, tag)
  const meta = `${note.description || ''} ${note.topicName || ''} ${note.tag || ''}`.toLowerCase();
  if (/\blab\b/.test(meta)) return 'Lab';
  if (/\b(suggestion|pyq)/.test(meta)) return 'Suggestions';
  if (/\btheory\b/.test(meta)) return 'Theory';

  // 3. Semantic match on title, filenames, original names
  const filesText = Array.isArray(note.files)
    ? note.files.map(f => `${f.originalName || ''} ${f.filename || ''}`).join(' ')
    : '';
  const text = `${note.title || ''} ${note.filename || ''} ${note.originalName || ''} ${filesText}`;

  if (LAB_PATTERNS.some(regex => regex.test(text))) {
    return 'Lab';
  }

  if (SUGGESTIONS_PATTERNS.some(regex => regex.test(text))) {
    return 'Suggestions';
  }

  return 'Theory';
}
