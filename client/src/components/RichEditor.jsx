import { useEffect, useRef } from 'react';
import { FiBold, FiItalic, FiUnderline, FiList, FiLink, FiRotateCcw, FiRotateCw, FiMinus } from 'react-icons/fi';

const isHtml = (s) => /<\/?[a-z][\s\S]*>/i.test(s);
const esc = (s) => s.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
const toHtml = (v = '') => (isHtml(v) ? v : esc(v).replace(/\n/g, '<br>'));

// Lightweight rich-text editor (Bold, Title, Header, lists, quote, link). Defined at module level so typing never loses focus.
export default function RichEditor({ value, onChange, placeholder }) {
  const ref = useRef(null);
  useEffect(() => { const h = toHtml(value); if (ref.current && ref.current.innerHTML !== h) ref.current.innerHTML = h; }, [value]);
  const emit = () => onChange(ref.current.innerHTML === '<br>' ? '' : ref.current.innerHTML);
  const run = (cmd, arg) => { ref.current.focus(); document.execCommand(cmd, false, arg); emit(); };
  const link = () => { const u = prompt('Link (https://...)'); if (u && /^https?:\/\//i.test(u)) run('createLink', u); };
  const B = ({ title, onClick, children, w }) => <button type="button" title={title} onMouseDown={(e) => { e.preventDefault(); onClick(); }} className={`flex h-9 items-center justify-center rounded-lg text-sm font-bold text-slate-600 transition hover:bg-brand-50 hover:text-brand-600 ${w || 'w-9'}`}>{children}</button>;
  const Sep = () => <span className="mx-1 h-5 w-px bg-slate-200" />;
  return (
    <div>
      <div className="flex flex-wrap items-center gap-0.5 rounded-t-xl border border-slate-200 bg-white p-1.5">
        <B title="Title (Heading)" w="px-3" onClick={() => run('formatBlock', 'h2')}>Title</B><B title="Header" w="px-3" onClick={() => run('formatBlock', 'h3')}>Header</B><B title="Sub-header" w="px-3" onClick={() => run('formatBlock', 'h4')}>Sub</B><B title="Normal text" w="px-3" onClick={() => run('formatBlock', 'p')}>Text</B><Sep />
        <B title="Bold" onClick={() => run('bold')}><FiBold /></B><B title="Italic" onClick={() => run('italic')}><FiItalic /></B><B title="Underline" onClick={() => run('underline')}><FiUnderline /></B><Sep />
        <B title="Bullet list" onClick={() => run('insertUnorderedList')}><FiList /></B><B title="Numbered list" onClick={() => run('insertOrderedList')}>1.</B><B title="Quote" onClick={() => run('formatBlock', 'blockquote')}>❝</B><B title="Divider" onClick={() => run('insertHorizontalRule')}><FiMinus /></B><B title="Link" onClick={link}><FiLink /></B><Sep />
        <B title="Undo" onClick={() => run('undo')}><FiRotateCcw /></B><B title="Redo" onClick={() => run('redo')}><FiRotateCw /></B>
      </div>
      <div ref={ref} contentEditable suppressContentEditableWarning data-ph={placeholder} className="rte rich" onInput={emit} onBlur={emit}
        onPaste={(e) => { e.preventDefault(); document.execCommand('insertText', false, e.clipboardData.getData('text/plain')); }} />
    </div>
  );
}
