// ============================================
// KONECTA PARTNER - APP PRINCIPAL
// ============================================

const APP = {
    currentView: 'matrix',
    nativeSlugKey: 'selectedFranchiseeSlug',

    async init() {
        document.getElementById('loading').classList.remove('hidden');
        this.setupEvents();

        const params = new URLSearchParams(window.location.search);
        const franqueado = this.normalizeSlug(params.get('franqueado'));
        const savedNativeSlug = this.normalizeSlug(UTILS.load(this.nativeSlugKey));

        if (this.isAdminMode()) {
            await MATRIX.init();
            this.currentView = 'matrix';
        } else if (franqueado) {
            if (this.isNativeApp()) {
                UTILS.save(this.nativeSlugKey, franqueado);
            }
            await FRANCHISEE.init(franqueado);
            this.currentView = 'franchisee';
        } else if (this.isNativeApp()) {
            if (savedNativeSlug) {
                const loaded = await FRANCHISEE.init(savedNativeSlug);
                if (loaded) {
                    this.currentView = 'franchisee';
                } else {
                    UTILS.remove(this.nativeSlugKey);
                    this.renderSlugSetup('Slug salvo nao encontrado. Informe novamente.');
                    this.currentView = 'slug-setup';
                }
            } else {
                this.renderSlugSetup();
                this.currentView = 'slug-setup';
            }
        } else {
            await MATRIX.init();
            this.currentView = 'matrix';
        }

        setTimeout(() => {
            document.getElementById('loading').classList.add('hidden');
        }, 500);
    },

    setupEvents() {
        document.getElementById('btnBack').addEventListener('click', () => {
            if (this.currentView === 'slug-setup') {
                this.goHome();
                return;
            }

            if (this.currentView === 'franchisee') {
                const main = document.getElementById('mainContent');
                const hasBackToHome = main.querySelector('.btn-full[onclick*="FRANCHISEE.goHome"]');
                if (hasBackToHome) {
                    FRANCHISEE.goHome();
                } else if (this.isNativeApp()) {
                    FRANCHISEE.goHome();
                } else {
                    this.goHome();
                }
                return;
            }

            window.location.href = window.location.pathname;
        });

        document.getElementById('btnRefresh').addEventListener('click', () => {
            UTILS.toast('Atualizando...', 'info');
            setTimeout(() => window.location.reload(), 300);
        });

        document.getElementById('modalClose').addEventListener('click', UTILS.closeModal);
        document.getElementById('modalOverlay').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) UTILS.closeModal();
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') UTILS.closeModal();
        });
    },

    goHome() {
        if (this.isNativeApp()) {
            if (FRANCHISEE.data) {
                FRANCHISEE.goHome();
            } else {
                this.renderSlugSetup();
            }
            return;
        }
        window.location.href = window.location.pathname;
    },

    isNativeApp() {
        if (window.location.protocol === 'http:' || window.location.protocol === 'https:') {
            return false;
        }

        if (window.location.protocol === 'capacitor:' || window.location.protocol === 'file:') {
            return true;
        }

        if (window.Capacitor && typeof window.Capacitor.isNativePlatform === 'function') {
            return window.Capacitor.isNativePlatform();
        }

        return false;
    },

    isAdminMode() {
        return window.KONECTA_MODE === 'admin' || window.location.pathname.endsWith('/adm.html');
    },

    normalizeSlug(slug) {
        return (slug || '').toString().trim().toLowerCase();
    },

    renderSlugSetup(message = '') {
        const main = document.getElementById('mainContent');
        document.getElementById('btnBack').style.display = 'none';

        main.innerHTML = `
            <section class="slug-setup">
                <img class="slug-setup-logo" src="assets/konecta-symbol.png" alt="Konecta">
                <div class="card slug-setup-card">
                    <h1>Identificar franqueado</h1>
                    <p>Digite o slug informado pela matriz para liberar o painel neste aparelho.</p>
                    ${message ? `<div class="slug-message">${message}</div>` : ''}
                    <form onsubmit="APP.saveNativeSlug(event)">
                        <div class="form-group">
                            <label class="form-label" for="nativeSlug">Slug do franqueado</label>
                            <input
                                class="form-control"
                                id="nativeSlug"
                                name="nativeSlug"
                                type="text"
                                placeholder="ex: joao-silva"
                                autocomplete="off"
                                autocapitalize="none"
                                spellcheck="false"
                                required
                            >
                        </div>
                        <button class="btn btn-primary btn-full" type="submit">Entrar no painel</button>
                    </form>
                </div>
            </section>
        `;

        setTimeout(() => {
            const input = document.getElementById('nativeSlug');
            if (input) input.focus();
        }, 100);
    },

    async saveNativeSlug(event) {
        event.preventDefault();
        const input = document.getElementById('nativeSlug');
        const slug = this.normalizeSlug(input ? input.value : '');

        if (!slug) {
            this.renderSlugSetup('Informe o slug para continuar.');
            return;
        }

        const franchisees = await UTILS.fetchFranchisees();
        const exists = franchisees.find(f => f.slug === slug);

        if (!exists) {
            this.renderSlugSetup('Slug nao encontrado. Confira o codigo enviado pela matriz.');
            return;
        }

        UTILS.save(this.nativeSlugKey, slug);
        UTILS.save('franchisees', franchisees);
        await FRANCHISEE.init(slug);
        this.currentView = 'franchisee';
        UTILS.toast('Franqueado identificado com sucesso!', 'success');
    },

    resetNativeSlug() {
        if (!confirm('Remover o slug salvo neste aparelho?')) return;
        UTILS.remove(this.nativeSlugKey);
        FRANCHISEE.data = null;
        FRANCHISEE.slug = null;
        this.renderSlugSetup('Informe o slug para identificar este aparelho.');
        this.currentView = 'slug-setup';
    }
};

UTILS.closeModal = function() {
    document.getElementById('modalOverlay').style.display = 'none';
    document.getElementById('modalBody').innerHTML = '';
};

document.addEventListener('DOMContentLoaded', () => {
    APP.init();
});

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js')
        .then(() => console.log('Service Worker registrado'))
        .catch(err => console.warn('SW nao registrado:', err));
}
