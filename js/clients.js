// ============================================
// KONECTA PARTNER - CRUD CLIENTES
// ============================================

const CLIENTS = {
    slug: null,
    clients: [],
    saveCallback: null,

    render(slug, clients, saveCallback) {
        this.slug = slug;
        this.clients = clients;
        this.saveCallback = saveCallback;
        this.renderList();
    },

    renderList() {
        const main = document.getElementById('mainContent');
        document.getElementById('btnBack').style.display = 'flex';

        main.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <span class="card-title">👤 Clientes</span>
                    <button class="btn btn-primary btn-sm" onclick="CLIENTS.showAddModal()">+ Novo</button>
                </div>
                <div class="table-responsive">
                    <table>
                        <thead>
                            <tr>
                                <th>Empresa</th>
                                <th>Responsável</th>
                                <th>Cidade</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${this.clients.length === 0 ? `
                                <tr><td colspan="4" class="text-center text-muted">Nenhum cliente cadastrado</td></tr>
                            ` : this.clients.map((c, i) => `
                                <tr>
                                    <td><strong>${c.empresa || '-'}</strong></td>
                                    <td>${c.responsavel || '-'}</td>
                                    <td>${c.cidade || '-'}</td>
                                    <td>
                                        <div class="flex" style="gap:4px;">
                                            <button class="btn btn-secondary btn-sm" onclick="CLIENTS.showEditModal(${i})">✏️</button>
                                            <button class="btn btn-danger btn-sm" onclick="CLIENTS.deleteClient(${i})">🗑️</button>
                                        </div>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
            <button class="btn btn-secondary btn-full" onclick="FRANCHISEE.goHome()">← Voltar</button>
        `;
    },

    showAddModal() {
        this.showFormModal(null);
    },

    showEditModal(index) {
        const client = this.clients[index];
        if (client) this.showFormModal(client, index);
    },

    showFormModal(client, index) {
        const isEdit = !!client;
        const c = client || { empresa: '', responsavel: '', whatsapp: '', endereco: '', cidade: '', segmento: '', dataContratacao: '', displays: 1, observacoes: '' };

        const modal = document.getElementById('modalOverlay');
        document.getElementById('modalTitle').textContent = isEdit ? '✏️ Editar Cliente' : '➕ Novo Cliente';

        document.getElementById('modalBody').innerHTML = `
            <form id="clientForm" onsubmit="CLIENTS.saveClient(event)">
                <input type="hidden" id="cIndex" value="${index !== undefined ? index : ''}">
                <div class="form-group">
                    <label class="form-label">Empresa *</label>
                    <input class="form-control" id="cEmpresa" value="${c.empresa || ''}" required placeholder="Nome da empresa">
                </div>
                <div class="form-group">
                    <label class="form-label">Responsável *</label>
                    <input class="form-control" id="cResponsavel" value="${c.responsavel || ''}" required placeholder="Nome do responsável">
                </div>
                <div class="form-group">
                    <label class="form-label">WhatsApp Business</label>
                    <input class="form-control" id="cWhatsapp" value="${c.whatsapp || ''}" placeholder="(11) 99999-9999">
                </div>
                <div class="form-group">
                    <label class="form-label">Endereço completo</label>
                    <input class="form-control" id="cEndereco" value="${c.endereco || ''}" placeholder="Rua, número, bairro, cidade">
                </div>
                <div class="form-group">
                    <label class="form-label">Cidade</label>
                    <input class="form-control" id="cCidade" value="${c.cidade || ''}" placeholder="São Paulo - SP">
                </div>
                <div class="form-group">
                    <label class="form-label">Segmento</label>
                    <input class="form-control" id="cSegmento" value="${c.segmento || ''}" placeholder="Ex: Alimentação, Varejo...">
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Data da contratação</label>
                        <input class="form-control" id="cData" value="${c.dataContratacao || ''}" type="date">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Quantidade de displays</label>
                        <input class="form-control" id="cDisplays" value="${c.displays || 1}" type="number" min="1">
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label">Observações</label>
                    <textarea class="form-control" id="cObservacoes" placeholder="Observações adicionais">${c.observacoes || ''}</textarea>
                </div>
                <div class="flex" style="gap:8px;margin-top:8px;">
                    <button type="submit" class="btn btn-primary btn-full">💾 Salvar</button>
                    <button type="button" class="btn btn-secondary" onclick="UTILS.closeModal()">Cancelar</button>
                </div>
            </form>
        `;

        modal.style.display = 'flex';
    },

    saveClient(e) {
        e.preventDefault();
        const index = document.getElementById('cIndex').value;
        const data = {
            empresa: document.getElementById('cEmpresa').value.trim(),
            responsavel: document.getElementById('cResponsavel').value.trim(),
            whatsapp: document.getElementById('cWhatsapp').value.trim(),
            endereco: document.getElementById('cEndereco').value.trim(),
            cidade: document.getElementById('cCidade').value.trim(),
            segmento: document.getElementById('cSegmento').value.trim(),
            dataContratacao: document.getElementById('cData').value,
            displays: parseInt(document.getElementById('cDisplays').value) || 1,
            observacoes: document.getElementById('cObservacoes').value.trim(),
            id: UTILS.uid(),
            createdAt: new Date().toISOString()
        };

        if (!data.empresa || !data.responsavel) {
            UTILS.toast('Preencha empresa e responsável', 'error');
            return;
        }

        if (index === '') {
            this.clients.push(data);
            UTILS.toast('Cliente cadastrado!', 'success');
        } else {
            this.clients[parseInt(index)] = { ...this.clients[parseInt(index)], ...data };
            UTILS.toast('Cliente atualizado!', 'success');
        }

        this.saveCallback();
        UTILS.closeModal();
        this.renderList();
    },

    deleteClient(index) {
        if (!confirm('Remover este cliente?')) return;
        this.clients.splice(index, 1);
        this.saveCallback();
        this.renderList();
        UTILS.toast('Cliente removido', 'success');
    }
};
