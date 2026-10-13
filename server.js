const express = require('express');
const cors = require('cors');
const db = require('./database');
 
const app = express();
const PORT = 3000;
 
app.use(cors());
app.use(express.json());
 
// Lista os contatos, com filtros opcionais por nome e cidade
app.get('/contatos', (req, res) => {
  const { nome, cidade } = req.query;
  let sql = 'SELECT * FROM contatos WHERE 1 = 1';
  const parametros = [];
 
  if (nome) {
    sql += ' AND nome LIKE ?';
    parametros.push(`%${nome}%`);
  }
  if (cidade) {
    sql += ' AND cidade LIKE ?';
    parametros.push(`%${cidade}%`);
  }
 
  sql += ' ORDER BY nome';
  const contatos = db.prepare(sql).all(...parametros);
  res.json(contatos);
});
 
// Busca um contato pelo id
app.get('/contatos/:id', (req, res) => {
  const contato = db.prepare('SELECT * FROM contatos WHERE id = ?').get(req.params.id);
  if (!contato) {
    return res.status(404).json({ erro: 'Contato não encontrado' });
  }
  res.json(contato);
});
 
// Valida os campos obrigatórios do corpo da requisição
function validarContato(dados) {
  if (!dados.nome || !dados.telefone || !dados.cidade) {
    return 'Os campos nome, telefone e cidade são obrigatórios';
  }
  return null;
}
 
// Cadastra um novo contato
app.post('/contatos', (req, res) => {
  const erro = validarContato(req.body);
  if (erro) return res.status(400).json({ erro });
 
  const { nome, telefone, email, cidade } = req.body;
  const resultado = db
    .prepare('INSERT INTO contatos (nome, telefone, email, cidade) VALUES (?, ?, ?, ?)')
    .run(nome, telefone, email || null, cidade);
 
  const novo = db
    .prepare('SELECT * FROM contatos WHERE id = ?')
    .get(resultado.lastInsertRowid);
  res.status(201).json(novo);
});
 
// Atualiza um contato existente
app.put('/contatos/:id', (req, res) => {
  const erro = validarContato(req.body);
  if (erro) return res.status(400).json({ erro });
 
  const { nome, telefone, email, cidade } = req.body;
  const resultado = db
    .prepare(`UPDATE contatos
              SET nome = ?, telefone = ?, email = ?, cidade = ?
              WHERE id = ?`)
    .run(nome, telefone, email || null, cidade, req.params.id);
 
  if (resultado.changes === 0) {
    return res.status(404).json({ erro: 'Contato não encontrado' });
  }
  const atualizado = db.prepare('SELECT * FROM contatos WHERE id = ?').get(req.params.id);
  res.json(atualizado);
});
 
// Exclui um contato
app.delete('/contatos/:id', (req, res) => {
  const resultado = db.prepare('DELETE FROM contatos WHERE id = ?').run(req.params.id);
  if (resultado.changes === 0) {
    return res.status(404).json({ erro: 'Contato não encontrado' });
  }
  res.status(204).send();
});
 
app.listen(PORT, () => {
  console.log(`API de contatos rodando em http://localhost:${PORT}`);
});