import { createClient } from '@supabase/supabase-js'

const SB_URL = 'https://vqcsocjxfrhzkwlubhha.supabase.co'
const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxY3NvY2p4ZnJoemt3bHViaGhhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQwNTc2NjIsImV4cCI6MjA4OTYzMzY2Mn0.N9ESHWWIvlT8OJqnOCCblXEtpsjg3UJmlzWoqziw7Rs'

export const config = { api: { bodyParser: true } }

function db() { return createClient(SB_URL, SB_KEY) }

// МСК время
function mskNow() {
  return new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' })
}
function mskDate(d) {
  return new Date(d || Date.now()).toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' })
}
function mskShort() {
  return new Date().toLocaleTimeString('ru-RU', { timeZone: 'Europe/Moscow', hour:'2-digit', minute:'2-digit' })
}
function isTodayMsk(dateStr) {
  const msk = new Date(new Date().toLocaleString('en-US', { timeZone: 'Europe/Moscow' }))
  const d   = new Date(new Date(dateStr).toLocaleString('en-US', { timeZone: 'Europe/Moscow' }))
  return msk.toDateString() === d.toDateString()
}

async function getToken() {
  try {
    const { data } = await db().from('settings').select('tg_token').eq('id', 1).single()
    return (data?.tg_token || '').trim()
  } catch { return '' }
}

async function tgPost(token, method, body) {
  const r = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  return r.json()
}

const mainKb = () => ({
  inline_keyboard: [
    [{ text: '📊 Статистика', callback_data: 'stats' }, { text: '📅 Сегодня МСК', callback_data: 'today' }],
    [{ text: '🧾 Заказы', callback_data: 'orders' }, { text: '👥 Клиенты', callback_data: 'users' }],
    [{ text: '🏆 Топ клиентов', callback_data: 'top' }, { text: '📦 Каталог', callback_data: 'products' }],
    [{ text: '👁 Посетители', callback_data: 'visitors' }],
  ]
})

const backKb = (action) => ({
  inline_keyboard: [[
    { text: '🔙 Меню', callback_data: 'menu' },
    { text: '🔄 Обновить', callback_data: action },
  ]]
})

// ── Данные ──
async function buildStats() {
  const d = db()
  const [{ data: ords }, { data: usrs }, { count: pCnt }, { count: vCnt }] = await Promise.all([
    d.from('orders').select('total,created_at'),
    d.from('users').select('phone'),
    d.from('products').select('*', { count:'exact', head:true }),
    d.from('visitors').select('*', { count:'exact', head:true }),
  ])
  const revenue = (ords||[]).reduce((s,o)=>s+(o.total||0), 0)
  const todayO  = (ords||[]).filter(o=>isTodayMsk(o.created_at))
  const avg     = (ords||[]).length ? Math.round(revenue/(ords||[]).length) : 0
  return (
    `📊 *СТАТИСТИКА — Ways Pod*\n` +
    `_${mskNow()} МСК_\n\n` +
    `💰 Выручка: *${revenue.toLocaleString('ru')} ₽*\n` +
    `🧾 Заказов: *${(ords||[]).length}*\n` +
    `👥 Клиентов: *${(usrs||[]).length}*\n` +
    `👁 Посетителей: *${vCnt||0}*\n` +
    `📦 Товаров: *${pCnt||0}*\n` +
    `💵 Средний чек: *${avg.toLocaleString('ru')} ₽*\n\n` +
    `📅 *Сегодня (МСК):* ${todayO.length} зак. · ${todayO.reduce((s,o)=>s+(o.total||0),0).toLocaleString('ru')} ₽`
  )
}

