// =============================================
// MODAIS — Cliente, Processo, Lançamento
// =============================================
import { saveCliente, saveProcesso, saveLancamento, saveLancamentos, gerarMensalidades, gerarParcelas, getClientes, getProcessosByCliente } from './lib/data.js'
import { toast, today, fmtVal, addMonths } from './lib/utils.js'

// ---- HELPERS ----
function v(id) { return document.getElementById(id) }
function val(id) { return v(id) ? v(id).value : '' }
function setVal(id, x) { if (v(id)) v(id).value = x ?? '' }
function show(id) { if (v(id)) v(id).style.display = '' }
function hide(id) { if (v(id)) v(id).style.display = 'none' }

export function openModal(id) {
  v(id)?.classList.add('open')
  document.addEventListener('keydown', _escHandler)
}
export function closeModal(id) {
  v(id)?.classList.remove('open')
  document.removeEventListener('keydown', _escHandler)
}
function _escHandler(e) {
  if (e.key === 'Escape') document.querySelectorAll('.modal-overlay.open').forEach(m => m.classList.remove('open'))
}
// Click-outside to close
document.addEventListener('click', e => {
  if (e.target.classList.contains('modal-overlay')) e.target.classList.remove('open')
})

// ============================================
// MODAL CLIENTE
// ============================================
export function renderModalCliente() {
  return `
  <div class="modal-overlay" id="modal-cliente">
    <div class="modal">
      <div class="modal-header">
        <div class="modal-title" id="modal-cliente-title">Novo cliente</div>
        <button class="modal-close" onclick="window.__modals.closeCliente()">×</button>
      </div>
      <div class="modal-body">
        <input type="hidden" id="clt-id">
        <div class="form-grid">
          <div class="field span2"><label>Nome / Razão social *</label><input type="text" id="clt-nome" placeholder="Nome completo ou razão social" autocomplete="off"></div>
          <div class="field"><label>CPF / CNPJ</label><input type="text" id="clt-doc" placeholder="000.000.000-00"></div>
          <div class="field"><label>Tipo</label><select id="clt-tipo"><option value="PF">Pessoa Física</option><option value="PJ">Pessoa Jurídica</option></select></div>
          <div class="field"><label>Telefone</label><input type="tel" id="clt-tel" placeholder="(11) 99999-9999"></div>
          <div class="field"><label>E-mail</label><input type="email" id="clt-email" placeholder="email@email.com"></div>
          <div class="field span2"><label>Endereço</label><input type="text" id="clt-end" placeholder="Rua, número, cidade"></div>
          <div class="field span2"><label>Observações</label><textarea id="clt-obs" placeholder="Notas sobre o cliente..."></textarea></div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="window.__modals.closeCliente()">Cancelar</button>
        <button class="btn btn-primary" id="btn-save-cliente" onclick="window.__modals.saveCliente()">Salvar cliente</button>
      </div>
    </div>
  </div>`
}

export function initModalCliente(onSaved) {
  window.__modals = window.__modals || {}
  window.__modals.openCliente = (data) => {
    clearClienteForm()
    if (data) populateClienteForm(data)
    openModal('modal-cliente')
    setTimeout(() => v('clt-nome')?.focus(), 50)
  }
  window.__modals.closeCliente = () => closeModal('modal-cliente')
  window.__modals.saveCliente = async () => {
    const nome = val('clt-nome').trim()
    if (!nome) { toast('Nome é obrigatório', 'error'); return }
    const btn = v('btn-save-cliente')
    btn.disabled = true; btn.textContent = 'Salvando...'
    try {
      const id = val('clt-id')
      const obj = {
        nome, doc: val('clt-doc'), tipo: val('clt-tipo'),
        tel: val('clt-tel'), email: val('clt-email'),
        endereco: val('clt-end'), obs: val('clt-obs'),
      }
      if (id) obj.id = parseInt(id)
      await saveCliente(obj)
      closeModal('modal-cliente')
      toast('Cliente salvo')
      onSaved && onSaved()
    } catch(e) {
      toast('Erro ao salvar: ' + e.message, 'error')
    } finally {
      btn.disabled = false; btn.textContent = 'Salvar cliente'
    }
  }
}

