# Forja 3D

Protótipo de modelador 3D que roda no navegador, feito com [three.js](https://threejs.org): primitivas, edição de vértices, pincel de esculpir, materiais e texturas. Dá pra usar no computador e no celular.

## Instalar no Windows

Baixe o `Forja3D-Setup-<versão>.exe` da [release mais recente](../../releases/latest) e instale. Não precisa de administrador nem de instalar mais nada: o Node e o three.js vão embutidos, o instalador cria o atalho **Forja 3D** na área de trabalho e no menu Iniciar, e o app abre numa janela própria do Chrome ou do Edge, funcionando offline.

**Atualizações:** quando sai uma versão nova, aparece o botão **Atualizar para X** na barra de cima. Ele baixa o setup novo, confere a assinatura e instala por cima sozinho; a janela recarrega já na versão nova e os projetos continuam onde estavam.

Os projetos ficam em `%LocalAppData%\Forja 3D\projetos` (um `.json` por projeto) e continuam lá se você desinstalar.

O instalador não é assinado digitalmente, então o Windows pode mostrar "O Windows protegeu o computador". Clique em **Mais informações › Executar assim mesmo**.

## Modelar no celular

O acesso pelo celular já vem ligado. O endereço aparece no **título da janela** da Forja (por exemplo `Forja 3D · 192.168.1.5:4631`).

1. Na primeira vez, se o Windows perguntar sobre o firewall, permita em **redes privadas**.
2. Com o celular no mesmo Wi-Fi, digite no navegador dele o endereço do título (`http://192.168.1.5:4631`), ou clique em **Celular** na barra de cima e aponte a câmera para o QR code.

O celular edita os mesmos projetos do computador, porque eles ficam salvos no PC. Evite abrir o mesmo projeto nos dois ao mesmo tempo: o último a salvar vence. O acesso só escuta em endereços de rede privada (nunca num IP público ou de VPN) e qualquer pessoa no mesmo Wi-Fi consegue abrir; para desligar, use **Celular › Desligar acesso pela rede** (ou rode o servidor com `--sem-rede`).

No celular: um dedo arrasta para girar a câmera, dois dedos aproximam e movem. Com o pincel ligado, um dedo **em cima da peça** esculpe e fora dela continua girando a câmera.

## Rodar sem instalar

Com o Node instalado: dois cliques em `abrir-forja.bat` (ou `node abrir.js`). Os projetos ficam na pasta `projetos/`.

Sem o Node, qualquer servidor estático serve (`python -m http.server 8080`), mas aí os projetos ficam no navegador (IndexedDB), não dá pra usar pelo celular e o three.js vem do CDN (precisa de internet).

## O que dá pra fazer

- **Projetos**: criar, abrir, duplicar e excluir, com miniatura e salvamento automático. Desfazer/refazer com Ctrl+Z / Ctrl+Shift+Z (sem tirar você da ferramenta em uso). O projeto de **modelo** (casinha estilo Pixar com um humano esculpido, em `exemplos/`) abre na primeira vez e em **Novo a partir do modelo**.
- **Modo objeto**: cubo, esfera, icoesfera, cilindro, cone, toro e plano com parâmetros editáveis; gizmo de mover/girar/escalar; ímã de grade; eixos global/local; **câmera padrão** (H). **Juntar objetos** transforma vários objetos em um só e solda os vértices encostados (o Ctrl+J do Blender). **Booleanas**: selecione vários com Shift + clique (o primeiro é o **A**) e use **A corta B** (ex.: um cilindro abrindo uma janela na parede), **Unir A + B** ou **Só o que se cruza**; o A fica escondido para reaproveitar.
- **Modo edição** (Tab ou duplo clique no objeto): selecionar por **vértices, arestas ou faces**; **Extrudar** (E) faces ou arestas e **Cortar em loop** (C; Shift+C = 2 cortes), os dois com prévia antes de aplicar (mova o mouse para ajustar, clique ou Enter aplica, Esc cancela); selecionar vértices por clique, face ou caixa; **edição proporcional** (puxa os vizinhos junto); Inflar, Murchar, Suavizar, Ruído, Achatar; Subdividir; **Unir vértices** próximos (com distância) ou a seleção no centro. A área que vai se mexer fica pintada de laranja, mais forte onde o movimento é total.
- **Pincel de esculpir** (P): Puxar, Arrastar, Inflar, Suavizar e Achatar, com **tamanho**, **força**, **núcleo** (a parte do centro que empurra com força total) e **queda** (suave, linear ou agulha) até a borda. A área que o pincel vai afetar aparece em azul antes de tocar. **Subdividir ao esculpir** (o Dyntopo do Blender) cria polígonos onde a superfície estica, com controle de **Detalhe**.
- **Materiais PBR**: cor, metálico, rugosidade, opacidade, emissão; textura de cor e de relevo enviadas do computador ou geradas na hora: telhas, reboco, tábuas, pedras, grama, terra, casca de árvore, folhagem, jeans, malha, couro, cabelo, tijolos, madeira, ruído e grade UV; repetição U/V.
- **Luzes**: Sol (luz infinita), Spot, Ponto (lâmpada) e Área (softbox), adicionadas pelo **+** como objetos da cena. Cada uma tem cor (com atalhos de temperatura: vela, lâmpada, neutra, dia, nublado), intensidade e sombra; o spot tem abertura e borda suave. Gire (R) para mirar.
- **Ambiente**: hora do dia (manhã, meio-dia, pôr do sol, noite), cor, força, altura e direção do sol, cor do céu e do chão, e reflexos de **Estúdio** ou de **Céu e sol** (metal e vidro refletem o céu e o brilho do sol da cena).
- **Importar/exportar**: projeto `.json`, modelo `.glb` (import e export; as luzes não vão no `.glb`) e imagem `.png` do viewport.

## Atalhos

| Tecla | Ação |
| --- | --- |
| G / R / S | Mover / girar / escalar |
| Tab | Entrar e sair do modo edição |
| P | Ligar/desligar o pincel |
| [ e ] | Diminuir/aumentar o pincel |
| Ctrl (segurando) | Inverte o pincel (afunda em vez de puxar) |
| Shift+A | Adicionar objeto |
| Shift+D | Duplicar |
| X ou Delete | Excluir |
| F | Enquadrar seleção |
| H | Câmera padrão |
| E · C · Shift+C | (edição) Extrudar · cortar · cortar em 2 |
| 1 / 3 / 7 / 5 | Vista frontal / lateral / topo / 3/4 |
| A · B · O | (edição) Selecionar tudo · caixa · proporcional |

## Gerar um instalador novo

Suba o número em `VERSION` e rode `instalador\publicar.bat`. Ele monta o setup com o Inno Setup 6, assina e cria a release `v<versão>` no GitHub com o setup e o `atualizacao.json`. As Forjas instaladas mostram o botão de atualizar em até 30 minutos (ou na próxima vez que abrirem). Só montar, sem publicar: `powershell -ExecutionPolicy Bypass -File instalador\build.ps1`.

A atualização só é aceita se vier assinada com a chave privada em `%USERPROFILE%\.forja3d\chave-atualizacao.pem` (fica fora do repositório). **Faça backup dela:** sem essa chave, as Forjas já instaladas não aceitam mais nenhuma versão nova e cada pessoa teria que reinstalar à mão.

## Limitações conhecidas

- Ainda não dá para excluir vértices ou faces; o corte em loop só atravessa partes feitas de quadrados.
- As booleanas precisam de objetos fechados (sem buracos) e o gizmo move só o último objeto clicado da seleção.
- UV é o padrão de cada primitiva e não é editável; deformar a malha estica a textura.
- Só mapas de cor e relevo (sem normal, rugosidade ou metálico separados) e um material por objeto.
- O pincel trabalha nos vértices que a malha já tem: para detalhes finos, subdivida antes.
