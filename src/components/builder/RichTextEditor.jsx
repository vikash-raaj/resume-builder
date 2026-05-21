import { useRef, useEffect } from 'react';
import {
  Bold, Italic, Underline, Strikethrough,
  List, ListOrdered, Link2, AlignLeft, Sparkles,
} from 'lucide-react';

const tools = [
  { Icon: Bold, cmd: 'bold', title: 'Bold' },
  { Icon: Italic, cmd: 'italic', title: 'Italic' },
  { Icon: Underline, cmd: 'underline', title: 'Underline' },
  { Icon: Strikethrough, cmd: 'strikeThrough', title: 'Strikethrough' },
  { Icon: ListOrdered, cmd: 'insertOrderedList', title: 'Ordered list' },
  { Icon: List, cmd: 'insertUnorderedList', title: 'Bullet list' },
  { Icon: Link2, cmd: 'link', title: 'Insert link' },
  { Icon: AlignLeft, cmd: 'justifyLeft', title: 'Align' },
];

export default function RichTextEditor({ value, onChange, placeholder = 'Write here…', label = 'DESCRIPTION' }) {
  const ref = useRef(null);
  const initialised = useRef(false);

  useEffect(() => {
    if (ref.current && !initialised.current) {
      ref.current.innerHTML = value || '';
      initialised.current = true;
    }
  }, []);

  const exec = (cmd) => {
    ref.current?.focus();
    if (cmd === 'link') {
      const url = window.prompt('Enter URL:');
      if (url) document.execCommand('createLink', false, url);
    } else {
      document.execCommand(cmd, false, null);
    }
    onChange?.(ref.current?.innerHTML || '');
  };

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden bg-white">
      <div className="px-3 pt-2.5 pb-1">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-500">
          {label}
        </span>
      </div>
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onInput={() => onChange?.(ref.current?.innerHTML || '')}
        data-placeholder={placeholder}
        className="rich-editor min-h-[180px] px-3 pb-3 text-sm text-gray-800 outline-none leading-relaxed"
      />
      <div className="border-t border-gray-200 px-2 py-1.5 flex items-center justify-between bg-gray-50">
        <div className="flex items-center gap-0.5">
          {tools.map(({ Icon, cmd, title }) => (
            <button
              key={cmd}
              onMouseDown={(e) => { e.preventDefault(); exec(cmd); }}
              title={title}
              className="p-1.5 rounded hover:bg-gray-200 text-gray-500 transition-colors"
            >
              <Icon className="w-3.5 h-3.5" />
            </button>
          ))}
        </div>
        <button className="flex items-center gap-1.5 text-xs text-blue-600 font-medium hover:text-blue-700 transition-colors px-2 py-1 rounded-md hover:bg-blue-50">
          <Sparkles className="w-3.5 h-3.5" />
          Perfecting with AI
        </button>
      </div>
    </div>
  );
}
