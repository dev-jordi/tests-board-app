// ===== CONFIG DO SUPABASE =====
// Mesmas credenciais usadas no app.js
const SUPABASE_URL = 'SUA_URL_AQUI';
const SUPABASE_KEY = 'SUA_KEY_AQUI';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ===== ELEMENTOS DO DOM =====
var form = document.getElementById('form-login');
var inputEmail = document.getElementById('email');
var inputSenha = document.getElementById('senha');
var erroMsg = document.getElementById('erro');

// ===== EVENTO DE SUBMIT =====
// Quando o usuário clica em "Entrar"
form.addEventListener('submit', function(e) {
    // Impede o formulário de recarregar a página
    e.preventDefault();

    // Pega os valores digitados
    var email = inputEmail.value;
    var senha = inputSenha.value;

    // Esconde mensagem de erro anterior
    erroMsg.classList.add('escondido');

    // Tenta fazer login no Supabase
    fazerLogin(email, senha);
});

// ===== FUNÇÃO DE LOGIN =====
// Usa o Supabase Auth para autenticar com email e senha
async function fazerLogin(email, senha) {
    var resultado = await supabase.auth.signInWithPassword({
        email: email,
        password: senha
    });

    // Se deu erro, mostra a mensagem
    if (resultado.error) {
        erroMsg.textContent = resultado.error.message;
        erroMsg.classList.remove('escondido');
        return;
    }

    // Se deu certo, redireciona para o board
    window.location.href = 'index.html';
}

// ===== VERIFICAR SE JÁ ESTÁ LOGADO =====
// Se o usuário já tem sessão ativa, vai direto pro board
async function verificarSessao() {
    var sessao = await supabase.auth.getSession();

    if (sessao.data.session) {
        window.location.href = 'index.html';
    }
}

// Verifica ao carregar a página
verificarSessao();
