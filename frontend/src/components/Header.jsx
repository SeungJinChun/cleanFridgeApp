export default function Header({ apiKey, setApiKey, items }) {
  return (
    <header className="sticky top-0 z-10 px-4 pt-5 pb-3 bg-[var(--bg)]">
      <div className="max-w-2xl mx-auto flex items-end justify-between gap-3">
        <div>
          <h1 className="text-[22px] sm:text-[26px] font-semibold text-[var(--accent-deep)] tracking-[-0.01em]">냉장고 파먹기 도우미</h1>
          <p className="mt-1 text-[13px] text-[var(--sub)]">있는 재료부터, 임박한 순서대로.</p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={apiKey}
            onChange={e => { setApiKey(e.target.value); localStorage.setItem('gemini_key', e.target.value) }}
            placeholder="API 키"
            className="w-28 sm:w-40 rounded-full border border-[var(--line)] bg-[var(--panel)] px-3 py-2 text-[12px] text-[var(--ink)] shadow-[var(--shadow)] placeholder:text-[var(--sub)] focus:outline-none"
          />
          <div className="rounded-full border border-[var(--line)] bg-[var(--panel)] px-3 py-2 text-[12px] text-[var(--sub)] shadow-[var(--shadow)] whitespace-nowrap">
            {new Date().toLocaleDateString('ko-KR', { year:'numeric', month:'long', day:'numeric' })} · {items.length}개
          </div>
        </div>
      </div>
    </header>
  )
}