const express = require('express')
const app = express()

const PORT  = 5000
const server = app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`)
})