function clearClienteForm() {
  v('modal-cliente-title').textContent = 'Novo cliente'
  ;['clt-id','clt-nome','clt-doc','clt-tel','clt-email','clt-end','clt-obs'].forEach(id => setVal(id, ''))
  setVal('clt-tipo', 'PF')
}
function populateClienteForm(c) {
  v('modal-cliente-title').textContent = 'Editar cliente'
  setVal('clt-id', c.id); setVal('clt-nome', c.nome); setVal('clt-doc', c.doc)
  setVal('clt-tipo', c.tipo || 'PF'); setVal('clt-tel', c.tel); setVal('clt-email', c.email)
  setVal('clt-end', c.endereco); setVal('clt-obs', c.obs)
}

// ============================================
// MODAL PROCESSO
// ============================================
export function renderModalProcesso() {
  return `
  <div class="modal-overlay" id="modal-processo">
    <div class="modal">
      <div class="modal-header">
        <div class="modal-title" id="modal-proc-title">Novo processo</div>
        <button class="modal-close" onclick="window.__modals.closeProcesso()">×</button>
      </div>
      <div class="modal-body">
        <input type="hidden" id="proc-id">
        <div class="form-grid">
          <div class="field span2"><label>Nº do processo *</label><input type="text" id="proc-num" placeholder="0000000-00.0000.0.00.0000" autocomplete="off"></div>
          <div class="field"><label>Cliente *</label><select id="proc-cliente" onchange="window.__modals.onClienteChange()"><option value="">Selecionar...</option></select></div>
          <div class="field"><label>Tribunal</label>
            <select id="proc-tribunal"><option>TJSP</option><option>TJMG</option><option>TJRJ</option><option>TJRS</option><option>TJSC</option><option>TRT15</option><option>TRT2</option><option>STJ</option><option>STF</option><option>TRF3</option><option>Outro</option></select>
          </div>
          <div class="field"><label>Área</label>
            <select id="proc-area"><option>Cível</option><option>Trabalhista</option><option>Empresarial</option><option>Tributário</option><option>Família</option><option>Criminal</option><option>Imobiliário</option><option>Ambiental</option><option>Outro</option></select>
          </div>
          <div class="field"><label>Fase processual</label>
            <select id="proc-fase"><option>Conhecimento</option><option>Instrução</option><option>Sentença</option><option>Recursal</option><option>Cumprimento de sentença</option><option>Execução</option><option>Transitado em julgado</option></select>
          </div>
          <div class="field">
            <label>Polo ativo (Autor) <button type="button" class="tag-btn" onclick="window.__modals.fillPolo('proc-autor')">↑ usar cliente</button></label>
            <input type="text" id="proc-autor" placeholder="Nome do autor">
          </div>
          <div class="field">
            <label>Polo passivo (Réu) <button type="button" class="tag-btn" onclick="window.__modals.fillPolo('proc-reu')">↑ usar cliente</button></label>
            <input type="text" id="proc-reu" placeholder="Nome do réu">
          </div>
          <div class="field"><label>Valor da causa (R$)</label><input type="number" id="proc-valor" placeholder="0,00" min="0" step="0.01"></div>
          <div class="field">
            <label>Honorários contratados (R$)</label>
            <input type="number" id="proc-honorarios" placeholder="0,00" min="0" step="0.01" oninput="window.__modals.onHonorarioChange()">
            <span class="hint success" id="honorario-hint" style="display:none">✓ Lançamento pendente será criado automaticamente</span>
          </div>
          <div class="field"><label>% Êxito</label><input type="number" id="proc-exito" placeholder="0" min="0" max="100"></div>
          <div class="field"><label>Status</label>
            <select id="proc-status"><option value="ativo">Ativo</option><option value="suspenso">Suspenso</option><option value="encerrado">Encerrado</option><option value="arquivado">Arquivado</option></select>
          </div>
          <div class="field span2"><label>Observações</label><textarea id="proc-obs" placeholder="Anotações sobre o processo..."></textarea></div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="window.__modals.closeProcesso()">Cancelar</button>
        <button class="btn btn-primary" id="btn-save-proc" onclick="window.__modals.saveProcesso()">Salvar processo</button>
      </div>
    </div>
  </div>`
}

