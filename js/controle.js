let usuario = JSON.parse(localStorage.getItem('usuarioLogado')) || { transacoes: [], relatorios: [], orcamento: 0 };
let transacoes = usuario.transacoes || [];
let graficoEntradasSaidas, graficoCategorias, calendario;


const filtroMesInput = document.getElementById('filtroMes');
const filtroCategoriaInput = document.getElementById('filtroCategoria');

[filtroMesInput, filtroCategoriaInput].forEach(el => el?.addEventListener('change', aplicarFiltros));

function aplicarFiltros() {
  const mesSelecionado = filtroMesInput?.value;
  const catSelecionada = filtroCategoriaInput?.value;

  let filtradas = [...transacoes];

  if (mesSelecionado) {
    const [ano, mes] = mesSelecionado.split("-");
    filtradas = filtradas.filter(t => {
      const d = new Date(t.data);
      return d.getFullYear() === parseInt(ano) && (d.getMonth() + 1) === parseInt(mes);
    });
  }

  if (catSelecionada && catSelecionada !== 'todas') {
    filtradas = filtradas.filter(t => t.categoria === catSelecionada);
  }

  atualizarLista(filtradas);
  atualizarGraficos(filtradas);
  atualizarCalendario(filtradas);
}

function atualizarLista(lista = transacoes) {
  const ul = document.getElementById('lista-transacoes');
  ul.innerHTML = '';
  lista.forEach(t => {
    const li = document.createElement('li');
    li.className = t.tipo;
    li.textContent = `${t.tipo.toUpperCase()} | R$${t.valor.toFixed(2)} | ${t.categoria} | ${t.descricao} | ${formatarData(t.data)}`;
    ul.appendChild(li);
  });
  atualizarResumo(lista);
  atualizarFiltroCategoria(lista);
}

function atualizarResumo(lista = transacoes) {
  let entradas = lista.filter(t => t.tipo === 'entrada').reduce((acc, t) => acc + t.valor, 0);
  let saidas = lista.filter(t => t.tipo === 'saida').reduce((acc, t) => acc + t.valor, 0);
  let saldo = entradas - saidas;

  document.getElementById('saldo').innerText = `Saldo: R$${saldo.toFixed(2)}`;
  document.getElementById('entradas').innerText = `Entradas: R$${entradas.toFixed(2)}`;
  document.getElementById('saidas').innerText = `Saídas: R$${saidas.toFixed(2)}`;

  if (usuario.orcamento > 0) {
    let porcentagem = (saidas / usuario.orcamento) * 100;
    document.getElementById('orcamento').innerText = `Orçamento: R$${usuario.orcamento.toFixed(2)} | Usado: ${porcentagem.toFixed(1)}%`;
    if (porcentagem > 80) alert('⚠️ Você já gastou mais de 80% do orçamento!');
  }
}

function atualizarFiltroCategoria(lista = transacoes) {
  const select = document.getElementById('filtroCategoria');
  if (!select) return;
  const categorias = [...new Set(lista.map(t => t.categoria))];
  select.innerHTML = `<option value="todas">Todas</option>`;
  categorias.forEach(cat => {
    const opt = document.createElement('option');
    opt.value = cat;
    opt.textContent = cat;
    select.appendChild(opt);
  });
}
function atualizarGraficos(lista = transacoes) {
  const entradas = lista.filter(t => t.tipo === 'entrada').reduce((acc, t) => acc + t.valor, 0);
  const saidas = lista.filter(t => t.tipo === 'saida').reduce((acc, t) => acc + t.valor, 0);

  if (graficoEntradasSaidas) graficoEntradasSaidas.destroy();
  const ctx1 = document.getElementById('graficoEntradasSaidas').getContext('2d');
  const gradEntrada = ctx1.createLinearGradient(0, 0, 0, 300);
  gradEntrada.addColorStop(0, '#34d399');
  gradEntrada.addColorStop(1, '#10b981');
  const gradSaida = ctx1.createLinearGradient(0, 0, 0, 300);
  gradSaida.addColorStop(0, '#f87171');
  gradSaida.addColorStop(1, '#ef4444');

  graficoEntradasSaidas = new Chart(ctx1, {
    type: 'bar',
    data: {
      labels: ['Entradas', 'Saídas'],
      datasets: [{
        label: 'R$',
        data: [entradas, saidas],
        backgroundColor: [gradEntrada, gradSaida],
        borderRadius: 12,
        borderSkipped: false
      }]
    },
    options: {
      responsive: true,
      animation: { duration: 1000, easing: 'easeOutQuart' },
      plugins: {
        tooltip: {
          backgroundColor: '#111827',
          titleColor: '#ffffff',
          bodyColor: '#d1d5db',
          callbacks: {
            label: context => `R$ ${context.formattedValue}`
          }
        },
        legend: { display: false }
      },
      scales: {
        y: {
          ticks: { color: '#4b5563', callback: value => `R$ ${value}` },
          grid: { color: '#e5e7eb' }
        },
        x: {
          ticks: { color: '#4b5563' },
          grid: { display: false }
        }
      }
    }
  });

  const categorias = {};
  lista.filter(t => t.tipo === 'saida').forEach(t => {
    categorias[t.categoria] = (categorias[t.categoria] || 0) + t.valor;
  });

  if (graficoCategorias) graficoCategorias.destroy();
  const ctx2 = document.getElementById('graficoCategorias').getContext('2d');
  graficoCategorias = new Chart(ctx2, {
    type: 'bar',
    data: {
      labels: Object.keys(categorias),
      datasets: [{
        label: 'Gastos por Categoria',
        data: Object.values(categorias),
        backgroundColor: '#6366f1',
        borderRadius: 10
      }]
    },
    options: {
      responsive: true,
      animation: { duration: 800, easing: 'easeInOutSine' },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#111827',
          titleColor: '#fff',
          bodyColor: '#f3f4f6'
        }
      },
      scales: {
        y: { ticks: { color: '#4b5563' }, grid: { color: '#e5e7eb' } },
        x: { ticks: { color: '#4b5563' }, grid: { display: false } }
      }
    }
  });
}

