// Recuperar usuários do localStorage
function getUsers() {
    return JSON.parse(localStorage.getItem('users') || '[]');
}

// Salvar usuários no localStorage
function saveUsers(users) {
    localStorage.setItem('users', JSON.stringify(users));
}

// Função de cadastro
function handleRegister(event) {
    event.preventDefault();

    const email = document.getElementById('regEmail').value;
    const senha = document.getElementById('regSenha').value;

    if (!email || !senha) {
        alert('Preencha todos os campos!');
        return false;
    }

    let users = getUsers();
    if (users.find(u => u.email === email)) {
        alert('Usuário já existe!');
        return false;
    }

    users.push({ email, senha, transacoes: [], relatorios: [], orcamento: 0 });
    saveUsers(users);

    alert('Cadastro realizado com sucesso!');
    showLogin(); // Volta para a tela de login
    return false;
}

// Função de login
function handleLogin(event) {
    event.preventDefault();

    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;

    if (!email || !senha) {
        alert('Preencha todos os campos!');
        return false;
    }

    const users = getUsers();
    const user = users.find(u => u.email === email && u.senha === senha);
    if (user) {
        localStorage.setItem('usuarioLogado', JSON.stringify(user));
        window.location.href = "controlefinanceiro.html"; // Redireciona para o painel
    } else {
        alert('Email ou senha incorretos!');
    }

    return false;
}

// Mostrar seção de cadastro
function showRegister() {
    document.querySelector('.login-form').style.display = 'none'; // Esconde login
    document.getElementById('registerSection').style.display = 'block'; // Mostra cadastro
}

// Mostrar seção de login
function showLogin() {
    document.querySelector('.login-form').style.display = 'block'; // Mostra login
    document.getElementById('registerSection').style.display = 'none'; // Esconde cadastro
}
