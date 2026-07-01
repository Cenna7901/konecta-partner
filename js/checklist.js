// ============================================
// KONECTA PARTNER - CHECKLIST DE IMPLANTAÇÃO
// ============================================

const CHECKLIST = {
    slug: null,
    clients: [],
    checklists: [],
    saveCallback: null,

    // Itens padrão do checklist
    defaultItems: [
        'Contrato',
        'Pagamento',
        'Displays',
        'Mini-site',
        'Revenue',
        'Treinamento',
        'Entrega'
    ],

    render(slug, clients, checklists, saveCallback) {
        this.slug = slug;
        this.clients = clients;
        this.checklists = checklists;
        this.saveCallback = saveCallback;
        this.renderList();
    },

    renderList() {
        const main = document.getElementById('mainContent');
        document.getElementById('btnBack').style.display = 'flex';

        // Verificar se há checklists existentes
        const hasChecklists = this.checklists.length > 0;

        main.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <span class="card-title">✅ Checklist de Implantação</span>
                    <button class="btn btn-primary btn-sm" onclick="CHECKLIST.showNewChecklist()">+ Novo</button>
                </div>
                ${hasChecklists ? `
                    <div class="table-responsive">
                        <table>
                            <thead>
                                <tr>
                                    <th>Cliente</th>
                                    <th>Progresso</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${this.checklists.map((c, i) => {
                                    const done = c.items.filter(item => item.done).length;
                                    const total = c.items.length;
                                    const progress = total > 0 ? Math.round((done/total)*100) : 0;
                                    const client = this.clients.find(cl => cl.id === c.clientId);
                                    return `
                                        <tr>
                                            <td><strong>${client ? client.empresa : 'Cliente removido'}</strong></td>
                                            <td>
                                                <div style="display:flex;align-items:center;gap:8px;">
                                                    <div style="flex:1;height:4px;background:var(--bg-input);border-radius:4px;overflow:hidden;">
                                                        <div style="width:${progress}%;height:100%;background:var(--gold);border-radius:4px;"></div>
                                                    </div>
                                                    <span style="font-size:12px;color:var(--text-secondary)">${progress}%</span>
                                                </div>
                                            </td>
                                            <td>
                                                <div class="flex" style="gap:4px;">
                                                    <button class="btn btn-secondary btn-sm" onclick="CHECKLIST.viewChecklist(${i})">👁️</button>
                                                    <button class="btn btn-danger btn-sm" onclick="CHECKLIST.deleteChecklist(${i})">🗑️</button>
                                                </div>
                                            </td>
                                        </tr>
                                    `;
                                }).join('')}
                            </tbody>
                        </table>
                    </div>
                ` : `
                    <p class="text-center text-muted" style="padding:20px 0;">
                        Nenhum checklist iniciado.
                        <br>Clique em "Novo" para começar.
                    </p>
                `}
            </div>
            <button class="btn btn-secondary btn-full" onclick="FRANCHISEE.goHome()">← Voltar</button>
        `;
    },

    showNewChecklist() {
        if (this.clients.length === 0) {
            UTILS.toast('Cadastre um cliente primeiro', 'error');
            return;
        }

        const modal = document.getElementById('modalOverlay');
        document.getElementById('modalTitle').textContent = '📋 Novo Checklist';

        document.getElementById('modalBody').innerHTML = `
            <form id="checklistForm" onsubmit="CHECKLIST.createChecklist(event)">
                <div class="form-group">
                    <label class="form-label">Cliente *</label>
                    <select class="form-control" id="clClient" required>
                        <option value="">Selecione um cliente</option>
                        ${this.clients.map(c => `
                            <option value="${c.id}">${c.empresa} - ${c.responsavel}</option>
                        `).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">Itens do Checklist</label>
                    <div style="background:var(--bg-input);border-radius:var(--radius);padding:12px;">
                        ${this.defaultItems.map(item => `
                            <label style="display:flex;align-items:center;gap:8px;padding:4px 0;font-size:13px;cursor:pointer;">
                                <input type="checkbox" checked value="${item}">
                                ${item}
                            </label>
                        `).join('')}
                    </div>
                    <small class="text-muted" style="font-size:11px;">Desmarque itens que não se aplicam</small>
                </div>
                <div class="flex" style="gap:8px;margin-top:8px;">
                    <button type="submit" class="btn btn-primary btn-full">✅ Criar Checklist</button>
                    <button type="button" class="btn btn-secondary" onclick="UTILS.closeModal()">Cancelar</button>
                </div>
            </form>
        `;

        modal.style.display = 'flex';
    },

    createChecklist(e) {
        e.preventDefault();
        const clientId = document.getElementById('clClient').value;
        if (!clientId) {
            UTILS.toast('Selecione um cliente', 'error');
            return;
        }

        const checkboxes = document.querySelectorAll('#checklistForm input[type="checkbox"]');
        const items = Array.from(checkboxes)
            .filter(cb => cb.checked)
            .map(cb => ({
                label: cb.value,
                done: false
            }));

        if (items.length === 0) {
            UTILS.toast('Selecione pelo menos um item', 'error');
            return;
        }

        this.checklists.push({
            id: UTILS.uid(),
            clientId: clientId,
            items: items,
            createdAt: new Date().toISOString()
        });

        this.saveCallback();
        UTILS.closeModal();
        this.renderList();
        UTILS.toast('Checklist criado!', 'success');
    },

    viewChecklist(index) {
        const checklist = this.checklists[index];
        if (!checklist) return;

        const client = this.clients.find(c => c.id === checklist.clientId);
        const done = checklist.items.filter(item => item.done).length;
        const total = checklist.items.length;

        const modal = document.getElementById('modalOverlay');
        document.getElementById('modalTitle').textContent = `📋 ${client ? client.empresa : 'Checklist'}`;

        document.getElementById('modalBody').innerHTML = `
            <div style="margin-bottom:16px;">
                <div class="flex-between">
                    <span class="text-secondary">Progresso:</span>
                    <span>${done}/${total} (${Math.round((done/total)*100)}%)</span>
                </div>
                <div style="width:100%;height:6px;background:var(--bg-input);border-radius:4px;overflow:hidden;margin-top:4px;">
                    <div style="width:${Math.round((done/total)*100)}%;height:100%;background:var(--gold);border-radius:4px;transition:width 0.3s;"></div>
                </div>
            </div>
            <div style="border-top:var(--border-light);padding-top:12px;">
                ${checklist.items.map((item, i) => `
                    <div class="checklist-item">
                        <label class="check-label" style="cursor:pointer;">
                            <input type="checkbox" ${item.done ? 'checked' : ''} 
                                   onchange="CHECKLIST.toggleItem(${index}, ${i})">
                            <span style="${item.done ? 'text-decoration:line-through;color:var(--text-muted);' : ''}">${item.label}</span>
                        </label>
                        <span class="check-status ${item.done ? 'text-green' : 'text-muted'}">
                            ${item.done ? '✅ Concluído' : '⏳ Pendente'}
                        </span>
                    </div>
                `).join('')}
            </div>
            <div class="flex" style="gap:8px;margin-top:16px;">
                <button class="btn btn-secondary btn-full" onclick="UTILS.closeModal();CHECKLIST.renderList();">Fechar</button>
            </div>
        `;

        modal.style.display = 'flex';
    },

    toggleItem(checklistIndex, itemIndex) {
        const checklist = this.checklists[checklistIndex];
        if (!checklist) return;

        checklist.items[itemIndex].done = !checklist.items[itemIndex].done;
        this.saveCallback();

        // Atualizar view se estiver aberta
        this.viewChecklist(checklistIndex);
    },

    deleteChecklist(index) {
        if (!confirm('Remover este checklist?')) return;
        this.checklists.splice(index, 1);
        this.saveCallback();
        this.renderList();
        UTILS.toast('Checklist removido', 'success');
    }
};
