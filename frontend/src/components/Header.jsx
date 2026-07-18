import { useEffect, useState } from 'react'

export default function Header({ apiKey, setApiKey }) {
  const [isOpen, setIsOpen] = useState(false)
  const [draftKey, setDraftKey] = useState(apiKey || '')

  useEffect(() => {
    setDraftKey(apiKey || '')
  }, [apiKey])

  const saveApiKey = () => {
    const nextValue = draftKey.trim()
    setApiKey(nextValue)
    localStorage.setItem('gemini_key', nextValue)
    setIsOpen(false)
  }

  const closeModal = () => {
    setDraftKey(apiKey || '')
    setIsOpen(false)
  }

  return (
    <>
      <header className="sticky top-0 z-10 px-4 pt-5 pb-3 bg-[var(--bg)]">
        <div className="max-w-2xl mx-auto flex items-end justify-between gap-3">
          <div className="min-w-0 leading-none">
            <h1 className="text-[20px] sm:text-[24px] font-semibold text-[var(--accent-deep)] tracking-[-0.01em]">냉장고 관리자</h1>
            <p className="mt-0 text-[10px] uppercase tracking-[0.16em] text-[var(--accent)] font-mono">Fridge Rescue Log</p>
          </div>
          <button
            onClick={() => setIsOpen(true)}
            className="rounded-full border border-[var(--line)] bg-[var(--panel)] px-3 py-2 text-[12px] font-medium text-[var(--ink)] shadow-[var(--shadow)]"
          >
            {apiKey ? 'API 키 수정' : 'API 키 입력'}
          </button>
        </div>
      </header>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={closeModal}>
          <div className="w-full max-w-sm rounded-[18px] border border-[var(--line)] bg-[var(--panel)] p-4 shadow-xl" onClick={e => e.stopPropagation()}>
            <h2 className="text-base font-semibold text-[var(--accent-deep)]">API 키 입력</h2>
            <p className="mt-1 text-sm text-[var(--sub)]">Gemini API 키를 입력해 주세요.</p>
            <input
              type="password"
              value={draftKey}
              onChange={e => setDraftKey(e.target.value)}
              placeholder="API 키"
              className="mt-3 w-full rounded-full border border-[var(--line)] bg-white px-3 py-2 text-sm text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            />
            <div className="mt-4 flex gap-2">
              <button onClick={closeModal} className="flex-1 rounded-full border border-[var(--line)] bg-[var(--panel)] px-3 py-2 text-sm text-[var(--ink)]">취소</button>
              <button onClick={saveApiKey} className="flex-1 rounded-full bg-[var(--accent)] px-3 py-2 text-sm font-semibold text-white">저장</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}