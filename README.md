# PI-II-TIME-11

Nome Projeto: Sistema De Acompanhamento De Demandas De Desenvolvimento

Nome dos Integrantes: Eduardo Martins Colmati, Enzo Carleti Teixeira, Gustavo de Oliveira de Santana, José Gabriel Bedani

Curso: Engenharia de Software

Componente Curricular: Projeto Integrador II

Semestre: 2°semestre/2026

Professora Orientadora: Renata Antonia Tadeu Arantes

## Banco de dados (Oracle)

1. Conecte na VPN da PUC (FortiClient, gateway `vpn.sis.puc-campinas.edu.br:443/acad`).
2. No arquivo `.env`, preencha `ORACLE_USER` e `ORACLE_PASSWORD` com o seu usuário do banco.
3. Rode `npm run banco`. O script executa `banco/criar_banco.sql`, que cria as tabelas `usuarios`, `projetos`, `demandas`, `comentarios` e `historico_status` e insere os dados de teste.

O mesmo arquivo `banco/criar_banco.sql` também pode ser executado direto no SQL Developer.
