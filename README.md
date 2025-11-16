# 👑 Rei do Bacbo - Gestão Profissional de Banca

## 🎰 Visão Geral

Aplicação web completa para gestão profissional de banca em jogos de Baccarat (Bacbo). Interface moderna, elegante e totalmente otimizada para dispositivos móveis.

## ✨ Funcionalidades Principais

### 💰 Gestão de Banca
- Configuração de banca inicial
- Acompanhamento em tempo real do saldo
- Cálculo automático de lucro/prejuízo
- Indicadores visuais de performance

### 🎲 Registro de Apostas
- **Tipos de Aposta:**
  - PLAYER (Pagamento 1:1)
  - BANKER (Pagamento 1:1)
  - TIE (Empate) com multiplicadores variáveis:
    - 4x, 6x, 10x, 25x, 88x

- **Entrada Rápida:**
  - Botões de atalho (3%, 5%, 10% da banca)
  - Input customizado para valores específicos
  - Seleção visual de tipo de aposta
  - Registro instantâneo de resultados

### 📊 Estatísticas Detalhadas
- Total de apostas realizadas
- Número de vitórias e derrotas
- Win Rate (taxa de acerto)
- Aposta média
- Lucro/Prejuízo total
- **ROI (Return on Investment)** - Retorno percentual sobre banca inicial
- Sequência atual (streak)
- Melhor sequência
- **Tempo de Sessão** - Duração desde o início da banca
- Gráfico de performance visual

### 📜 Histórico Completo
- Lista detalhada de todas as apostas
- **Filtros Inteligentes:**
  - Todos
  - PLAYER
  - BANKER
  - TIE
  - Vitórias
  - Derrotas
- Informações por aposta:
  - Data e hora
  - Tipo de aposta
  - Valor apostado
  - Resultado
  - Multiplicador (se TIE)
  - Lucro/Prejuízo
  - Saldo após a aposta
- Opção de deletar apostas individuais
- **Exportação para CSV com estatísticas completas:**
  - ROI da sessão
  - Win Rate
  - Tempo de sessão
  - Total de apostas

### ⚠️ Stop Loss / Stop Gain
- Sistema configurável de limites
- **Stop Loss:** Define perda máxima aceitável
- **Stop Gain:** Define meta de lucro
- Alertas visuais quando limites são atingidos
- Bloqueio automático de novas apostas
- Cálculo de porcentagem sobre banca inicial

### 📅 Plano de Gestão 30 Dias
- Geração de plano progressivo
- **Tipos de Progressão:**
  - Fixa: Aumento em R$ por dia
  - Percentual: Aumento em % por dia
- Preview dos primeiros 7 dias
- Visualização do valor no dia 30
- **Lucro Total Projetado** com ROI
- **Opção de Arredondamento** para valores inteiros
- Exportação completa para planilha CSV com:
  - ROI projetado
  - Configurações utilizadas
  - Resumo completo

## ⌨️ Atalhos de Teclado

- **Enter:** Confirmar último resultado (após selecionar tipo de aposta)
- **ESC:** Resetar formulário de aposta
- **Atalhos Rápidos:** Botões de 3%, 5%, 10% da banca

## 🎨 Design e Interface

### Paleta de Cores
- **Verde Escuro:** #0A4D3C (Dark Green)
- **Verde Profundo:** #052D22 (Deep Green)
- **Dourado:** #D4AF37 (Primary Gold)
- **Dourado Claro:** #F4E4B5 (Light Gold)
- **Preto:** #0D0D0D
- **Sucesso:** #28A745 (Verde)
- **Perigo:** #DC3545 (Vermelho)
- **Aviso:** #FFC107 (Amarelo)

### Características Visuais
- Design luxuoso com tema de cassino
- Gradientes sofisticados
- Bordas douradas brilhantes
- Animações suaves
- Efeitos de sombra e brilho
- Ícones intuitivos

### Responsividade
- 100% otimizado para mobile
- Interface touch-friendly
- Botões grandes e espaçados
- Navegação por abas
- Scrolling suave
- Prevenção de zoom indesejado

## 🛠️ Tecnologias

- **HTML5:** Estrutura semântica
- **CSS3:** Estilização avançada com gradientes e animações
- **JavaScript Vanilla:** Lógica de negócio pura
- **Canvas API:** Gráficos de performance
- **LocalStorage:** Persistência de dados offline

## 📱 Uso

### Primeira Configuração
1. Abra `index.html` no navegador
2. Digite sua banca inicial
3. Clique em "Iniciar"

### Registrando Apostas
1. Escolha o valor (atalhos 3%, 5%, 10% ou custom)
2. Selecione o tipo (PLAYER/BANKER/TIE)
3. Se TIE, escolha o multiplicador
4. Clique em GANHOU ou PERDEU
5. **Atalho:** Pressione Enter após selecionar o tipo

### Filtrando Histórico
1. Vá na aba "Histórico"
2. Clique nos botões de filtro:
   - **Todos:** Mostra todas as apostas
   - **Player/Banker/Tie:** Filtra por tipo de aposta
   - **Vitórias/Derrotas:** Filtra por resultado
3. O filtro permanece ativo até ser alterado

### Configurando Stop Loss
1. Vá na aba "Stop"
2. Ative o toggle
3. Configure perda máxima
4. Configure lucro máximo
5. Salve as configurações

