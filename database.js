const Database = require('better-sqlite3');
 
const db = new Database('contatos.db');
 
db.exec(`
  CREATE TABLE IF NOT EXISTS contatos (
    id       INTEGER PRIMARY KEY AUTOINCREMENT,
    nome     TEXT NOT NULL,
    telefone TEXT NOT NULL,
    email    TEXT,
    cidade   TEXT NOT NULL
  )
`);
 
// Carga inicial: só insere se a tabela estiver vazia
const total = db.prepare('SELECT COUNT(*) AS qtd FROM contatos').get().qtd;
 
if (total === 0) {
  const inserir = db.prepare(
    'INSERT INTO contatos (nome, telefone, email, cidade) VALUES (?, ?, ?, ?)'
  );
  inserir.run('Ana Souza', '(51) 99876-1234', 'ana@email.com', 'Porto Alegre');
  inserir.run('Bruno Lima', '(51) 98765-4321', 'bruno@email.com', 'Canoas');
  inserir.run('Carla Mendes', '(51) 99123-4567', null, 'Porto Alegre');
  inserir.run('Daniel Rocha', '(54) 99654-3210', 'daniel@email.com', 'Caxias do Sul');
  inserir.run('Eduarda Alves', '(51) 98111-2233', 'eduarda@email.com', 'Viamão');
}
 
module.exports = db;