import { useState } from 'react'
import { getRecipeRecommendations } from '../api.js'

export default function RecipePage({ apiKey, sortedItems, navigate }) {
  const [recipeSelect, setRecipeSelect] = useState({})
  const [recipes, setRecipes] = useState('')
  const [recipeLoading, setRecipeLoading] = useState(false)

  const handleGetRecipes = async (selectedItems) => {
    const targets = selectedItems || sortedItems
    if (targets.length === 0) return
    setRecipeLoading(true)
    setRecipes('')
    try {
      const result = await getRecipeRecommendations(apiKey, targets.filter(i => {
        const d = getDday(i.expiry); return d <= 2
      }), targets)
      if (result.includes('해당없음')) {
        setRecipes('해당없음')
      } else {
        setRecipes(result)
      }
    } catch (e) {
      alert('레시피 추천 오류: ' + e.message)
    }
    setRecipeLoading(false)
  }

  return (
    <div>
      {recipeLoading && <div className="text-center py-8"><p className="text-lg animate-pulse">AI 셰프가 레시피를 고민 중...</p></div>}
      {!recipes && !recipeLoading && (
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-gray-500">레시피에 사용할 재료 선택</h2>
          <div className="flex flex-wrap gap-1.5">
            {sortedItems.map(item => (
              <button key={item.id}
                onClick={() => setRecipeSelect(prev => ({ ...prev, [item.id]: !prev[item.id] }))}
                className={`px-2.5 py-1 rounded-full text-xs border ${recipeSelect[item.id] ? 'bg-emerald-100 border-emerald-400 text-emerald-700 font-bold' : 'bg-white border-gray-200 text-gray-600'}`}
              >{item.name}</button>
            ))}
          </div>
          <button
            onClick={() => {
              const sel = sortedItems.filter(i => recipeSelect[i.id])
              handleGetRecipes(sel.length > 0 ? sel : sortedItems)
            }}
            disabled={recipeLoading || sortedItems.length === 0}
            className="w-full py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-bold hover:bg-emerald-700 disabled:opacity-50"
          >{recipeLoading ? '레시피 찾는 중...' : `선택 재료 ${Object.values(recipeSelect).filter(Boolean).length}개 · 레시피 보기`}</button>
        </div>
      )}
      {recipes === '해당없음' && (
        <div className="text-center py-12">
          <p className="text-4xl mb-3">🤷</p>
          <p className="text-gray-500 font-medium">등록된 재료로 만들 수 있는 요리가 없어요</p>
          <p className="text-sm text-gray-400 mt-1">다른 재료를 더 추가해 보세요</p>
        </div>
      )}
      {recipes && recipes !== '해당없음' && (
        <div className="bg-white rounded-xl p-5 shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">🍳 맞춤형 구출 레시피</h2>
            <button onClick={() => { setRecipes(''); setRecipeSelect({}) }} className="text-sm text-emerald-600 hover:underline">다시 선택</button>
          </div>
          <pre className="whitespace-pre-wrap text-xs sm:text-sm leading-relaxed text-gray-700 font-sans">{recipes}</pre>
        </div>
      )}
    </div>
  )
}

function getDday(expiryStr) {
  if (!expiryStr || !expiryStr.includes('-')) return 999
  const now = new Date()
  const exp = new Date(expiryStr)
  return Math.ceil((exp - now) / (1000 * 60 * 60 * 24))
}