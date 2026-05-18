// ===== CONFIG =====
var SUPABASE_URL = 'https://etwubdlpsspdfbatjgib.supabase.co';
var SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV0d3ViZGxwc3NwZGZiYXRqZ2liIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkwNjQzNTksImV4cCI6MjA5NDY0MDM1OX0.wgHr2mS_b92uwwKQA_2EpJdWKL-a7KBC7380Wrn-YpM';
var supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ===== PROTEÇÃO DE ROTA =====
async function verificarAuth() {
    var sessao = await supabase.auth.getSession();
    if (!sessao.data.session) {
        window.location.href = 'login.html';
    }
}
verificarAuth();

// ===== CONFIG DAS ABAS =====
var TABS = {
    tests: {
        table: 'tasks',
        columns: [
            { id: 'todo', title: 'A TESTAR', emoji: '🧪' },
            { id: 'doing', title: 'TESTANDO', emoji: '🔥' },
            { id: 'done', title: 'TESTADO', emoji: '✅' }
        ],
        addStatus: 'todo',
        statusOrder: ['todo', 'doing', 'done']
    },
    bugs: {
        table: 'bugs',
        columns: [
            { id: 'reported', title: 'REPORTADO', emoji: '🐛' },
            { id: 'fixing', title: 'CORRIGINDO', emoji: '🔧' },
            { id: 'fixed', title: 'CORRIGIDO', emoji: '✅' }
        ],
        addStatus: 'reported',
        statusOrder: ['reported', 'fixing', 'fixed']
    },
    improvements: {
        table: 'improvements',
        columns: [
            { id: 'suggested', title: 'SUGERIDO', emoji: '💡' },
            { id: 'planned', title: 'PLANEJADO', emoji: '📋' },
            { id: 'done', title: 'IMPLEMENTADO', emoji: '✅' }
        ],
        addStatus: 'suggested',
        statusOrder: ['suggested', 'planned', 'done']
    }
};

// ===== STATE =====
var activePage = 'dashboard';
var data = { tasks: [], bugs: [], improvements: [] };
var deleteId = null;

// ===== DOM =====
var confirmDialog = document.getElementById('confirm-dialog');

// ===== INIT =====
document.addEventListener('DOMContentLoaded', function() {
    setupNavigation();
    setupConfirmDialog();
    setupLogout();
    setupTheme();
    loadAllData();
    setupRealtimeAll();
});

// ===== NAVIGATION =====
function setupNavigation() {
    var items = document.querySelectorAll('.menu-item');
    items.forEach(function(item) {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            var page = item.dataset.page;
            activePage = page;

            // Update active class
            items.forEach(function(i) { i.classList.remove('active'); });
            item.classList.add('active');

            // Show/hide pages
            document.querySelectorAll('.page').forEach(function(p) { p.classList.add('escondido'); });
            document.getElementById('page-' + page).classList.remove('escondido');

            // Render board if needed
            if (page !== 'dashboard') {
                renderBoard(page);
            }
        });
    });
}

// ===== LOGOUT =====
function setupLogout() {
    document.getElementById('btn-logout').addEventListener('click', async function() {
        await supabase.auth.signOut();
        window.location.href = 'login.html';
    });
}

// ===== DARK MODE =====
function setupTheme() {
    var btn = document.getElementById('btn-theme');
    var saved = localStorage.getItem('theme');
    if (saved === 'dark') {
        document.body.classList.add('dark');
        btn.textContent = '☀️ Light Mode';
    }
    btn.addEventListener('click', function() {
        document.body.classList.toggle('dark');
        var isDark = document.body.classList.contains('dark');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        btn.textContent = isDark ? '☀️ Light Mode' : '🌙 Dark Mode';
    });
}

// ===== LOAD DATA =====
async function loadAllData() {
    var results = await Promise.all([
        supabase.from('tasks').select('*').order('created_at', { ascending: true }),
        supabase.from('bugs').select('*').order('created_at', { ascending: true }),
        supabase.from('improvements').select('*').order('created_at', { ascending: true })
    ]);

    data.tasks = results[0].data || [];
    data.bugs = results[1].data || [];
    data.improvements = results[2].data || [];

    renderDashboard();
}

