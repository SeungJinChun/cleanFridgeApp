export default function Header({ apiKey, setApiKey, items }) {
  return (
    <header className="bg-emerald-600 text-white p-3 sm:p-4 sticky top-0 z-10">
      <div className="max-w-2xl mx-auto flex items-center justify-between gap-2">
        <div className="flex items-center gap-1 sm:gap-2">
          <span className="text-xl sm:text-2xl">🧊</span>
          <h1 className="text-base sm:text-xl font-bold">냉장고 관리자</h1>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="text" value={apiKey} onChange={e => { setApiKey(e.target.value); localStorage.setItem('gemini_key', e.target.value) }}
            placeholder="API 키"
            className="text-xs px-2 py-1 rounded bg-white/20 text-white placeholder-white/60 border border-white/30 w-28 sm:w-40 focus:outline-none"
          />
          <span className="text-xs sm:text-sm opacity-80">
            {new Date().toLocaleDateString('ko-KR', { year:'numeric', month:'long', day:'numeric' })} · {items.length}개
          </span>
        </div>
      </div>
    </header>
  )
}