// أيقونات خطية بسيطة بنفس شكل Figma (stroke 1.8، زوايا مدوّرة)
const base = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' }

const Svg = ({ size = 24, children, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true" {...base}>
    {children}
  </svg>
)

export const GridIcon = (p) => (
  <Svg {...p}>
    <rect x="4" y="4" width="6" height="6" rx="1" />
    <rect x="14" y="4" width="6" height="6" rx="1" />
    <rect x="4" y="14" width="6" height="6" rx="1" />
    <path d="M17 14v6M14 17h6" />
  </Svg>
)

export const BuildingIcon = (p) => (
  <Svg {...p}>
    <rect x="5" y="3" width="14" height="18" rx="1" />
    <path d="M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2M10 21v-3h4v3" />
  </Svg>
)

export const CardIcon = (p) => (
  <Svg {...p}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="M3 10h18M7 15h4" />
  </Svg>
)

export const ListIcon = (p) => (
  <Svg {...p}>
    <path d="M9 6h11M9 12h11M9 18h11" />
    <path d="M4.5 6h.01M4.5 12h.01M4.5 18h.01" strokeWidth="2.6" />
  </Svg>
)

export const GearIcon = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </Svg>
)

export const SearchIcon = (p) => (
  <Svg {...p}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="m20 20-4.2-4.2" />
  </Svg>
)

export const PlusIcon = (p) => (
  <Svg {...p}>
    <path d="M12 5v14M5 12h14" />
  </Svg>
)

export const EyeIcon = (p) => (
  <Svg {...p}>
    <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" />
    <circle cx="12" cy="12" r="3" />
  </Svg>
)

export const CloseIcon = (p) => (
  <Svg {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </Svg>
)

export const CopyIcon = (p) => (
  <Svg {...p}>
    <rect x="9" y="9" width="11" height="11" rx="2" />
    <path d="M5 15V6a2 2 0 0 1 2-2h8" />
  </Svg>
)

export const CalendarIcon = (p) => (
  <Svg {...p}>
    <rect x="4" y="5" width="16" height="15" rx="2" />
    <path d="M4 10h16M9 3v4M15 3v4" />
  </Svg>
)

export const ChevronDown = (p) => (
  <Svg {...p}>
    <path d="m6 9 6 6 6-6" />
  </Svg>
)

export const ChevronUp = (p) => (
  <Svg {...p}>
    <path d="m6 15 6-6 6 6" />
  </Svg>
)

export const ImageIcon = (p) => (
  <Svg {...p}>
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <circle cx="9" cy="10" r="1.8" />
    <path d="m21 16-5-5-9 9" />
  </Svg>
)

export const CheckIcon = (p) => (
  <Svg {...p}>
    <path d="m5 12 5 5 9-10" />
  </Svg>
)
