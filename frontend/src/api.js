const TODAY = new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })
const BACKEND_URL = 'https://cleanfridgeapp.onrender.com'

async function geminiText(apiKey, prompt, tokens = 600, temp = 0.3) {
  const resp = await fetch(`${BACKEND_URL}/api/gemini/text`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ apiKey, prompt, tokens, temp }),
  })
  if (!resp.ok) {
    const errText = await resp.text()
    let msg = errText.slice(0, 200)
    try { msg = JSON.parse(errText).error || msg } catch {}
    throw new Error(msg)
  }
  const data = await resp.json()
  return data.text
}

async function geminiVision(apiKey, prompt, base64Image, tokens = 600, temp = 0.3) {
  const resp = await fetch(`${BACKEND_URL}/api/gemini/vision`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ apiKey, prompt, base64Image, tokens, temp }),
  })
  if (!resp.ok) {
    const errText = await resp.text()
    let msg = errText.slice(0, 200)
    try { msg = JSON.parse(errText).error || msg } catch {}
    throw new Error(msg)
  }
  const data = await resp.json()
  return data.text
}

export async function analyzeProductImage(apiKey, base64Image) {
  const prompt = `이 식품 사진을 분석해줘.
반드시 아래 형식의 한 줄만 출력해줘.
형식: 제품명|카테고리|1개|YYYY-MM-DD 또는 없음
규칙:
1. 설명, 인사, 추가 문장, 마크다운, 코드블록, 목록 금지
2. 제품명은 포장지에 적힌 이름 그대로 사용
3. 카테고리는 예시 중 하나만 사용: 우유, 두유, 라면, 과자, 계란, 김치, 빵, 과일, 채소, 육류, 생선, 해산물, 음료, 기타
4. 유통기한이 없으면 없음으로 표기
5. 반드시 한 줄만 출력하고, 줄바꿈은 1번만 허용
예시: 서울우유|우유|1개|2026-08-15`
  return geminiVision(apiKey, prompt, base64Image, 400, 0.1)
}

export async function analyzeProductImageLegacy(base64Image) {
  const prompt = `이 사진은 식품 제품입니다. 제품명과 수량, 소비기한을 알려주세요.
제품 포장지에 유통기한(소비기한) 날짜가 찍혀있으면 반드시 그 날짜를 그대로 사용하세요.
찍힌 날짜가 없으면 오늘(${TODAY}) 기준 일반 유통기한으로 추정하세요.
반드시 아래 형식만 출력:
제품명|수량|YYYY-MM-DD
예: 서울우유|1개|2026-08-15`
  return geminiVision(prompt, base64Image, 400, 0.1)
}

const ESTIMATE_GUIDE = {
  '두유':180,'우유':7,'두부':5,'순두부':7,'계란':14,'달걀':14,
  '닭':3,'닭고기':3,'소고기':5,'돼지고기':5,'삼겹살':5,'목살':5,'앞다리':5,'등심':5,'생선':2,'고등어':2,'갈치':2,'연어':3,'오징어':3,'새우':3,
  '김치':30,'상추':5,'깻잎':5,'오이':7,'당근':14,'양파':30,'감자':30,'고구마':21,'버섯':5,'팽이':5,'느타리':5,'양송이':5,'토마토':7,'방울토마토':7,
  '사과':14,'바나나':7,'딸기':3,'포도':7,'귤':14,'오렌지':14,'키위':10,'블루베리':5,'망고':7,'복숭아':5,'참외':7,'수박':7,'자두':5,'배':14,
  '빵':5,'식빵':5,'치즈':14,'햄':14,'베이컨':10,'소시지':14,'어묵':10,'맛살':14,
  '라면':180,'면':180,'국수':180,'파스타':365,'스파게티':365,'과자':180,'캔':365,'통조림':365,'캔디':365,'초콜릿':180,'즉석밥':180,'컵밥':180,'시리얼':180,
  '요거트':14,'요구르트':14,'주스':7,'음료':180,'생수':365,'탄산':180,'맥주':180,'소주':365,'우유':7,'두유':180,'요거트':14,
  '쨈':180,'잼':180,'꿀':365,'식용유':365,'참기름':180,'고추장':365,'된장':365,'간장':365,
  '견과류':180,'아몬드':180,'호두':180,'땅콩':180,
  '냉동만두':90,'냉동':90,'피자':7,'김밥':1,'샐러드':2,'과일':5,
  '시금치':5,'콩나물':3,'숙주':3,'청포도':7,'체리':5,'멜론':7,'감':10,'단호박':30,'애호박':7,'가지':7,'파프리카':10,'케일':5,
  '크림':14,'휘핑':14,'마요네즈':90,'케첩':180,'카레':365,'짜장':365,'미역':365,'다시마':365,'올리브':365,
}

export function estimateExpiry(name) {
  const today = new Date()
  const matches = []
  for (const [key, days] of Object.entries(ESTIMATE_GUIDE)) {
    if (name.includes(key)) matches.push([key, days])
  }
  if (matches.length === 0) return null
  matches.sort((a, b) => b[0].length - a[0].length)
  const d = new Date(today); d.setDate(d.getDate() + matches[0][1])
  return d.toISOString().slice(0, 10)
}

