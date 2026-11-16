-- Autor: José Gabriel Bedani
-- Projeto: PI-II-TIME-11 - Sistema de Acompanhamento de Demandas
-- O que faz: cria as 5 tabelas do sistema e coloca alguns dados de exemplo.
-- Como usar: abrir no SQL Developer, conectar no banco e executar tudo (F5).
-- Pode ser executado várias vezes: o bloco do passo 1 apaga as tabelas antigas, se existirem.

-- 1. APAGA AS TABELAS ANTIGAS (só as que já existem, então não dá erro na primeira vez)
BEGIN
    FOR t IN (SELECT table_name FROM user_tables
              WHERE table_name IN ('HISTORICO', 'COMENTARIOS', 'DEMANDAS', 'PROJETOS', 'USUARIOS')) LOOP
        EXECUTE IMMEDIATE 'DROP TABLE ' || t.table_name || ' CASCADE CONSTRAINTS';
    END LOOP;
END;
/

-- 2. CRIA AS TABELAS
-- O "id" é gerado sozinho pelo banco (1, 2, 3...), por isso o sistema não precisa enviá-lo.
-- NOT NULL = campo obrigatório. Os campos sem NOT NULL podem ficar vazios.

-- Usuários. Perfis: Administrador, Líder de Projeto ou Membro da Equipe
-- (Nesta versão de demonstração a senha fica em texto simples. Num sistema real seria guardada com hash.)
CREATE TABLE usuarios (
    id     NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nome   VARCHAR2(100) NOT NULL,
    email  VARCHAR2(100) NOT NULL,
    senha  VARCHAR2(50)  NOT NULL,
    perfil VARCHAR2(30)  NOT NULL
);

-- Projetos. id_responsavel = usuário responsável pelo projeto
-- data_fim pode ficar vazia (projeto ainda sem data de término)
CREATE TABLE projetos (
    id             NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nome           VARCHAR2(100) NOT NULL,
    descricao      VARCHAR2(300),
    data_inicio    DATE NOT NULL,
    data_fim       DATE,
    situacao       VARCHAR2(30) NOT NULL,
    id_responsavel NUMBER NOT NULL REFERENCES usuarios (id)
);

-- Demandas. Cada demanda pertence a um projeto.
-- O responsável e o prazo podem ficar vazios e ser definidos depois.
CREATE TABLE demandas (
    id                NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    titulo            VARCHAR2(150) NOT NULL,
    descricao         VARCHAR2(500) NOT NULL,
    tipo              VARCHAR2(20)  NOT NULL,   -- Tarefa, Defeito, Melhoria ou Documentação
    prioridade        VARCHAR2(20)  NOT NULL,   -- Crítica, Alta, Média ou Baixa
    status            VARCHAR2(20)  NOT NULL,   -- Aberta, Em andamento, Em revisão, Concluída ou Cancelada
    id_projeto        NUMBER NOT NULL REFERENCES projetos (id),
    id_responsavel    NUMBER REFERENCES usuarios (id),
    prazo_finalizacao DATE,
    data_criacao      DATE NOT NULL,
    data_atualizacao  DATE NOT NULL
);

-- Comentários feitos em uma demanda
CREATE TABLE comentarios (
    id            NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_demanda    NUMBER NOT NULL REFERENCES demandas (id),
    id_usuario    NUMBER NOT NULL REFERENCES usuarios (id),
    texto         VARCHAR2(500) NOT NULL,
    data_registro DATE NOT NULL
);

-- Histórico de alterações. Nunca se apaga linhas desta tabela
CREATE TABLE historico (
    id            NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_demanda    NUMBER NOT NULL REFERENCES demandas (id),
    id_usuario    NUMBER NOT NULL REFERENCES usuarios (id),   -- quem fez a alteração
    descricao     VARCHAR2(300) NOT NULL,                     -- ex: "alterou o status de Aberta para Em andamento"
    data_registro DATE NOT NULL
);

-- 3. DADOS DE EXEMPLO
-- Como os ids são gerados em ordem, o 1º insert de cada tabela recebe id 1, o 2º recebe id 2, e assim por diante.

-- Usuários: Ana = 1, Lucas = 2, Maria = 3 (os mesmos e-mails e senhas do login)
INSERT INTO usuarios (nome, email, senha, perfil) VALUES ('Ana',   'teste1@gmail.com', '123', 'Administrador');
INSERT INTO usuarios (nome, email, senha, perfil) VALUES ('Lucas', 'teste2@gmail.com', '456', 'Líder de Projeto');
INSERT INTO usuarios (nome, email, senha, perfil) VALUES ('Maria', 'teste3@gmail.com', '789', 'Membro da Equipe');

