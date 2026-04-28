// =============================================
// UTILITÁRIOS GLOBAIS
// =============================================

export function fmtVal(v) {
  return (parseFloat(v) || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export function fmtDate(d) {
  if (!d) return '—'
  const parts = String(d).split('T')[0].split('-')
  if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`
  return d
}

export function isoDate(d) {
  // Garante formato YYYY-MM-DD
  if (!d) return ''
  return String(d).split('T')[0]
}

export function today() {
  return new Date().toISOString().split('T')[0]
}

export function addMonths(dateStr, n) {
  const d = new Date(dateStr + 'T12:00:00')
  d.setMonth(d.getMonth() + n)
  return d.toISOString().split('T')[0]
}

export function calcSaldo(lancamentos) {
  return lancamentos.reduce((s, l) => {
    const v = parseFloat(l.valor || 0)
    return s + (l.direcao === 'entrada' ? v : -v)
  }, 0)
}

export function tipoLabel(tipo) {
  return {
    honorario: 'Honorários',
    exito: 'Êxito',
    parcela: 'Parcela',
    despesa: 'Despesa',
    reembolso: 'Reembolso',
    mensalidade: 'Mensalidade'
  }[tipo] || tipo || '—'
}

export function statusBadgeProc(s) {
  return {
    ativo:     '<span class="badge badge-green">Ativo</span>',
    suspenso:  '<span class="badge badge-amber">Suspenso</span>',
    encerrado: '<span class="badge badge-gray">Encerrado</span>',
    arquivado: '<span class="badge badge-gray">Arquivado</span>',
  }[s] || `<span class="badge badge-gray">${s || '—'}</span>`
}

export function statusLancBadge(s) {
  return {
    pago:     '<span class="badge badge-green">Pago</span>',
    pendente: '<span class="badge badge-amber">Pendente</span>',
    vencido:  '<span class="badge badge-red">Vencido</span>',
  }[s] || `<span class="badge badge-gray">${s || '—'}</span>`
}

// TOAST
export function toast(msg, type = 'success') {
  let container = document.querySelector('.toast-container')
  if (!container) {
    container = document.createElement('div')
    container.className = 'toast-container'
    document.body.appendChild(container)
  }
  const el = document.createElement('div')
  el.className = `toast ${type}`
  el.textContent = msg
  container.appendChild(el)
  setTimeout(() => el.classList.add('show'), 10)
  setTimeout(() => {
    el.classList.remove('show')
    setTimeout(() => el.remove(), 300)
  }, 3000)
}

// UUID v4 simples
export function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16)
  })
}

// SVG icons
export const icons = {
  dashboard: `<svg class="nav-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="1" y="1" width="6" height="6" rx="1"/><rect x="9" y="1" width="6" height="6" rx="1"/><rect x="1" y="9" width="6" height="6" rx="1"/><rect x="9" y="9" width="6" height="6" rx="1"/></svg>`,
  clientes:  `<svg class="nav-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="8" cy="5" r="3"/><path d="M2 14c0-3.3 2.7-6 6-6s6 2.7 6 6"/></svg>`,
  processos: `<svg class="nav-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 2h7l3 3v9H3V2z"/><path d="M10 2v3h3"/><path d="M6 7h4M6 10h4M6 13h2"/></svg>`,
  financeiro:`<svg class="nav-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M2 4h12M2 8h8M2 12h5"/><circle cx="12" cy="11" r="3"/></svg>`,
  inadimpl:  `<svg class="nav-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="8" cy="8" r="7"/><path d="M8 4v4M8 11v1"/></svg>`,
  plus:      `<svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M6 1v10M1 6h10"/></svg>`,
  back:      `<svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 2L4 7l5 5"/></svg>`,
  ham:       `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 5h14M3 10h14M3 15h14"/></svg>`,
  logout:    `<svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M10 3h3v10h-3"/><path d="M7 11l4-3-4-3"/><path d="M7 8H1"/></svg>`,
}
