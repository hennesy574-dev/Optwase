// api/notify.js — отправка уведомления + PDF в Telegram
// Используем raw multipart/form-data буфер (FormData не работает в Node.js Vercel edge)
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import { createClient } from '@supabase/supabase-js'

const SB_URL = 'https://vqcsocjxfrhzkwlubhha.supabase.co'
const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxY3NvY2p4ZnJoemt3bHViaGhhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQwNTc2NjIsImV4cCI6MjA4OTYzMzY2Mn0.N9ESHWWIvlT8OJqnOCCblXEtpsjg3UJmlzWoqziw7Rs'

export const config = { api: { bodyParser: { sizeLimit: '10mb' } } }

function msk(d) {
  return new Date(d || Date.now()).toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' })
}
function mskDate(d) {
  return new Date(d || Date.now()).toLocaleDateString('ru-RU', { timeZone: 'Europe/Moscow' })
}

// Отправка документа через raw multipart — работает везде
async function sendDocument(token, chatId, pdfBytes, filename, caption) {
  const boundary = 'WaysPodBoundary' + Date.now()
  const CRLF = '\r\n'

  const parts = []

  // chat_id
  parts.push(
    `--${boundary}${CRLF}` +
    `Content-Disposition: form-data; name="chat_id"${CRLF}${CRLF}` +
    `${chatId}`
  )
  // caption
  parts.push(
    `--${boundary}${CRLF}` +
    `Content-Disposition: form-data; name="caption"${CRLF}${CRLF}` +
    `${caption}`
  )
  // parse_mode
  parts.push(
    `--${boundary}${CRLF}` +
    `Content-Disposition: form-data; name="parse_mode"${CRLF}${CRLF}` +
    `Markdown`
  )

  const textPart = parts.join(CRLF) + CRLF
  const filePart =
    `--${boundary}${CRLF}` +
    `Content-Disposition: form-data; name="document"; filename="${filename}"${CRLF}` +
    `Content-Type: application/pdf${CRLF}${CRLF}`
  const closing = `${CRLF}--${boundary}--${CRLF}`

  const body = Buffer.concat([
    Buffer.from(textPart, 'utf8'),
    Buffer.from(filePart, 'utf8'),
    Buffer.from(pdfBytes),
    Buffer.from(closing, 'utf8'),
  ])

  const res = await fetch(`https://api.telegram.org/bot${token}/sendDocument`, {
    method: 'POST',
    headers: {
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
      'Content-Length': body.length.toString(),
    },
    body,
  })
  return res.json()
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  let body
  try { body = req.body } catch { return res.status(400).json({ error: 'Bad body' }) }

  const { order, tgToken, tgChatId } = body || {}

  if (!order)    return res.status(400).json({ error: 'No order' })
  if (!tgToken)  return res.status(400).json({ error: 'No tgToken' })
  if (!tgChatId) return res.status(400).json({ error: 'No tgChatId' })

  const token  = String(tgToken).trim()
  const chatId = String(tgChatId).trim()

  // Проверка токена
  if (!token.match(/^\d+:[A-Za-z0-9_-]+$/)) {
    return res.status(400).json({ error: 'Invalid token format' })
  }

  try {
    // Статистика клиента
    let prevOrders = 0, prevTotal = 0, regDate = 'Новый клиент', isNew = false
    try {
      const sbc = createClient(SB_URL, SB_KEY)
      const [{ data: uOrds }, { data: uInfo }] = await Promise.all([
        sbc.from('orders').select('total').eq('phone', order.phone),
        sbc.from('users').select('created_at').eq('phone', order.phone).single(),
      ])
      prevOrders = (uOrds || []).length
      prevTotal  = (uOrds || []).reduce((s, o) => s + (o.total || 0), 0)
      if (uInfo?.created_at) {
        regDate = msk(uInfo.created_at)
        isNew = (Date.now() - new Date(uInfo.created_at).getTime()) < 300000
      }
    } catch {}

    const dl    = order.delivery_type === 'sdek' ? '📦 СДЭК' : '📮 Почта России'
    const items = (order.items || []).map(i =>
      `  • ${i.name} × ${i.qty} = ${(i.price * i.qty).toLocaleString('ru')} ₽`
    ).join('\n')

    const text =
      `🛒 *НОВЫЙ ЗАКАЗ #${order.id}*${isNew ? '\n🆕 *НОВЫЙ КЛИЕНТ*' : ''}\n` +
      `━━━━━━━━━━━━━━━━\n` +
      `👤 *${order.name}*\n📞 ${order.phone}\n` +
      `${dl}: ${order.delivery_addr || '—'}\n` +
      `🕐 ${msk()} МСК\n` +
      `━━━━━━━━━━━━━━━━\n` +
      `📦 *Товары:*\n${items}\n` +
      `━━━━━━━━━━━━━━━━\n` +
      `💰 *ИТОГО: ${(order.total || 0).toLocaleString('ru')} ₽*\n` +
      `━━━━━━━━━━━━━━━━\n` +
      `📊 Заказов клиента: ${prevOrders} · ${prevTotal.toLocaleString('ru')} ₽\n` +
      `📅 Рег.: ${regDate}`

    // 1. Текстовое уведомление
    const msgRes = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'Markdown' }),
    })
    const msgData = await msgRes.json()

    if (!msgData.ok) {
      console.error('sendMessage error:', JSON.stringify(msgData))
      return res.status(200).json({
        success: false,
        step: 'sendMessage',
        error: msgData.description,
        debug: { token: token.slice(0, 10) + '...', chatId }
      })
    }

    // 2. Генерируем PDF
    const pdfBytes = await buildPDF(order)

    // 3. Отправляем PDF через raw multipart
    const caption = `📄 Накладная #${order.id} · ${(order.total || 0).toLocaleString('ru')} ₽`
    const docData = await sendDocument(token, chatId, pdfBytes, `invoice_${order.id}.pdf`, caption)

    if (!docData.ok) {
      console.error('sendDocument error:', JSON.stringify(docData))
    }

    return res.status(200).json({
      success: true,
      msgOk: msgData.ok,
      docOk: docData.ok,
      docError: docData.ok ? null : docData.description,
    })

  } catch (err) {
    console.error('notify handler error:', err)
    return res.status(500).json({ error: err.message, stack: err.stack?.slice(0, 300) })
  }
}

