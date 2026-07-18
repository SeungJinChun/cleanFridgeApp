export default function BottomBar({ navigate }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-10">
      <div className="max-w-2xl mx-auto flex">
        <button onClick={() => navigate('/input')} className="flex-1 py-3 text-sm font-bold text-center text-gray-600 hover:bg-gray-50 active:bg-gray-100">
          <span className="block text-lg">📸</span>
          <span className="text-xs">식재료 등록</span>
        </button>
        <button onClick={() => navigate('/')} className="flex-1 py-3 text-sm font-bold text-center text-gray-600 hover:bg-gray-50 active:bg-gray-100">
          <span className="block text-lg">🧊</span>
          <span className="text-xs">내 냉장고</span>
        </button>
        <button onClick={() => navigate('/recipe')} className="flex-1 py-3 text-sm font-bold text-center text-gray-600 hover:bg-gray-50 active:bg-gray-100">
          <span className="block text-lg">🍳</span>
          <span className="text-xs">레시피</span>
        </button>
      </div>
    </div>
  )
}