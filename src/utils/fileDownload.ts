import { FileAttachment } from '../types';

export interface DownloadResult {
  success: boolean;
  message: string;
  fileName?: string;
}

/**
 * Enhanced file download utility that handles data URLs and various file types
 */
export const downloadFile = async (file: FileAttachment): Promise<DownloadResult> => {
  try {
    // Validate file data
    if (!file || !file.url || !file.name) {
      return {
        success: false,
        message: 'Invalid file data. Missing file information.'
      };
    }

    let downloadUrl = file.url;
    let shouldRevoke = false;

    // Handle data URLs by converting to blob URL for better download support
    if (file.url.startsWith('data:')) {
      try {
        // Extract data from data URL
        const response = await fetch(file.url);
        const blob = await response.blob();
        
        // Create blob URL
        downloadUrl = URL.createObjectURL(blob);
        shouldRevoke = true;
      } catch (error) {
        console.error('Error converting data URL to blob:', error);
        return {
          success: false,
          message: 'Unable to process file data. The file may be corrupted.'
        };
      }
    }

    // Create download link
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = file.name;
    
    // Set additional attributes for better compatibility
    link.style.display = 'none';
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    
    // Add to DOM temporarily
    document.body.appendChild(link);
    
    // Trigger download
    link.click();
    
    // Cleanup
    document.body.removeChild(link);
    
    // Revoke blob URL if created
    if (shouldRevoke) {
      setTimeout(() => {
        URL.revokeObjectURL(downloadUrl);
      }, 100);
    }

    return {
      success: true,
      message: `${file.name} downloaded successfully!`,
      fileName: file.name
    };

  } catch (error) {
    console.error('File download error:', error);
    return {
      success: false,
      message: 'Download failed. Please try again or contact support if the problem persists.'
    };
  }
};

/**
 * Validates if a file can be downloaded
 */
export const validateFileForDownload = (file: FileAttachment): boolean => {
  if (!file || !file.url || !file.name) {
    return false;
  }

  // Check if it's a valid data URL or regular URL
  if (file.url.startsWith('data:')) {
    // Basic data URL validation
    return file.url.includes(',') && file.url.length > 50;
  }

  // For regular URLs, basic validation
  try {
    new URL(file.url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Gets file size display string
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Gets file type icon class based on MIME type
 */
export const getFileTypeInfo = (mimeType: string) => {
  if (mimeType.startsWith('image/')) {
    return { type: 'image', color: 'text-blue-500', label: 'Image' };
  }
  if (mimeType.includes('pdf')) {
    return { type: 'pdf', color: 'text-red-500', label: 'PDF' };
  }
  if (mimeType.includes('word') || mimeType.includes('document')) {
    return { type: 'document', color: 'text-blue-600', label: 'Document' };
  }
  if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) {
    return { type: 'spreadsheet', color: 'text-green-600', label: 'Spreadsheet' };
  }
  if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) {
    return { type: 'presentation', color: 'text-orange-600', label: 'Presentation' };
  }
  return { type: 'file', color: 'text-gray-500', label: 'File' };
}; 