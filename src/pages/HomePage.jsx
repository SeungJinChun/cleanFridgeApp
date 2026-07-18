export default function HomePage({
  sortedItems, urgentItems, recipeLoading,
  handleRemove, handleGetRecipes, updateExpiry, refreshItems,
  editingId, setEditingId, navigate,
}) {
  return (
    <div className="space-y-4">
      {sortedItems.length > 0 && (
        <button onClick={() => navigate('/recipe')}
          className="w-full py-2.5 bg-white border-2 border-emerald-200 text-emerald-700 rounded-xl text-sm font-bold hover:bg-emerald-50 shadow-sm"
        >🍳 레시피 보기</button>
      )}
      {urgentItems.length > 0 && (
        <div className="bg-red-50 border-2 border-red-300 rounded-xl p-4">
          <h3 className="text-base font-bold text-red-700 mb-2">🚨 마감 임박! 소비 독려 알림</h3>
          {urgentItems.map(item => (
            <p key={item.id} className="text-sm text-red-600 mb-1"><strong>{item.name}</strong>이(가) 유통기한 마감 직전! 오늘 소비하지 않으면 지구와 지갑이 아파해요</p>
          ))}
          <button onClick={() => navigate('/recipe')} className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700">🍳 마감 재료 확인하러 가기</button>
        </div>
      )}
      {sortedItems.length === 0 ? (
        <div className="text-center py-16 sm:py-20">
          <p className="text-5xl sm:text-6xl mb-4">🧊</p>
          <p className="text-gray-500 font-medium text-sm sm:text-base">냉장고가 비어 있어요</p>
          <p className="text-gray-400 text-xs sm:text-sm mt-1 mb-4">제품을 찍거나 직접 추가해 보세요</p>
          <button onClick={() => navigate('/input')} className="px-6 py-2.5 bg-emerald-600 text-white rounded-full text-sm font-bold hover:bg-emerald-700 shadow">+ 식재료 추가하기</button>
        </div>
      ) : (
        <div>
          <div className="space-y-2">
            <h2 className="text-lg font-bold">전체 식재료 ({sortedItems.length}개)</h2>
            {sortedItems.map(item => (
              <ItemCard key={item.id} item={item}
                editingId={editingId} setEditingId={setEditingId}
                handleRemove={handleRemove}
                updateExpiry={updateExpiry} refreshItems={refreshItems}
              />
            ))}
          </div>
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

function getUrgency(dday) {
  if (dday <= 0) return { label: '🔥 만료', text: 'text-red-700', bar: 'bg-red-400' }
  if (dday <= 2) return { label: '⚠️ 임박', text: 'text-orange-700', bar: 'bg-orange-400' }
  if (dday <= 5) return { label: '📅 곧', text: 'text-yellow-700', bar: 'bg-yellow-400' }
  return { label: '✅ 여유', text: 'text-green-600', bar: 'bg-green-400' }
}

function foodIcon(name) {
  const map = { '우유':'🥛','두유':'🥛','계란':'🥚','두부':'🧈','닭':'🍗','소':'🥩','돼':'🥩','생선':'🐟','김치':'🥬','상추':'🥬','오이':'🥒','당근':'🥕','양파':'🧅','감자':'🥔','고구마':'🍠','버섯':'🍄','토마토':'🍅','사과':'🍎','바나나':'🍌','딸기':'🍓','포도':'🍇','빵':'🍞','치즈':'🧀','라면':'🍜','면':'🍝','밥':'🍚','과자':'🍪','캔':'🥫','요거트':'🍦','꿀':'🍯','두유':'🧃' }
  for (const [k, v] of Object.entries(map)) if (name.includes(k)) return v
  return '📦'
}

function getStorage(name) {
  const 냉장 = ['우유','두유','두부','순두부','계란','달걀','닭','소고기','돼지','삼겹','목살','등심','생선','고등어','갈치','연어','오징어','새우','김치','상추','깻잎','오이','당근','버섯','팽이','느타리','양송이','토마토','사과','바나나','딸기','포도','귤','오렌지','키위','블루베리','망고','복숭아','참외','수박','자두','배','체리','멜론','청포도','감','단호박','애호박','가지','파프리카','케일','시금치','콩나물','숙주','치즈','햄','베이컨','소시지','어묵','맛살','요거트','요구르트','크림','휘핑','마요네즈','피자','김밥','샐러드','주스','과일']
  const 냉동 = ['냉동','만두','아이스']
  for (const k of 냉동) if (name.includes(k)) return '🧊 냉동'
  for (const k of 냉장) if (name.includes(k)) return '❄️ 냉장'
  return '🌡️ 실온'
}

function ItemCard({ item, editingId, setEditingId, handleRemove, updateExpiry, refreshItems }) {
  const dday = getDday(item.expiry)
  const u = getUrgency(dday)
  const isEditing = editingId === item.id
  const maxDays = Math.max(14, Math.abs(dday) + 7)
  const barPercent = Math.min(100, Math.max(0, dday <= 0 ? 100 : 100 - (dday / maxDays) * 100))
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3 p-3">
        <span className="text-2xl">{foodIcon(item.name)}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold truncate">{item.name}</span>
            <span className="text-xs text-gray-400 ml-1 shrink-0">{getStorage(item.name)}</span>
            <button onClick={() => handleRemove(item.id)} className="text-gray-300 hover:text-red-500 text-base leading-none ml-1 shrink-0">✕</button>
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-gray-400">{item.qty}</span>
            {isEditing ? (
              <input type="date" defaultValue={item.expiry?.slice(0,10) || ''} autoFocus
                onBlur={e => { updateExpiry(item.id, e.target.value); refreshItems(); setEditingId(null) }}
                onKeyDown={e => { if (e.key === 'Enter') { updateExpiry(item.id, e.target.value); refreshItems(); setEditingId(null) }}}
                className="text-xs border border-gray-300 rounded px-1 py-0.5 w-28" />
            ) : item.expiry ? (
              <span onClick={() => setEditingId(item.id)} className={`text-xs px-1.5 py-0.5 rounded-full font-bold cursor-pointer bg-${u.text.split('-')[1]}-100 ${u.text}`}>
                {u.label} D-{Math.abs(dday)}일
              </span>
            ) : (
              <span onClick={() => setEditingId(item.id)} className="text-xs text-gray-400 cursor-pointer bg-gray-100 px-1.5 py-0.5 rounded-full">미지정</span>
            )}
          </div>
        </div>
      </div>
      {item.expiry && (
        <div className="h-1 bg-gray-100">
          <div className={`h-full transition-all ${u.bar}`} style={{ width: `${barPercent}%` }} />
        </div>
      )}
    </div>
  )
}