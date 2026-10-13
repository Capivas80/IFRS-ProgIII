const API_URL = 'http://localhost:3000/contatos';

const formContato = document.getElementById('form-contato');
const formTitulo = document.getElementById('form-titulo');
const listaContatos = document.getElementById('tabela-corpo');
const inputId = document.getElementById('contato-id');
const btnCancelar = document.getElementById('btn-cancelar');

async function carregarContatos(query = '') {
  const resposta = await fetch(`${API_URL}${query}`);
  const contatos = await resposta.json();
  renderizarContatos(contatos);
}

function renderizarContatos(contatos) {
  listaContatos.innerHTML = '';

  if (contatos.length === 0) {
    listaContatos.innerHTML = `<tr><td colspan="5" class="empty-message">Nenhum contato encontrado.</td></tr>`;
    return;
  }

  contatos.forEach((contato) => {
    const linha = document.createElement('tr');
    linha.innerHTML = `
      <td>${contato.nome}</td>
      <td>${contato.telefone}</td>
      <td>${contato.email ?? '-'}</td>
      <td>${contato.cidade}</td>
      <td>
        <button class="btn-editar" data-id="${contato.id}">Editar</button>
        <button class="btn-excluir" data-id="${contato.id}">Excluir</button>
      </td>
    `;
    listaContatos.appendChild(linha);
  });
}

carregarContatos();

const filtroNome = document.getElementById('filtro-nome');
const filtroCidade = document.getElementById('filtro-cidade');
const btnBuscar = document.getElementById('btn-buscar');
const btnLimpar = document.getElementById('btn-limpar');

btnBuscar.addEventListener('click', () => {
  const parametros = new URLSearchParams();

  if (filtroNome.value) parametros.append('nome', filtroNome.value);
  if (filtroCidade.value) parametros.append('cidade', filtroCidade.value);

  const query = parametros.toString();
  carregarContatos(query ? `?${query}` : '');
});

btnLimpar.addEventListener('click', () => {
  filtroNome.value = '';
  filtroCidade.value = '';
  carregarContatos();
});

formContato.addEventListener('submit', async (evento) => {
  evento.preventDefault();

  const contato = {
    nome: document.getElementById('nome').value,
    telefone: document.getElementById('telefone').value,
    email: document.getElementById('email').value || null,
    cidade: document.getElementById('cidade').value
  };

  const id = inputId.value;

  if (id) {
    await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(contato)
    });
  } else {
    await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(contato)
    });
  }

  formContato.reset();
  inputId.value = '';
  formTitulo.textContent = 'Novo Contato';
  btnCancelar.style.display = 'none'; 
  carregarContatos();
});

btnCancelar.addEventListener('click', () => {
  formContato.reset();
  inputId.value = '';
  formTitulo.textContent = 'Novo Contato';
  btnCancelar.style.display = 'none';
});

listaContatos.addEventListener('click', async (evento) => {
  const id = evento.target.dataset.id;
  if (!id) return;

  if (evento.target.classList.contains('btn-excluir')) {
    if (confirm('Tem certeza que deseja excluir este contato?')) {
      await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      carregarContatos();
    }
    return;
  }

  if (evento.target.classList.contains('btn-editar')) {
    const resposta = await fetch(`${API_URL}/${id}`);
    const contato = await resposta.json();

    inputId.value = contato.id;
    document.getElementById('nome').value = contato.nome;
    document.getElementById('telefone').value = contato.telefone;
    document.getElementById('email').value = contato.email ?? '';
    document.getElementById('cidade').value = contato.cidade;
    
    formTitulo.textContent = `Editando: ${contato.nome}`;
    btnCancelar.style.display = 'inline-block'; 
  }
});