export async function initModalProcesso(onSaved, getClientesCache) {
  window.__modals = window.__modals || {}

  window.__modals.onClienteChange = () => {}
  window.__modals.onHonorarioChange = () => {
    const val = parseFloat(v('proc-honorarios')?.value) || 0
    v('honorario-hint').style.display = val > 0 ? '' : 'none'
  }
  window.__modals.fillPolo = async (targetId) => {
    const cid = parseInt(val('proc-cliente'))
    if (!cid) { toast('Selecione um cliente primeiro', 'error'); return }
    const clientes = await getClientesCache()
    const c = clientes.find(c => c.id === cid)
    if (c) setVal(targetId, c.nome)
  }

  window.__modals.openProcesso = async (data, preClienteId) => {
    clearProcForm()
    await populateProcClienteSelect(getClientesCache, preClienteId)
    if (data) populateProcForm(data)
    openModal('modal-processo')
    setTimeout(() => v('proc-num')?.focus(), 50)
  }
  window.__modals.closeProcesso = () => closeModal('modal-processo')

  window.__modals.saveProcesso = async () => {
    const num = val('proc-num').trim()
    const clienteId = parseInt(val('proc-cliente'))
    if (!num) { toast('Número do processo obrigatório', 'error'); return }
    if (!clienteId) { toast('Selecione um cliente', 'error'); return }
    const btn = v('btn-save-proc')
    btn.disabled = true; btn.textContent = 'Salvando...'
    try {
      const idVal = val('proc-id')
      const honorarios = parseFloat(val('proc-honorarios')) || 0
      const obj = {
        num, cliente_id: clienteId,
        tribunal: val('proc-tribunal'), area: val('proc-area'),
        fase: val('proc-fase'), autor: val('proc-autor'), reu: val('proc-reu'),
        valor_causa: parseFloat(val('proc-valor')) || 0,
        honorarios, pct_exito: parseFloat(val('proc-exito')) || 0,
        status: val('proc-status'), obs: val('proc-obs'),
      }
      if (idVal) obj.id = parseInt(idVal)
      const isNew = !idVal
      const procId = await saveProcesso(obj)

      // Auto-criar lançamento de honorários se for novo processo
      if (isNew && honorarios > 0) {
        const clientes = await getClientesCache()
        const cliente = clientes.find(c => c.id === clienteId)
        await saveLancamento({
          cliente_id: clienteId,
          cliente_nome: cliente?.nome || '',
          processo_id: procId,
          processo_num: num,
          tipo: 'honorario', direcao: 'entrada',
          valor: honorarios, data: today(),
          vencimento: null, status: 'pendente',
          descricao: 'Processo judicial',
        })
      }

      closeModal('modal-processo')
      toast('Processo salvo')
      onSaved && onSaved()
    } catch(e) {
      toast('Erro: ' + e.message, 'error')
    } finally {
      btn.disabled = false; btn.textContent = 'Salvar processo'
    }
  }
}

async function populateProcClienteSelect(getClientesCache, preselect) {
  const clientes = await getClientesCache()
  const sel = v('proc-cliente')
  if (!sel) return
  sel.innerHTML = '<option value="">Selecionar...</option>' +
    clientes.map(c => `<option value="${c.id}"${preselect == c.id ? ' selected' : ''}>${c.nome}</option>`).join('')
}

function clearProcForm() {
  v('modal-proc-title').textContent = 'Novo processo'
  ;['proc-id','proc-num','proc-autor','proc-reu','proc-valor','proc-honorarios','proc-exito','proc-obs'].forEach(id => setVal(id, ''))
  setVal('proc-status', 'ativo')
  if (v('honorario-hint')) v('honorario-hint').style.display = 'none'
}
function populateProcForm(p) {
  v('modal-proc-title').textContent = 'Editar processo'
  setVal('proc-id', p.id); setVal('proc-num', p.num)
  setVal('proc-cliente', p.cliente_id); setVal('proc-tribunal', p.tribunal)
  setVal('proc-area', p.area); setVal('proc-fase', p.fase)
  setVal('proc-autor', p.autor); setVal('proc-reu', p.reu)
  setVal('proc-valor', p.valor_causa); setVal('proc-honorarios', p.honorarios)
  setVal('proc-exito', p.pct_exito); setVal('proc-status', p.status)
  setVal('proc-obs', p.obs)
  if (p.honorarios > 0 && v('honorario-hint')) v('honorario-hint').style.display = ''
}

