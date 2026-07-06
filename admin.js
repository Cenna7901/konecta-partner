// ============================================
// KONECTA PARTNER - ENTRADA EXCLUSIVA DO ADM
// ============================================

const APP = {
    currentView: 'matrix',
    nativeSlugKey: 'selectedFranchiseeSlug',

    async init() {
        document.getElementById('loading').classList.remove('hidden');
        this.setupEvents();

        const params = new URLSearchParams(window.location.search);
        if (params.get('adm') !== '1') {
            this.renderBlockedAdmin();
            this.currentView = 'blocked-admin';
        } else {
            await MATRIX.init();
            this.currentView = 'matrix';
        }

        setTimeout(() => document.getElementById('loading').classList.add('hidden'), 300);
    },

    setupEvents() {
        document.getElementById('btnBack').style.display = 'none';
        document.getElementById('btnRefresh').addEventListener('click', () => window.location.reload());
        document.getElementById('modalClose').addEventListener('click', UTILS.closeModal);
        document.getElementById('modalOverlay').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) UTILS.closeModal();
        });
    },

    isNativeApp() { return false; },
    isInstalledPWA() { return false; },

    renderBlockedAdmin() {
        document.getElementById('mainContent').innerHTML = `
            <section class="slug-setup">
                <img class="slug-setup-logo" src="assets/konecta-symbol.png" alt="Konecta">
                <div class="card slug-setup-card">
                    <h1>Acesso administrativo bloqueado</h1>
                    <p>Esta área é exclusiva da matriz.</p>
                </div>
            </section>
        `;
    }
};

UTILS.closeModal = function() {
    document.getElementById('modalOverlay').style.display = 'none';
    document.getElementById('modalBody').innerHTML = '';
};

document.addEventListener('DOMContentLoaded', () => APP.init());
