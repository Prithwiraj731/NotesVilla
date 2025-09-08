/**
 * Enhanced Download Utility
 * Provides robust file download functionality with multiple fallback strategies
 * and comprehensive error handling for cross-browser compatibility
 */

/**
 * Download a single file with multiple fallback strategies
 * @param {string} fileUrl - The URL of the file to download
 * @param {string} filename - The desired filename for the download
 * @param {Object} options - Configuration options
 * @returns {Promise<boolean>} - Success status of the download
 */
export const downloadFile = async (fileUrl, filename, options = {}) => {
  const {
    enableLogging = true,
    fallbackToNewTab = true,
    retryAttempts = 1,
    timeout = 30000,
    useDownloadEndpoint = true
  } = options;

  const startTime = Date.now();

  if (enableLogging) {
    console.log('🔽 Starting download:', { fileUrl, filename, options });
  }

  // Validate inputs
  if (!fileUrl || !filename) {
    const error = 'Invalid download parameters: fileUrl and filename are required';
    if (enableLogging) console.error('❌ Download failed:', error);
    return false;
  }

  // Convert static file URL to download endpoint URL if needed
  const downloadUrl = useDownloadEndpoint ? convertToDownloadUrl(fileUrl, filename) : fileUrl;
  
  if (enableLogging && downloadUrl !== fileUrl) {
    console.log('🔄 Converted URL:', { original: fileUrl, download: downloadUrl });
  }

  // Try multiple download strategies in order of preference
  const strategies = [
    () => downloadViaAnchor(downloadUrl, filename, enableLogging),
    () => downloadViaFetch(downloadUrl, filename, enableLogging, timeout),
    fallbackToNewTab ? () => downloadViaNewTab(downloadUrl, enableLogging) : null
  ].filter(Boolean);

  for (let attempt = 0; attempt < retryAttempts; attempt++) {
    for (const [index, strategy] of strategies.entries()) {
      try {
        const success = await strategy();
        if (success) {
          const duration = Date.now() - startTime;
          if (enableLogging) {
            console.log(`✅ Download successful via strategy ${index + 1}:`, {
              filename,
              duration: `${duration}ms`,
              attempt: attempt + 1
            });
          }
          return true;
        }
      } catch (error) {
        if (enableLogging) {
          console.warn(`⚠️ Strategy ${index + 1} failed:`, error.message);
        }
      }
    }

    if (attempt < retryAttempts - 1) {
      if (enableLogging) {
        console.log(`🔄 Retrying download (attempt ${attempt + 2}/${retryAttempts})`);
      }
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1s before retry
    }
  }

  const duration = Date.now() - startTime;
  if (enableLogging) {
    console.error('❌ All download strategies failed:', {
      filename,
      duration: `${duration}ms`,
      attempts: retryAttempts
    });
  }
  return false;
};

/**
 * Download multiple files with staggered timing
 * @param {Array} files - Array of {fileUrl, filename} objects
 * @param {Object} options - Configuration options
 * @returns {Promise<Object>} - Download results summary
 */
export const downloadMultipleFiles = async (files, options = {}) => {
  const {
    staggerDelay = 500,
    enableLogging = true,
    continueOnError = true
  } = options;

  if (enableLogging) {
    console.log(`🔽 Starting batch download of ${files.length} files`);
  }

  const results = {
    total: files.length,
    successful: 0,
    failed: 0,
    errors: []
  };

  for (let i = 0; i < files.length; i++) {
    const file = files[i];

    if (enableLogging) {
      console.log(`📁 Downloading file ${i + 1}/${files.length}:`, file.filename);
    }

    try {
      const success = await downloadFile(file.fileUrl, file.filename, {
        ...options,
        enableLogging: false // Reduce noise in batch operations
      });

      if (success) {
        results.successful++;
        if (enableLogging) {
          console.log(`✅ File ${i + 1} downloaded successfully:`, file.filename);
        }
      } else {
        results.failed++;
        results.errors.push(`Failed to download: ${file.filename}`);
        if (enableLogging) {
          console.error(`❌ File ${i + 1} download failed:`, file.filename);
        }
      }
    } catch (error) {
      results.failed++;
      results.errors.push(`Error downloading ${file.filename}: ${error.message}`);
      if (enableLogging) {
        console.error(`❌ File ${i + 1} error:`, error.message);
      }
    }

    // Add delay between downloads to prevent browser blocking
    if (i < files.length - 1) {
      await new Promise(resolve => setTimeout(resolve, staggerDelay));
    }

    // Stop if continueOnError is false and we hit an error
    if (!continueOnError && results.failed > 0) {
      break;
    }
  }

  if (enableLogging) {
    console.log('📊 Batch download complete:', results);
  }

  return results;
};

