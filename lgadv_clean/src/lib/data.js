// =============================================
// DATA LAYER — todas as operações com Supabase
// =============================================
import { supabase } from './supabase.js'
import { uuid, addMonths } from './utils.js'

// ---- AUTH ----
export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  return { data, error }
}

export async function signUp(email, password) {
  const { data, error } = await supabase.auth.signUp({ email, password })
  return { data, error }
}

export async function signOut() {
  await supabase.auth.signOut()
}

export async function getUser() {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

// ---- CLIENTES ----
export async function getClientes() {
  const { data, error } = await supabase
    .from('clientes')
    .select('*')
    .order('nome')
  if (error) throw error
  return data
}

export async function saveCliente(obj) {
  const user = await getUser()
  const payload = { ...obj, user_id: user.id }
  if (payload.id) {
    const { error } = await supabase.from('clientes').update(payload).eq('id', payload.id)
    if (error) throw error
    return payload.id
  } else {
    delete payload.id
    const { data, error } = await supabase.from('clientes').insert(payload).select('id').single()
    if (error) throw error
    return data.id
  }
}

export async function deleteCliente(id) {
  const { error } = await supabase.from('clientes').delete().eq('id', id)
  if (error) throw error
}

// ---- PROCESSOS ----
export async function getProcessos() {
  const { data, error } = await supabase
    .from('processos')
    .select('*')
    .order('criado_em', { ascending: false })
  if (error) throw error
  return data
}

export async function getProcessosByCliente(clienteId) {
  const { data, error } = await supabase
    .from('processos')
    .select('*')
    .eq('cliente_id', clienteId)
    .order('criado_em', { ascending: false })
  if (error) throw error
  return data
}

export async function saveProcesso(obj) {
  const user = await getUser()
  const payload = { ...obj, user_id: user.id }
  if (payload.id) {
    const { error } = await supabase.from('processos').update(payload).eq('id', payload.id)
    if (error) throw error
    return payload.id
  } else {
    delete payload.id
    const { data, error } = await supabase.from('processos').insert(payload).select('id').single()
    if (error) throw error
    return data.id
  }
}

export async function deleteProcesso(id) {
  const { error } = await supabase.from('processos').delete().eq('id', id)
  if (error) throw error
}

// ---- LANÇAMENTOS ----
export async function getLancamentos(filters = {}) {
  let q = supabase.from('lancamentos').select('*').order('data', { ascending: false })
  if (filters.clienteId) q = q.eq('cliente_id', filters.clienteId)
  if (filters.tipo)      q = q.eq('tipo', filters.tipo)
  const { data, error } = await q
  if (error) throw error
  return data
}

export async function getLancamentosByCliente(clienteId) {
  const { data, error } = await supabase
    .from('lancamentos')
    .select('*')
    .eq('cliente_id', clienteId)
    .order('data', { ascending: false })
  if (error) throw error
  return data
}

export async function saveLancamento(obj) {
  const user = await getUser()
  const payload = { ...obj, user_id: user.id }
  if (payload.id) {
    const { error } = await supabase.from('lancamentos').update(payload).eq('id', payload.id)
    if (error) throw error
  } else {
    delete payload.id
    const { error } = await supabase.from('lancamentos').insert(payload)
    if (error) throw error
  }
}

// Salvar múltiplos lançamentos (parcelamento ou mensalidade)
export async function saveLancamentos(list) {
  const user = await getUser()
  const payload = list.map(l => ({ ...l, user_id: user.id }))
  const { error } = await supabase.from('lancamentos').insert(payload)
  if (error) throw error
}

export async function deleteLancamento(id) {
  const { error } = await supabase.from('lancamentos').delete().eq('id', id)
  if (error) throw error
}

// Deletar grupo de mensalidade/parcela
export async function deleteLancamentoGrupo(grupoUUID, campo) {
  const { error } = await supabase
    .from('lancamentos')
    .delete()
    .eq(campo, grupoUUID)
  if (error) throw error
}

// ---- GERAR PARCELAS DE MENSALIDADE ----
// Cria 12 meses de lançamentos, pendentes, a partir da data base
export function gerarMensalidades(base, meses = 12) {
  const grupoUUID = uuid()
  const lancamentos = []
  const diaBase = base.data ? parseInt(base.data.split('-')[2]) : new Date().getDate()

  for (let i = 0; i < meses; i++) {
    const dataLanc = addMonths(base.data, i)
    // Ajusta o dia para o dia original (se mês menor, usa último dia)
    const d = new Date(dataLanc + 'T12:00:00')
    const ultimoDia = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()
    d.setDate(Math.min(diaBase, ultimoDia))
    const dataFinal = d.toISOString().split('T')[0]

    lancamentos.push({
      ...base,
      data: dataFinal,
      vencimento: dataFinal,
      status: i === 0 && base.status === 'pago' ? 'pago' : 'pendente',
      descricao: `${base.descricao || 'Mensalidade'} — ${String(i + 1).padStart(2, '0')}/${meses}`,
      mensalidade: true,
      mensalidade_dia: diaBase,
      mensalidade_grupo: grupoUUID,
      parcela_num: i + 1,
      parcela_total: meses,
    })
  }
  return lancamentos
}

// ---- GERAR PARCELAS ----
export function gerarParcelas(base, numParcelas) {
  const grupoUUID = uuid()
  const lancamentos = []
  const valParc = parseFloat((parseFloat(base.valor) / numParcelas).toFixed(2))

  for (let i = 0; i < numParcelas; i++) {
    const venc = addMonths(base.data, i)
    lancamentos.push({
      ...base,
      valor: valParc,
      data: i === 0 ? base.data : venc,
      vencimento: venc,
      status: 'pendente',
      descricao: `${base.descricao || tipoLabelLocal(base.tipo)} — ${i + 1}/${numParcelas}`,
      parcela_num: i + 1,
      parcela_total: numParcelas,
      parcela_grupo: grupoUUID,
    })
  }
  return lancamentos
}

function tipoLabelLocal(tipo) {
  return {
    honorario: 'Honorários', exito: 'Êxito', parcela: 'Parcela',
    despesa: 'Despesa', reembolso: 'Reembolso', mensalidade: 'Mensalidade'
  }[tipo] || tipo || ''
}
