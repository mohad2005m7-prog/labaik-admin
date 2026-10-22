import { Component } from 'react'

// خطأ بالرسم (render) بدل صفحة بيضا: رسالة + إعادة تحميل
export default class ErrorBoundary extends Component {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(error, info) {
    console.error(error, info?.componentStack)
  }

  render() {
    if (!this.state.failed) return this.props.children
    return (
      <div className="flex min-h-screen items-center justify-center bg-brand font-ar" dir="rtl">
        <div className="flex w-[420px] flex-col gap-[16px] rounded-[16px] bg-white p-[36px] text-center shadow-card">
          <h1 className="m-0 text-[24px] font-bold">حدث خطأ غير متوقع</h1>
          <p className="m-0 text-[16px] text-muted">تعذّر عرض لوحة التحكم. أعد تحميل الصفحة، وإذا تكرر الخطأ تواصل مع الدعم الفني.</p>
          <button type="button" onClick={() => window.location.reload()} className="h-[52px] rounded-[10px] bg-brand text-[18px] font-semibold text-white">
            إعادة تحميل الصفحة
          </button>
        </div>
      </div>
    )
  }
}
