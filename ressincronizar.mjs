// Reajusta TODOS os tempos do storyboard.json aos tempos reais da narração (palavras.json + voz.json).
// Uso (na pasta do pack):  node projects/e-se-a-lua-sumisse/ressincronizar.mjs
// Não mexe no motor nem nas cenas: só desloca/estica os tempos de forma proporcional (cena a cena, frase a frase).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const pasta = path.dirname(fileURLToPath(import.meta.url));
const ler = (n) => JSON.parse(fs.readFileSync(path.join(pasta, n), 'utf8'));
const falha = (m) => { console.error('\n✖ ' + m + '\n'); process.exit(1); };

for (const n of ['storyboard.json', 'tempos-estimados.json', 'palavras.json', 'voz.json', 'narracao.txt'])
  if (!fs.existsSync(path.join(pasta, n))) falha(`Falta "${n}". Gere a voz antes: node tools/voz.mjs gerar projects/e-se-a-lua-sumisse`);

const linhas = fs.readFileSync(path.join(pasta, 'narracao.txt'), 'utf8').split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
const nPal = linhas.map((l) => l.split(/\s+/).length);
const palavras = ler('palavras.json');
const total = nPal.reduce((a, b) => a + b, 0);
if (palavras.length !== total)
  falha(`A voz devolveu ${palavras.length} palavras, mas a narração tem ${total}. Isso acontece se o texto foi alterado depois de montar o storyboard. Peça ao agente: "reajuste o storyboard aos tempos de frases.json".`);

// início real de cada linha (primeira palavra); a primeira linha começa em 0
const novo = []; let k = 0;
nPal.forEach((n, i) => { novo.push(i === 0 ? 0 : palavras[k].inicio); k += n; });
const velho = ler('tempos-estimados.json').inicioDasLinhas;
if (velho.length !== novo.length) falha('tempos-estimados.json não bate com a narração.');
const audio = ler('voz.json').duracao;
const durNova = +(audio + 0.5).toFixed(2);
const durVelha = ler('tempos-estimados.json').duracaoEstimada;
velho.push(durVelha); novo.push(durNova);

// mapa por partes (linear dentro de cada frase)
const mapa = (t) => {
  if (t <= velho[0]) return novo[0] + (t - velho[0]);
  for (let i = 0; i < velho.length - 1; i++)
    if (t <= velho[i + 1] + 1e-9) return novo[i] + ((t - velho[i]) / (velho[i + 1] - velho[i])) * (novo[i + 1] - novo[i]);
  return novo[novo.length - 1] + (t - velho[velho.length - 1]);
};
const r2 = (x) => Math.round(x * 100) / 100;
const CHAVES_TEMPO = new Set(['de', 'ate', 'em', 'inicio', 'fim', 'aparece', 'some']);
const ehKeyframes = (v) => Array.isArray(v) && v.length && v.every((q) => Array.isArray(q) && typeof q[0] === 'number');

function andar(no, chave) {
  if (Array.isArray(no)) return no.map((x) => andar(x));
  if (no && typeof no === 'object') {
    const o = {};
    for (const [c, v] of Object.entries(no)) {
      if (CHAVES_TEMPO.has(c) && typeof v === 'number') o[c] = r2(mapa(v));
      else if (c === 'anim' && v && typeof v === 'object') {
        o[c] = { ...v };
        for (const kf of ['pos', 'giro', 'escala']) if (ehKeyframes(v[kf])) o[c][kf] = v[kf].map(([t, ...resto]) => [r2(mapa(t)), ...resto]);
      } else o[c] = andar(v, c);
    }
    return o;
  }
  return no;
}

const arq = path.join(pasta, 'storyboard.json');
const sb = JSON.parse(fs.readFileSync(arq, 'utf8'));
if (!fs.existsSync(path.join(pasta, 'storyboard.estimado.json'))) fs.writeFileSync(path.join(pasta, 'storyboard.estimado.json'), JSON.stringify(sb, null, 1));
const saida = andar(sb);
saida.duracao = durNova;
saida.cenas[0].inicio = 0;
saida.cenas[saida.cenas.length - 1].fim = durNova;
for (let i = 1; i < saida.cenas.length; i++) saida.cenas[i].inicio = saida.cenas[i - 1].fim; // sem buracos
fs.writeFileSync(arq, JSON.stringify(saida, null, 1));
// os novos tempos viram a base (permite rodar de novo sem acumular erro)
fs.writeFileSync(path.join(pasta, 'tempos-estimados.json'), JSON.stringify({ aviso: 'Tempos reais da narração (já reajustados).', inicioDasLinhas: novo.slice(0, -1), duracaoEstimada: durNova }, null, 1));
const pedida = 110;
console.log(`✔ Storyboard reajustado: áudio ${audio}s, vídeo ${durNova}s (pedido: ${pedida}s, ${(100 * (audio - pedida) / pedida).toFixed(1)}%).`);
if (Math.abs(audio - pedida) / pedida > 0.15) console.log('⚠ A duração ficou a mais de 15% do pedido: ajuste o texto ou use  node tools/voz.mjs gerar ... --velocidade 1.05');
console.log('Próximo passo: node tools/validar.mjs projects/e-se-a-lua-sumisse');
