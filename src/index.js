const fs = require('fs').promises;
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
}

app.get('/talker', async (req, res) => {
  const register = await getFile();
  return res.status(200).json(register);
})

app.get('/talker/:id', async (req, res) => {
  const register = await getFile();
  const foundReg = register.find((obj) => obj.id === Number(req.params.id));
  console.log(foundReg)
  if (!foundReg) {
    return res.status(404).json({ message: "Pessoa palestrante não encontrada" });
  }
  return res.status(200).json(foundReg);
})

app.listen(PORT, () => {
  console.log('Online');
});
