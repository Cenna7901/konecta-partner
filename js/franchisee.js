// ============================================
// KONECTA PARTNER - APP DO FRANQUEADO
// ============================================

const FRANCHISEE = {
    data: null,
    slug: null,
    clients: [],
    proposals: [],
    checklists: [],

    // Inicializar
    async init(slug) {
        this.slug = slug;
        await this.loadFranchisee(slug);
        if (this.data) {
            this.loadLocalData();
            this.render();
        }
    },

    // Carregar dados do franqueado
    async loadFranchisee(slug) {
        const franchisees = UTILS.load('franchisees') || await UTILS.fetchFranchisees();
        this.data = franchisees.find(f => f.slug === slug);
    },

    // Carregar dados locais
    loadLocalData() {
        const key = `franchisee_${this.slug}`;
        this.clients = UTILS.load(`${key}_clients`, []);
        this.proposals = UTILS.load(`${key}_proposals`, []);
        this.checklists = UTILS.load(`${key}_checklists`, []);
    },

    // Salvar dados locais
    saveLocalData() {
        const key = `franchisee_${this.slug}`;
        UTILS.save(`${key}_clients`, this.clients);
        UTILS.save(`${key}_proposals`, this.proposals);
        UTILS.save(`${key}_checklists`, this.checklists);
    },

    // Renderizar app do franqueado
    render() {
        const main = document.getElementById('mainContent');
        const f = this.data;

        // Verificar status
        if (f.status === 'inativo' || f.status === 'bloqueado') {
            main.innerHTML = `
                <div class="status-unavailable">
                    <div class="icon-big">🚫</div>
                    <h2>Acesso Indisponível</h2>
                    <p>O franqueado <strong>${f.nome}</strong> está ${f.status === 'bloqueado' ? 'bloqueado' : 'inativo'}.</p>
                    <p style="margin-top:12px;font-size:13px;">Entre em contato com a matriz para mais informações.</p>
                    <button class="btn btn-primary mt-16" onclick="APP.goHome()">Voltar</button>
                </div>
            `;
            document.getElementById('btnBack').style.display = 'flex';
            return;
        }

        // Contagem de clientes
        const totalClients = this.clients.length;

        main.innerHTML = `
            <!-- Header do Franqueado -->
            <div class="franchisee-header">
                <div class="logo-icon">K</div>
                <h1 class="franchisee-name">${f.nome}</h1>
                <p class="franchisee-detail">${f.cidade || 'Cidade não informada'}</p>
                ${f.email ? `<p class="franchisee-detail">📧 ${f.email}</p>` : ''}
                ${f.telefone ? `<p class="franchisee-detail">📱 ${f.telefone}</p>` : ''}
                <div style="margin-top:8px;">
                    <span class="badge badge-${f.status}">
                        <span class="badge-dot green"></span>
                        ${f.status.charAt(0).toUpperCase() + f.status.slice(1)}
                    </span>
                    <span class="badge badge-active" style="margin-left:8px;">
                        👥 ${totalClients} clientes
                    </span>
                </div>
            </div>

            <!-- Menu -->
            <div class="franchisee-menu">
                <div class="menu-item" onclick="FRANCHISEE.goTo('clients')">
                    <span class="menu-icon">👤</span>
                    <span class="menu-label">Clientes</span>
                    <span class="menu-desc">${totalClients} cadastrados</span>
                </div>
                <div class="menu-item" onclick="FRANCHISEE.goTo('proposals')">
                    <span class="menu-icon">📄</span>
                    <span class="menu-label">Propostas</span>
                    <span class="menu-desc">Gerar PDF</span>
                </div>
                <div class="menu-item" onclick="FRANCHISEE.goTo('materials')">
                    <span class="menu-icon">📚</span>
                    <span class="menu-label">Materiais</span>
                    <span class="menu-desc">Conteúdos e dicas</span>
                </div>
                <div class="menu-item" onclick="FRANCHISEE.goTo('checklist')">
                    <span class="menu-icon">✅</span>
                    <span class="menu-label">Checklist</span>
                    <span class="menu-desc">Implantações</span>
                </div>
            </div>

            <!-- Rodapé -->
            <div style="text-align:center;margin-top:24px;padding-top:16px;border-top:var(--border-light);">
                <p style="font-size:11px;color:var(--text-muted);">Konecta Partner • v1.0</p>
            </div>
        `;

        document.getElementById('btnBack').style.display = 'flex';
    },

    // Navegar para seções
    goTo(section) {
        switch(section) {
            case 'clients':
                CLIENTS.render(this.slug, this.clients, () => this.saveLocalData());
                break;
            case 'proposals':
                PROPOSALS.render(this.slug, this.clients, this.proposals, () => this.saveLocalData());
                break;
            case 'materials':
                MATERIALS.render();
                break;
            case 'checklist':
                CHECKLIST.render(this.slug, this.clients, this.checklists, () => this.saveLocalData());
                break;
            default:
                this.render();
        }
    },

    // Voltar para home do franqueado
    goHome() {
        this.render();
    }
};