async function buildToday() {
  const { data: ords } = await db().from('orders').select('*').order('created_at', { ascending: false })
  const todayO = (ords||[]).filter(o=>isTodayMsk(o.created_at))
  if (!todayO.length) return `📅 Сегодня (МСК) заказов нет.\n_${mskNow()} МСК_`
  const rev = todayO.reduce((s,o)=>s+(o.total||0),0)
  let t = `📅 *СЕГОДНЯ (МСК): ${todayO.length} зак. · ${rev.toLocaleString('ru')} ₽*\n_${mskNow()} МСК_\n\n`
  for (const o of todayO.slice(0,10)) {
    t += `🛒 *#${o.id}* · ${mskDate(o.created_at)}\n`
    t += `👤 ${o.name} · 📞 ${o.phone}\n`
    t += `${o.delivery_type==='sdek'?'📦 СДЭК':'📮 Почта'}: ${o.delivery_addr||'—'}\n`
    t += `💰 ${(o.total||0).toLocaleString('ru')} ₽ · ${(o.items||[]).length} поз.\n\n`
  }
  return t
}

async function buildOrders() {
  const { data: ords } = await db().from('orders').select('*').order('created_at', { ascending: false }).limit(10)
  if (!(ords||[]).length) return `🧾 Заказов пока нет.\n_${mskNow()} МСК_`
  let t = `🧾 *ПОСЛЕДНИЕ ЗАКАЗЫ*\n_${mskNow()} МСК_\n\n`
  for (const o of ords) {
    t += `*#${o.id}* · ${mskDate(o.created_at)}\n`
    t += `👤 ${o.name} · 📞 ${o.phone}\n`
    t += `${o.delivery_type==='sdek'?'📦 СДЭК':'📮 Почта'}: ${o.delivery_addr||'—'}\n`
    t += `💰 ${(o.total||0).toLocaleString('ru')} ₽ · ${(o.items||[]).length} поз.\n\n`
  }
  return t
}

async function buildUsers() {
  const d = db()
  const [{ data: usrs }, { data: ords }] = await Promise.all([
    d.from('users').select('*').order('created_at', { ascending: false }).limit(15),
    d.from('orders').select('phone,total'),
  ])
  if (!(usrs||[]).length) return `👥 Клиентов пока нет.\n_${mskNow()} МСК_`
  let t = `👥 *КЛИЕНТЫ (${usrs.length})*\n_${mskNow()} МСК_\n\n`
  for (const u of usrs) {
    const uO = (ords||[]).filter(o=>o.phone===u.phone)
    const uT = uO.reduce((s,o)=>s+(o.total||0),0)
    const isNew = (Date.now()-new Date(u.created_at).getTime())<86400000
    t += `${isNew?'🆕 ':''}👤 *${u.name||'—'}* · 📞 ${u.phone}\n`
    t += `   📅 ${mskDate(u.created_at)} · 🧾 ${uO.length} · 💰 ${uT.toLocaleString('ru')} ₽\n\n`
  }
  return t
}

async function buildTop() {
  const d = db()
  const [{ data: usrs }, { data: ords }] = await Promise.all([
    d.from('users').select('*'),
    d.from('orders').select('phone,total'),
  ])
  const ranked = (usrs||[]).map(u=>{
    const uO=(ords||[]).filter(o=>o.phone===u.phone)
    return { ...u, total:uO.reduce((s,o)=>s+(o.total||0),0), count:uO.length }
  }).sort((a,b)=>b.total-a.total).slice(0,10)
  if (!ranked.length) return `🏆 Данных пока нет.\n_${mskNow()} МСК_`
  let t = `🏆 *ТОП КЛИЕНТОВ*\n_${mskNow()} МСК_\n\n`
  ranked.forEach((u,i)=>{
    const m = i===0?'🥇':i===1?'🥈':i===2?'🥉':`${i+1}.`
    t += `${m} *${u.name||u.phone}*\n   💰 ${u.total.toLocaleString('ru')} ₽ · 🧾 ${u.count} зак.\n\n`
  })
  return t
}

