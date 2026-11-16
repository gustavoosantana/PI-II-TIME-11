# PI-II-TIME-11

Nome Projeto: Sistema De Acompanhamento De Demandas De Desenvolvimento

Nome dos Integrantes: Eduardo Martins Colmati, Enzo Carleti Teixeira, Gustavo de Oliveira de Santana, José Gabriel Bedani

Curso: Engenharia de Software

Componente Curricular: Projeto Integrador II

Semestre: 2°semestre/2026

Professora Orientadora: Renata Antonia Tadeu Arantes


## Como executar o sistema

### 1. Criar o banco de dados (Oracle)
1. Abra o Oracle SQL Developer e conecte no banco.
2. Abra o arquivo `banco.sql` (na raiz do repositório) e execute tudo com F5.
3. O script cria as tabelas `usuarios`, `projetos`, `demandas`, `comentarios` e `historico` e insere os dados de exemplo.
4. Pode ser executado de novo quando quiser: ele apaga as tabelas antigas e cria tudo outra vez.

### 2. Configurar a conexão
1. Copie o arquivo `.env.example` e renomeie a cópia para `.env`.
2. Preencha `ORACLE_HOST`, `ORACLE_PORT`, `ORACLE_SERVICE`, `ORACLE_USER` e `ORACLE_PASSWORD` com os dados do seu banco. `PORT` é a porta do servidor (se ficar vazia, usa 3000).

### 3. Rodar o servidor
```
npm install
npm run dev
```
Depois abra `http://localhost:3000/login.html` no navegador.
Usuários (um por integrante):

| Integrante | E-mail | Senha | Perfil |
|---|---|---|---|
| Gustavo de Oliveira de Santana | `gustavo@time11.com` | `gustavo123` | Administrador |
| Gabriel Lopes Londe Rodrigues | `gabriel@time11.com` | `gabriel123` | Líder de Projeto (Sistema de Demandas) |
| José Gabriel Bedani | `jose@time11.com` | `jose123` | Líder de Projeto (Portal do Aluno) |
| Eduardo Martins Colmati | `eduardo@time11.com` | `eduardo123` | Membro da Equipe |
| Enzo Carleti Teixeira | `enzo@time11.com` | `enzo123` | Membro da Equipe |

Permissões (arquivo `permissoes.ts`): o Administrador pode tudo; o Líder de Projeto cadastra e altera as demandas dos projetos que lidera; o Membro da Equipe altera só as demandas em que é o responsável e não cadastra. Todos veem as demandas e podem comentar.

### Dashboard (José Gabriel Bedani)
A tela `pages/dashboard.html` chama `GET /dashboard`, que lê as demandas direto do banco (tabelas `demandas` e `usuarios`) e mostra os totais por status, prioridade e tipo, as demandas críticas em aberto e as próximas do prazo. O parâmetro `?dias=N` muda o período (1 a 365, padrão 7).
## Versão publicada (Render)

O sistema também fica publicado no Render. Lá as telas abrem normalmente, mas os dados não aparecem: o Oracle da PUC (`172.16.12.14`) só é alcançado de dentro da VPN, e o servidor do Render não está na VPN. O servidor sobe mesmo sem banco e as rotas que consultam o Oracle respondem com erro.

Para usar com os dados, rode no computador conectado na VPN (`npm install` e `npm run dev`) e abra `http://localhost:3000`.
