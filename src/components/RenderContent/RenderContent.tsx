import DOMPurify from 'dompurify';
import { escapeHtml } from '@/utils';

const RenderContent = ({ htmlContent }: { htmlContent: string }) => {
  // Sanitize HTML to prevent XSS attacks. Guard against runtime errors
  // from the sanitizer and always provide a safe fallback.
  let sanitizedContent = '';
  try {
    if (DOMPurify && typeof DOMPurify.sanitize === 'function') {
      sanitizedContent = DOMPurify.sanitize(htmlContent || '', {
        ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'span', 'div', 'ul', 'ol', 'li'],
        ALLOWED_ATTR: ['href', 'target', 'rel', 'class']
      });
    } else {
      // Fallback: escape HTML to plain text
      sanitizedContent = escapeHtml(String(htmlContent || ''));
    }
  } catch (err) {
    // Log the error object for debugging and fall back to escaped plain text
    // Avoid throwing so dev overlay doesn't show an opaque [object Object]
    // in the browser.
    // eslint-disable-next-line no-console
    console.error('RenderContent sanitization error:', err);
    sanitizedContent = escapeHtml(String(htmlContent || ''));
  }

  return (
    <div
      dangerouslySetInnerHTML={{ __html: sanitizedContent }}
    />
  );
};

export default RenderContent;