export function getStorage(name) {
  const 냉장 = ['우유','두유','두부','순두부','계란','달걀','닭','소고기','돼지','삼겹','목살','등심','생선','고등어','갈치','연어','오징어','새우','김치','상추','깻잎','오이','당근','버섯','팽이','느타리','양송이','토마토','사과','바나나','딸기','포도','귤','오렌지','키위','블루베리','망고','복숭아','참외','수박','자두','배','체리','멜론','청포도','감','단호박','애호박','가지','파프리카','케일','시금치','콩나물','숙주','치즈','햄','베이컨','소시지','어묵','맛살','요거트','요구르트','크림','휘핑','마요네즈','피자','김밥','샐러드','주스','과일']
  const 냉동 = ['냉동','만두','아이스']
  for (const k of 냉동) if (name.includes(k)) return '🧊 냉동'
  for (const k of 냉장) if (name.includes(k)) return '❄️ 냉장'
  return '🌡️ 실온'
}

export async function analyzeReceiptImage(apiKey, base64Image) {
  const prompt = `이 영수증 사진에서 식재료(식품)만 골라서 반드시 아래 형식으로 한 줄씩 출력해줘. 생활용품 제외.
형식: 제품명|수량|YYYY-MM-DD
규칙:
1. 설명, 인사, 추가 문장, 마크다운, 코드블록, 목록 금지
2. 식재료만 출력하고 생활용품은 제외
3. 각 줄은 제품명|수량|YYYY-MM-DD 형식만 사용
4. 날짜가 없으면 오늘(${TODAY}) 기준으로 일반 보관기간을 추정해서 YYYY-MM-DD로 작성
5. 출력은 줄바꿈으로 여러 줄 가능하지만, 각 줄은 위 형식만 사용
예시: 우유|2개|2026-07-28`
  return geminiVision(apiKey, prompt, base64Image, 400, 0.1)
}

export async function getRecipeRecommendations(apiKey, urgentIngredients, allIngredients) {
  const prompt = `냉장고 모든 재료: ${allIngredients.map(i => i.name).join(', ')}
${urgentIngredients.length > 0 ? '빨리 먹어야 하는 재료: ' + urgentIngredients.map(i => i.name).join(', ') : '마감 임박 재료 없음. 모든 재료로 자유롭게 추천.'}
이 재료들을 활용하는 실제 존재하는 한국 요리만 추천. 가상 요리나 현실적으로 불가능한 요리는 절대 금지.
양념류(소금,설탕,간장,고추장,된장,참기름,식용유,마늘,파,후추) 자유 사용.
만약 적합한 요리가 하나도 없으면 "해당없음"이라고만 답변.
가능한 요리가 있다면 아래 형식으로 출력:
[1] 요리명
재료: ...
순서: 1) ... 2) ... 3) ...
팁: ...`
  return geminiText(apiKey, prompt, 2000, 0.8)
}

export function parseGptTable(text) {
  const items = []
  const raw = (text || '').toString()
  const lines = raw.split(/\r?\n/)
  for (const line of lines) {
    let clean = line.replace(/^[*\s\-•]+\*?\*?/, '').trim()
    clean = clean.replace(/\*\*/g, '')
    clean = clean.replace(/^\|\s*|\s*\|$/g, '')
    if (!clean) continue
    if (/^[-=]{3,}/.test(clean)) continue
    if (/식재료|제품명|식품아님|참고|형식|예:|출력/.test(clean)) continue

    const parts = clean.split(/\s*\|\s*/).map(p => p.trim()).filter(Boolean)
    if (parts.length === 0) continue

    let name = parts[0] || ''
    if (!name || name.length < 2) continue
    if (name.includes('---') || name.includes('이(가)') || name.includes('을') || name.includes('를')) continue
    if (name.length > 50) name = name.slice(0, 50)

    let category = ''
    let qty = '1개'
    let expiry = ''

    if (parts.length >= 2) {
      category = parts[1]
    }
    if (parts.length >= 3) {
      qty = parts[2]
    }
    if (parts.length >= 4) {
      expiry = parts[3]
    }

    const expiryMatch = expiry.match(/\d{4}-\d{2}-\d{2}/)
    if (expiry && !expiry.includes('-')) {
      const m = expiry.match(/(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일/)
      if (m) expiry = `${m[1]}-${m[2].padStart(2,'0')}-${m[3].padStart(2,'0')}`
    }

    if (expiryMatch) expiry = expiryMatch[0]
    if (!qty) qty = '1개'

    items.push({ name, category: category || name, qty, expiry: expiry || '' })
  }

  if (items.length === 0) {
    const fallback = raw.match(/([가-힣A-Za-z0-9()\-\s]{2,})/)
    if (fallback) {
      const name = fallback[1].trim().slice(0, 50)
      items.push({ name, category: name, qty: '1개', expiry: '' })
    }
  }

  return items
}