async function buildProducts() {
  const { data: prods, count } = await db().from('products').select('cat', { count:'exact' })
  const cm = {}
  ;(prods||[]).forEach(p=>{ cm[p.cat]=(cm[p.cat]||0)+1 })
  let t = `📦 *КАТАЛОГ — ${count||0} позиций*\n_${mskNow()} МСК_\n\n`
  Object.entries(cm).sort((a,b)=>b[1]-a[1]).forEach(([c,n])=>{ t += `• ${c}: ${n} шт\n` })
  return t
}

async function buildVisitors() {
  const d = db()
  const [{ count: total }, { data: recent }] = await Promise.all([
    d.from('visitors').select('*', { count:'exact', head:true }),
    d.from('visitors').select('*').order('last_seen', { ascending:false }).limit(20),
  ])
  const todayV = (recent||[]).filter(v=>isTodayMsk(v.last_seen))
  let t = `👁 *ПОСЕТИТЕЛИ*\n_${mskNow()} МСК_\n\n`
  t += `📊 Всего: *${total||0}*\n`
  t += `📅 Сегодня: *${todayV.length}*\n\n`
  if ((recent||[]).length) {
    t += `*Последние визиты:*\n`
    ;(recent||[]).slice(0,10).forEach(v=>{
      t += `• ${v.id.slice(0,12)}... · ${mskDate(v.last_seen)}\n`
    })
  }
  return t
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()

  // Регистрация вебхука
  if (req.method === 'GET') {
    const { setup, token, url } = req.query || {}
    if (setup && token && url) {
      try {
        const webhookUrl = url.replace(/\/+$/, '') + '/api/bot'
        const r = await fetch(`https://api.telegram.org/bot${token}/setWebhook`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            url: webhookUrl, drop_pending_updates: true,
            allowed_updates: ['message', 'callback_query'],
          }),
        })
        const d = await r.json()
        return res.status(200).json({ ok: d.ok, description: d.description, webhook: webhookUrl })
      } catch (e) {
        return res.status(500).json({ ok: false, error: e.message })
      }
    }
    return res.status(200).json({ ok: true, time_msk: mskNow() })
  }

  if (req.method !== 'POST') return res.status(200).json({ ok: true })

  const update = req.body
  if (!update) return res.status(200).json({ ok: true })

  try {
    const token = await getToken()
    if (!token) return res.status(200).json({ ok: true })

    // ── Callback query ──
    if (update.callback_query) {
      const cb     = update.callback_query
      const chatId = String(cb.message.chat.id)
      const msgId  = cb.message.message_id
      const data   = cb.data

      await tgPost(token, 'answerCallbackQuery', {
        callback_query_id: cb.id, text: '⏳', show_alert: false,
      })

      let text = '', kb = backKb(data)

      if      (data === 'menu')     { text = `👋 *Ways Pod — Панель управления*\n_${mskNow()} МСК_\n\nВыберите раздел:`; kb = mainKb() }
      else if (data === 'stats')    text = await buildStats()
      else if (data === 'today')    text = await buildToday()
      else if (data === 'orders')   text = await buildOrders()
      else if (data === 'users')    text = await buildUsers()
      else if (data === 'top')      text = await buildTop()
      else if (data === 'products') text = await buildProducts()
      else if (data === 'visitors') text = await buildVisitors()
      else { text = '❓ Неизвестно'; kb = mainKb() }

      await tgPost(token, 'editMessageText', {
        chat_id: chatId, message_id: msgId,
        text, parse_mode: 'Markdown', reply_markup: kb,
      })
      return res.status(200).json({ ok: true })
    }

    // ── Текстовое сообщение ──
    if (update.message) {
      const chatId = String(update.message.chat.id)
      await tgPost(token, 'sendMessage', {
        chat_id: chatId,
        text: `👋 *Ways Pod — Панель управления*\n_${mskNow()} МСК_\n\nВыберите раздел:`,
        parse_mode: 'Markdown',
        reply_markup: mainKb(),
      })
    }

  } catch (e) { console.error('bot error:', e) }

  return res.status(200).json({ ok: true })
}
