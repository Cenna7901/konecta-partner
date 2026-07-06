// ============================================
// KONECTA PARTNER - APP PRINCIPAL
// ============================================

const APP = {
    currentView: 'matrix',

    // Inicializar
    async init() {
        document.getElementById('loading').classList.remove('hidden');

        this.setupEvents();

        const params = new URLSearchParams(window.location.search);
        let franqueado = params.get('franqueado');

        // Se não veio na URL, tenta buscar o código salvo no celular
        if (!franqueado) {
            franqueado = localStorage.getItem('konecta_franqueado');
        }

        if (franqueado) {
            // Salva para próximas aberturas
            localStorage.setItem('konecta_franqueado', franqueado);

            await FRANCHISEE.init(franqueado);
            this.currentView = 'franchisee';
        } else {
            // Primeira abertura: pede código
            this.renderActivationScreen();
            this.currentView = 'activation';
        }

        setTimeout(() => {
            document.getElementById('loading').classList.add('hidden');
        }, 500);
    },

    // Configurar eventos
    setupEvents() {
        document.getElementById('btnBack').addEventListener('click', () => {
            if (this.currentView === 'franchisee') {
                const franqueado = localStorage.getItem('konecta_franqueado');

                if (franqueado) {
                    FRANCHISEE.goHome();
                } else {
                    this.renderActivationScreen();
                    this.currentView = 'activation';
                }
            } else {
                this.renderActivationScreen();
                this.currentView = 'activation';
            }
        });

        document.getElementById('btnRefresh').addEventListener('click', () => {
            UTILS.toast('🔄 Atualizando...', 'info');
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

    // Tela de ativação
    renderActivationScreen() {
        const main = document.getElementById('mainContent');

        main.innerHTML = `
            <section class="card">
                <h2>Ativar acesso</h2>
                <p>Digite o código informado pela Konecta.</p>

                <input 
                    id="activationCode" 
                    class="input" 
                    placeholder="Ex: j_zanguetin"
                    autocomplete="off"
                >

                <button class="btn-full" onclick="APP.activateFranchisee()">
                    Entrar
                </button>
            </section>
        `;

        document.getElementById('btnBack').style.display = 'none';
    },

    // Ativar franqueado
    async activateFranchisee() {
        const input = document.getElementById('activationCode');
        const code = input.value.trim();

        if (!code) {
            UTILS.toast('Digite seu código de acesso.', 'warning');
            return;
        }

        localStorage.setItem('konecta_franqueado', code);

        await FRANCHISEE.init(code);
        this.currentView = 'franchisee';
    },

    // Voltar para ativação
    goHome() {
        localStorage.removeItem('konecta_franqueado');
        this.renderActivationScreen();
        this.currentView = 'activation';
    }
};

// ============================================
// UTILIDADES EXTRA (global)
// ============================================

UTILS.closeModal = function() {
    document.getElementById('modalOverlay').style.display = 'none';
    document.getElementById('modalBody').innerHTML = '';
};

// ============================================
// INICIALIZAR
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    APP.init();
});

// Registrar Service Worker
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js')
        .then(() => console.log('✅ Service Worker registrado'))
        .catch(err => console.warn('⚠️ SW não registrado:', err));
}
