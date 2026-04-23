// ===== CONFIG =====
const SUPABASE_URL = 'SUA_URL_AQUI';
const SUPABASE_KEY = 'SUA_KEY_AQUI';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ===== TABS CONFIG =====
const TABS = {
    tests: {
        table: 'tasks',
        columns: [
            { id: 'todo', title: 'A TESTAR', emoji: '🧪' },
            { id: 'doing', title: 'TESTANDO', emoji: '🔥' },
            { id: 'done', title: 'TESTADO', emoji: '✅' },
        ],
        addStatus: 'todo',
        statusOrder: ['todo', 'doing', 'done'],
    },
    bugs: {
        table: 'bugs',
        columns: [
            { id: 'reported', title: 'REPORTADO', emoji: '🐛' },
            { id: 'fixing', title: 'CORRIGINDO', emoji: '🔧' },
            { id: 'fixed', title: 'CORRIGIDO', emoji: '✅' },
        ],
        addStatus: 'reported',
        statusOrder: ['reported', 'fixing', 'fixed'],
    },
    improvements: {
        table: 'improvements',
        columns: [
            { id: 'suggested', title: 'SUGERIDO', emoji: '💡' },
            { id: 'planned', title: 'PLANEJADO', emoji: '📋' },
            { id: 'done', title: 'IMPLEMENTADO', emoji: '✅' },
        ],
        addStatus: 'suggested',
        statusOrder: ['suggested', 'planned', 'done'],
    },
};

const COLORS = ['color-lime', 'color-pink', 'color-yellow', 'color-cyan'];

// ===== STATE =====
let activeTab = 'tests';
let items = [];
let deleteId = null;

// ===== DOM =====
const boardEl = document.getElementById('board');
const loadingEl = document.getElementById('loading');
const confirmDialog = document.getElementById('confirm-dialog');

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
    setupTabs();
    loadTab(activeTab);
    setupRealtimeAll();
    setupConfirmDialog();
});

// ===== TABS =====
function setupTabs() {
    document.querySelectorAll('.tab').forEach((btn) => {
        btn.addEventListener('click', () => {
            activeTab = btn.dataset.tab;
            document.querySelectorAll('.tab').forEach((b) => b.classList.remove('active'));
            btn.classList.add('active');
            loadTab(activeTab);
        });
    });
}

// ===== LOAD DATA =====
async function loadTab(tab) {
    loadingEl.classList.remove('hidden');
    boardEl.innerHTML = '';

    const config = TABS[tab];
    const { data, error } = await supabase
        .from(config.table)
        .select('*')
        .order('created_at', { ascending: true });

    if (error) {
        console.error('Erro ao carregar:', error);
        loadingEl.textContent = 'Erro ao carregar dados ❌';
        return;
    }

    items = data || [];
    loadingEl.classList.add('hidden');
    renderBoard();
    updateCounts();
}

// ===== RENDER =====
function renderBoard() {
    const config = TABS[activeTab];
    boardEl.innerHTML = '';

    config.columns.forEach((col) => {
        const colItems = items.filter((item) => item.status === col.id);
        const colEl = createColumn(col, colItems, config);
        boardEl.appendChild(colEl);
    });
}

function createColumn(col, colItems, config) {
    const div = document.createElement('div');
    div.className = 'column';
    div.dataset.status = col.id;

    // Header
    const header = document.createElement('div');
    header.className = 'column-header';
    header.innerHTML = `
        <span>${col.emoji}</span>
        <h2>${col.title}</h2>
        <span class="column-count">${colItems.length}</span>
    `;
    div.appendChild(header);

    // Add form (only on first column)
    if (col.id === config.addStatus) {
        div.appendChild(createAddForm(config));
    }

    // Cards
    colItems.forEach((item) => {
        div.appendChild(createCard(item, config));
    });

    return div;
}

function createAddForm(config) {
    const form = document.createElement('div');
    form.className = 'add-form';

    const row = document.createElement('div');
    row.className = 'add-row';

    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Novo item...';

    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'btn-toggle';
    toggleBtn.textContent = '▼';

    const addBtn = document.createElement('button');
    addBtn.className = 'btn-add';
    addBtn.textContent = '+';

    row.appendChild(input);
    row.appendChild(toggleBtn);
    row.appendChild(addBtn);
    form.appendChild(row);

    const textarea = document.createElement('textarea');
    textarea.placeholder = 'Descrição (passos, resultado esperado...)';
    textarea.rows = 2;
    form.appendChild(textarea);

    // Toggle description
    toggleBtn.addEventListener('click', () => {
        textarea.classList.toggle('show');
        toggleBtn.textContent = textarea.classList.contains('show') ? '▲' : '▼';
    });

    // Add item
    const handleAdd = async () => {
        const text = input.value.trim();
        if (!text) return;

        const color = COLORS[Math.floor(Math.random() * COLORS.length)];
        const { error } = await supabase.from(config.table).insert({
            text: text,
            description: textarea.value.trim(),
            status: config.addStatus,
            color: color,
        });

        if (error) {
            console.error('Erro ao adicionar:', error);
            return;
        }

        input.value = '';
        textarea.value = '';
        textarea.classList.remove('show');
        toggleBtn.textContent = '▼';
    };

    addBtn.addEventListener('click', handleAdd);
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') handleAdd();
    });

    return form;
}

