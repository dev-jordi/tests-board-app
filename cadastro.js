// ===== CONFIG DO SUPABASE =====
var SUPABASE_URL = 'https://etwubdlpsspdfbatjgib.supabase.co';
var SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV0d3ViZGxwc3NwZGZiYXRqZ2liIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkwNjQzNTksImV4cCI6MjA5NDY0MDM1OX0.wgHr2mS_b92uwwKQA_2EpJdWKL-a7KBC7380Wrn-YpM';
var supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ===== ELEMENTOS DO DOM =====
var form = document.getElementById('form-cadastro');
var inputEmail = document.getElementById('email');
var inputSenha = document.getElementById('senha');
var inputConfirmar = document.getElementById('confirmar');
var erroMsg = document.getElementById('erro');
var sucessoMsg = document.getElementById('sucesso');

// ===== EVENTO DE SUBMIT =====
form.addEventListener('submit', function(e) {
    e.preventDefault();
    var email = inputEmail.value;
    var senha = inputSenha.value;
    var confirmar = inputConfirmar.value;

    erroMsg.classList.add('escondido');
    sucessoMsg.classList.add('escondido');

    if (senha !== confirmar) {
        erroMsg.textContent = 'As senhas não coincidem.';
        erroMsg.classList.remove('escondido');
        return;
    }

    if (senha.length < 6) {
        erroMsg.textContent = 'A senha precisa ter pelo menos 6 caracteres.';
        erroMsg.classList.remove('escondido');
        return;
    }

    fazerCadastro(email, senha);
});

// ===== FUNÇÃO DE CADASTRO =====
async function fazerCadastro(email, senha) {
    var resultado = await supabase.auth.signUp({
        email: email,
        password: senha
    });

    if (resultado.error) {
        erroMsg.textContent = resultado.error.message;
        erroMsg.classList.remove('escondido');
        return;
    }

    sucessoMsg.textContent = 'Conta criada! Verifique seu e-mail para confirmar.';
    sucessoMsg.classList.remove('escondido');
    form.reset();
}
