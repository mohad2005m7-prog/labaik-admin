/** ألوان لوحة لبيك — من Figma (الإطار «الداشبورد» 830:4308، 1440×1024) */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: '#113A2E', // السايدبار والأزرار والتبويب المختار
        ink: '#000000',
        muted: '#717171', // عناوين الأعمدة والنصوص الفرعية
        soft: '#EEF2F2', // خلفية التبويبات والحقول
        line: '#EAEAEA',
        hint: '#8A8A8E', // placeholder
        icon: '#838589',
        gold: '#B5A72A', // ينتهي خلال ٣٠ يوماً / متوقّف
        avatar: '#B7964F',
        track: '#CCC7D1', // مسار شريط الاشتراك
        danger: '#F44336',
        dangerText: '#FF1D1D',
        okBg: '#DAFFDC',
        okText: '#0B392C',
        warnBg: '#FFF8C0',
        badBg: '#FFCECA',
        off: '#BCBBBB', // مفتاح متوقّف
        grey3: '#3C3C43',
      },
      fontFamily: {
        ar: ['"Noto Sans Arabic"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '3px 4px 7.8px 0 rgba(17, 58, 50, 0.18)',
      },
    },
  },
}
