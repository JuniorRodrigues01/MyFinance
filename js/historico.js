let usuario = JSON.parse(localStorage.getItem('usuarioLogado'));

if (usuario && usuario.relatorios && usuario.relatorios.length > 0) {
    const lista = document.getElementById('lista-relatorios');

    usuario.relatorios.forEach(relatorio => {
        const card = document.createElement('div');
        card.className = 'card-relatorio';
        card.innerHTML = `<h3>${relatorio.mes}</h3><ul>` +
            relatorio.transacoes.map(transacao => `
                <li>
                    ${transacao.tipo.toUpperCase()} | 
                    ${transacao.categoria} | 
                    R$${transacao.valor.toFixed(2)} | 
                    ${transacao.descricao} | 
                    ${formatarData(transacao.data)}
                </li>
            `).join('') +
        '</ul>';
        lista.appendChild(card);
    });
} else {
    document.getElementById('lista-relatorios').innerHTML = "<p style='text-align:center;'>Nenhum mês fechado ainda!</p>";
}

function formatarData(dataISO) {
    const d = new Date(dataISO);
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth()+1).toString().padStart(2, '0')}/${d.getFullYear()}`;
}
