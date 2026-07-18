export default function HomePage({
  sortedItems, urgentItems, recipeLoading,
  handleRemove, handleGetRecipes, updateExpiry, refreshItems,
  editingId, setEditingId, navigate,
}) {
  return (
    <div className="space-y-4">
      {sortedItems.length > 0 && (
        <button onClick={() => navigate('/recipe')}
          className="w-full rounded-[14px] border border-[var(--line)] bg-[var(--panel)] px-4 py-3 text-sm font-semibold text-[var(--accent-deep)] shadow-[var(--shadow)] hover:bg-[var(--accent-soft)]"
        >🍳 레시피 보기</button>
      )}
      {urgentItems.length > 0 && (
        <div className="rounded-[18px] border border-[var(--grade-a-soft)] bg-[var(--grade-a-soft)] p-4 shadow-[var(--shadow)]">
          <h3 className="mb-2 text-base font-bold text-[var(--grade-a)]">🚨 마감 임박! 소비 독려 알림</h3>
          {urgentItems.map(item => (
            <p key={item.id} className="mb-1 text-sm text-[var(--grade-a)]"><strong>{item.name}</strong>이(가) 유통기한 마감 직전! 오늘 소비하지 않으면 지구와 지갑이 아파해요</p>
          ))}
          <button onClick={() => navigate('/recipe')} className="mt-2 rounded-lg bg-[var(--grade-a)] px-4 py-2 text-sm font-bold text-white hover:opacity-90">🍳 마감 재료 확인하러 가기</button>
        </div>
      )}
      {sortedItems.length === 0 ? (
        <div className="rounded-[18px] border border-[var(--line)] bg-[var(--panel)] py-16 text-center shadow-[var(--shadow)] sm:py-20">
          <p className="mb-4 text-5xl sm:text-6xl">🧊</p>
          <p className="text-sm font-semibold text-[var(--sub)] sm:text-base">냉장고가 비어 있어요</p>
          <p className="mt-1 mb-4 text-xs text-[var(--sub)] sm:text-sm">제품을 찍거나 직접 추가해 보세요</p>
          <button onClick={() => navigate('/input')} className="rounded-full bg-[var(--accent)] px-6 py-2.5 text-sm font-bold text-white shadow-[var(--shadow)] hover:bg-[var(--accent-deep)]">+ 식재료 추가하기</button>
        </div>
      ) : (
        <div>
          <div className="space-y-2">
            <h2 className="text-lg font-bold text-[var(--accent-deep)]">전체 식재료 ({sortedItems.length}개)</h2>
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
  if (dday <= 0) return { label: '🔥 만료', text: 'text-[var(--grade-a)]', bar: 'bg-[var(--grade-a)]' }
  if (dday <= 2) return { label: '⚠️ 임박', text: 'text-[var(--grade-b)]', bar: 'bg-[var(--grade-b)]' }
  if (dday <= 5) return { label: '📅 곧', text: 'text-[var(--grade-c)]', bar: 'bg-[var(--grade-c)]' }
  return { label: '✅ 여유', text: 'text-[var(--accent)]', bar: 'bg-[var(--accent)]' }
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
    <div className="overflow-hidden rounded-[16px] border border-[var(--line)] bg-[var(--panel)] shadow-[var(--shadow)] transition-shadow hover:shadow-md">
      <div className="flex items-center gap-3 p-3">
        <span className="text-2xl">{foodIcon(item.name)}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="truncate text-sm font-bold text-[var(--accent-deep)]">{item.name}</span>
            <span className="shrink-0 text-[11px] text-[var(--sub)]">{getStorage(item.name)}</span>
            <button onClick={() => handleRemove(item.id)} className="ml-1 shrink-0 text-base leading-none text-[var(--sub)] hover:text-[var(--grade-a)]">✕</button>
          </div>
          <div className="mt-0.5 flex items-center gap-2">
            <span className="text-[11px] text-[var(--sub)]">{item.qty}</span>
            {isEditing ? (
              <input type="date" defaultValue={item.expiry?.slice(0,10) || ''} autoFocus
                onBlur={e => { updateExpiry(item.id, e.target.value); refreshItems(); setEditingId(null) }}
                onKeyDown={e => { if (e.key === 'Enter') { updateExpiry(item.id, e.target.value); refreshItems(); setEditingId(null) }}}
                className="w-28 rounded border border-[var(--line)] px-1 py-0.5 text-[11px]" />
            ) : item.expiry ? (
              <span onClick={() => setEditingId(item.id)} className={`cursor-pointer rounded-full px-1.5 py-0.5 text-[11px] font-bold ${u.text}`}>
                {u.label} D-{Math.abs(dday)}일
              </span>
            ) : (
              <span onClick={() => setEditingId(item.id)} className="cursor-pointer rounded-full bg-[var(--accent-soft)] px-1.5 py-0.5 text-[11px] text-[var(--accent)]">미지정</span>
            )}
          </div>
        </div>
      </div>
      {item.expiry && (
        <div className="h-1 bg-[var(--line)]">
          <div className={`h-full transition-all ${u.bar}`} style={{ width: `${barPercent}%` }} />
        </div>
      )}
    </div>
  )
}