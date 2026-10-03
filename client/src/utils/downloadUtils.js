// file download helper with multiple fallbacks
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
  // If direct cloud storage (Cloudinary, Supabase, Google Storage), don't convert to API endpoint; use as-is
  const isDirectCloud = /res\.cloudinary\.com|\.cloudinary\.com|\.supabase\.co|storage\.googleapis\.com/.test(fileUrl);
  const originalUrl = normalizeFileUrl(fileUrl); // normalize localhost / old render -> current production render URL
  const downloadUrl = (!isDirectCloud && useDownloadEndpoint)
    ? convertToDownloadUrl(originalUrl, filename)
    : originalUrl;

  if (enableLogging && downloadUrl !== fileUrl) {
    console.log('🔄 Converted URL:', { original: fileUrl, download: downloadUrl });
  }

  // Try multiple download strategies in order of preference
  // 1) download endpoint via fetch (most reliable across devices)
  // 2) download endpoint via anchor
  // 3) original static URL via fetch (fallback for 404s on endpoint)
  // 4) original static URL via anchor
  // 5) optional new tab (last resort)
  const strategies = [
    () => downloadViaFetch(downloadUrl, filename, enableLogging, timeout),
    () => downloadViaAnchor(downloadUrl, filename, enableLogging),
    // Use originalUrl as further fallback in case attachment path is blocked
    () => downloadViaFetch(originalUrl, filename, enableLogging, timeout),
    () => downloadViaAnchor(originalUrl, filename, enableLogging),
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
      if (filename) link.download = filename;
      link.style.display = 'none';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        try { document.body.removeChild(link); } catch (_) { }
      }, 100);
      if (enableLogging) console.log('🔗 Anchor download initiated for:', filename || fileUrl);
      resolve(true);
    } catch (error) {
      if (enableLogging) console.warn('🔗 Anchor download failed:', error.message);
      resolve(false);
    }
  });
};

// download using fetch blob
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

// fallback to open in new tab
const downloadViaNewTab = (fileUrl, enableLogging) => {
  return new Promise((resolve) => {
    if (enableLogging) {
      console.warn('🪟 New tab fallback used');
    }
    const w = window.open(fileUrl, '_blank', 'noopener,noreferrer');
    if (w) resolve(true); else resolve(false);
  });
};

// extract filename from url
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

// check if url is valid
export const isValidFileUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
};

// convert local upload url to download endpoint
export const convertToDownloadUrl = (fileUrl, originalName) => {
  try {
    if (!fileUrl) return '';

    // Direct cloud URLs should not be converted to API endpoint
    if (/res\.cloudinary\.com|\.cloudinary\.com|\.supabase\.co|storage\.googleapis\.com/.test(fileUrl)) {
      return fileUrl;
    }

    const normalized = normalizeFileUrl(fileUrl);
    const filename = extractFilenameFromUrl(normalized);

    const baseUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
      ? 'http://localhost:5000'
      : (import.meta.env.VITE_API_BASE
          ? import.meta.env.VITE_API_BASE.replace(/\/api\/?$/, '').replace(/https?:\/\/notesvilla\.onrender\.com/g, 'https://notesvilla-sige.onrender.com')
          : 'https://notesvilla-sige.onrender.com');

    return `${baseUrl}/api/notes/download/${filename}?name=${encodeURIComponent(originalName)}`;
  } catch (error) {
    console.warn('Failed to convert to download URL, using original:', error.message);
    return fileUrl;
  }
};

// normalize backend file urls
export const normalizeFileUrl = (url) => {
  if (!url) return '';
  try {
    const prodBase = (import.meta.env.VITE_API_BASE 
      ? import.meta.env.VITE_API_BASE.replace(/\/api\/?$/, '') 
      : 'https://notesvilla-sige.onrender.com').replace(/https?:\/\/notesvilla\.onrender\.com/g, 'https://notesvilla-sige.onrender.com');

    // Always replace old render domain with current render domain
    let normalized = url.replace(/https?:\/\/notesvilla\.onrender\.com/g, prodBase);

    const u = new URL(normalized, window.location.origin);
    const isLocalhost = u.hostname === 'localhost' || u.hostname === '127.0.0.1';
    const isBrowserLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

    if (!isBrowserLocal && isLocalhost) {
      return prodBase + u.pathname + u.search + u.hash;
    }
    return normalized;
  } catch (e) {
    return url.replace(/https?:\/\/notesvilla\.onrender\.com/g, 'https://notesvilla-sige.onrender.com');
  }
};