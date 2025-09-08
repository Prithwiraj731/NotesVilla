/**
 * Simple test file to verify download utility functions
 * This can be run in the browser console for testing
 */

import { downloadFile, downloadMultipleFiles, isValidFileUrl, extractFilenameFromUrl, convertToDownloadUrl } from './downloadUtils.js';

// Test URL validation
console.log('Testing URL validation:');
console.log('Valid URL:', isValidFileUrl('http://localhost:5000/uploads/test.pdf')); // should be true
console.log('Invalid URL:', isValidFileUrl('not-a-url')); // should be false

// Test filename extraction
console.log('Testing filename extraction:');
console.log('From URL:', extractFilenameFromUrl('http://localhost:5000/uploads/test.pdf')); // should be 'test.pdf'
console.log('From complex URL:', extractFilenameFromUrl('http://localhost:5000/api/notes/download/file-123.png?name=original.png')); // should be 'file-123.png'

// Test URL conversion
console.log('Testing URL conversion:');
console.log('Static to download:', convertToDownloadUrl('http://localhost:5000/uploads/files-1756709354803-597255814.png', 'My Photo.png'));
// Should output: http://localhost:5000/api/notes/download/files-1756709354803-597255814.png?name=My%20Photo.png

// Test single file download (uncomment to test with real file)
// downloadFile('http://localhost:5000/uploads/files-1756709354803-597255814.png', 'test-download.png');

// Test multiple file download (uncomment to test with real files)
// const testFiles = [
//   { fileUrl: 'http://localhost:5000/uploads/file1.pdf', filename: 'file1.pdf' },
//   { fileUrl: 'http://localhost:5000/uploads/file2.png', filename: 'file2.png' }
// ];
// downloadMultipleFiles(testFiles);

export { downloadFile, downloadMultipleFiles, isValidFileUrl, extractFilenameFromUrl, convertToDownloadUrl };