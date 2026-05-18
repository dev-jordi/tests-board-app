// ===== CONFIG DO SUPABASE =====
var SUPABASE_URL = 'https://etwubdlpsspdfbatjgib.supabase.co';
var SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV0d3ViZGxwc3NwZGZiYXRqZ2liIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkwNjQzNTksImV4cCI6MjA5NDY0MDM1OX0.wgHr2mS_b92uwwKQA_2EpJdWKL-a7KBC7380Wrn-YpM';
var supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ===== ELEMENTOS DO DOM =====
var form = document.getElementById('form-login');
var inputEmail = document.getElementById('email');
var inputSenha = document.getElementById('senha');
var erroMsg = document.getElementById('erro');

// ===== EVENTO DE SUBMIT =====
form.addEventListener('submit', function(e) {
    e.preventDefault();
    var email = inputEmail.value;
    var senha = inputSenha.value;
    erroMsg.classList.add('escondido');
    fazerLogin(email, senha);
});

// ===== FUNÇÃO DE LOGIN =====
async function fazerLogin(email, senha) {
    var resultado = await supabase.auth.signInWithPassword({
        email: email,
        password: senha
    });

    if (resultado.error) {
        erroMsg.textContent = resultado.error.message;
        erroMsg.classList.remove('escondido');
        return;
    }

    window.location.href = 'index.html';
}

// ===== VERIFICAR SE JÁ ESTÁ LOGADO =====
async function verificarSessao() {
    var sessao = await supabase.auth.getSession();
    if (sessao.data.session) {
        window.location.href = 'index.html';
    }
}
verificarSessao();
