import DOMPurify from 'dompurify';

interface SanitizeOptions {
  allowedTags?: string[];
  allowedAttributes?: string[];
  stripTags?: boolean;
}

export function sanitizeHtml(dirty: string, options: SanitizeOptions = {}): string {
  const {
    allowedTags = ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
    allowedAttributes = ['href', 'target'],
    stripTags = false
  } = options;

  if (stripTags) {
    return DOMPurify.sanitize(dirty, { 
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: [],
      KEEP_CONTENT: true
    });
  }

  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: allowedTags,
    ALLOWED_ATTR: allowedAttributes,
    ALLOW_DATA_ATTR: false,
    SANITIZE_NAMED_PROPS: true,
  });
}

export function sanitizeText(text: string): string {
  return sanitizeHtml(text, { stripTags: true });
}

export function validateFileType(file: File, allowedTypes: string[]): boolean {
  return allowedTypes.includes(file.type);
}

export function validateFileSize(file: File, maxSizeMB: number): boolean {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxSizeBytes;
}

export function sanitizeFileName(fileName: string): string {
  // Remove potentially dangerous characters
  return fileName.replace(/[<>:"/\\|?*\x00-\x1f]/g, '').substring(0, 255);
}

export function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function validateUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return ['http:', 'https:'].includes(urlObj.protocol);
  } catch {
    return false;
  }
}