// ============================================
// KONECTA PARTNER - ENTRADA DO FRANQUEADO/PÚBLICA
// Esta entrada NUNCA inicializa o ADM.
// ============================================

const APP = {
    currentView: 'public-access',
    nativeSlugKey: 'selectedFranchiseeSlug',

    async init() {
        document.getElementById('loading').classList.remove('hidden');
        this.setupEvents();

        const params = new URLSearchParams(window.location.search);
        const explicitFranqueado = this.normalizeSlug(params.get('franqueado'));
        const savedNativeSlug = this.normalizeSlug(UTILS.load(this.nativeSlugKey));

        // Blindagem: se alguém tentar abrir ADM pela entrada normal,
        // redireciona para a página administrativa separada.
        if (params.get('adm') === '1') {
            window.location.replace('./adm.html?adm=1');
            return;
        }

        if (explicitFranqueado) {
            await this.openFranchisee(explicitFranqueado);
        } else if (this.isActivationLink()) {
            this.renderSlugSetup();
            this.currentView = 'slug-setup';
        } else if ((this.isNativeApp() || this.isInstalledPWA()) && savedNativeSlug) {
            const loaded = await FRANCHISEE.init(savedNativeSlug);
            if (loaded) this.currentView = 'franchisee';
            else {
                UTILS.remove(this.nativeSlugKey);
                this.renderSlugSetup('Identificador salvo nao encontrado. Informe novamente.');
                this.currentView = 'slug-setup';
            }
        } else {
            this.renderPublicAccess();
            this.currentView = 'public-access';
        }

        setTimeout(() => document.getElementById('loading').classList.add('hidden'), 300);
    },

    setupEvents() {
        document.getElementById('btnBack').addEventListener('click', () => {
            if (this.currentView === 'franchisee') FRANCHISEE.goHome();
            else this.renderPublicAccess();
        });
        document.getElementById('btnRefresh').addEventListener('click', () => window.location.reload());
        document.getElementById('modalClose').addEventListener('click', UTILS.closeModal);
        document.getElementById('modalOverlay').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) UTILS.closeModal();
        });
    },

    async openFranchisee(slug) {
        UTILS.save(this.nativeSlugKey, slug);
        const loaded = await FRANCHISEE.init(slug);
        if (loaded) this.currentView = 'franchisee';
        else {
            UTILS.remove(this.nativeSlugKey);
            this.renderSlugSetup('Identificador nao encontrado. Confira o codigo enviado pela matriz.');
            this.currentView = 'slug-setup';
        }
    },

    goHome() { if (FRANCHISEE.data) FRANCHISEE.goHome(); else this.renderSlugSetup(); },
    isNativeApp() { return window.location.protocol === 'capacitor:' || window.location.protocol === 'file:' || !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform()); },
    isInstalledPWA() { return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true; },
    isActivationLink() { return new URLSearchParams(window.location.search).get('ativar') === '1'; },
    normalizeSlug(slug) { return (slug || '').toString().trim().toLowerCase(); },

    renderPublicAccess() { this.renderSlugSetup('Use o identificador recebido da matriz.'); },

    renderSlugSetup(message = '') {
        document.getElementById('btnBack').style.display = 'none';
        document.getElementById('mainContent').innerHTML = `
            <section class="slug-setup">
                <img class="slug-setup-logo" src="assets/konecta-symbol.png" alt="Konecta">
                <div class="card slug-setup-card">
                    <h1>Konecta Partner</h1>
                    <p>Digite o identificador informado pela matriz para liberar o painel neste aparelho.</p>
                    ${message ? `<div class="slug-message">${message}</div>` : ''}
                    <form onsubmit="APP.saveNativeSlug(event)">
                        <div class="form-group">
                            <label class="form-label" for="nativeSlug">Identificador do franqueado</label>
                            <input class="form-control" id="nativeSlug" name="nativeSlug" type="text" placeholder="ex: J_Zanguetin" autocomplete="off" autocapitalize="none" spellcheck="false" required>
                        </div>
                        <button class="btn btn-primary btn-full" type="submit">Entrar no painel</button>
                    </form>
                </div>
            </section>`;
        setTimeout(() => document.getElementById('nativeSlug')?.focus(), 100);
    },

    async saveNativeSlug(event) {
        event.preventDefault();
        const input = document.getElementById('nativeSlug');
        const slug = this.normalizeSlug(input ? input.value : '');
        if (!slug) return this.renderSlugSetup('Informe o identificador para continuar.');
        const franchisees = await UTILS.fetchFranchisees();
        const exists = franchisees.find(f => this.normalizeSlug(f.slug) === slug);
        if (!exists) return this.renderSlugSetup('Identificador nao encontrado. Confira o codigo enviado pela matriz.');
        UTILS.save('franchisees', franchisees);
        await this.openFranchisee(slug);
        UTILS.toast('Acesso liberado com sucesso!', 'success');
    },

    resetNativeSlug() {
        if (!confirm('Remover o identificador salvo neste aparelho?')) return;
        UTILS.remove(this.nativeSlugKey);
        FRANCHISEE.data = null;
        FRANCHISEE.slug = null;
        this.renderSlugSetup('Informe o identificador para identificar este aparelho.');
        this.currentView = 'slug-setup';
    }
};

UTILS.closeModal = function() {
    document.getElementById('modalOverlay').style.display = 'none';
    document.getElementById('modalBody').innerHTML = '';
};

document.addEventListener('DOMContentLoaded', () => APP.init());

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js?v=30')
        .catch(err => console.warn('SW nao registrado:', err));
}