/**
 * Strategy 1: Download using anchor element with download attribute
 * Most reliable method for same-origin files
 */
const downloadViaAnchor = (fileUrl, filename, enableLogging) => {
  return new Promise((resolve) => {
    try {
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = filename;
      link.style.display = 'none';

      // Add to DOM temporarily
      document.body.appendChild(link);

      // Trigger download
      link.click();

      // Clean up
      document.body.removeChild(link);

      if (enableLogging) {
        console.log('🔗 Anchor download initiated for:', filename);
      }

      // We can't reliably detect success with this method
      // so we assume success and let fallbacks handle failures
      resolve(true);
    } catch (error) {
      if (enableLogging) {
        console.warn('🔗 Anchor download failed:', error.message);
      }
      resolve(false);
    }
  });
};

/**
 * Strategy 2: Download using fetch API and blob creation
 * Good for cross-origin files and when we need more control
 */
const downloadViaFetch = async (fileUrl, filename, enableLogging, timeout) => {
  try {
    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(fileUrl, {
      signal: controller.signal,
      mode: 'cors',
      credentials: 'omit'
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);

    // Create download link
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up blob URL
    window.URL.revokeObjectURL(url);

    if (enableLogging) {
      console.log('📦 Fetch download completed for:', filename);
    }

    return true;
  } catch (error) {
    if (enableLogging) {
      console.warn('📦 Fetch download failed:', error.message);
    }
    return false;
  }
};

/**
 * Strategy 3: Fallback to opening in new tab
 * Last resort when other methods fail
 */
const downloadViaNewTab = (fileUrl, enableLogging) => {
  return new Promise((resolve) => {
    try {
      const newWindow = window.open(fileUrl, '_blank');

      if (newWindow) {
        if (enableLogging) {
          console.log('🪟 Opened file in new tab:', fileUrl);
        }
        resolve(true);
      } else {
        if (enableLogging) {
          console.warn('🪟 Failed to open new tab (popup blocked?)');
        }
        resolve(false);
      }
    } catch (error) {
      if (enableLogging) {
        console.warn('🪟 New tab fallback failed:', error.message);
      }
      resolve(false);
    }
  });
};

/**
 * Utility function to extract filename from URL
 * @param {string} url - The file URL
 * @returns {string} - Extracted filename or default
 */
export const extractFilenameFromUrl = (url) => {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const filename = pathname.split('/').pop();
    return filename || 'download';
  } catch (error) {
    return 'download';
  }
};

/**
 * Utility function to validate file URL
 * @param {string} url - The URL to validate
 * @returns {boolean} - Whether the URL is valid
 */
export const isValidFileUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Convert static file URL to download endpoint URL
 * Converts /uploads/filename to /api/notes/download/filename?name=originalname
 * @param {string} fileUrl - The static file URL
 * @param {string} originalName - The original filename for the download
 * @returns {string} - The download endpoint URL
 */
export const convertToDownloadUrl = (fileUrl, originalName) => {
  try {
    // Extract the filename from the URL
    const filename = extractFilenameFromUrl(fileUrl);
    
    // Determine the base URL
    const baseUrl = window.location.hostname === 'localhost'
      ? 'http://localhost:5000'
      : 'https://notesvilla.onrender.com';
    
    // Create the download endpoint URL
    const downloadUrl = `${baseUrl}/api/notes/download/${filename}?name=${encodeURIComponent(originalName)}`;
    
    return downloadUrl;
  } catch (error) {
    console.warn('Failed to convert to download URL, using original:', error.message);
    return fileUrl;
  }
};