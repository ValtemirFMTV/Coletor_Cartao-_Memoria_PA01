import { WebSerialAdapter } from './adapters/webSerialAdapter.js';
import { WebBluetoothAdapter } from './adapters/webBluetoothAdapter.js';

let transport = null;
let bufferTexto = '';
let recebendoArquivo = false;
let arquivoBuffer = [];
let arquivoAtual = '';
let tamanhoArquivo = 0;
let resolucaoArquivo = null;
let bytesRestantes = 0;

const logEl = document.getElementById('log');
const listaEl = document.getElementById('listaArquivos');
const progBar = document.getElementById('progressoBar');
const progTxt = document.getElementById('progressoTexto');
const btnConectar = document.getElementById('btnConectar');
const btnListar = document.getElementById('btnListar');
const btnBaixarSel = document.getElementById('btnBaixarSel');
const btnBaixarTodos = document.getElementById('btnBaixarTodos');

function log(msg) {
  logEl.value += msg + '\n';
  logEl.scrollTop = logEl.scrollHeight;
}

function setProgresso(pct) {
  let value = pct;
  if (value < 0) value = 0;
  if (value > 100) value = 100;
  progBar.style.width = value + '%';
  progTxt.textContent = '➡️ ' + value + '%';
}

function habilitarAcoes(ativo) {
  btnListar.disabled = !ativo;
  btnBaixarSel.disabled = !ativo;
  btnBaixarTodos.disabled = !ativo;
}

function desconectarVisual() {
  btnConectar.classList.remove('online');
  btnConectar.textContent = 'CONECTAR📡';
  habilitarAcoes(false);
  log(' ⚠️ Dispositivo desconectado.');
}

function tratarComando(linha) {
  log('RX: ' + linha);

  if (linha === 'INICIO_LISTA') {
    listaEl.innerHTML = '';
    return;
  }

  if (linha.startsWith('PENDENTE;')) {
    const nome = linha.substring(9);
    const opt = document.createElement('option');
    opt.value = nome;
    opt.textContent = ' 🟠 ' + nome + '(Pendente)';
    opt.className = 'pendente';
    listaEl.appendChild(opt);
    return;
  }

  if (linha.startsWith('COLETADO;')) {
    const nome = linha.substring(9);
    const opt = document.createElement('option');
    opt.value = nome;
    opt.textContent = ' 🟢 ' + nome + '(Coletado)';
    opt.className = 'coletado';
    listaEl.appendChild(opt);
  }
}

function salvarArquivoBinario(nome, bytes) {
  const blob = new Blob([new Uint8Array(bytes)], { type: 'application/octet-stream' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = nome;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  log(' 💾 Arquivo salvo: ' + nome);
}

function processarEntrada(value) {
  for (const byte of value) {
    if (recebendoArquivo) {
      arquivoBuffer.push(byte);
      bytesRestantes--;

      if (tamanhoArquivo > 0) {
        const pct = Math.round(((tamanhoArquivo - bytesRestantes) / tamanhoArquivo) * 100);
        setProgresso(pct);
      }

      if (bytesRestantes <= 0) {
        recebendoArquivo = false;
        salvarArquivoBinario(arquivoAtual, arquivoBuffer);
        enviarComando('CONFIRMAR ' + arquivoAtual);

        if (resolucaoArquivo) {
          resolucaoArquivo();
          resolucaoArquivo = null;
        }
      }

      continue;
    }

    if (byte === 10 || byte === 13) {
      const linha = bufferTexto.trim();
      bufferTexto = '';

      if (linha.length > 0) {
        if (linha.startsWith('TAMANHO ')) {
          tamanhoArquivo = parseInt(linha.substring(8), 10);
          bytesRestantes = tamanhoArquivo;
        } else if (linha === 'INICIO_ARQUIVO') {
          recebendoArquivo = true;
          arquivoBuffer = [];
          setProgresso(0);
        } else {
          tratarComando(linha);
        }
      }
    } else {
      bufferTexto += String.fromCharCode(byte);
    }
  }
}

function escolherTransporte() {
  const bleAdapter = new WebBluetoothAdapter();
  if (bleAdapter.isSupported()) {
    return bleAdapter;
  }

  const serialAdapter = new WebSerialAdapter();
  if (serialAdapter.isSupported()) {
    return serialAdapter;
  }

  return null;
}

async function conectar() {
  try {
    transport = escolherTransporte();

    if (!transport) {
      log(' ❌ Navegador sem suporte a Web Bluetooth e Web Serial.');
      return;
    }

    const info = await transport.connect();
    transport.onData(processarEntrada);

    if (typeof transport.onDisconnect === 'function') {
      transport.onDisconnect(() => {
        desconectarVisual();
      });
    }

    btnConectar.classList.add('online');
    btnConectar.textContent = info.transport === 'ble' ? 'BLE Conectado👍' : 'Serial Conectado👍';
    habilitarAcoes(true);

    if (info.transport === 'ble') {
      log(' ✅ Conectado ao PA01 por BLE.');
    } else {
      log(' ✅ Conectado ao PA01 por Serial.');
      log(' ℹ️ Modo legado ativo. Priorize BLE na entrega final ao cliente.');
    }
  } catch (e) {
    log(' ❌ Erro ao conectar: ' + e);
    desconectarVisual();
  }
}

async function enviarComando(cmd) {
  if (!transport) {
    log(' ⚠️ Sem transporte ativo.');
    return;
  }

  log('TX: ' + cmd);
  await transport.send(cmd);
}

async function baixarSelecionado() {
  const opt = listaEl.value;
  if (!opt || opt.includes('Aguardando')) {
    log(' ⚠️ Selecione um arquivo!');
    return;
  }

  arquivoAtual = opt;
  tamanhoArquivo = 0;
  arquivoBuffer = [];
  setProgresso(0);

  await new Promise((resolve) => {
    resolucaoArquivo = resolve;
    enviarComando('BAIXAR ' + arquivoAtual);
  });
}

async function baixarTodos() {
  const options = Array.from(listaEl.options).filter((o) => o.className === 'pendente');
  if (options.length === 0) {
    log(' ⚠️ Nenhum arquivo pendente.');
    return;
  }

  for (const opt of options) {
    arquivoAtual = opt.value;
    tamanhoArquivo = 0;
    arquivoBuffer = [];
    setProgresso(0);
    log('⏳ Baixando: ' + arquivoAtual);

    await new Promise((resolve) => {
      resolucaoArquivo = resolve;
      enviarComando('BAIXAR ' + arquivoAtual);
    });
  }
}

btnConectar.addEventListener('click', conectar);
btnListar.addEventListener('click', async () => {
  listaEl.innerHTML = '<option>Carregando...</option>';
  await enviarComando('LISTAR');
});
btnBaixarSel.addEventListener('click', baixarSelecionado);
btnBaixarTodos.addEventListener('click', baixarTodos);
