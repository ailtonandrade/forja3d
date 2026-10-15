# Forja 3D

Protótipo de modelador 3D que roda no navegador, feito com [three.js](https://threejs.org): primitivas, edição de vértices, pincel de esculpir, materiais e texturas. Dá pra usar no computador e no celular.

## Instalar no Windows

Baixe o `Forja3D-Setup-<versão>.exe` da [release mais recente](../../releases/latest) e instale. Não precisa de administrador nem de instalar mais nada: o Node e o three.js vão embutidos e o app abre numa janela própria do Chrome ou do Edge, funcionando offline.

Os projetos ficam em `%LocalAppData%\Forja 3D\projetos` (um `.json` por projeto) e continuam lá se você desinstalar.

O instalador não é assinado digitalmente, então o Windows pode mostrar "O Windows protegeu o computador". Clique em **Mais informações › Executar assim mesmo**.

## Modelar no celular

1. Abra a Forja no computador e clique em **Celular** (barra de cima).
2. Clique em **Liberar acesso pela rede**. Se o Windows perguntar sobre o firewall, permita em **redes privadas**.
3. Com o celular no mesmo Wi-Fi, aponte a câmera para o QR code (ou digite o endereço, algo como `http://192.168.1.5:4631`).

O celular edita os mesmos projetos do computador, porque eles ficam salvos no PC. Evite abrir o mesmo projeto nos dois ao mesmo tempo: o último a salvar vence. O acesso só escuta em endereços de rede privada (nunca num IP público) e qualquer pessoa no mesmo Wi-Fi consegue abrir enquanto estiver liberado; desligue pelo mesmo botão quando terminar.

No celular: um dedo arrasta para girar a câmera, dois dedos aproximam e movem. Com o pincel ligado, um dedo **em cima da peça** esculpe e fora dela continua girando a câmera.

## Rodar sem instalar

Com o Node instalado: `node abrir.js` (ou `node abrir.js --rede` para já liberar o celular). Os projetos ficam na pasta `projetos/`.

Sem o Node, qualquer servidor estático serve (`python -m http.server 8080`), mas aí os projetos ficam no navegador (IndexedDB), não dá pra usar pelo celular e o three.js vem do CDN (precisa de internet).

## O que dá pra fazer

- **Projetos**: criar, abrir, duplicar e excluir, com miniatura e salvamento automático. Desfazer/refazer com Ctrl+Z / Ctrl+Shift+Z.
- **Modo objeto**: cubo, esfera, icoesfera, cilindro, cone, toro e plano com parâmetros editáveis; gizmo de mover/girar/escalar; ímã de grade; eixos global/local.
- **Modo edição** (Tab ou duplo clique no objeto): selecionar vértices por clique, face ou caixa; **edição proporcional** (puxa os vizinhos junto); Inflar, Murchar, Suavizar, Ruído, Achatar; Subdividir. A área que vai se mexer fica pintada de laranja, mais forte onde o movimento é total.
- **Pincel de esculpir** (P): Puxar, Arrastar, Inflar, Suavizar e Achatar, com **tamanho**, **força**, **núcleo** (a parte do centro que empurra com força total) e **queda** (suave, linear ou agulha) até a borda. A área que o pincel vai afetar aparece em azul antes de tocar.
- **Materiais PBR**: cor, metálico, rugosidade, opacidade, emissão; textura de cor e de relevo enviadas do computador ou geradas na hora (xadrez, tijolos, madeira, ruído, grade UV); repetição U/V.
- **Importar/exportar**: projeto `.json`, modelo `.glb` (import e export) e imagem `.png` do viewport.

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
| 1 / 3 / 7 / 5 | Vista frontal / lateral / topo / 3/4 |
| A · B · O | (edição) Selecionar tudo · caixa · proporcional |

## Gerar um instalador novo

Suba o número em `VERSION` e rode `instalador\publicar.bat`: monta o setup com o Inno Setup 6 e anexa na release do GitHub. Só montar, sem publicar: `powershell -ExecutionPolicy Bypass -File instalador\build.ps1`.

## Limitações conhecidas

- A edição não muda a topologia ainda: sem extrudar, excluir vértices, loop cut ou booleanas.
- UV é o padrão de cada primitiva e não é editável; deformar a malha estica a textura.
- Só mapas de cor e relevo (sem normal, rugosidade ou metálico separados) e um material por objeto.
- O pincel trabalha nos vértices que a malha já tem: para detalhes finos, subdivida antes.
