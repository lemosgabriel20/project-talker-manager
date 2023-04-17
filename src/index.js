const fs = require('fs').promises;
const cryptoRS = require('crypto');
const path = require('path');
const express = require('express');

const app = express();
app.use(express.json());

const HTTP_OK_STATUS = 200;
const PORT = process.env.PORT || '3001';

// não remova esse endpoint, e para o avaliador funcionar
app.get('/', (_request, response) => {
  response.status(HTTP_OK_STATUS).send();
});

const getFile = async () => {
  const file = await fs.readFile(path.resolve(__dirname, './talker.json'));
  return JSON.parse(file);
};

const validateAuth = (req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization) {
    return res.status(401).json({ message: 'Token não encontrado' });
  }
  if (authorization.length !== 16 || typeof authorization !== 'string') {
    return res.status(401).json({ message: 'Token inválido' });
  }
  next();
};
const validateName = (req, res, next) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ message: 'O campo "name" é obrigatório' });
  }
  if (name.length < 6) {
    return res.status(400).json({ message: 'O "name" deve ter pelo menos 3 caracteres' });
  }
  next();
};
const validateAge = (req, res, next) => {
  const { age } = req.body;
  if (!age) {
    return res.status(400).json({ message: 'O campo "age" é obrigatório' });
  }
  if (age < 18 || typeof age !== 'number' || !Number.isInteger(age)) {
    return res.status(400).json({
      message: 'O campo "age" deve ser um número inteiro igual ou maior que 18',
    });
  }
  next();
};
const validateTalk = (req, res, next) => {
  const { talk } = req.body;
  if (!talk) {
    return res.status(400).json({ message: 'O campo "talk" é obrigatório' });
  }
  next();
};
const validateWatchedAt = (req, res, next) => {
  const { watchedAt } = req.body.talk;
  if (!watchedAt) {
    return res.status(400).json({ message: 'O campo "watchedAt" é obrigatório' });
  }
  if (!watchedAt.match(/^([0-2][0-9]|(3)[0-1])(\/)(((0)[0-9])|((1)[0-2]))(\/)\d{4}$/i)) {
    return res.status(400).json({ message: 'O campo "watchedAt" deve ter o formato "dd/mm/aaaa"' });
  }
  next();
};
const validateRate = (req, res, next) => {
  const { rate } = req.body.talk;
  if (rate === undefined) {
    return res.status(400).json({ message: 'O campo "rate" é obrigatório' });
  }
  if (rate < 1 || rate > 5 || !Number.isInteger(rate)) {
    return res.status(400).json({
      message: 'O campo "rate" deve ser um número inteiro entre 1 e 5',
    });
  }
  next();
};

app.get('/talker', async (req, res) => {
  const register = await getFile();
  return res.status(200).json(register);
});

app.get('/talker/search', validateAuth, async (req, res) => {
  const { q } = req.query;
  const talkers = await getFile();
  if (!q) {
    return res.status(200).json(talkers);
  }
  const foundTalkers = talkers.filter((obj) => obj.name.includes(q));
  console.log(foundTalkers);
  return res.status(200).json(foundTalkers);
});

app.get('/talker/:id', async (req, res) => {
  const register = await getFile();
  const foundReg = register.find((obj) => obj.id === Number(req.params.id));
  if (!foundReg) {
    return res.status(404).json({ message: 'Pessoa palestrante não encontrada' });
  }
  return res.status(200).json(foundReg);
});

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  if (!email) {
    return res.status(400).json({ message: 'O campo "email" é obrigatório' });
  }
  if (!email.match(/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/g)) {
    return res.status(400).json({ message: 'O "email" deve ter o formato "email@email.com"' });
  }
  if (!password) {
    return res.status(400).json({ message: 'O campo "password" é obrigatório' });
  }
  if (password.length < 6) {
    return res.status(400).json({ message: 'O "password" deve ter pelo menos 6 caracteres' });
  }
  next();
};

app.post('/login', validateLogin, (req, res) => {
  const token = cryptoRS.randomBytes(8).toString('hex');
  return res.status(200).json({ token });
});

app.post('/talker',
  validateAuth,
  validateName,
  validateAge,
  validateTalk,
  validateWatchedAt,
  validateRate,
  async (req, res) => {
  const { name, age, talk } = req.body;
  const talkers = await getFile();
  const newTalker = {
    id: talkers[talkers.length - 1].id + 1,
    name,
    age,
    talk,
  };
  talkers.push(newTalker);
  await fs.writeFile(path.resolve(__dirname, './talker.json'), JSON.stringify(talkers));
  return res.status(201).json({ ...newTalker });
});

app.put('/talker/:id',
  validateAuth,
  validateName,
  validateAge,
  validateTalk,
  validateWatchedAt,
  validateRate,
  async (req, res) => {
  const { id } = req.params;
  const { name, age, talk } = req.body;
  const talkers = await getFile();
  const foundTalker = talkers.find((obj) => obj.id === Number(id));
  if (!foundTalker) {
    return res.status(404).json({ message: 'Pessoa palestrante não encontrada' });
  }

  const index = talkers.indexOf(foundTalker);
  
  foundTalker.name = name;
  foundTalker.age = age;
  foundTalker.talk = talk;

  talkers[index] = foundTalker;
  
  await fs.writeFile(path.resolve(__dirname, './talker.json'), JSON.stringify(talkers));
  return res.status(200).json({ ...foundTalker });
});

app.delete('/talker/:id',
  validateAuth,
  async (req, res) => {
  const { id } = req.params;
  const talkers = await getFile();
  const foundTalker = talkers.find((obj) => obj.id === Number(id));

  const index = talkers.indexOf(foundTalker);
  talkers.splice(index, 1);

  await fs.writeFile(path.resolve(__dirname, './talker.json'), JSON.stringify(talkers));
  return res.status(204).end();
});

app.listen(PORT, () => {
  console.log('Online');
});