### Gerando Plano 30 Dias
1. Vá na aba "30D"
2. Defina valor base inicial
3. Escolha tipo de progressão
4. Configure o incremento
5. Clique em "Gerar Plano"
6. Baixe a planilha em CSV

### Exportando Dados
- **Histórico:** Botão na aba Histórico
- **Plano 30 Dias:** Após gerar o plano
- Formato CSV compatível com Excel

## 💾 Armazenamento

Todos os dados são salvos automaticamente no navegador:
- Banca atual e inicial
- Histórico completo de apostas
- Configurações de Stop Loss
- Preferências do usuário

**Nota:** Os dados persistem mesmo após fechar o navegador!

## 🔒 Segurança

- Validação de todos os inputs
- Confirmação para ações destrutivas
- Proteção contra valores inválidos
- Verificação de saldo antes de apostas
- Bloqueio automático por Stop Loss

## 🎯 Diferenciais

### Multiplicadores de TIE
Sistema único com 5 opções de multiplicadores para apostas TIE:
- **4x:** Conservador
- **6x:** Moderado
- **10x:** Agressivo
- **25x:** Muito Agressivo
- **88x:** Extremo

### Sistema de Progressão Inteligente
- Progressão fixa ideal para bankrolls maiores
- Progressão percentual ideal para crescimento exponencial
- Visualização clara do crescimento projetado

### Interface Profissional
- Design premium de cassino
- Animações fluidas
- Feedback visual imediato
- Toasts informativos
- Modais de confirmação

## 📊 Recursos Estatísticos

### Métricas Calculadas
- **Win Rate:** Percentual de acerto
- **ROI:** Retorno sobre investimento em %
- **Streaks:** Sequências de vitórias/derrotas
- **Aposta Média:** Valor médio apostado
- **Performance:** Gráfico temporal
- **Tempo de Sessão:** Duração desde início da banca
- **Lucro/Prejuízo:** Resultado financeiro absoluto

### Análises Visuais
- Gráfico de linha da evolução da banca
- Indicadores coloridos (verde/vermelho)
- Grid de estatísticas organizadas
- Cards de streak destacados

## 🚀 Instalação

1. Baixe os arquivos:
   - `index.html`
   - `app.js`

2. Abra `index.html` em qualquer navegador moderno

3. Para mobile:
   - Envie os arquivos para seu smartphone
   - Abra com navegador (Chrome, Safari, etc.)
   - Adicione à tela inicial para acesso rápido

## 📖 Estrutura do Projeto

```
BACBO_GERENCIADOR/
├── index.html          # Interface principal
├── app.js             # Lógica da aplicação
└── README.md          # Documentação
```

## 🎮 Fluxo de Uso Recomendado

1. **Início da Sessão:**
   - Configure banca inicial
   - Defina Stop Loss e Stop Gain
   - Planeje suas apostas

2. **Durante o Jogo:**
   - Registre todas as apostas
   - Monitore estatísticas em tempo real
   - Respeite os limites configurados

3. **Final da Sessão:**
   - Revise o histórico
   - Analise as estatísticas
   - Exporte os dados
   - Planeje a próxima sessão

4. **Gestão de Longo Prazo:**
   - Gere plano de 30 dias
   - Acompanhe a progressão
   - Ajuste estratégia conforme resultados

## ⚡ Performance

- Carregamento instantâneo
- Sem dependências externas
- Funciona offline
- Otimizado para mobile
- Baixo consumo de recursos

## 🔄 Melhorias Recentes

### ✅ Implementado (Versão Atual)
- ✅ ROI calculado e exibido nas estatísticas
- ✅ Validação visual aprimorada (borda vermelha para saldo insuficiente)
- ✅ Filtros de histórico (Todos, Player, Banker, Tie, Vitórias, Derrotas)
- ✅ Rastreamento de tempo de sessão
- ✅ Atalhos de teclado (Enter e ESC)
- ✅ Exportações CSV aprimoradas com ROI, Win Rate e tempo de sessão
- ✅ Persistência do valor da aposta após registrar resultado
- ✅ Botão de exclusão reposicionado para evitar cliques acidentais

### 🔮 Atualizações Futuras Planejadas

- [ ] Gráficos adicionais (pizza, barras)
- [ ] Modo escuro/claro
- [ ] Múltiplas bankrolls
- [ ] Importação de dados
- [ ] Estatísticas avançadas por tipo de aposta
- [ ] Sistema de metas e conquistas
- [ ] Comparação entre sessões
- [ ] Backup em nuvem
- [ ] Indicadores de performance por hora/dia
- [ ] Gráficos responsivos otimizados

## 📝 Notas Importantes

- **Dados Locais:** Tudo fica no navegador
- **Sem Backend:** Não há servidor
- **Privacidade:** Seus dados não saem do dispositivo
- **Backup:** Exporte regularmente seus dados
- **Reset Cuidado:** Ação irreversível

## 🆘 Suporte

Em caso de problemas:
1. Limpe o cache do navegador
2. Exporte seus dados antes de resetar
3. Use navegadores atualizados
4. Certifique-se de ter JavaScript habilitado

## 📄 Licença

Uso livre para fins pessoais.

---

**👑 Rei do Bacbo - Gestão Profissional de Banca**

*Desenvolvido com foco em usabilidade, performance e design premium.*
