import { useEffect, useState } from 'react'

// التصميم إطاره 1440×1024 بـ Figma — الصفحة بتتحجّم لتوسع الشاشة عرضاً وطولاً (zoom)
// ما بتكبر أكتر من مقاس Figma (1) — على شاشة 1920 كانت بتتكبّر ×1.33 وتطلع ضخمة
export const FRAME_W = 1440
export const FRAME_H = 1024
const MIN = 0.6
const MAX = 1

const read = () => {
  if (typeof window === 'undefined') return 1
  const fit = Math.min(window.innerWidth / FRAME_W, window.innerHeight / FRAME_H)
  return Math.min(MAX, Math.max(MIN, fit))
}

export function useScale() {
  const [scale, setScale] = useState(read)
  useEffect(() => {
    const onResize = () => setScale(read())
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])
  return scale
}
