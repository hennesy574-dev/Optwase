import { createClient } from '@supabase/supabase-js'

const SB_URL = 'https://vqcsocjxfrhzkwlubhha.supabase.co'
const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxY3NvY2p4ZnJoemt3bHViaGhhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQwNTc2NjIsImV4cCI6MjA4OTYzMzY2Mn0.N9ESHWWIvlT8OJqnOCCblXEtpsjg3UJmlzWoqziw7Rs'
export const sb = createClient(SB_URL, SB_KEY)

// ── Cookie + localStorage helpers ──
export function getCookie(name) {
  try {
    const c = document.cookie.split(';').find(x => x.trim().startsWith(name + '='))
    return c ? decodeURIComponent(c.trim().slice(name.length + 1)) : null
  } catch { return null }
}
export function setCookie(name, val, days = 365) {
  try {
    const e = new Date(Date.now() + days * 86400000).toUTCString()
    document.cookie = `${name}=${encodeURIComponent(val)};expires=${e};path=/;SameSite=Lax`
  } catch {}
}
export function ls(key, def = '') {
  try { return localStorage.getItem(key) || def } catch { return def }
}
export function lsSet(key, val) {
  try { localStorage.setItem(key, String(val)) } catch {}
}
export function getVisitorId() {
  let id = getCookie('wp_vid') || ls('wp_vid')
  if (!id) {
    id = 'v' + Date.now() + Math.random().toString(36).slice(2, 6)
    setCookie('wp_vid', id)
    lsSet('wp_vid', id)
  }
  return id
}
export function getSavedPhone()    { return getCookie('wp_phone') || ls('wp_phone') }
export function getSavedName()     { return getCookie('wp_name')  || ls('wp_name')  }
export function getSavedDelivery() { return ls('wp_dlv') || 'sdek' }
export function getSavedAddr()     { return ls('wp_addr') || '' }
export function savePhone(v)    { setCookie('wp_phone', v); lsSet('wp_phone', v) }
export function saveName(v)     { setCookie('wp_name',  v); lsSet('wp_name', v)  }
export function saveDelivery(v) { lsSet('wp_dlv', v) }
export function saveAddr(v)     { lsSet('wp_addr', v) }
export function getSavedCart()  { try { return JSON.parse(ls('wp_cart', '{}')) } catch { return {} } }
export function saveCart(c)     { try { lsSet('wp_cart', JSON.stringify(c)) } catch {} }

// ── DB ──
export async function dbGetProducts() {
  try { const { data } = await sb.from('products').select('*').order('cat'); return data || [] }
  catch { return [] }
}
export async function dbUpsertProduct(p) {
  try { await sb.from('products').upsert(p, { onConflict: 'id' }) } catch(e) { console.error(e) }
}
export async function dbDeleteProduct(id) {
  try { await sb.from('products').delete().eq('id', id) } catch(e) { console.error(e) }
}
export async function dbGetOrders() {
  try { const { data } = await sb.from('orders').select('*').order('created_at', { ascending: false }); return data || [] }
  catch { return [] }
}
export async function dbInsertOrder(o) {
  try { await sb.from('orders').insert(o) } catch(e) { console.error(e) }
}

// ── Настройки: сначала читаем актуальную запись, затем мёржим и UPDATE ──
export async function dbGetSettings() {
  try {
    const { data, error } = await sb.from('settings').select('*').eq('id', 1).single()
    if (error) {
      // Запись не существует — создаём
      await sb.from('settings').insert({ id: 1 })
      const { data: d2 } = await sb.from('settings').select('*').eq('id', 1).single()
      return d2 || null
    }
    return data || null
  } catch { return null }
}

export async function dbSaveSettings(fields) {
  try {
    // Читаем текущие данные
    const { data: cur } = await sb.from('settings').select('*').eq('id', 1).single()
    const merged = { ...(cur || {}), id: 1, ...fields }
    // UPDATE (надёжнее чем upsert при одной строке)
    const { error } = await sb.from('settings').update(merged).eq('id', 1)
    if (error) {
      console.error('settings update error:', error)
      // Если нет записи — вставляем
      await sb.from('settings').insert(merged)
    }
    return true
  } catch(e) { console.error('dbSaveSettings error:', e); return false }
}

export async function dbGetPush() {
  try { const { data } = await sb.from('push_history').select('*').order('created_at', { ascending: false }).limit(30); return data || [] }
  catch { return [] }
}
export async function dbAddPush(text) {
  try { await sb.from('push_history').insert({ text }) } catch(e) { console.error(e) }
}
export async function dbGetUsers() {
  try { const { data } = await sb.from('users').select('*').order('created_at', { ascending: false }); return data || [] }
  catch { return [] }
}
export async function dbUpsertUser(user) {
  try { await sb.from('users').upsert(user, { onConflict: 'phone' }) } catch(e) { console.error(e) }
}
export async function dbTrackVisitor(id) {
  try { await sb.from('visitors').upsert({ id, last_seen: new Date().toISOString() }, { onConflict: 'id' }) } catch {}
}
