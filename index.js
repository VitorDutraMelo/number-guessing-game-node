// Servidor Node.js para o Jogo de Adivinhação
// Este arquivo conecta o frontend com a lógica do jogo no backend.

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;

// Número secreto gerado entre 1 e 100
let numeroSecreto = gerarNumeroSecreto();
let tentativas = 0;
let melhorJogo = 0;

function gerarNumeroSecreto() {
  return Math.floor(Math.random() * 100) + 1;
}

function enviarJSON(res, statusCode, data) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

function servirArquivoEstatico(req, res) {
  const filePath = req.url === '/' 
    ? path.join(__dirname, 'public', 'index.html')
    : path.join(__dirname, 'public', req.url);

  const extname = path.extname(filePath);

  const contentTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml'
  };

  fs.readFile(filePath, (error, content) => {
    if (error) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Arquivo não encontrado');
      return;
    }

    res.writeHead(200, { 'Content-Type': contentTypes[extname] || 'text/plain' });
    res.end(content);
  });
}

const server = http.createServer((req, res) => {
  // Rota para enviar o palpite
  if (req.url === '/guess' && req.method === 'POST') {
    let body = '';

    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', () => {
      const { palpite } = JSON.parse(body);
      const numero = Number(palpite);

      if (!numero || numero < 1 || numero > 100) {
        enviarJSON(res, 400, {
          mensagem: 'Digite um número válido entre 1 e 100.',
          tipo: 'erro',
          tentativas,
          melhorJogo
        });
        return;
      }

      tentativas++;

      if (numero < numeroSecreto) {
        enviarJSON(res, 200, {
          mensagem: 'Muito baixo! Tente um número maior.',
          tipo: 'baixo',
          tentativas,
          melhorJogo
        });
        return;
      }

      if (numero > numeroSecreto) {
        enviarJSON(res, 200, {
          mensagem: 'Muito alto! Tente um número menor.',
          tipo: 'alto',
          tentativas,
          melhorJogo
        });
        return;
      }

      if (melhorJogo === 0 || tentativas < melhorJogo) {
        melhorJogo = tentativas;
      }

      enviarJSON(res, 200, {
        mensagem: `Parabéns! Você acertou o número ${numeroSecreto} em ${tentativas} tentativa(s)!`,
        tipo: 'correto',
        tentativas,
        melhorJogo
      });
    });

    return;
  }

  // Rota para reiniciar o jogo
  if (req.url === '/reset' && req.method === 'POST') {
    numeroSecreto = gerarNumeroSecreto();
    tentativas = 0;

    enviarJSON(res, 200, {
      mensagem: 'Novo jogo iniciado! Faça seu primeiro palpite.',
      tipo: 'reset',
      tentativas,
      melhorJogo
    });

    return;
  }

  servirArquivoEstatico(req, res);
});

server.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