// ===== DASHBOARD =====
function renderDashboard() {
    renderStats();
    renderResumo();
    renderRecentes();
}

function renderStats() {
    var grid = document.getElementById('stats-grid');
    var totalTests = data.tasks.length;
    var totalBugs = data.bugs.length;
    var totalImprovements = data.improvements.length;
    var testsDone = data.tasks.filter(function(t) { return t.status === 'done'; }).length;
    var bugsDone = data.bugs.filter(function(b) { return b.status === 'fixed'; }).length;
    var total = totalTests + totalBugs + totalImprovements;

    grid.innerHTML = ''
        + criarStatCard('📊', 'Total de Itens', total, 'em todas as categorias', 'stat-total')
        + criarStatCard('🧪', 'Testes', totalTests, testsDone + ' concluídos', 'stat-tests')
        + criarStatCard('🐛', 'Bugs', totalBugs, bugsDone + ' corrigidos', 'stat-bugs')
        + criarStatCard('💡', 'Melhorias', totalImprovements, 'sugestões registradas', 'stat-improvements');
}

function criarStatCard(icon, label, value, hint, cls) {
    return '<div class="stat-card ' + cls + '">'
        + '<div class="stat-icon">' + icon + '</div>'
        + '<div class="stat-label">' + label + '</div>'
        + '<div class="stat-value">' + value + '</div>'
        + '<div class="stat-hint">' + hint + '</div>'
        + '</div>';
}

function renderResumo() {
    var container = document.getElementById('resumo-status');
    var items = [
        { label: 'A Testar', count: data.tasks.filter(function(t) { return t.status === 'todo'; }).length, color: '#1877f2' },
        { label: 'Testando', count: data.tasks.filter(function(t) { return t.status === 'doing'; }).length, color: '#f39c12' },
        { label: 'Testado', count: data.tasks.filter(function(t) { return t.status === 'done'; }).length, color: '#27ae60' },
        { label: 'Bugs Reportados', count: data.bugs.filter(function(b) { return b.status === 'reported'; }).length, color: '#e74c3c' },
        { label: 'Bugs Corrigidos', count: data.bugs.filter(function(b) { return b.status === 'fixed'; }).length, color: '#27ae60' }
    ];

    var max = Math.max.apply(null, items.map(function(i) { return i.count; })) || 1;
    var html = '';

    items.forEach(function(item) {
        var pct = (item.count / max) * 100;
        html += '<div class="resumo-item">'
            + '<div class="resumo-label"><span>' + item.label + '</span><span>' + item.count + '</span></div>'
            + '<div class="resumo-bar"><div class="resumo-bar-fill" style="width:' + pct + '%;background:' + item.color + '"></div></div>'
            + '</div>';
    });

    container.innerHTML = html;
}

function renderRecentes() {
    var container = document.getElementById('itens-recentes');
    var todos = [];

    data.tasks.forEach(function(t) { todos.push({ text: t.text, type: 'tests', date: t.created_at }); });
    data.bugs.forEach(function(b) { todos.push({ text: b.text, type: 'bugs', date: b.created_at }); });
    data.improvements.forEach(function(i) { todos.push({ text: i.text, type: 'improvements', date: i.created_at }); });

    todos.sort(function(a, b) { return new Date(b.date) - new Date(a.date); });

    var html = '';
    var labels = { tests: '🧪 Teste', bugs: '🐛 Bug', improvements: '💡 Melhoria' };

    todos.slice(0, 8).forEach(function(item) {
        html += '<div class="item-recente">'
            + '<span class="badge badge-' + item.type + '">' + labels[item.type] + '</span>'
            + '<span>' + item.text + '</span>'
            + '</div>';
    });

    if (todos.length === 0) {
        html = '<p style="color:#606770;font-size:0.85rem;">Nenhum item ainda.</p>';
    }

    container.innerHTML = html;
}

