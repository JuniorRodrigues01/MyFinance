function getUsers() {
    return JSON.parse(localStorage.getItem('users') || '[]');
}

e
function saveUsers(users) {
    localStorage.setItem('users', JSON.stringify(users));
}


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
    showLogin();
    return false;
}


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
        window.location.href = "controlefinanceiro.html";
    } else {
        alert('Email ou senha incorretos!');
    }

    return false;
}


function showRegister() {
    document.querySelector('.login-form').style.display = 'none'; 
    document.getElementById('registerSection').style.display = 'block';
}


function showLogin() {
    document.querySelector('.login-form').style.display = 'block'; 
    document.getElementById('registerSection').style.display = 'none';
}
