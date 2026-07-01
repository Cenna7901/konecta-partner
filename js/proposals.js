// ============================================
// KONECTA PARTNER - GERADOR DE PROPOSTAS
// ============================================

const PROPOSALS = {
    slug: null,
    clients: [],
    proposals: [],
    saveCallback: null,

    render(slug, clients, proposals, saveCallback) {
        this.slug = slug;
        this.clients = clients;
        this.proposals = proposals;
        this.saveCallback = saveCallback;
        this.renderList();
    },

    renderList() {
        const main = document.getElementById('mainContent');
        document.getElementById('btnBack').style.display = 'flex';

        const clientOptions = this.clients.map(c =>
            `<option value="${c.id}">${c.empresa} - ${c.responsavel}</option>`
        ).join('');

        main.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <span class="card-title">📄 Propostas</span>
                    <button class="btn btn-primary btn-sm" onclick="PROPOSALS.showGenerator()">+ Nova</button>
                </div>
                <p class="text-secondary" style="font-size:13px;margin-bottom:12px;">
                    Selecione um cliente e gere a proposta automaticamente.
                </p>
                <form id="proposalForm" onsubmit="PROPOSALS.generate(event)">
                    <div class="form-group">
                        <label class="form-label">Cliente *</label>
                        <select class="form-control" id="pCliente" required>
                            <option value="">Selecione um cliente</option>
                            ${clientOptions}
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Quantidade de Displays</label>
                        <input class="form-control" id="pDisplays" type="number" value="1" min="1" onchange="PROPOSALS.updateCalc()">
                    </div>
                    <div style="background:var(--bg-input);border-radius:var(--radius);padding:16px;margin:12px 0;">
                        <div class="flex-between" style="padding:4px 0;">
                            <span class="text-secondary">Valor por display:</span>
                            <span>R$ 20,00</span>
                        </div>
                        <div class="flex-between" style="padding:4px 0;">
                            <span class="text-secondary">Taxa fixa:</span>
                            <span>R$ 500,00</span>
                        </div>
                        <div class="flex-between" style="padding:4px 0;">
                            <span class="text-secondary">Assinatura mensal:</span>
                            <span>R$ 497,00</span>
                        </div>
                        <div class="flex-between" style="padding:8px 0;border-top:var(--border-light);font-weight:700;font-size:16px;">
                            <span>Total da implementação:</span>
                            <span class="text-gold" id="pTotal">R$ 0,00</span>
                        </div>
                        <div class="flex-between" style="padding:4px 0;font-size:14px;">
                            <span class="text-secondary">Entrada (50%):</span>
                            <span id="pEntrada">R$ 0,00</span>
                        </div>
                        <div class="flex-between" style="padding:4px 0;font-size:14px;">
                            <span class="text-secondary">Saldo (50%):</span>
                            <span id="pSaldo">R$ 0,00</span>
                        </div>
                    </div>
                    <div class="flex" style="gap:8px;">
                        <button type="submit" class="btn btn-primary btn-full">📄 Gerar PDF</button>
                        <button type="button" class="btn btn-secondary" onclick="PROPOSALS.downloadPDF()">⬇️ Baixar PDF</button>
                    </div>
                </form>
            </div>
            <button class="btn btn-secondary btn-full" onclick="FRANCHISEE.goHome()">← Voltar</button>
        `;

        // Atualizar cálculos
        this.updateCalc();
    },

    updateCalc() {
        const displays = parseInt(document.getElementById('pDisplays').value) || 1;
        const valorDisplay = 20;
        const taxaFixa = 500;
        const assinatura = 497;

        const totalDisplays = displays * valorDisplay;
        const total = totalDisplays + taxaFixa + assinatura;
        const entrada = total * 0.5;
        const saldo = total * 0.5;

        document.getElementById('pTotal').textContent = UTILS.formatCurrency(total);
        document.getElementById('pEntrada').textContent = UTILS.formatCurrency(entrada);
        document.getElementById('pSaldo').textContent = UTILS.formatCurrency(saldo);
    },

    generate(e) {
        e.preventDefault();
        const clientId = document.getElementById('pCliente').value;
        const displays = parseInt(document.getElementById('pDisplays').value) || 1;

        if (!clientId) {
            UTILS.toast('Selecione um cliente', 'error');
            return;
        }

        const client = this.clients.find(c => c.id === clientId);
        if (!client) {
            UTILS.toast('Cliente não encontrado', 'error');
            return;
        }

        const valorDisplay = 20;
        const taxaFixa = 500;
        const assinatura = 497;
        const totalDisplays = displays * valorDisplay;
        const total = totalDisplays + taxaFixa + assinatura;
        const entrada = total * 0.5;
        const saldo = total * 0.5;

        // Gerar conteúdo do PDF
        const content = `
            <h1>Konecta Partner</h1>
            <h2>Proposta Comercial</h2>
            <p><strong>Cliente:</strong> ${client.empresa}</p>
            <p><strong>Responsável:</strong> ${client.responsavel}</p>
            <p><strong>Data:</strong> ${new Date().toLocaleDateString('pt-BR')}</p>
            <hr>
            <div class="card">
                <h3>Resumo da Proposta</h3>
                <div class="row"><span>${displays} display(s) x R$ 20,00</span><span>${UTILS.formatCurrency(totalDisplays)}</span></div>
                <div class="row"><span>Taxa fixa</span><span>${UTILS.formatCurrency(taxaFixa)}</span></div>
                <div class="row"><span>Assinatura mensal</span><span>${UTILS.formatCurrency(assinatura)}</span></div>
                <div class="row" style="font-weight:700;font-size:18px;border-bottom:2px solid #E6B35A;padding:12px 0;"><span>TOTAL</span><span>${UTILS.formatCurrency(total)}</span></div>
                <div class="row"><span>Entrada (50%)</span><span>${UTILS.formatCurrency(entrada)}</span></div>
                <div class="row"><span>Saldo (50%)</span><span>${UTILS.formatCurrency(saldo)}</span></div>
            </div>
            <p style="margin-top:20px;font-size:14px;color:#555;">
                <strong>Condições:</strong><br>
                • Entrada de 50% no momento da assinatura<br>
                • Saldo restante em 30 dias<br>
                • Implementação em até 15 dias úteis
            </p>
            <p style="margin-top:12px;font-size:12px;color:#999;">
                Proposta gerada automaticamente pelo sistema Konecta Partner.
            </p>
        `;

        this.lastPDFContent = content;
        UTILS.generatePDF(content, `proposta_${client.empresa}.pdf`);
        UTILS.toast('PDF gerado!', 'success');
    },

    downloadPDF() {
        if (this.lastPDFContent) {
            UTILS.generatePDF(this.lastPDFContent, `proposta_${Date.now()}.pdf`);
        } else {
            UTILS.toast('Gere uma proposta primeiro', 'error');
        }
    }
};
