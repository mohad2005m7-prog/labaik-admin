import { useEffect } from 'react'
import { useScale } from '../lib/scale'

// نافذة فوق اللوحة: رأس ثابت + محتوى بيسكرول + أسفل ثابت (FIXED / SCROLLS بـ Figma)
// [width] بأرقام Figma — والارتفاع على قد الشاشة
export default function Modal({ width, header, footer, children, onClose, radius = 0 }) {
  const scale = useScale()
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div
        style={{ zoom: scale, width, maxHeight: `calc(${100 / scale}vh - 40px)`, borderRadius: radius }}
        className="flex flex-col overflow-hidden bg-white font-ar shadow-2xl"
        dir="rtl"
      >
        {header}
        <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
        {footer}
      </div>
    </div>
  )
}
