import sanitizeHtml from 'sanitize-html';
// Product descriptions are rich text (HTML written by admin). Only safe formatting tags are kept (XSS protection).
export const cleanHtml = (html = '') => sanitizeHtml(html, {
  allowedTags: ['p', 'br', 'strong', 'b', 'em', 'i', 'u', 'h2', 'h3', 'h4', 'ul', 'ol', 'li', 'blockquote', 'hr', 'a'],
  allowedAttributes: { a: ['href', 'target', 'rel'] },
  allowedSchemes: ['http', 'https'],
  transformTags: { a: (tag, attribs) => ({ tagName: 'a', attribs: { href: attribs.href || '#', target: '_blank', rel: 'noopener noreferrer nofollow' } }) },
});
