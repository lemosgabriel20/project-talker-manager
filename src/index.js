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

app.get('/talker', async (req, res) => {
  const register = await getFile();
  return res.status(200).json(register);
});

app.get('/talker/:id', async (req, res) => {
  const register = await getFile();
  const foundReg = register.find((obj) => obj.id === Number(req.params.id));
  console.log(foundReg);
  if (!foundReg) {
    return res.status(404).json({ message: 'Pessoa palestrante não encontrada' });
  }
  return res.status(200).json(foundReg);
});

const validateTalker = (req, res, next) => {
  const { email, password } = req.body;
  console.log(email);
  if (!email) {
    return res.status(400).json({ message: 'O campo "email" é obrigatório' });
  }
  if (!email.match(/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/g)) {
    return res.status(400).json({ message: 'O "email" deve ter o formato "email@email.com"' });
  }
  if (!password) {
    return res.status(400).json({ message: 'O campo "password" é obrigatório' });
  }
  if (password.length <= 6) {
    return res.status(400).json({ message: 'O "password" deve ter pelo menos 6 caracteres' });
  }
  next();
};

app.post('/login', validateTalker, (req, res) => {
  const token = cryptoRS.randomBytes(8).toString('hex');
  return res.status(200).json({ token });
});

app.listen(PORT, () => {
  console.log('Online');
});
