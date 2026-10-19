import { FRAME_H, FRAME_W, useScale } from '../lib/scale'

// كل القياسات بالكود بنفس أرقام Figma (إطار 1440×1024)، والصفحة كلها بتتحجّم على عرض الشاشة
export default function Scaler({ children }) {
  const scale = useScale()
  const height = Math.max(FRAME_H, window.innerHeight / scale)
  return (
    <div style={{ zoom: scale, width: FRAME_W, minHeight: height }} className="relative mx-auto font-ar">
      {children}
    </div>
  )
}
