// ============================================
// KONECTA PARTNER - APP PRINCIPAL
// ============================================

const APP = {
    currentView: 'matrix',

    // Inicializar
    async init() {
        // Mostrar loading
        document.getElementById('loading').classList.remove('hidden');

        // Configurar eventos
        this.setupEvents();

        // Verificar parâmetro
        const params = new URLSearchParams(window.location.search);
        const franqueado = params.get('franqueado');

        if (franqueado) {
            // Modo franqueado
            await FRANCHISEE.init(franqueado);
            this.currentView = 'franchisee';
        } else {
            // Modo matriz
            await MATRIX.init();
            this.currentView = 'matrix';
        }

        // Esconder loading
        setTimeout(() => {
            document.getElementById('loading').classList.add('hidden');
        }, 500);
    },

    // Configurar eventos
    setupEvents() {
        // Botão voltar
        document.getElementById('btnBack').addEventListener('click', () => {
            if (this.currentView === 'franchisee') {
                const params = new URLSearchParams(window.location.search);
                if (params.get('franqueado')) {
                    // Se está em uma sub-tela, volta para home do franqueado
                    const slug = params.get('franqueado');
                    const f = (UTILS.load('franchisees') || []).find(f => f.slug === slug);
                    if (f) {
                        // Verificar se estamos em uma sub-tela
                        const main = document.getElementById('mainContent');
                        const hasBackToHome = main.querySelector('.btn-full[onclick*="FRANCHISEE.goHome"]');
                        if (hasBackToHome) {
                            // Já está na home do franqueado, volta para matriz
                            this.goHome();
                        } else {
                            FRANCHISEE.goHome();
                        }
                    } else {
                        this.goHome();
                    }
                } else {
                    this.goHome();
                }
            } else {
                // Recarregar sem parâmetros
                window.location.href = window.location.pathname;
            }
        });

        // Botão refresh
        document.getElementById('btnRefresh').addEventListener('click', () => {
            UTILS.toast('🔄 Atualizando...', 'info');
            setTimeout(() => window.location.reload(), 300);
        });

        // Modal close
        document.getElementById('modalClose').addEventListener('click', UTILS.closeModal);
        document.getElementById('modalOverlay').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) UTILS.closeModal();
        });

        // Tecla ESC fecha modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') UTILS.closeModal();
        });
    },

    // Voltar para a matriz
    goHome() {
        window.location.href = window.location.pathname;
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
    navigator.serviceWorker.register('/sw.js')
        .then(() => console.log('✅ Service Worker registrado'))
        .catch(err => console.warn('⚠️ SW não registrado:', err));
}