function createCard(item, config) {
    const card = document.createElement('div');
    card.className = `card ${item.color || 'color-lime'}`;

    const statusIdx = config.statusOrder.indexOf(item.status);
    const isDone = statusIdx === config.statusOrder.length - 1;

    // Top row: text + desc button + delete
    const top = document.createElement('div');
    top.className = 'card-top';

    const textEl = document.createElement('span');
    textEl.className = 'card-text' + (isDone ? ' done' : '');
    textEl.textContent = item.text;
    top.appendChild(textEl);

    if (item.description) {
        const descBtn = document.createElement('button');
        descBtn.className = 'btn-desc';
        descBtn.textContent = '📄';
        top.appendChild(descBtn);

        const descEl = document.createElement('div');
        descEl.className = 'card-description';
        descEl.textContent = item.description;
        card.appendChild(top);
        card.appendChild(descEl);

        descBtn.addEventListener('click', () => {
            descEl.classList.toggle('show');
        });
    } else {
        card.appendChild(top);
    }

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn-x';
    deleteBtn.textContent = '✕';
    deleteBtn.addEventListener('click', () => showConfirm(item.id, config.table));
    top.appendChild(deleteBtn);

    // Move buttons
    const actions = document.createElement('div');
    actions.className = 'card-actions';

    if (statusIdx > 0) {
        const prevStatus = config.statusOrder[statusIdx - 1];
        const btnLeft = document.createElement('button');
        btnLeft.className = 'btn-move';
        btnLeft.textContent = '◀ ' + prevStatus.toUpperCase();
        btnLeft.addEventListener('click', () => moveItem(item.id, prevStatus, config.table));
        actions.appendChild(btnLeft);
    }

    if (statusIdx < config.statusOrder.length - 1) {
        const nextStatus = config.statusOrder[statusIdx + 1];
        const btnRight = document.createElement('button');
        btnRight.className = 'btn-move';
        btnRight.textContent = nextStatus.toUpperCase() + ' ▶';
        btnRight.addEventListener('click', () => moveItem(item.id, nextStatus, config.table));
        actions.appendChild(btnRight);
    }

    card.appendChild(actions);
    return card;
}

// ===== ACTIONS =====
async function moveItem(id, newStatus, table) {
    const { error } = await supabase.from(table).update({ status: newStatus }).eq('id', id);
    if (error) console.error('Erro ao mover:', error);
}

async function deleteItem(id, table) {
    const { error } = await supabase.from(table).delete().eq('id', id);
    if (error) console.error('Erro ao excluir:', error);
}

// ===== CONFIRM DIALOG =====
function setupConfirmDialog() {
    document.getElementById('confirm-cancel').addEventListener('click', () => {
        confirmDialog.classList.add('hidden');
        deleteId = null;
    });

    document.getElementById('confirm-ok').addEventListener('click', async () => {
        if (deleteId) {
            await deleteItem(deleteId.id, deleteId.table);
            deleteId = null;
        }
        confirmDialog.classList.add('hidden');
    });
}

function showConfirm(id, table) {
    deleteId = { id, table };
    confirmDialog.classList.remove('hidden');
}

// ===== REALTIME =====
function setupRealtimeAll() {
    ['tasks', 'bugs', 'improvements'].forEach((table) => {
        supabase
            .channel(table + '-realtime')
            .on('postgres_changes', { event: '*', schema: 'public', table: table }, () => {
                // Reload only if this table matches the active tab
                const config = TABS[activeTab];
                if (config.table === table) {
                    loadTab(activeTab);
                } else {
                    // Update counts for other tabs
                    updateCountForTable(table);
                }
            })
            .subscribe();
    });
}

async function updateCountForTable(table) {
    const { count } = await supabase.from(table).select('*', { count: 'exact', head: true });
    const tabName = Object.keys(TABS).find((key) => TABS[key].table === table);
    if (tabName) {
        document.getElementById('count-' + tabName).textContent = count || 0;
    }
}

function updateCounts() {
    // Update active tab count from loaded items
    document.getElementById('count-' + activeTab).textContent = items.length;

    // Fetch counts for other tabs
    Object.keys(TABS).forEach((tab) => {
        if (tab !== activeTab) {
            updateCountForTable(TABS[tab].table);
        }
    });
}
