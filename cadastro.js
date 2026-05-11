// ===== CONFIG DO SUPABASE =====
var SUPABASE_URL = 'SUA_URL_AQUI';
var SUPABASE_KEY = 'SUA_KEY_AQUI';
var supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ===== ELEMENTOS DO DOM =====
var form = document.getElementById('form-cadastro');
var inputEmail = document.getElementById('email');
var inputSenha = document.getElementById('senha');
var inputConfirmar = document.getElementById('confirmar');
var erroMsg = document.getElementById('erro');
var sucessoMsg = document.getElementById('sucesso');

// ===== EVENTO DE SUBMIT =====
// Quando o usuário clica em "Cadastrar"
form.addEventListener('submit', function(e) {
    // Impede recarregar a página
    e.preventDefault();

    // Pega os valores digitados
    var email = inputEmail.value;
    var senha = inputSenha.value;
    var confirmar = inputConfirmar.value;

    // Esconde mensagens anteriores
    erroMsg.classList.add('escondido');
    sucessoMsg.classList.add('escondido');

    // Verifica se as senhas são iguais
    if (senha !== confirmar) {
        erroMsg.textContent = 'As senhas não coincidem.';
        erroMsg.classList.remove('escondido');
        return;
    }

    // Verifica tamanho mínimo da senha
    if (senha.length < 6) {
        erroMsg.textContent = 'A senha precisa ter pelo menos 6 caracteres.';
        erroMsg.classList.remove('escondido');
        return;
    }

    // Tenta criar a conta
    fazerCadastro(email, senha);
});

// ===== FUNÇÃO DE CADASTRO =====
// Usa o Supabase Auth para criar um novo usuário
async function fazerCadastro(email, senha) {
    var resultado = await supabase.auth.signUp({
        email: email,
        password: senha
    });

    // Se deu erro, mostra a mensagem
    if (resultado.error) {
        erroMsg.textContent = resultado.error.message;
        erroMsg.classList.remove('escondido');
        return;
    }

    // Se deu certo, mostra mensagem de sucesso
    sucessoMsg.textContent = 'Conta criada! Verifique seu e-mail para confirmar.';
    sucessoMsg.classList.remove('escondido');

    // Limpa o formulário
    form.reset();
}
