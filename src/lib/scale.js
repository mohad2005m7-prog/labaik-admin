import { useEffect, useState } from 'react'

// التصميم إطاره 1440×1024 بـ Figma — الصفحة بتتكبّر/بتصغر على عرض الشاشة (zoom)
export const FRAME_W = 1440
export const FRAME_H = 1024

const read = () => (typeof window === 'undefined' ? 1 : Math.max(window.innerWidth, 960) / FRAME_W)

export function useScale() {
  const [scale, setScale] = useState(read)
  useEffect(() => {
    const onResize = () => setScale(read())
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])
  return scale
}