// ── PDF генерация ──
async function buildPDF(order) {
  const doc  = await PDFDocument.create()
  const page = doc.addPage([595, 842])
  const W = 595, H = 842

  const bold = await doc.embedFont(StandardFonts.HelveticaBold)
  const reg  = await doc.embedFont(StandardFonts.Helvetica)

  const INK    = rgb(0.06, 0.08, 0.12)
  const ACCENT = rgb(0.15, 0.39, 0.92)
  const GRAY   = rgb(0.48, 0.53, 0.62)
  const LIGHT  = rgb(0.95, 0.96, 0.97)
  const WHITE  = rgb(1, 1, 1)
  const GREEN  = rgb(0.07, 0.57, 0.32)

  const nowDate = mskDate()
  const nowFull = msk()

  // ── Шапка ──
  page.drawRectangle({ x: 0, y: H - 90, width: W, height: 90, color: INK })
  page.drawText('WAYS POD', { x: 40, y: H - 40, size: 26, font: bold, color: ACCENT })
  page.drawText('Оптовые поставки · wayspod.ru', { x: 40, y: H - 58, size: 9, font: reg, color: GRAY })
  page.drawText('© 2026', { x: 40, y: H - 72, size: 8, font: reg, color: rgb(0.35, 0.42, 0.58) })

  const invTitle = `НАКЛАДНАЯ #${order.id}`
  page.drawText(invTitle, {
    x: W - bold.widthOfTextAtSize(invTitle, 14) - 40, y: H - 40, size: 14, font: bold, color: WHITE
  })
  const dateStr = `Дата: ${nowDate}`
  page.drawText(dateStr, {
    x: W - reg.widthOfTextAtSize(dateStr, 9) - 40, y: H - 58, size: 9, font: reg, color: GRAY
  })
  page.drawText(nowFull + ' МСК', {
    x: W - reg.widthOfTextAtSize(nowFull + ' МСК', 8) - 40, y: H - 72, size: 8, font: reg, color: GRAY
  })
  page.drawRectangle({ x: 0, y: H - 94, width: W, height: 4, color: ACCENT })

  // ── Блок реквизитов ──
  let y = H - 116
  page.drawRectangle({ x: 38, y: y - 56, width: W - 76, height: 64, color: LIGHT })
  page.drawRectangle({ x: 38, y: y - 56, width: W - 76, height: 64, color: rgb(1,1,1), opacity: 0 })

  const dlLabel = order.delivery_type === 'sdek' ? 'СДЭК' : 'Почта России'
  const rows = [
    ['Поставщик:',  'ООО «Ways Pod» · wayspod.ru'],
    ['Покупатель:', String(order.name || '—').slice(0, 46)],
    ['Телефон:',    String(order.phone || '—')],
    ['Доставка:',   `${dlLabel} · ${String(order.delivery_addr || '—').slice(0, 40)}`],
  ]
  rows.forEach(([l, v], i) => {
    const ry = y - i * 14
    page.drawText(l, { x: 48, y: ry, size: 8.5, font: bold,  color: INK })
    page.drawText(v, { x: 125, y: ry, size: 8.5, font: reg, color: INK })
  })

  // ── Таблица товаров ──
  y -= 70
  page.drawRectangle({ x: 38, y: y - 2, width: W - 76, height: 20, color: INK })
  const CX = { n: 44, name: 76, qty: 362, price: 416, sum: 486 }
  ;[['№', CX.n], ['Наименование товара', CX.name], ['Кол.', CX.qty], ['Цена, ₽', CX.price], ['Сумма, ₽', CX.sum]]
    .forEach(([t, x]) => { page.drawText(t, { x, y: y + 5, size: 7.5, font: bold, color: WHITE }) })
  y -= 20

  const items = order.items || []
  items.forEach((item, i) => {
    const bg = i % 2 === 0 ? WHITE : LIGHT
    page.drawRectangle({ x: 38, y: y - 2, width: W - 76, height: 17, color: bg })
    const nm    = String(item.name  || '').slice(0, 44)
    const price = Number(item.price || 0)
    const qty   = Number(item.qty   || 0)
    page.drawText(String(i + 1),             { x: CX.n,     y: y + 3, size: 7.5, font: reg,  color: INK })
    page.drawText(nm,                         { x: CX.name,  y: y + 3, size: 7.5, font: reg,  color: INK })
    page.drawText(String(qty),               { x: CX.qty,   y: y + 3, size: 7.5, font: reg,  color: INK })
    page.drawText(price.toLocaleString('ru'), { x: CX.price, y: y + 3, size: 7.5, font: reg,  color: INK })
    page.drawText((price * qty).toLocaleString('ru'), { x: CX.sum, y: y + 3, size: 7.5, font: bold, color: INK })
    y -= 17
  })

  // Итоги под таблицей
  page.drawLine({ start: { x: 38, y: y + 2 }, end: { x: W - 38, y: y + 2 }, thickness: 0.8, color: rgb(0.75, 0.78, 0.83) })
  y -= 14
  const totQty = items.reduce((s, i) => s + (Number(i.qty) || 0), 0)
  page.drawText(`Позиций: ${items.length}   Единиц: ${totQty}`, { x: 44, y, size: 8, font: reg, color: GRAY })

  page.drawRectangle({ x: W - 210, y: y - 8, width: 172, height: 28, color: GREEN })
  page.drawText('ИТОГО:', { x: W - 200, y: y + 6, size: 10, font: bold, color: WHITE })
  const totStr = (order.total || 0).toLocaleString('ru') + ' руб.'
  page.drawText(totStr, { x: W - 200 + 60, y: y + 7, size: 12, font: bold, color: WHITE })

  // ── Подписи ──
  y -= 52
  page.drawLine({ start: { x: 38, y: y + 32 }, end: { x: W - 38, y: y + 32 }, thickness: 0.4, color: rgb(0.83, 0.86, 0.89) })

  page.drawText('Поставщик:', { x: 44, y: y + 20, size: 8.5, font: bold, color: INK })
  page.drawText('ООО «Ways Pod»', { x: 44, y: y + 6, size: 8, font: reg, color: INK })
  page.drawText('М.П.  Подпись: _____________________', { x: 44, y: y - 8, size: 8, font: reg, color: INK })

  page.drawText('Покупатель:', { x: W / 2 + 16, y: y + 20, size: 8.5, font: bold, color: INK })
  page.drawText(String(order.name || '').slice(0, 28), { x: W / 2 + 16, y: y + 6, size: 8, font: reg, color: INK })
  page.drawText('Подпись: _____________________________', { x: W / 2 + 16, y: y - 8, size: 8, font: reg, color: INK })

  // ── Футер ──
  page.drawRectangle({ x: 0, y: 0, width: W, height: 26, color: INK })
  page.drawText(
    `Ways Pod  ©  2026  •  Накладная #${order.id}  •  ${nowDate} МСК`,
    { x: 40, y: 7, size: 7.5, font: reg, color: GRAY }
  )
  page.drawText('wayspod.ru', {
    x: W - reg.widthOfTextAtSize('wayspod.ru', 9) - 40, y: 7, size: 9, font: bold, color: ACCENT
  })

  return doc.save()
}