// ===== PROGRESSO =====
function renderProgresso() {
    var container = document.getElementById('progresso-geral');
    var testsTotal = data.tasks.length;
    var testsDone = data.tasks.filter(function(t) { return t.status === 'done'; }).length;
    var bugsTotal = data.bugs.length;
    var bugsDone = data.bugs.filter(function(b) { return b.status === 'fixed'; }).length;
    var impTotal = data.improvements.length;
    var impDone = data.improvements.filter(function(i) { return i.status === 'done'; }).length;

    var items = [
        { label: '🧪 Testes concluídos', done: testsDone, total: testsTotal, color: '#6c5ce7' },
        { label: '🐛 Bugs corrigidos', done: bugsDone, total: bugsTotal, color: '#e74c3c' },
        { label: '💡 Melhorias implementadas', done: impDone, total: impTotal, color: '#f39c12' }
    ];

    var html = '';
    items.forEach(function(item) {
        var pct = item.total > 0 ? Math.round((item.done / item.total) * 100) : 0;
        html += '<div class="progresso-item">'
            + '<div class="progresso-top"><span class="progresso-label">' + item.label + '</span><span class="progresso-pct">' + pct + '%</span></div>'
            + '<div class="progresso-bar"><div class="progresso-bar-fill" style="width:' + pct + '%;background:' + item.color + '"></div></div>'
            + '</div>';
    });

    container.innerHTML = html;
}

// ===== ATALHOS =====
function setupAtalhos() {
    document.querySelectorAll('.atalho-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
            var page = btn.dataset.goto;
            document.querySelector('.menu-item[data-page="' + page + '"]').click();
        });
    });
}

// ===== BOARD RENDER =====
function renderBoard(tab) {
    var config = TABS[tab];
    var boardEl = document.getElementById('board-' + tab);
    var items = data[config.table] || [];
    boardEl.innerHTML = '';
    boardEl.className = 'board board-' + tab;

    config.columns.forEach(function(col) {
        var colItems = items.filter(function(item) { return item.status === col.id; });
        var colEl = criarColuna(col, colItems, config, tab);
        boardEl.appendChild(colEl);
    });
}

function criarColuna(col, colItems, config, tab) {
    var div = document.createElement('div');
    div.className = 'column';

    // Header
    var header = document.createElement('div');
    header.className = 'column-header';
    header.innerHTML = '<span>' + col.emoji + '</span><h4>' + col.title + '</h4><span class="column-count">' + colItems.length + '</span>';
    div.appendChild(header);

    // Add form (first column only)
    if (col.id === config.addStatus) {
        div.appendChild(criarFormAdd(config, tab));
    }

    // Cards
    colItems.forEach(function(item) {
        div.appendChild(criarCard(item, config, tab));
    });

    return div;
}

function criarFormAdd(config, tab) {
    var form = document.createElement('div');
    form.className = 'add-form';

    var row = document.createElement('div');
    row.className = 'add-row';

    var input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Novo item...';

    var toggleBtn = document.createElement('button');
    toggleBtn.className = 'btn-toggle';
    toggleBtn.textContent = '▼';

    var addBtn = document.createElement('button');
    addBtn.className = 'btn-add';
    addBtn.textContent = '+';

    row.appendChild(input);
    row.appendChild(toggleBtn);
    row.appendChild(addBtn);
    form.appendChild(row);

    var textarea = document.createElement('textarea');
    textarea.placeholder = 'Descrição (opcional)';
    textarea.rows = 2;
    form.appendChild(textarea);

    toggleBtn.addEventListener('click', function() {
        textarea.classList.toggle('show');
        toggleBtn.textContent = textarea.classList.contains('show') ? '▲' : '▼';
    });

    var handleAdd = async function() {
        var text = input.value.trim();
        if (!text) return;

        var resultado = await supabase.from(config.table).insert({
            text: text,
            description: textarea.value.trim(),
            status: config.addStatus
        });

        if (resultado.error) {
            console.error('Erro ao adicionar:', resultado.error);
            return;
        }

        input.value = '';
        textarea.value = '';
        textarea.classList.remove('show');
        toggleBtn.textContent = '▼';
    };

    addBtn.addEventListener('click', handleAdd);
    input.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') handleAdd();
    });

    return form;
}

