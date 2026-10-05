import { useState } from 'react'

export default function Tooltip({ content, position = 'top', children }) {
  const [visible, setVisible] = useState(false)

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
  }

  return (
    <div
      className="relative inline-flex items-center"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      {children || (
        <button
          type="button"
          className="w-4 h-4 rounded-full text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 flex items-center justify-center transition-colors text-[10px] font-bold border border-slate-600/60"
          aria-label="Bilgi"
        >
          i
        </button>
      )}

      {visible && (
        <div
          role="tooltip"
          className={`absolute ${positionClasses[position]} z-50 pointer-events-none w-56 p-2.5 text-xs leading-relaxed text-slate-200 bg-slate-900/95 border border-white/10 rounded-xl shadow-2xl backdrop-blur-md animate-fade-in`}
        >
          {content}
        </div>
      )}
    </div>
  )
}
