import DOMPurify from 'dompurify';
const isHtml = (s) => /<\/?[a-z][\s\S]*>/i.test(s);
// Renders admin-written rich text safely (sanitised again in the browser). Old plain-text descriptions still work.
export default function RichText({ html }) {
  if (!html) return <p className="text-slate-400">—</p>;
  if (!isHtml(html)) return <p className="whitespace-pre-line leading-relaxed text-slate-700">{html}</p>;
  const clean = DOMPurify.sanitize(html, { ALLOWED_TAGS: ['p', 'br', 'strong', 'b', 'em', 'i', 'u', 'h2', 'h3', 'h4', 'ul', 'ol', 'li', 'blockquote', 'hr', 'a'], ALLOWED_ATTR: ['href', 'target', 'rel'] });
  return <div className="rich" dangerouslySetInnerHTML={{ __html: clean }} />;
}
