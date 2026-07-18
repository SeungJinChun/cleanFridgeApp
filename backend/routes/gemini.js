import express from 'express'

const router = express.Router()

router.post('/text', async (req, res) => {
  const { apiKey, prompt, tokens = 600, temp = 0.3 } = req.body
  if (!apiKey || !prompt) {
    return res.status(400).json({ error: 'apiKey and prompt are required' })
  }

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: tokens, temperature: temp },
      }),
    })

    const data = await response.json()
    if (!response.ok) {
      return res.status(response.status).json({ error: data.error?.message || 'Gemini API request failed' })
    }

    res.json({ text: data.candidates?.[0]?.content?.parts?.[0]?.text || '' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.post('/vision', async (req, res) => {
  const { apiKey, prompt, base64Image, tokens = 600, temp = 0.3 } = req.body
  if (!apiKey || !prompt || !base64Image) {
    return res.status(400).json({ error: 'apiKey, prompt and base64Image are required' })
  }

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: prompt },
            { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
          ],
        }],
        generationConfig: { maxOutputTokens: tokens, temperature: temp },
      }),
    })

    const data = await response.json()
    if (!response.ok) {
      return res.status(response.status).json({ error: data.error?.message || 'Gemini API request failed' })
    }

    res.json({ text: data.candidates?.[0]?.content?.parts?.[0]?.text || '' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router
