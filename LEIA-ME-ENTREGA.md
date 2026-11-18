# E se a Lua sumisse? — projeto pronto para voz e render

**Estado:** roteiro, plano de animação, storyboard (25 cenas, 110 s) e texto de postagem prontos. **Faltam a voz e o render do MP4**, que precisam da sua máquina (navegador, `npm install` e sua chave ElevenLabs).

## O que fazer (na pasta do pack)
1. Copie esta pasta para `projects/e-se-a-lua-sumisse/` e `config/canal.json` para `config/`.
2. `npm install` (uma vez). Precisa de Node 18+, ffmpeg e Chrome, Edge ou Brave.
3. Copie `.env.example` para `.env` e cole sua chave depois de `ELEVENLABS_API_KEY=` (edite você mesmo; não cole no chat).
4. Voz escolhida: **Will – Institucional**. Rode `node tools/voz.mjs configurar-paga --voz IKpiSijWzlhOL6uX83EH` (o teste no ElevenLabs deu cerca de 116 s, dentro do limite). Se a voz não aparecer, confira com `node tools/voz.mjs vozes` se ela está na mesma conta da chave.
5. `node tools/voz.mjs gerar projects/e-se-a-lua-sumisse`. A duração aceita fica entre 94 e 126 s; se fugir, use `--velocidade 1.05` ou `0.95`.
6. `node projects/e-se-a-lua-sumisse/ressincronizar.mjs` ajusta todos os tempos do storyboard à voz real.
7. `node tools/validar.mjs projects/e-se-a-lua-sumisse`
8. `node tools/render.mjs projects/e-se-a-lua-sumisse --quadros` e **olhe os quadros** (veja abaixo).
9. `--previa`, depois o render final, e `--capa 1.2` para a capa.

Com Claude Code aberto dentro da pasta, basta dizer "leia o AGENTE.md e continue o projeto e-se-a-lua-sumisse".

## Pontos que precisam do seu olho nos quadros
Eu não pude renderizar nem ver os quadros neste ambiente (sem navegador e sem internet), então a composição das cenas **não foi conferida visualmente**. Confira especialmente:
- **Céu:** Lua e estrelas ficam no alto do quadro (cenas 1, 2, 4, 5, 11, 20 a 22). Se a Lua cortar o título, mude `pos` dela.
- **Globo (cenas 3, 12 a 19 e 23):** esfera azul com eixo vermelho inclinado; confira se as duas pessoas cabem nas laterais.
- **Tartarugas (cena 6):** são peças simples de `forma`; confira se andam em direção ao mar.
- **Noite:** o motor não tem céu noturno. O escuro é feito com `tarde`, estrelas e efeito preto e branco.
