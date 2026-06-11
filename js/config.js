export const API_URL = 'http://localhost:3000';
export const PING_INTERVAL = 5000;

export const PASSWORDS = {
  teacher: 'PROF2026',
  exam: 'MATRIX2026'
};

export const TEACHER_DATA = {
  'aula1-mod1': {
    title: 'Aula 01 // Módulo 1.1: O Lado Oculto da Web',
    guideline: `
      <div class="guideline-section-title">Objetivo Pedagógico</div>
      <p>Introduzir o conceito de arquitetura Cliente-Servidor e o tráfego HTTP.</p>
      <div class="guideline-section-title">Pontos de Destaque</div>
      <ul class="guideline-list">
        <li>Explique a diferença clara de papéis: Frontend consome, Backend processa/persiste.</li>
        <li>Demonstre a analogia técnica do restaurante no fluxo interativo acima.</li>
        <li>Conceitue CORS de forma simples: uma trava no navegador para proteção do usuário.</li>
      </ul>
    `,
    solution: `// Módulo conceitual teórico.
// Sem exercícios práticos de código.`
  },
  'aula1-mod2': {
    title: 'Aula 01 // Módulo 1.2: Subindo o Servidor',
    guideline: `
      <div class="guideline-section-title">Objetivo Pedagógico</div>
      <p>Configurar o ambiente de desenvolvimento local (Node.js e JSON Server).</p>
      <div class="guideline-section-title">Pontos de Destaque</div>
      <ul class="guideline-list">
        <li>Garanta que os alunos criem a pasta física e a abram no VS Code corretamente.</li>
        <li>Instrua a usar a versão json-server@0.17.4 para garantir que IDs numéricos funcionem estavelmente.</li>
        <li>Demonstre a visualização no navegador pelo endereço http://localhost:3000/agentes.</li>
      </ul>
    `,
    solution: `// Comando para rodar o servidor simulado localmente:
npx json-server@0.17.4 db.json

// Conteúdo inicial sugerido para o arquivo db.json:
{
  "agentes": [
    { "id": "1", "nome": "Neo", "status": "Ativo" },
    { "id": "2", "nome": "Trinity", "status": "Oculto" }
  ]
}`
  },
  'aula1-mod3': {
    title: 'Aula 01 // Módulo 1.3: Operações CRUD',
    guideline: `
      <div class="guideline-section-title">Objetivo Pedagógico</div>
      <p>Dominar os métodos HTTP no console do desenvolvedor (F12) contra uma API ativa.</p>
      <div class="guideline-section-title">Pontos de Destaque</div>
      <ul class="guideline-list">
        <li>Explique o cabeçalho 'Content-Type: application/json' no POST e PUT.</li>
        <li>Mostre a diferença do POST (cadastrar novo registro) para o PUT (atualizar/sobrescrever).</li>
        <li>Use o console do navegador deste dashboard para disparar os testes.</li>
      </ul>
    `,
    solution: `// Exemplo de requisição POST via console:
fetch('http://localhost:3000/agentes', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ id: "3", nome: "Morpheus", status: "Procurado" })
})
.then(res => res.json())
.then(console.log);`
  },
  'aula1-mod4': {
    title: 'Aula 01 // Módulo 1.4: Conectando Frontend',
    guideline: `
      <div class="guideline-section-title">Objetivo Pedagógico</div>
      <p>Vincular elementos DOM de um arquivo HTML real às chamadas fetch da API local.</p>
      <div class="guideline-section-title">Pontos de Destaque</div>
      <ul class="guideline-list">
        <li>Instrua os alunos a criarem index.html and app.js em sua pasta local.</li>
        <li>Enfatize a atualização do DOM limpando a lista e recriando com innerHTML/appendChild.</li>
      </ul>
    `,
    solution: `// Motor JavaScript local (app.js):
const urlBase = 'http://localhost:3000/agentes';

function buscarAgentes() {
  fetch(urlBase)
    .then(res => res.json())
    .then(dados => {
      const lista = document.getElementById('lista-agentes');
      lista.innerHTML = '';
      dados.forEach(ag => {
        const li = document.createElement('li');
        li.textContent = \`[ID \${ag.id}] \${ag.nome} - \${ag.status}\`;
        lista.appendChild(li);
      });
    });
}`
  },
  'aula1-mod5': {
    title: 'Aula 01 // Módulo 1.5: Sincronização e Git',
    guideline: `
      <div class="guideline-section-title">Objetivo Pedagógico</div>
      <p>Entender o comportamento de Dev Server e versionar o código final.</p>
      <div class="guideline-section-title">Pontos de Destaque</div>
      <ul class="guideline-list">
        <li>Evite loops de refresh criando o arquivo de configurações ignore no VS Code (.vscode/settings.json).</li>
        <li>Estimule as boas práticas de versionamento com commits limpos.</li>
      </ul>
    `,
    solution: `// Conteúdo para o arquivo .vscode/settings.json:
{
  "liveServer.settings.ignoreFiles": [
    "**/db.json"
  ]
}`
  },
  'revisao-simulado': {
    title: 'Revisão // Simulado de CRUD (18/06)',
    guideline: `
      <div class="guideline-section-title">Objetivo Pedagógico</div>
      <p>Simular o fluxo completo da avaliação final, rodando testes CRUD (GET, POST, PUT, DELETE) na máquina do aluno.</p>
      <div class="guideline-section-title">Pontos de Destaque</div>
      <ul class="guideline-list">
        <li>Os alunos praticarão subindo o JSON Server local na porta 3000.</li>
        <li>O simulador tenta criar, ler, editar e remover o agente Cypher (ID 9).</li>
        <li>Isso garante que todas as operações básicas de persistência e requisições HTTP da Aula 1 foram compreendidas.</li>
      </ul>
    `,
    solution: `// Comando para rodar o servidor simulado localmente:
npx json-server@0.17.4 db.json --port 3000

// db.json de seed padrão da Aula 1:
{
  "agentes": [
    { "id": "1", "nome": "Neo", "status": "Ativo" },
    { "id": "2", "nome": "Trinity", "status": "Oculto" }
  ]
}

// Rotas consumidas no teste do simulado:
// 1. GET http://localhost:3000/agentes
// 2. POST http://localhost:3000/agentes (com id: "9", nome: "Cypher", status: "Ativo")
// 3. PUT http://localhost:3000/agentes/9 (com nome: "Cypher", status: "Procurado")
// 4. DELETE http://localhost:3000/agentes/9`
  },
  'revisao-simulado2': {
    title: 'Revisão // Simulado Avançado (PATCH) (20/06)',
    guideline: `
      <div class="guideline-section-title">Objetivo Pedagógico</div>
      <p>Simular atualizações parciais com o método <code>PATCH</code> e a leitura de dados no backend local.</p>
      <div class="guideline-section-title">Pontos de Destaque</div>
      <ul class="guideline-list">
        <li>Os alunos usarão o verbo <code>PATCH</code> para editar apenas propriedades específicas do registro.</li>
        <li>O simulador testa a alteração parcial do status da Trinity (ID 2) para "Oculto" preservando seu nome.</li>
        <li>O simulador também valida a inclusão e exclusão do agente Niobe (ID 10) para testar o CRUD combinado.</li>
      </ul>
    `,
    solution: `// Comando para rodar o servidor simulado localmente:
npx json-server@0.17.4 db.json --port 3000

// Exemplo de chamada PATCH para atualização parcial:
fetch('http://localhost:3000/agentes/2', {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ status: "Oculto" })
})
.then(res => res.json())
.then(console.log);`
  },
  'avaliacao1': {
    title: 'Avaliação 1 // Teste Prático de Backend (json-server)',
    guideline: `
      <div class="guideline-section-title">Objetivo Pedagógico (Prova)</div>
      <p>Verificar se o aluno consegue subir um servidor local <code>json-server</code> e realizar requisições CRUD completas (GET, POST, PUT, DELETE) na rota <code>/agentes</code>.</p>
      <div class="guideline-section-title">Pontos de Destaque</div>
      <ul class="guideline-list">
        <li>O aluno deve subir o servidor usando <code>npx json-server@0.17.4 db.json</code> na porta 3000.</li>
        <li>O arquivo <code>db.json</code> deve iniciar contendo os agentes "Neo" (status: Ativo) e "Trinity" (status: Oculto).</li>
        <li>O validador da prova executará uma bateria de testes cobrindo as quatro operações fundamentais do CRUD.</li>
      </ul>
      <div class="guideline-section-title">Apoio de Depuração</div>
      <p>Caso algum teste falhe, verifique se o servidor está ativo, se a porta 3000 não está em uso por outro processo e se o arquivo <code>db.json</code> foi resetado com os dados originais.</p>
    `,
    solution: `// Comando para iniciar o servidor JSON local:
npx json-server@0.17.4 db.json

// Conteúdo original necessário para db.json:
{
  "agentes": [
    { "id": "1", "nome": "Neo", "status": "Ativo" },
    { "id": "2", "nome": "Trinity", "status": "Oculto" }
  ]
}

// Exemplos de chamadas que a bateria de testes executa:
// 1. GET http://localhost:3000/agentes (deve conter Neo e Trinity)
// 2. POST http://localhost:3000/agentes (com id: "3", nome: "Morpheus", status: "Procurado")
// 3. PUT http://localhost:3000/agentes/2 (com nome: "Trinity", status: "Ativo")
// 4. DELETE http://localhost:3000/agentes/3 (limpeza pós-teste)`
  }
};

// Auto-fill dictionary keys for all other modules to prevent reference errors
for (let a = 2; a <= 5; a++) {
  for (let m = 1; m <= 5; m++) {
    const key = `aula${a}-mod${m}`;
    TEACHER_DATA[key] = {
      title: `Aula 0${a} // Módulo ${a}.${m}`,
      guideline: `
        <div class="guideline-section-title">Objetivo Pedagógico</div>
        <p>Desenvolver os conceitos correspondentes à Aula 0${a} Módulo ${m} descritos na ementa.</p>
        <div class="guideline-section-title">Pontos de Destaque</div>
        <ul class="guideline-list">
          <li>Instrua os alunos a executarem as atividades passo a passo no seu VS Code local.</li>
          <li>Garantir a verificação dos checklists antes de prosseguir.</li>
        </ul>
      `,
      solution: `// Soluções para Aula 0${a} - Módulo ${m}.
// Consulte a trilha local para códigos de referência correspondentes.`
    };
  }
}
