# Forja 3D

Protótipo de modelador 3D que roda direto no navegador, feito com [three.js](https://threejs.org). É um arquivo HTML só, sem build e sem instalar nada.

## Como abrir

Baixe o `.zip` da [release mais recente](../../releases/latest), extraia e sirva a pasta com qualquer servidor estático:

```bash
python -m http.server 8080
```

Depois abra http://localhost:8080 no Chrome ou no Edge. Abrir o `index.html` com duplo clique costuma funcionar no Chrome, mas o servidor local é o caminho garantido. Precisa de internet na primeira carga, porque o three.js vem do CDN jsDelivr.

## O que dá pra fazer

- **Projetos**: criar, abrir, duplicar e excluir. Tudo salva sozinho no navegador (IndexedDB), com miniatura. Desfazer/refazer com Ctrl+Z / Ctrl+Shift+Z.
- **Modo objeto**: cubo, esfera, icoesfera, cilindro, cone, toro e plano com parâmetros editáveis; gizmo de mover/girar/escalar; ímã de grade; eixos global/local.
- **Modo edição** (Tab ou duplo clique no objeto): selecionar vértices por clique, face ou caixa; **edição proporcional** (puxa os vizinhos junto); esculpir com Inflar, Murchar, Suavizar, Ruído e Achatar; Subdividir.
- **Materiais PBR**: cor, metálico, rugosidade, opacidade, emissão; textura de cor e de relevo enviadas do computador ou geradas na hora (xadrez, tijolos, madeira, ruído, grade UV); repetição U/V.
- **Importar/exportar**: projeto `.json`, modelo `.glb` (import e export) e imagem `.png` do viewport.

## Atalhos

| Tecla | Ação |
| --- | --- |
| G / R / S | Mover / girar / escalar |
| Tab | Entrar e sair do modo edição |
| Shift+A | Adicionar objeto |
| Shift+D | Duplicar |
| X ou Delete | Excluir |
| F | Enquadrar seleção |
| 1 / 3 / 7 / 5 | Vista frontal / lateral / topo / 3/4 |
| A · B · O | (edição) Selecionar tudo · caixa · proporcional |

## Limitações conhecidas

- A edição não muda a topologia ainda: sem extrudar, excluir vértices, loop cut ou booleanas.
- UV é o padrão de cada primitiva e não é editável; deformar a malha estica a textura.
- Só mapas de cor e relevo (sem normal, rugosidade ou metálico separados) e um material por objeto.
- Os projetos ficam só no navegador onde foram criados. Para levar a outro computador, use Exportar › Projeto Forja (.json).