function criarCard(item, config, tab) {
    var card = document.createElement('div');
    card.className = 'card';

    var statusIdx = config.statusOrder.indexOf(item.status);
    var isDone = statusIdx === config.statusOrder.length - 1;

    // Top
    var top = document.createElement('div');
    top.className = 'card-top';

    var textEl = document.createElement('span');
    textEl.className = 'card-text' + (isDone ? ' done' : '');
    textEl.textContent = item.text;
    top.appendChild(textEl);

    if (item.description) {
        var descBtn = document.createElement('button');
        descBtn.className = 'btn-desc';
        descBtn.textContent = '📄';
        top.appendChild(descBtn);

        var descEl = document.createElement('div');
        descEl.className = 'card-description';
        descEl.textContent = item.description;
        card.appendChild(top);
        card.appendChild(descEl);

        descBtn.addEventListener('click', function() {
            descEl.classList.toggle('show');
        });
    } else {
        card.appendChild(top);
    }

    var deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn-x';
    deleteBtn.textContent = '✕';
    deleteBtn.addEventListener('click', function() { showConfirm(item.id, config.table, tab); });
    top.appendChild(deleteBtn);

    // Move buttons
    var actions = document.createElement('div');
    actions.className = 'card-actions';

    if (statusIdx > 0) {
        var prevStatus = config.statusOrder[statusIdx - 1];
        var btnLeft = document.createElement('button');
        btnLeft.className = 'btn-move';
        btnLeft.textContent = '◀ ' + prevStatus.toUpperCase();
        btnLeft.addEventListener('click', function() { moveItem(item.id, prevStatus, config.table, tab); });
        actions.appendChild(btnLeft);
    }

    if (statusIdx < config.statusOrder.length - 1) {
        var nextStatus = config.statusOrder[statusIdx + 1];
        var btnRight = document.createElement('button');
        btnRight.className = 'btn-move';
        btnRight.textContent = nextStatus.toUpperCase() + ' ▶';
        btnRight.addEventListener('click', function() { moveItem(item.id, nextStatus, config.table, tab); });
        actions.appendChild(btnRight);
    }

    card.appendChild(actions);
    return card;
}

// ===== ACTIONS =====
async function moveItem(id, newStatus, table, tab) {
    var resultado = await supabase.from(table).update({ status: newStatus }).eq('id', id);
    if (resultado.error) console.error('Erro ao mover:', resultado.error);
}

async function deleteItem(id, table, tab) {
    var resultado = await supabase.from(table).delete().eq('id', id);
    if (resultado.error) console.error('Erro ao excluir:', resultado.error);
}

// ===== CONFIRM DIALOG =====
function setupConfirmDialog() {
    document.getElementById('confirm-cancel').addEventListener('click', function() {
        confirmDialog.classList.add('escondido');
        deleteId = null;
    });

    document.getElementById('confirm-ok').addEventListener('click', async function() {
        if (deleteId) {
            await deleteItem(deleteId.id, deleteId.table, deleteId.tab);
            deleteId = null;
        }
        confirmDialog.classList.add('escondido');
    });
}

function showConfirm(id, table, tab) {
    deleteId = { id: id, table: table, tab: tab };
    confirmDialog.classList.remove('escondido');
}

// ===== REALTIME =====
function setupRealtimeAll() {
    ['tasks', 'bugs', 'improvements'].forEach(function(table) {
        supabase
            .channel(table + '-realtime')
            .on('postgres_changes', { event: '*', schema: 'public', table: table }, function() {
                reloadTable(table);
            })
            .subscribe();
    });
}

async function reloadTable(table) {
    var resultado = await supabase.from(table).select('*').order('created_at', { ascending: true });
    data[table] = resultado.data || [];

    // Re-render dashboard
    renderDashboard();

    // Re-render board if active
    var tab = Object.keys(TABS).find(function(key) { return TABS[key].table === table; });
    if (tab && activePage === tab) {
        renderBoard(tab);
    }
}
