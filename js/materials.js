// ============================================
// KONECTA PARTNER - MATERIAIS
// ============================================

const MATERIALS = {
    categories: [
        { id: 'vender', label: '💡 Como vender', items: [
            'Apresentação comercial Konecta',
            'Script de abordagem',
            'Diferenciais competitivos',
            'Cases de sucesso'
        ]},
        { id: 'instalar', label: '🔧 Como instalar', items: [
            'Manual de instalação',
            'Vídeo passo a passo',
            'Checklist de instalação',
            'Ferramentas necessárias'
        ]},
        { id: 'apresentar', label: '📊 Como apresentar a Konecta', items: [
            'Deck de apresentação',
            'Demonstração ao vivo',
            'Perguntas frequentes',
            'Argumentos de venda'
        ]},
        { id: 'dicas', label: '💎 Dicas importantes', items: [
            'Melhores práticas',
            'Atendimento ao cliente',
            'Pós-venda',
            'Networking'
        ]},
        { id: 'pdfs', label: '📁 PDFs', items: [
            'Catálogo de produtos',
            'Ficha técnica',
            'Termo de garantia',
            'Contrato modelo'
        ]},
        { id: 'artes', label: '🎨 Artes', items: [
            'Logo em alta resolução',
            'Artes para redes sociais',
            'Banners promocionais',
            'Material gráfico'
        ]}
    ],

    render() {
        const main = document.getElementById('mainContent');
        document.getElementById('btnBack').style.display = 'flex';

        main.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <span class="card-title">📚 Materiais</span>
                    <span class="card-subtitle">Conteúdos para franqueados</span>
                </div>
                ${this.categories.map(cat => `
                    <div style="margin-bottom:16px;">
                        <h4 style="font-size:14px;font-weight:600;color:var(--gold);margin-bottom:8px;">${cat.label}</h4>
                        <div style="display:flex;flex-wrap:wrap;gap:6px;">
                            ${cat.items.map(item => `
                                <span style="background:var(--bg-input);padding:6px 12px;border-radius:var(--radius);font-size:12px;color:var(--text-secondary);border:var(--border-light);cursor:pointer;" 
                                      onclick="UTILS.toast('📄 ${item} - Em breve disponível')">
                                    ${item}
                                </span>
                            `).join('')}
                        </div>
                    </div>
                `).join('')}
                <p class="text-muted" style="font-size:12px;margin-top:12px;text-align:center;">
                    Clique em um item para visualizar. Novos materiais serão adicionados em breve.
                </p>
            </div>
            <button class="btn btn-secondary btn-full" onclick="FRANCHISEE.goHome()">← Voltar</button>
        `;
    }
};