// ============================================
// MODAL LANÇAMENTO
// ============================================
export function renderModalLancamento() {
  return `
  <div class="modal-overlay" id="modal-lancamento">
    <div class="modal">
      <div class="modal-header">
        <div class="modal-title" id="modal-lanc-title">Novo lançamento</div>
        <button class="modal-close" onclick="window.__modals.closeLancamento()">×</button>
      </div>
      <div class="modal-body">
        <input type="hidden" id="lanc-id">
        <div class="form-grid">
          <div class="field"><label>Cliente *</label><select id="lanc-cliente" onchange="window.__modals.onLancClienteChange()"><option value="">Selecionar...</option></select></div>
          <div class="field"><label>Processo (opcional)</label><select id="lanc-proc"><option value="">Sem processo</option></select></div>
          <div class="field"><label>Tipo *</label>
            <select id="lanc-tipo" onchange="window.__modals.onTipoChange()">
              <option value="honorario">Honorários</option>
              <option value="mensalidade">Mensalidade</option>
              <option value="exito">Honorários de êxito</option>
              <option value="parcela">Parcela avulsa</option>
              <option value="despesa">Despesa / Custo</option>
              <option value="reembolso">Reembolso de custas</option>
            </select>
          </div>
          <div class="field"><label>Direção</label>
            <select id="lanc-dir"><option value="entrada">Entrada (receita)</option><option value="saida">Saída (despesa)</option></select>
          </div>
          <div class="field"><label>Valor total (R$) *</label><input type="number" id="lanc-valor" placeholder="0,00" min="0" step="0.01" oninput="window.__modals.updatePreview()"></div>
          <div class="field"><label>Data *</label><input type="date" id="lanc-data" oninput="window.__modals.updatePreview()"></div>

          <!-- PARCELAMENTO -->
          <div class="field span2" style="padding:10px;background:var(--surface2);border-radius:var(--rsm);border:1px solid var(--border)">
            <label style="margin-bottom:8px">
              <input type="checkbox" id="lanc-parcelar" onchange="window.__modals.toggleParcelamento()">
              Parcelar (dividir em N parcelas)
            </label>
            <div id="parcelamento-config" style="display:none">
              <div class="form-grid" style="margin-top:8px">
                <div class="field"><label>Nº de parcelas</label><input type="number" id="lanc-n-parcelas" value="2" min="2" max="60" oninput="window.__modals.updatePreview()"></div>
                <div class="field"><label>1ª parcela vence em</label><input type="date" id="lanc-primeira-parc" oninput="window.__modals.updatePreview()"></div>
              </div>
            </div>
          </div>

          <!-- MENSALIDADE CONFIG -->
          <div class="field span2" id="mensalidade-config" style="display:none;padding:10px;background:var(--gold-light);border-radius:var(--rsm);border:1px solid rgba(200,168,75,0.3)">
            <div style="font-size:12px;font-weight:600;color:#7a5c10;margin-bottom:6px">Mensalidade — repete todo mês no mesmo dia</div>
            <div class="form-grid">
              <div class="field"><label>Meses a gerar</label><input type="number" id="lanc-meses" value="12" min="1" max="60" oninput="window.__modals.updatePreview()"></div>
              <div class="field"><label>Dia de vencimento</label><input type="number" id="lanc-dia-mens" min="1" max="28" placeholder="Ex: 5" oninput="window.__modals.updatePreview()"></div>
            </div>
            <div id="mensalidade-preview" style="margin-top:8px"></div>
          </div>

          <div class="field" id="lanc-venc-field"><label>Vencimento</label><input type="date" id="lanc-venc"></div>
          <div class="field"><label>Status</label>
            <select id="lanc-status"><option value="pago">Pago / Recebido</option><option value="pendente">Pendente</option><option value="vencido">Vencido</option></select>
          </div>
          <div class="field span2"><label>Descrição</label><input type="text" id="lanc-desc" placeholder="Descrição do lançamento" autocomplete="off"></div>

          <div id="parcelas-preview-wrap" style="display:none;grid-column:span 2"></div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="window.__modals.closeLancamento()">Cancelar</button>
        <button class="btn btn-primary" id="btn-save-lanc" onclick="window.__modals.saveLancamento()">Salvar lançamento</button>
      </div>
    </div>
  </div>`
}

