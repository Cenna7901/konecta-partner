// ============================================
// KONECTA PARTNER - PAINEL DA MATRIZ
// ============================================

const MATRIX = {
    franchisees: [],
    selectedFranchisee: null,

    // Inicializar
    async init() {
        await this.loadFranchisees();
        this.render();
    },

    // Carregar franqueados
    async loadFranchisees() {
        const saved = UTILS.load('franchisees');
        if (saved && saved.length > 0) {
            this.franchisees = saved;
        } else {
            this.franchisees = await UTILS.fetchFranchisees();
            UTILS.save('franchisees', this.franchisees);
        }
    },

    // Salvar franqueados
    saveFranchisees() {
        UTILS.save('franchisees', this.franchisees);
        this.render();
    },

    // Renderizar painel
    render() {
        const main = document.getElementById('mainContent');
        const total = this.franchisees.length;
        const active = this.franchisees.filter(f => f.status === 'ativo').length;
        const inactive = this.franchisees.filter(f => f.status === 'inativo').length;
        const blocked = this.franchisees.filter(f => f.status === 'bloqueado').length;

        main.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <span class="card-title">📊 Dashboard</span>
                    <span class="card-subtitle">${total} franqueados</span>
                </div>
                <div class="stats-grid">
                    <div class="stat-card">
                        <span class="stat-number">${total}</span>
                        <span class="stat-label">Total</span>
                    </div>
                    <div class="stat-card">
                        <span class="stat-number" style="color:var(--status-green)">${active}</span>
                        <span class="stat-label">Ativos</span>
                    </div>
                    <div class="stat-card">
                        <span class="stat-number" style="color:var(--status-red)">${inactive}</span>
                        <span class="stat-label">Inativos</span>
                    </div>
                    <div class="stat-card">
                        <span class="stat-number" style="color:var(--status-yellow)">${blocked}</span>
                        <span class="stat-label">Bloqueados</span>
                    </div>
                </div>
            </div>

            <div class="card">
                <div class="card-header">
                    <span class="card-title">👥 Franqueados</span>
                    <button class="btn btn-primary btn-sm" onclick="MATRIX.showAddModal()">+ Novo</button>
                </div>
                <div class="flex" style="gap:8px;margin-bottom:16px;flex-wrap:wrap;">
                    <button class="btn btn-secondary btn-sm" onclick="MATRIX.exportJSON()">📤 Exportar JSON</button>
                    <button class="btn btn-secondary btn-sm" onclick="MATRIX.setBaseUrl()">🔗 Definir URL Base</button>
                </div>
                <div class="table-responsive">
                    <table>
                        <thead>
                            <tr>
                                <th>Nome</th>
                                <th>Slug</th>
                                <th>Status</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${this.franchisees.length === 0 ? `
                                <tr><td colspan="4" class="text-center text-muted">Nenhum franqueado cadastrado</td></tr>
                            ` : this.franchisees.map(f => `
                                <tr>
                                    <td><strong>${f.nome}</strong></td>
                                    <td><code style="font-size:11px;color:var(--text-secondary)">${f.slug}</code></td>
                                    <td>
                                        <span class="badge badge-${f.status}">
                                            <span class="badge-dot ${f.status === 'ativo' ? 'green' : f.status === 'inativo' ? 'red' : 'yellow'}"></span>
                                            ${f.status.charAt(0).toUpperCase() + f.status.slice(1)}
                                        </span>
                                    </td>
                                    <td>
                                        <div class="flex" style="gap:4px;flex-wrap:wrap;">
                                            <button class="btn btn-secondary btn-sm" onclick="MATRIX.viewFranchisee('${f.slug}')" title="Visualizar">👁️</button>
                                            <button class="btn btn-secondary btn-sm" onclick="MATRIX.editFranchisee('${f.slug}')" title="Editar">✏️</button>
                                            <button class="btn btn-secondary btn-sm" onclick="MATRIX.copyLink('${f.slug}')" title="Copiar link">📋</button>
                                            <button class="btn btn-secondary btn-sm" onclick="MATRIX.toggleStatus('${f.slug}')" title="Alterar status">🔄</button>
                                        </div>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        // Esconder botão voltar
        document.getElementById('btnBack').style.display = 'none';
    },

    // Mostrar modal de cadastro
    showAddModal() {
        this.showFormModal(null);
    },

    // Editar franqueado
    editFranchisee(slug) {
        const f = this.franchisees.find(f => f.slug === slug);
        if (f) this.showFormModal(f);
    },

    // Formulário modal
    showFormModal(franchisee) {
        const isEdit = !!franchisee;
        const f = franchisee || { nome: '', slug: '', email: '', telefone: '', cidade: '', status: 'ativo' };

        const modal = document.getElementById('modalOverlay');
        document.getElementById('modalTitle').textContent = isEdit ? '✏️ Editar Franqueado' : '➕ Novo Franqueado';

        document.getElementById('modalBody').innerHTML = `
            <form id="franchiseeForm" onsubmit="MATRIX.saveFranchisee(event)">
                <input type="hidden" id="fSlug" value="${f.slug || ''}">
                <div class="form-group">
                    <label class="form-label">Nome completo *</label>
                    <input class="form-control" id="fNome" value="${f.nome || ''}" required placeholder="Nome do franqueado">
                </div>
                <div class="form-group">
                    <label class="form-label">Identificador (slug) *</label>
                    <input class="form-control" id="fSlugInput" value="${f.slug || ''}" required placeholder="ex: franqueado-sp" ${isEdit ? 'readonly' : ''}>
                    <small class="text-muted" style="font-size:11px;">${isEdit ? 'Slug não pode ser alterado' : 'Usado na URL: ?franqueado=slug'}</small>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">E-mail</label>
                        <input class="form-control" id="fEmail" value="${f.email || ''}" type="email" placeholder="email@exemplo.com">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Telefone</label>
                        <input class="form-control" id="fTelefone" value="${f.telefone || ''}" placeholder="(11) 99999-9999">
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label">Cidade</label>
                    <input class="form-control" id="fCidade" value="${f.cidade || ''}" placeholder="São Paulo - SP">
                </div>
                <div class="form-group">
                    <label class="form-label">Status</label>
                    <select class="form-control" id="fStatus">
                        <option value="ativo" ${f.status === 'ativo' ? 'selected' : ''}>Ativo</option>
                        <option value="inativo" ${f.status === 'inativo' ? 'selected' : ''}>Inativo</option>
                        <option value="bloqueado" ${f.status === 'bloqueado' ? 'selected' : ''}>Bloqueado</option>
                    </select>
                </div>
                <div class="flex" style="gap:8px;margin-top:8px;">
                    <button type="submit" class="btn btn-primary btn-full">💾 Salvar</button>
                    <button type="button" class="btn btn-secondary" onclick="UTILS.closeModal()">Cancelar</button>
                </div>
            </form>
        `;

        modal.style.display = 'flex';
    },

    // Salvar franqueado
    saveFranchisee(e) {
        e.preventDefault();
        const slug = document.getElementById('fSlugInput').value.trim();
        const nome = document.getElementById('fNome').value.trim();
        const email = document.getElementById('fEmail').value.trim();
        const telefone = document.getElementById('fTelefone').value.trim();
        const cidade = document.getElementById('fCidade').value.trim();
        const status = document.getElementById('fStatus').value;
        const oldSlug = document.getElementById('fSlug').value;

        if (!nome || !slug) {
            UTILS.toast('Preencha nome e slug', 'error');
            return;
        }

        // Verificar slug duplicado (se for novo)
        if (!oldSlug && this.franchisees.some(f => f.slug === slug)) {
            UTILS.toast('Slug já existe. Escolha outro.', 'error');
            return;
        }

        const data = { nome, slug, email, telefone, cidade, status };

        if (oldSlug) {
            // Edição
            const index = this.franchisees.findIndex(f => f.slug === oldSlug);
            if (index !== -1) {
                this.franchisees[index] = { ...this.franchisees[index], ...data };
            }
            UTILS.toast('Franqueado atualizado!', 'success');
        } else {
            // Novo
            this.franchisees.push(data);
            UTILS.toast('Franqueado cadastrado!', 'success');
        }

        this.saveFranchisees();
        UTILS.closeModal();
    },

    // Visualizar app do franqueado
    viewFranchisee(slug) {
        const url = new URL(window.location.href);
        url.searchParams.set('franqueado', slug);
        window.location.href = url.toString();
    },

    // Copiar link
    async copyLink(slug) {
        const baseUrl = UTILS.load('baseUrl') || window.location.origin;
        const url = `${baseUrl}?franqueado=${slug}`;
        await UTILS.copyText(url);
        UTILS.toast('Link copiado!', 'success');
    },

    // Alternar status
    toggleStatus(slug) {
        const f = this.franchisees.find(f => f.slug === slug);
        if (!f) return;

        const statuses = ['ativo', 'inativo', 'bloqueado'];
        const currentIndex = statuses.indexOf(f.status);
        f.status = statuses[(currentIndex + 1) % statuses.length];
        this.saveFranchisees();
        UTILS.toast(`Status alterado para: ${f.status}`, 'success');
    },

    // Exportar JSON
    exportJSON() {
        const json = JSON.stringify(this.franchisees, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'franqueados.json';
        a.click();
        URL.revokeObjectURL(url);
        UTILS.toast('Arquivo exportado!', 'success');
    },

    // Definir URL base
    setBaseUrl() {
        const current = UTILS.load('baseUrl') || window.location.origin;
        const modal = document.getElementById('modalOverlay');
        document.getElementById('modalTitle').textContent = '🔗 URL Base';

        document.getElementById('modalBody').innerHTML = `
            <form onsubmit="MATRIX.saveBaseUrl(event)">
                <div class="form-group">
                    <label class="form-label">URL base do app</label>
                    <input class="form-control" id="baseUrlInput" value="${current}" placeholder="https://meuapp.com">
                    <small class="text-muted" style="font-size:11px;">Use para gerar links de acesso aos franqueados</small>
                </div>
                <div class="flex" style="gap:8px;margin-top:8px;">
                    <button type="submit" class="btn btn-primary btn-full">💾 Salvar</button>
                    <button type="button" class="btn btn-secondary" onclick="UTILS.closeModal()">Cancelar</button>
                </div>
            </form>
        `;

        modal.style.display = 'flex';
    },

    saveBaseUrl(e) {
        e.preventDefault();
        const url = document.getElementById('baseUrlInput').value.trim();
        if (url) {
            UTILS.save('baseUrl', url);
            UTILS.toast('URL base salva!', 'success');
            UTILS.closeModal();
        }
    }
};
