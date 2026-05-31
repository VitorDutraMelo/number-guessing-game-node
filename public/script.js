const form = document.getElementById('guessForm');
const input = document.getElementById('palpiteInput');
const dicaTexto = document.getElementById('dicaTexto');
const messageBox = document.getElementById('messageBox');
const tentativasEl = document.getElementById('tentativas');
const melhorJogoEl = document.getElementById('melhorJogo');
const resetBtn = document.getElementById('resetBtn');

function atualizarMensagem(texto, tipo) {
  messageBox.className = 'message-box';

  if (tipo === 'correto') {
    messageBox.classList.add('success');
    messageBox.innerHTML = `<div class="question-circle">✅</div><p>${texto}</p>`;
    return;
  }

  if (tipo === 'erro') {
    messageBox.classList.add('error');
    messageBox.innerHTML = `<div class="question-circle">!</div><p>${texto}</p>`;
    return;
  }

  if (tipo === 'alto' || tipo === 'baixo') {
    messageBox.classList.add('warning');
    messageBox.innerHTML = `<div class="question-circle">?</div><p>${texto}</p>`;
    return;
  }

  messageBox.innerHTML = `<div class="question-circle">?</div><p>${texto}</p>`;
}

function atualizarEstatisticas(tentativas, melhorJogo) {
  tentativasEl.textContent = tentativas;
  melhorJogoEl.textContent = melhorJogo;
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const palpite = input.value;

  try {
    const response = await fetch('/guess', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ palpite })
    });

    const data = await response.json();

    atualizarMensagem(data.mensagem, data.tipo);
    atualizarEstatisticas(data.tentativas, data.melhorJogo);

    if (data.tipo === 'baixo') {
      dicaTexto.textContent = 'O número secreto é maior que o seu palpite.';
    } else if (data.tipo === 'alto') {
      dicaTexto.textContent = 'O número secreto é menor que o seu palpite.';
    } else if (data.tipo === 'correto') {
      dicaTexto.textContent = 'Você venceu! Clique em Novo jogo para jogar novamente.';
    }

    input.value = '';
    input.focus();
  } catch (error) {
    atualizarMensagem('Erro ao conectar com o servidor.', 'erro');
  }
});

resetBtn.addEventListener('click', async () => {
  const response = await fetch('/reset', {
    method: 'POST'
  });

  const data = await response.json();

  dicaTexto.textContent = 'O número que estou pensando está entre 1 e 100.';
  atualizarMensagem(data.mensagem, data.tipo);
  atualizarEstatisticas(data.tentativas, data.melhorJogo);
  input.value = '';
  input.focus();
});
