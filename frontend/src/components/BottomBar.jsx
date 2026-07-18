export default function BottomBar({ navigate }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-[var(--line)] bg-[var(--panel)] shadow-[var(--shadow)]">
      <div className="max-w-2xl mx-auto flex">
        <button onClick={() => navigate('/input')} className="flex-1 py-3 text-center text-[var(--sub)] hover:bg-[var(--accent-soft)] active:bg-[var(--accent-soft)]">
          <span className="block text-lg">📸</span>
          <span className="text-[11px] font-semibold">식재료 등록</span>
        </button>
        <button onClick={() => navigate('/')} className="flex-1 py-3 text-center text-[var(--sub)] hover:bg-[var(--accent-soft)] active:bg-[var(--accent-soft)]">
          <span className="block text-lg">🧊</span>
          <span className="text-[11px] font-semibold">내 냉장고</span>
        </button>
        <button onClick={() => navigate('/recipe')} className="flex-1 py-3 text-center text-[var(--sub)] hover:bg-[var(--accent-soft)] active:bg-[var(--accent-soft)]">
          <span className="block text-lg">🍳</span>
          <span className="text-[11px] font-semibold">레시피</span>
        </button>
      </div>
    </div>
  )
}