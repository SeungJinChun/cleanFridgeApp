import { useState, useEffect, useRef } from 'react'
import { analyzeReceiptImage, analyzeProductImage, parseGptTable, estimateExpiry } from '../api.js'

export default function InputPage({ apiKey, onItemsAdded, showStatus, loading, setLoading }) {
  const [inputMode, setInputMode] = useState('product')
  const [productCamera, setProductCamera] = useState(false)
  const [productImage, setProductImage] = useState(null)
  const [receiptCamera, setReceiptCamera] = useState(false)
  const [capturedImage, setCapturedImage] = useState(null)
  const [manualName, setManualName] = useState('')
  const [manualQty, setManualQty] = useState('1개')
  const [manualExpiry, setManualExpiry] = useState('')
  const [pendingItem, setPendingItem] = useState(null)
  const cameraRef = useRef(null)
  const streamRef = useRef(null)

  const anyCamera = productCamera || receiptCamera

  useEffect(() => {
    if (anyCamera && cameraRef.current && streamRef.current) {
      cameraRef.current.srcObject = streamRef.current
      cameraRef.current.play().catch(() => {})
    }
  }, [anyCamera])

  useEffect(() => () => {
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop())
  }, [])

  const openCamera = async (setCamera) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } } })
      streamRef.current = stream
      setCamera(true)
    } catch (e) {
      showStatus('카메라 접근이 거부되었습니다. 브라우저 설정에서 카메라 권한을 허용해 주세요.')
    }
  }

  const closeCamera = (setCamera, setImage) => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
      streamRef.current = null
    }
    setCamera(false)
    if (setImage) setImage(null)
  }

  const takePhoto = (setCamera, setImage) => {
    if (!cameraRef.current) return
    const canvas = document.createElement('canvas')
    canvas.width = cameraRef.current.videoWidth
    canvas.height = cameraRef.current.videoHeight
    const ctx = canvas.getContext('2d')
    ctx.drawImage(cameraRef.current, 0, 0)
    setImage(canvas.toDataURL('image/jpeg'))
    closeCamera(setCamera, null)
  }

  const getFriendlyError = (err) => {
    const msg = err?.message || err?.toString() || ''
    if (/Failed to fetch|NetworkError|network|fetch/i.test(msg)) {
      return '백엔드가 깨어나는 중입니다. 잠시 후 다시 시도해 주세요.'
    }
    if (/5\d\d|timeout|timed out|503|504|502/i.test(msg)) {
      return '서버가 잠시 응답하지 않습니다. 잠시 후 다시 시도해 주세요.'
    }
    return msg || '분석 중 오류가 발생했습니다.'
  }

  const handleProductAnalyze = async () => {
    setLoading(true)
    showStatus('제품 분석 중...')
    try {
      const b64 = productImage.split(',')[1]
      const result = await analyzeProductImage(apiKey, b64)
      const parsed = parseGptTable(result)
      const item = parsed[0]
      if (!item || !item.name) { showStatus('인식 실패: ' + result.slice(0, 80)); return }
      setPendingItem(item)
      setProductImage(null)
    } catch (e) { showStatus('제품 분석 오류: ' + getFriendlyError(e)) }
    finally { setLoading(false) }
  }

  const handleReceiptAnalyze = async () => {
    setLoading(true)
    showStatus('영수증 분석 중...')
    try {
      const b64 = capturedImage.split(',')[1]
      const result = await analyzeReceiptImage(apiKey, b64)
      const parsed = parseGptTable(result)
      const list = parsed.map(p => ({
        id: Date.now() + Math.random()*1000|0,
        name: p.name,
        qty: p.qty,
        expiry: p.expiry && p.expiry !== '없음' ? p.expiry : estimateExpiry(p.name) || '',
        time: new Date().toISOString().slice(0, 10),
      }))
      onItemsAdded(list)
      setCapturedImage(null)
    } catch (e) { showStatus('영수증 분석 오류: ' + getFriendlyError(e)) }
    finally { setLoading(false) }
  }

  const handleManualAdd = () => {
    const name = manualName.trim()
    if (!name) return
    const expiry = manualExpiry || estimateExpiry(name) || ''
    onItemsAdded([{ id: Date.now(), name, qty: manualQty || '1개', expiry, time: new Date().toISOString().slice(0, 10) }])
    setManualName('')
    setManualQty('1개')
    setManualExpiry('')
    showStatus(`'${name}' 등록 완료!`)
  }

  const confirmProduct = () => {
    if (!pendingItem) return
    let expiry = pendingItem.expiry
    if (!expiry || !expiry.match(/\d{4}-\d{2}-\d{2}/)) {
      expiry = estimateExpiry(pendingItem.name)
      if (!expiry) {
        showStatus('소비기한을 직접 입력해 주세요')
        return
      }
    }
    onItemsAdded([{ id: Date.now(), name: pendingItem.name, qty: pendingItem.qty, expiry, time: new Date().toISOString().slice(0, 10) }])
    showStatus(`${pendingItem.name} 등록!`)
    setPendingItem(null)
  }

  return (
    <div className="space-y-4">
      <div className="flex overflow-hidden rounded-[14px] border border-[var(--line)] bg-[var(--panel)] shadow-[var(--shadow)]">
        {[
          { key: 'product', label: '📷 제품 촬영' },
          { key: 'receipt', label: '🧾 영수증' },
          { key: 'manual', label: '✏️ 직접' },
        ].map(m => (
          <button key={m.key} onClick={() => setInputMode(m.key)}
            className={`flex-1 py-2.5 text-sm font-semibold ${inputMode === m.key ? 'bg-[var(--accent-deep)] text-white' : 'text-[var(--sub)] hover:bg-[var(--accent-soft)]'}`}
          >{m.label}</button>
        ))}
      </div>

      {inputMode === 'product' && (
        <div className="rounded-[18px] border border-[var(--line)] bg-[var(--panel)] p-5 shadow-[var(--shadow)]">
          <h2 className="mb-3 text-lg font-bold text-[var(--accent-deep)]">제품 사진 촬영</h2>
          <p className="mb-3 text-sm text-[var(--sub)]">식품을 카메라로 찍으면 AI가 제품명과 소비기한을 자동 인식합니다.</p>
          {productCamera ? (
            <div className="space-y-2">
              <video ref={cameraRef} autoPlay playsInline className="w-full max-h-64 rounded-lg bg-black" />
              <div className="flex gap-2">
                <button onClick={() => takePhoto(setProductCamera, setProductImage)} className="flex-1 rounded-lg bg-[var(--accent)] py-2.5 text-sm font-bold text-white hover:bg-[var(--accent-deep)]">📸 촬영</button>
                <button onClick={() => closeCamera(setProductCamera, setProductImage)} className="flex-1 rounded-lg bg-[var(--line)] py-2.5 text-sm font-bold text-[var(--ink)] hover:opacity-90">취소</button>
              </div>
            </div>
          ) : productImage ? (
            <div className="space-y-2">
              <img src={productImage} alt="촬영된 제품" className="w-full max-h-64 rounded-lg border object-contain" />
              <div className="flex gap-2">
                <button onClick={handleProductAnalyze} disabled={loading} className="flex-1 rounded-lg bg-[var(--accent)] py-2.5 text-sm font-bold text-white hover:bg-[var(--accent-deep)] disabled:opacity-50">{loading ? 'AI 분석 중...' : '제품 분석하기'}</button>
                <button onClick={() => setProductImage(null)} className="flex-1 rounded-lg bg-[var(--line)] py-2.5 text-sm font-bold text-[var(--ink)] hover:opacity-90">다시 찍기</button>
              </div>
            </div>
          ) : (
            <button onClick={() => openCamera(setProductCamera)} disabled={loading} className="w-full rounded-lg bg-[var(--accent)] py-2.5 text-sm font-bold text-white hover:bg-[var(--accent-deep)] disabled:opacity-50">{loading ? '분석 중...' : '📸 카메라 열기'}</button>
          )}
        </div>
      )}

      {inputMode === 'receipt' && (
        <div className="rounded-[18px] border border-[var(--line)] bg-[var(--panel)] p-5 shadow-[var(--shadow)]">
          <h2 className="mb-3 text-lg font-bold text-[var(--accent-deep)]">영수증 사진 촬영</h2>
          <p className="mb-3 text-sm text-[var(--sub)]">영수증을 카메라로 찍으면 AI가 식재료만 골라 소비기한과 함께 등록합니다.</p>
          {receiptCamera ? (
            <div className="space-y-2">
              <video ref={cameraRef} autoPlay playsInline className="w-full max-h-64 rounded-lg bg-black" />
              <div className="flex gap-2">
                <button onClick={() => takePhoto(setReceiptCamera, setCapturedImage)} className="flex-1 rounded-lg bg-[var(--accent)] py-2.5 text-sm font-bold text-white hover:bg-[var(--accent-deep)]">📸 촬영</button>
                <button onClick={() => closeCamera(setReceiptCamera, setCapturedImage)} className="flex-1 rounded-lg bg-[var(--line)] py-2.5 text-sm font-bold text-[var(--ink)] hover:opacity-90">취소</button>
              </div>
            </div>
          ) : capturedImage ? (
            <div className="space-y-2">
              <img src={capturedImage} alt="촬영된 영수증" className="w-full max-h-64 rounded-lg border object-contain" />
              <div className="flex gap-2">
                <button onClick={handleReceiptAnalyze} disabled={loading} className="flex-1 rounded-lg bg-[var(--accent)] py-2.5 text-sm font-bold text-white hover:bg-[var(--accent-deep)] disabled:opacity-50">{loading ? 'AI 분석 중...' : '영수증 분석하기'}</button>
                <button onClick={() => setCapturedImage(null)} className="flex-1 rounded-lg bg-[var(--line)] py-2.5 text-sm font-bold text-[var(--ink)] hover:opacity-90">다시 찍기</button>
              </div>
            </div>
          ) : (
            <button onClick={() => openCamera(setReceiptCamera)} disabled={loading} className="w-full rounded-lg bg-[var(--accent)] py-2.5 text-sm font-bold text-white hover:bg-[var(--accent-deep)] disabled:opacity-50">{loading ? '분석 중...' : '📸 카메라 열기'}</button>
          )}
        </div>
      )}

      {inputMode === 'manual' && (
        <div className="space-y-3 rounded-[18px] border border-[var(--line)] bg-[var(--panel)] p-5 shadow-[var(--shadow)]">
          <h2 className="text-lg font-bold text-[var(--accent-deep)]">직접 입력</h2>
          <input value={manualName} onChange={e => setManualName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleManualAdd()} placeholder="식재료명" className="w-full rounded-lg border border-[var(--line)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]" />
          <div className="flex gap-2">
            <input value={manualQty} onChange={e => setManualQty(e.target.value)} placeholder="수량" className="w-24 rounded-lg border border-[var(--line)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]" />
            <input value={manualExpiry} onChange={e => setManualExpiry(e.target.value)} type="date" className="flex-1 rounded-lg border border-[var(--line)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]" />
          </div>
          <button onClick={handleManualAdd} disabled={!manualName.trim()} className="w-full rounded-lg bg-[var(--accent-deep)] py-2.5 text-sm font-semibold text-white hover:bg-[var(--accent)] disabled:opacity-50">추가</button>
        </div>
      )}

      {pendingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setPendingItem(null)}>
          <div className="w-[calc(100%-32px)] max-w-80 rounded-[18px] border border-[var(--line)] bg-[var(--panel)] p-4 shadow-xl sm:p-5" onClick={e => e.stopPropagation()}>
            <h3 className="mb-3 text-base font-bold text-[var(--accent-deep)]">제품 확인</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-[var(--sub)]">제품명</label>
                <input value={pendingItem.name} onChange={e => setPendingItem({...pendingItem, name: e.target.value})}
                  className="w-full rounded-lg border border-[var(--line)] px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-xs text-[var(--sub)]">수량</label>
                <input value={pendingItem.qty} onChange={e => setPendingItem({...pendingItem, qty: e.target.value})}
                  className="w-full rounded-lg border border-[var(--line)] px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-xs text-[var(--sub)]">소비기한 (선택)</label>
                <input type="date" value={pendingItem.expiry} onChange={e => setPendingItem({...pendingItem, expiry: e.target.value})}
                  className="w-full rounded-lg border border-[var(--line)] px-3 py-2 text-sm" />
              </div>
              <button onClick={confirmProduct} className="w-full rounded-lg bg-[var(--accent)] py-2.5 text-sm font-bold text-white hover:bg-[var(--accent-deep)]">등록</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}