export async function initModalLancamento(onSaved, getClientesCache) {
  window.__modals = window.__modals || {}

  window.__modals.onTipoChange = () => {
    const tipo = val('lanc-tipo')
    // Direção default
    v('lanc-dir').value = tipo === 'despesa' ? 'saida' : 'entrada'
    // Mensalidade config
    v('mensalidade-config').style.display = tipo === 'mensalidade' ? '' : 'none'
    // Se mensalidade, esconde venc field individual
    if (tipo === 'mensalidade') {
      v('lanc-venc-field').style.display = 'none'
      v('lanc-parcelar').checked = false
      v('parcelamento-config').style.display = 'none'
    } else {
      v('lanc-venc-field').style.display = ''
    }
    window.__modals.updatePreview()
  }

  window.__modals.toggleParcelamento = () => {
    const on = v('lanc-parcelar').checked
    v('parcelamento-config').style.display = on ? '' : 'none'
    v('lanc-venc-field').style.display = on ? 'none' : ''
    v('parcelas-preview-wrap').style.display = 'none'
    if (on) {
      const nextMonth = addMonths(val('lanc-data') || today(), 1)
      setVal('lanc-primeira-parc', nextMonth)
      window.__modals.updatePreview()
    }
  }

  window.__modals.updatePreview = () => {
    const tipo = val('lanc-tipo')
    const total = parseFloat(val('lanc-valor')) || 0
    const dataBase = val('lanc-data')

    if (tipo === 'mensalidade' && total > 0 && dataBase) {
      const meses = parseInt(val('lanc-meses')) || 12
      const dia = parseInt(val('lanc-dia-mens'))
      const preview = v('mensalidade-preview')
      if (!preview) return
      const exemplos = Math.min(meses, 4)
      let html = '<div class="parcelas-preview"><div class="parcelas-title">Prévia da mensalidade</div>'
      for (let i = 0; i < exemplos; i++) {
        const d = addMonths(dataBase, i)
        if (dia) {
          const dt = new Date(d + 'T12:00:00')
          const ultimoDia = new Date(dt.getFullYear(), dt.getMonth() + 1, 0).getDate()
          dt.setDate(Math.min(dia, ultimoDia))
          const dStr = dt.toISOString().split('T')[0]
          const parts = dStr.split('-')
          html += `<div class="parcela-item"><span>${i+1}ª — ${parts[2]}/${parts[1]}/${parts[0]}</span><span>${fmtVal(total)}</span></div>`
        } else {
          const parts = d.split('-')
          html += `<div class="parcela-item"><span>${i+1}ª — ${parts[2]}/${parts[1]}/${parts[0]}</span><span>${fmtVal(total)}</span></div>`
        }
      }
      if (meses > 4) html += `<div class="parcela-item" style="color:var(--text3);font-style:italic"><span>... e mais ${meses - 4} meses</span><span></span></div>`
      html += '</div>'
      preview.innerHTML = html
      return
    }

    if (v('lanc-parcelar').checked && total > 0 && dataBase) {
      const n = parseInt(val('lanc-n-parcelas')) || 2
      const primeiraStr = val('lanc-primeira-parc')
      const wrap = v('parcelas-preview-wrap')
      if (!wrap || !primeiraStr) return
      const valParc = total / n
      let html = '<div class="parcelas-preview"><div class="parcelas-title">Prévia das parcelas</div>'
      const exibir = Math.min(n, 5)
      for (let i = 0; i < exibir; i++) {
        const d = addMonths(primeiraStr, i)
        const parts = d.split('-')
        html += `<div class="parcela-item"><span>${i+1}ª — ${parts[2]}/${parts[1]}/${parts[0]}</span><span>${fmtVal(valParc)}</span></div>`
      }
      if (n > 5) html += `<div class="parcela-item" style="color:var(--text3)"><span>... e mais ${n-5} parcelas</span></div>`
      html += '</div>'
      wrap.innerHTML = html
      wrap.style.display = ''
    }
  }

  window.__modals.onLancClienteChange = async () => {
    const cid = parseInt(val('lanc-cliente'))
    const sel = v('lanc-proc')
    sel.innerHTML = '<option value="">Sem processo</option>'
    if (!cid) return
    const procs = await getProcessosByCliente(cid)
    procs.forEach(p => { sel.innerHTML += `<option value="${p.id}">${p.num} — ${p.tribunal}</option>` })
  }

  window.__modals.openLancamento = async (data, preClienteId) => {
    clearLancForm()
    await populateLancClienteSelect(getClientesCache, preClienteId)
    if (preClienteId) await window.__modals.onLancClienteChange()
    if (data) populateLancForm(data)
    openModal('modal-lancamento')
    setTimeout(() => v('lanc-valor')?.focus(), 50)
  }
  window.__modals.closeLancamento = () => closeModal('modal-lancamento')

  window.__modals.saveLancamento = async () => {
    const clienteId = parseInt(val('lanc-cliente'))
    const valor = parseFloat(val('lanc-valor'))
    const tipo = val('lanc-tipo')
    if (!clienteId) { toast('Selecione um cliente', 'error'); return }
    if (!valor) { toast('Informe o valor', 'error'); return }

    const btn = v('btn-save-lanc')
    btn.disabled = true; btn.textContent = 'Salvando...'

    try {
      const procId = parseInt(val('lanc-proc')) || null
      const clientes = await getClientesCache()
      const cliente = clientes.find(c => c.id === clienteId)
      let procNum = ''
      if (procId) {
        const procs = await getProcessosByCliente(clienteId)
        const p = procs.find(p => p.id === procId)
        procNum = p?.num || ''
      }
      const idVal = val('lanc-id')
      const base = {
        cliente_id: clienteId, cliente_nome: cliente?.nome || '',
        processo_id: procId, processo_num: procNum,
        tipo, direcao: val('lanc-dir'), valor,
        data: val('lanc-data'), status: val('lanc-status'),
        descricao: val('lanc-desc'),
      }

      if (idVal) {
        // Edição simples
        base.id = parseInt(idVal)
        base.vencimento = val('lanc-venc') || null
        await saveLancamento(base)
        toast('Lançamento atualizado')
      } else if (tipo === 'mensalidade') {
        const meses = parseInt(val('lanc-meses')) || 12
        const dia = parseInt(val('lanc-dia-mens')) || parseInt(base.data?.split('-')[2]) || 1
        const lista = gerarMensalidades({ ...base, mensalidade_dia: dia }, meses)
        await saveLancamentos(lista)
        toast(`${meses} mensalidades criadas`)
      } else if (v('lanc-parcelar').checked) {
        const n = parseInt(val('lanc-n-parcelas')) || 2
        const lista = gerarParcelas({ ...base, data: val('lanc-primeira-parc') || base.data }, n)
        await saveLancamentos(lista)
        toast(`${n} parcelas criadas`)
      } else {
        base.vencimento = val('lanc-venc') || null
        await saveLancamento(base)
        toast('Lançamento salvo')
      }

      closeModal('modal-lancamento')
      onSaved && onSaved()
    } catch(e) {
      toast('Erro: ' + e.message, 'error')
    } finally {
      btn.disabled = false; btn.textContent = 'Salvar lançamento'
    }
  }
}