function atualizarCalendario(lista = transacoes) {
  if (calendario) calendario.destroy();
  const eventos = lista.map(t => ({
    title: `${t.tipo.toUpperCase()} R$${t.valor.toFixed(2)} - ${t.categoria}`,
    start: t.data,
    color: t.tipo === 'entrada' ? '#10b981' : '#ef4444',
    extendedProps: t
  }));

  calendario = new FullCalendar.Calendar(document.getElementById('calendar'), {
    initialView: 'dayGridMonth',
    events: eventos,
    eventClick(info) {
      const t = info.event.extendedProps;
      document.getElementById('modal-conteudo').innerHTML = `
        <strong>${t.tipo.toUpperCase()}</strong><br/>
        Valor: R$${t.valor.toFixed(2)}<br/>
        Categoria: ${t.categoria}<br/>
        Descrição: ${t.descricao}<br/>
        Data: ${formatarData(t.data)}
      `;
      document.getElementById('modal-detalhes').style.display = 'flex';
    }
  });

  calendario.render();
}

function fecharModal() {
  document.getElementById('modal-detalhes').style.display = 'none';
}

function formatarData(dataISO) {
  const d = new Date(dataISO);
  return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth()+1).toString().padStart(2, '0')}/${d.getFullYear()}`;
}

const form = document.getElementById('form-transacao');
form?.addEventListener('submit', function (event) {
  event.preventDefault();
  const descricao = document.getElementById('descricao').value;
  const categoria = document.getElementById('categoria').value;
  const valor = parseFloat(document.getElementById('valor').value);
  const data = document.getElementById('data').value;
  const tipo = document.getElementById('tipo').value;

  if (!data) return alert('Selecione uma data!');
  transacoes.push({ descricao, categoria, valor, tipo, data });
  usuario.transacoes = transacoes;
  salvarUsuario();
  aplicarFiltros();
  form.reset();
});

// Botões
document.getElementById('definir-orcamento')?.addEventListener('click', () => {
  const novo = parseFloat(prompt("Digite o novo orçamento:"));
  if (!isNaN(novo)) {
    usuario.orcamento = novo;
    salvarUsuario();
    atualizarResumo();
  }
});

document.getElementById('fechar-mes')?.addEventListener('click', () => {
  if (transacoes.length === 0) return alert('Nenhuma transação!');
  const mesAtual = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
  if (!usuario.relatorios) usuario.relatorios = [];
  usuario.relatorios.push({ mes: mesAtual, transacoes: [...transacoes] });
  usuario.transacoes = [];
  salvarUsuario();
  alert('Mês fechado com sucesso!');
  window.location.href = 'historico.html';
});

document.getElementById('logout')?.addEventListener('click', () => {
  localStorage.removeItem('usuarioLogado');
  window.location.href = 'index.html';
});

function salvarUsuario() {
  localStorage.setItem('usuarioLogado', JSON.stringify(usuario));
  let users = JSON.parse(localStorage.getItem('users') || '[]');
  const i = users.findIndex(u => u.email === usuario.email);
  if (i !== -1) {
    users[i] = usuario;
    localStorage.setItem('users', JSON.stringify(users));
  }
}

document.addEventListener('DOMContentLoaded', () => {
  if (usuario.email) {
    const nome = usuario.email.split('@')[0];
    document.getElementById('boas-vindas').innerText = `Bem-vindo, ${nome}!`;
  }
  aplicarFiltros();
});
