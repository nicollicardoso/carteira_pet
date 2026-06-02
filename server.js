const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3003;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'carteira_pet')));

// ─── Persistência em arquivo JSON ───────────────
const DB_FILE = path.join(__dirname, 'db.json');

function loadDb() {
  if (fs.existsSync(DB_FILE)) {
    try { return JSON.parse(fs.readFileSync(DB_FILE, 'utf8')); } catch {}
  }
  return { usuarios: [], pets: [], agendamentos: [], vacinas: [], historico: [], configuracoes: [] };
}

function saveDb() {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

const db = loadDb();

// ─────────────────────────────────────────────
// AUTH — Login / Cadastro
// ─────────────────────────────────────────────

app.post('/api/login', (req, res) => {
  const { email, senha } = req.body;
  if (!email || !senha) return res.status(400).json({ erro: 'Email e senha são obrigatórios.' });

  const usuario = db.usuarios.find(u => u.email === email && u.senha === senha);
  if (!usuario) return res.status(401).json({ erro: 'Email ou senha inválidos.' });

  res.json({ mensagem: 'Login realizado com sucesso.', usuario: { id: usuario.id, email: usuario.email } });
});

app.post('/api/cadastro', (req, res) => {
  const { email, senha } = req.body;
  if (!email || !senha) return res.status(400).json({ erro: 'Email e senha são obrigatórios.' });
  if (db.usuarios.find(u => u.email === email)) return res.status(409).json({ erro: 'Email já cadastrado.' });

  const usuario = { id: Date.now(), email, senha };
  db.usuarios.push(usuario);
  saveDb();

  res.status(201).json({ mensagem: 'Usuário criado com sucesso.', id: usuario.id });
});

// ─────────────────────────────────────────────
// PETS
// ─────────────────────────────────────────────

app.get('/api/pets', (req, res) => {
  res.json(db.pets);
});

app.post('/api/pets', (req, res) => {
  const { nome, especie, raca, nascimento, peso, cor, chip, observacoes } = req.body;
  if (!nome) return res.status(400).json({ erro: 'Nome do pet é obrigatório.' });

  const pet = { id: Date.now(), nome, especie, raca, nascimento, peso, cor, chip, observacoes, criadoEm: new Date().toISOString() };
  db.pets.push(pet);
  saveDb();

  res.status(201).json({ mensagem: 'Pet cadastrado com sucesso.', pet });
});

app.put('/api/pets/:id', (req, res) => {
  const id = Number(req.params.id);
  const idx = db.pets.findIndex(p => p.id === id);
  if (idx === -1) return res.status(404).json({ erro: 'Pet não encontrado.' });

  db.pets[idx] = { ...db.pets[idx], ...req.body, atualizadoEm: new Date().toISOString() };
  saveDb();

  res.json({ mensagem: 'Pet atualizado com sucesso.', pet: db.pets[idx] });
});

app.delete('/api/pets/:id', (req, res) => {
  const id = Number(req.params.id);
  const idx = db.pets.findIndex(p => p.id === id);
  if (idx === -1) return res.status(404).json({ erro: 'Pet não encontrado.' });

  db.pets.splice(idx, 1);
  saveDb();

  res.json({ mensagem: 'Pet removido com sucesso.' });
});

// ─────────────────────────────────────────────
// AGENDAMENTOS
// ─────────────────────────────────────────────

app.get('/api/agendamentos', (req, res) => {
  res.json(db.agendamentos);
});

app.post('/api/agendamentos', (req, res) => {
  const { tipo, procedimento, data, horario, observacoes, petId } = req.body;
  if (!tipo || !data || !horario) return res.status(400).json({ erro: 'Tipo, data e horário são obrigatórios.' });

  const agendamento = { id: Date.now(), tipo, procedimento, data, horario, observacoes, petId, criadoEm: new Date().toISOString() };
  db.agendamentos.push(agendamento);
  saveDb();

  res.status(201).json({ mensagem: 'Agendamento criado com sucesso.', agendamento });
});

app.put('/api/agendamentos/:id', (req, res) => {
  const id = Number(req.params.id);
  const idx = db.agendamentos.findIndex(a => a.id === id);
  if (idx === -1) return res.status(404).json({ erro: 'Agendamento não encontrado.' });

  db.agendamentos[idx] = { ...db.agendamentos[idx], ...req.body, atualizadoEm: new Date().toISOString() };
  saveDb();

  res.json({ mensagem: 'Agendamento atualizado com sucesso.', agendamento: db.agendamentos[idx] });
});

app.delete('/api/agendamentos/:id', (req, res) => {
  const id = Number(req.params.id);
  const idx = db.agendamentos.findIndex(a => a.id === id);
  if (idx === -1) return res.status(404).json({ erro: 'Agendamento não encontrado.' });

  db.agendamentos.splice(idx, 1);
  saveDb();

  res.json({ mensagem: 'Agendamento removido com sucesso.' });
});

// ─────────────────────────────────────────────
// VACINAS
// ─────────────────────────────────────────────

app.get('/api/vacinas', (req, res) => {
  res.json(db.vacinas);
});

app.post('/api/vacinas', (req, res) => {
  const { nome, data, horario, petId, lote, veterinario, observacoes } = req.body;
  if (!nome || !data) return res.status(400).json({ erro: 'Nome da vacina e data são obrigatórios.' });

  const vacina = { id: Date.now(), nome, data, horario, petId, lote, veterinario, observacoes, criadoEm: new Date().toISOString() };
  db.vacinas.push(vacina);
  saveDb();

  res.status(201).json({ mensagem: 'Vacina registrada com sucesso.', vacina });
});

app.put('/api/vacinas/:id', (req, res) => {
  const id = Number(req.params.id);
  const idx = db.vacinas.findIndex(v => v.id === id);
  if (idx === -1) return res.status(404).json({ erro: 'Vacina não encontrada.' });

  db.vacinas[idx] = { ...db.vacinas[idx], ...req.body, atualizadoEm: new Date().toISOString() };
  saveDb();

  res.json({ mensagem: 'Vacina atualizada com sucesso.', vacina: db.vacinas[idx] });
});

app.delete('/api/vacinas/:id', (req, res) => {
  const id = Number(req.params.id);
  const idx = db.vacinas.findIndex(v => v.id === id);
  if (idx === -1) return res.status(404).json({ erro: 'Vacina não encontrada.' });

  db.vacinas.splice(idx, 1);
  saveDb();

  res.json({ mensagem: 'Vacina removida com sucesso.' });
});

// ─────────────────────────────────────────────
// HISTÓRICO
// ─────────────────────────────────────────────

app.get('/api/historico', (req, res) => {
  const { petId, tipo } = req.query;
  let resultado = db.historico;
  if (petId) resultado = resultado.filter(h => String(h.petId) === String(petId));
  if (tipo) resultado = resultado.filter(h => h.tipo === tipo);
  res.json(resultado);
});

app.post('/api/historico', (req, res) => {
  const { petId, tipo, descricao, data, veterinario, observacoes } = req.body;
  if (!tipo || !data) return res.status(400).json({ erro: 'Tipo e data são obrigatórios.' });

  const registro = { id: Date.now(), petId, tipo, descricao, data, veterinario, observacoes, criadoEm: new Date().toISOString() };
  db.historico.push(registro);
  saveDb();

  res.status(201).json({ mensagem: 'Registro adicionado ao histórico.', registro });
});

app.delete('/api/historico/:id', (req, res) => {
  const id = Number(req.params.id);
  const idx = db.historico.findIndex(h => h.id === id);
  if (idx === -1) return res.status(404).json({ erro: 'Registro não encontrado.' });

  db.historico.splice(idx, 1);
  saveDb();

  res.json({ mensagem: 'Registro removido com sucesso.' });
});

// ─────────────────────────────────────────────
// CONFIGURAÇÕES
// ─────────────────────────────────────────────

app.get('/api/configuracoes/:usuarioId', (req, res) => {
  const usuarioId = Number(req.params.usuarioId);
  const config = db.configuracoes.find(c => c.usuarioId === usuarioId);
  res.json(config || {});
});

app.post('/api/configuracoes', (req, res) => {
  const { usuarioId, senhaAtual, novaSenha, ...campos } = req.body;

  if (!usuarioId) return res.status(400).json({ erro: 'usuarioId é obrigatório.' });

  // Troca de senha
  if (novaSenha) {
    const usuario = db.usuarios.find(u => u.id === Number(usuarioId));
    if (!usuario || usuario.senha !== senhaAtual) {
      return res.status(401).json({ erro: 'Senha atual incorreta.' });
    }
    usuario.senha = novaSenha;
    saveDb();
    return res.json({ mensagem: 'Senha alterada com sucesso.' });
  }

  // Merge com configuração existente (não apaga campos não enviados)
  const idx = db.configuracoes.findIndex(c => c.usuarioId === Number(usuarioId));
  const anterior = idx !== -1 ? db.configuracoes[idx] : {};
  const config = { ...anterior, ...campos, usuarioId: Number(usuarioId), atualizadoEm: new Date().toISOString() };

  if (idx === -1) {
    db.configuracoes.push(config);
  } else {
    db.configuracoes[idx] = config;
  }
  saveDb();

  res.json({ mensagem: 'Configurações salvas com sucesso.', configuracoes: config });
});

// ─────────────────────────────────────────────
// Fallback — SPA
// ─────────────────────────────────────────────

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'carteira_pet', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
