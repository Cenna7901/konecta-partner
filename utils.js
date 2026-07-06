// ============================================
// KONECTA PARTNER - UTILIDADES
// ============================================

const UTILS = {
    remoteFranchiseesUrl: 'https://raw.githubusercontent.com/cenna7901/konecta-partner/main/public/franqueados.json',

    // Gerar ID único
    uid() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    },

    // Formatar data
    formatDate(date) {
        if (!date) return '-';
        const d = new Date(date);
        return d.toLocaleDateString('pt-BR');
    },

    // Formatar moeda
    formatCurrency(value) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    },

    // Slugify
    slugify(text) {
        return text
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');
    },

    // Salvar no localStorage
    save(key, data) {
        try {
            localStorage.setItem(`konecta_${key}`, JSON.stringify(data));
        } catch (e) {
            console.error('Erro ao salvar:', e);
        }
    },

    // Carregar do localStorage
    load(key, defaultValue = null) {
        try {
            const data = localStorage.getItem(`konecta_${key}`);
            return data ? JSON.parse(data) : defaultValue;
        } catch (e) {
            console.error('Erro ao carregar:', e);
            return defaultValue;
        }
    },

    // Remover do localStorage
    remove(key) {
        localStorage.removeItem(`konecta_${key}`);
    },

    // Buscar franqueados do JSON público
    async fetchFranchisees() {
        const remoteUrl = this.remoteFranchiseesUrl;
        const localUrl = './public/franqueados.json';

        try {
            const response = await fetch(`${remoteUrl}?v=${Date.now()}`, { cache: 'no-store' });
            if (!response.ok) throw new Error('Erro ao carregar franqueados');
            return await response.json();
        } catch (e) {
            console.warn('Erro fetch franqueados remoto, usando local:', e);
            try {
                const response = await fetch(localUrl);
                if (!response.ok) throw new Error('Erro ao carregar franqueados local');
                return await response.json();
            } catch (localError) {
                console.error('Erro fetch franqueados:', localError);
                return [];
            }
        }
    },

    // Gerar PDF (usando jsPDF ou similar - simplificado)
    generatePDF(content, filename) {
        // Placeholder - aqui você pode integrar com jsPDF
        // Por enquanto, usamos print
        const win = window.open('', '_blank');
        if (!win) {
            alert('Permita pop-ups para gerar o PDF');
            return;
        }
        win.document.write(`
            <html>
                <head><title>${filename}</title>
                <style>
                    body { font-family: 'Inter', sans-serif; padding: 40px; color: #1a1a2e; }
                    h1 { color: #E6B35A; }
                    .card { background: #f5f3ee; padding: 20px; border-radius: 6px; margin: 10px 0; }
                    .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #ddd; }
                    .total { font-size: 20px; font-weight: 700; color: #E6B35A; }
                </style>
                </head>
                <body>
                    ${content}
                    <p style="margin-top:40px;color:#999;font-size:12px;">Konecta Partner - Proposta gerada em ${new Date().toLocaleDateString('pt-BR')}</p>
                </body>
            </html>
        `);
        win.document.close();
        win.print();
    },

    // Copiar texto
    copyText(text) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            return navigator.clipboard.writeText(text);
        }
        // Fallback
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        return Promise.resolve();
    },

    // Mostrar toast (notificação simples)
    toast(message, type = 'info') {
        const existing = document.querySelector('.toast-container');
        if (existing) existing.remove();

        const container = document.createElement('div');
        container.className = 'toast-container';
        container.style.cssText = `
            position: fixed;
            bottom: 80px;
            left: 50%;
            transform: translateX(-50%);
            background: ${type === 'success' ? 'var(--status-green)' : 'var(--bg-card)'};
            color: ${type === 'success' ? 'var(--bg-primary)' : 'var(--text-primary)'};
            padding: 12px 24px;
            border-radius: var(--radius);
            font-family: var(--font);
            font-size: 13px;
            font-weight: 500;
            z-index: 9999;
            border: var(--border);
            max-width: 90%;
            box-shadow: 0 8px 30px rgba(0,0,0,0.5);
            animation: fadeIn 0.3s ease;
        `;
        container.textContent = message;
        document.body.appendChild(container);

        setTimeout(() => {
            container.style.opacity = '0';
            container.style.transition = 'opacity 0.3s ease';
            setTimeout(() => container.remove(), 300);
        }, 3000);
    }
};

// Exportar para uso
window.UTILS = UTILS;