-- Projetos: Sistema de Demandas = 1, Portal do Aluno = 2 (id_responsavel 2 = Lucas)
INSERT INTO projetos (nome, descricao, data_inicio, data_fim, situacao, id_responsavel)
VALUES ('Sistema de Demandas', 'Projeto Integrador II', DATE '2026-08-01', DATE '2026-12-10', 'Ativo', 2);
INSERT INTO projetos (nome, descricao, data_inicio, data_fim, situacao, id_responsavel)
VALUES ('Portal do Aluno', 'Consulta de notas e frequência', DATE '2026-09-01', NULL, 'Ativo', 2);

-- Demandas (ids 1 a 8, na ordem abaixo)
-- SYSDATE é a data de hoje. "SYSDATE + 3" quer dizer "daqui a 3 dias".
-- Assim o dashboard sempre tem demandas próximas do prazo, em qualquer dia da apresentação.
INSERT INTO demandas (titulo, descricao, tipo, prioridade, status, id_projeto, id_responsavel, prazo_finalizacao, data_criacao, data_atualizacao)
VALUES ('Erro ao salvar demanda', 'Dá erro 500 ao salvar sem descrição', 'Defeito', 'Crítica', 'Aberta', 1, 3, SYSDATE + 2, SYSDATE, SYSDATE);
INSERT INTO demandas (titulo, descricao, tipo, prioridade, status, id_projeto, id_responsavel, prazo_finalizacao, data_criacao, data_atualizacao)
VALUES ('Criar tela de login', 'Tela com validação de e-mail e senha', 'Tarefa', 'Alta', 'Em andamento', 1, 3, SYSDATE + 5, SYSDATE, SYSDATE);
INSERT INTO demandas (titulo, descricao, tipo, prioridade, status, id_projeto, id_responsavel, prazo_finalizacao, data_criacao, data_atualizacao)
VALUES ('Escrever o README', 'Instruções de instalação e uso', 'Documentação', 'Baixa', 'Aberta', 1, NULL, NULL, SYSDATE, SYSDATE);
INSERT INTO demandas (titulo, descricao, tipo, prioridade, status, id_projeto, id_responsavel, prazo_finalizacao, data_criacao, data_atualizacao)
VALUES ('Consulta de notas lenta', 'Demora mais de 10 segundos', 'Melhoria', 'Média', 'Em revisão', 2, 3, SYSDATE + 12, SYSDATE, SYSDATE);
INSERT INTO demandas (titulo, descricao, tipo, prioridade, status, id_projeto, id_responsavel, prazo_finalizacao, data_criacao, data_atualizacao)
VALUES ('Configurar o Oracle', 'Conexão e arquivo .env', 'Tarefa', 'Alta', 'Concluída', 1, 3, SYSDATE - 3, SYSDATE, SYSDATE);
INSERT INTO demandas (titulo, descricao, tipo, prioridade, status, id_projeto, id_responsavel, prazo_finalizacao, data_criacao, data_atualizacao)
VALUES ('Tema escuro', 'Opção de tema escuro nas telas', 'Melhoria', 'Baixa', 'Cancelada', 2, NULL, NULL, SYSDATE, SYSDATE);
INSERT INTO demandas (titulo, descricao, tipo, prioridade, status, id_projeto, id_responsavel, prazo_finalizacao, data_criacao, data_atualizacao)
VALUES ('Senha aparece no console', 'A senha fica visível após o login', 'Defeito', 'Crítica', 'Em andamento', 2, 3, SYSDATE + 1, SYSDATE, SYSDATE);
INSERT INTO demandas (titulo, descricao, tipo, prioridade, status, id_projeto, id_responsavel, prazo_finalizacao, data_criacao, data_atualizacao)
VALUES ('Manual do usuário', 'Explicar como usar cada tela', 'Documentação', 'Média', 'Aberta', 2, NULL, SYSDATE + 20, SYSDATE, SYSDATE);

-- Comentários (id_demanda, id_usuario): demanda 1 comentada por Lucas (2), demanda 2 por Maria (3)
INSERT INTO comentarios (id_demanda, id_usuario, texto, data_registro) VALUES (1, 2, 'Reproduzi o erro, falta validar no servidor.', SYSDATE);
INSERT INTO comentarios (id_demanda, id_usuario, texto, data_registro) VALUES (2, 3, 'Já terminei o HTML e o CSS.', SYSDATE);

-- Histórico (id_demanda, id_usuario): demanda 2 por Maria (3), demanda 4 por Lucas (2), demanda 6 por Ana (1)
INSERT INTO historico (id_demanda, id_usuario, descricao, data_registro) VALUES (2, 3, 'alterou o status de Aberta para Em andamento', SYSDATE);
INSERT INTO historico (id_demanda, id_usuario, descricao, data_registro) VALUES (4, 2, 'alterou o status de Em andamento para Em revisão', SYSDATE);
INSERT INTO historico (id_demanda, id_usuario, descricao, data_registro) VALUES (6, 1, 'cancelou a demanda', SYSDATE);

COMMIT;
