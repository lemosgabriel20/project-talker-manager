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

app.get('/talker', async (req, res) => {
  const file = await fs.readFile(path.resolve(__dirname, './talker.json'));
  const register = JSON.parse(file);
  return res.status(200).json(register);
})

app.listen(PORT, () => {
  console.log('Online');
});