async function populateLancClienteSelect(getClientesCache, preselect) {
  const clientes = await getClientesCache()
  const sel = v('lanc-cliente')
  if (!sel) return
  sel.innerHTML = '<option value="">Selecionar...</option>' +
    clientes.map(c => `<option value="${c.id}"${preselect == c.id ? ' selected' : ''}>${c.nome}</option>`).join('')
}

function clearLancForm() {
  v('modal-lanc-title').textContent = 'Novo lançamento'
  ;['lanc-id','lanc-valor','lanc-desc','lanc-venc'].forEach(id => setVal(id, ''))
  setVal('lanc-tipo', 'honorario'); setVal('lanc-dir', 'entrada'); setVal('lanc-status', 'pago')
  setVal('lanc-data', today()); setVal('lanc-n-parcelas', '2')
  v('lanc-parcelar').checked = false
  v('parcelamento-config').style.display = 'none'
  v('mensalidade-config').style.display = 'none'
  v('lanc-venc-field').style.display = ''
  v('parcelas-preview-wrap').style.display = 'none'
  if (v('mensalidade-preview')) v('mensalidade-preview').innerHTML = ''
}
function populateLancForm(l) {
  v('modal-lanc-title').textContent = 'Editar lançamento'
  setVal('lanc-id', l.id); setVal('lanc-cliente', l.cliente_id)
  setVal('lanc-tipo', l.tipo); setVal('lanc-dir', l.direcao)
  setVal('lanc-valor', l.valor); setVal('lanc-data', l.data)
  setVal('lanc-venc', l.vencimento); setVal('lanc-status', l.status)
  setVal('lanc-desc', l.descricao)
  window.__modals.onLancClienteChange().then(() => setVal('lanc-proc', l.processo_id || ''))
}
