-- Autor: José Gabriel Bedani

BEGIN
    FOR t IN (SELECT table_name FROM user_tables
              WHERE table_name IN ('HISTORICO', 'COMENTARIOS', 'DEMANDAS', 'PROJETOS', 'USUARIOS')) LOOP
        EXECUTE IMMEDIATE 'DROP TABLE ' || t.table_name || ' CASCADE CONSTRAINTS';
    END LOOP;
END;
/

CREATE TABLE usuarios (
    id     NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nome   VARCHAR2(100) NOT NULL,
    email  VARCHAR2(100) NOT NULL,
    senha  VARCHAR2(50)  NOT NULL,
    perfil VARCHAR2(30)  NOT NULL
);

CREATE TABLE projetos (
    id             NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nome           VARCHAR2(100) NOT NULL,
    descricao      VARCHAR2(300),
    data_inicio    DATE NOT NULL,
    data_fim       DATE,
    situacao       VARCHAR2(30) NOT NULL,
    id_responsavel NUMBER NOT NULL REFERENCES usuarios (id)
);

CREATE TABLE demandas (
    id                NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    titulo            VARCHAR2(150) NOT NULL,
    descricao         VARCHAR2(500) NOT NULL,
    tipo              VARCHAR2(20)  NOT NULL,
    prioridade        VARCHAR2(20)  NOT NULL,
    status            VARCHAR2(20)  NOT NULL,
    id_projeto        NUMBER NOT NULL REFERENCES projetos (id),
    id_responsavel    NUMBER REFERENCES usuarios (id),
    prazo_finalizacao DATE,
    data_criacao      DATE NOT NULL,
    data_atualizacao  DATE NOT NULL
);

CREATE TABLE comentarios (
    id            NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_demanda    NUMBER NOT NULL REFERENCES demandas (id),
    id_usuario    NUMBER NOT NULL REFERENCES usuarios (id),
    texto         VARCHAR2(500) NOT NULL,
    data_registro DATE NOT NULL
);

CREATE TABLE historico (
    id            NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_demanda    NUMBER NOT NULL REFERENCES demandas (id),
    id_usuario    NUMBER NOT NULL REFERENCES usuarios (id),
    descricao     VARCHAR2(300) NOT NULL,
    data_registro DATE NOT NULL
);

INSERT INTO usuarios (nome, email, senha, perfil) VALUES ('Gustavo de Oliveira de Santana', 'gustavo@time11.com', 'gustavo123', 'Administrador');
INSERT INTO usuarios (nome, email, senha, perfil) VALUES ('Gabriel Lopes Londe Rodrigues',  'gabriel@time11.com', 'gabriel123', 'Líder de Projeto');
INSERT INTO usuarios (nome, email, senha, perfil) VALUES ('José Gabriel Bedani',            'jose@time11.com',    'jose123',    'Líder de Projeto');
INSERT INTO usuarios (nome, email, senha, perfil) VALUES ('Eduardo Martins Colmati',        'eduardo@time11.com', 'eduardo123', 'Membro da Equipe');
INSERT INTO usuarios (nome, email, senha, perfil) VALUES ('Enzo Carleti Teixeira',          'enzo@time11.com',    'enzo123',    'Membro da Equipe');

INSERT INTO projetos (nome, descricao, data_inicio, data_fim, situacao, id_responsavel)
VALUES ('Sistema de Demandas', 'Projeto Integrador II', DATE '2026-08-01', DATE '2026-12-10', 'Ativo', 2);
INSERT INTO projetos (nome, descricao, data_inicio, data_fim, situacao, id_responsavel)
VALUES ('Portal do Aluno', 'Consulta de notas e frequência', DATE '2026-09-01', NULL, 'Ativo', 3);

INSERT INTO demandas (titulo, descricao, tipo, prioridade, status, id_projeto, id_responsavel, prazo_finalizacao, data_criacao, data_atualizacao)
VALUES ('Erro ao salvar demanda', 'Dá erro 500 ao salvar sem descrição', 'Defeito', 'Crítica', 'Aberta', 1, 4, CAST(SYSTIMESTAMP AT TIME ZONE 'America/Sao_Paulo' AS DATE) + 2, CAST(SYSTIMESTAMP AT TIME ZONE 'America/Sao_Paulo' AS DATE), CAST(SYSTIMESTAMP AT TIME ZONE 'America/Sao_Paulo' AS DATE));
INSERT INTO demandas (titulo, descricao, tipo, prioridade, status, id_projeto, id_responsavel, prazo_finalizacao, data_criacao, data_atualizacao)
VALUES ('Criar tela de login', 'Tela com validação de e-mail e senha', 'Tarefa', 'Alta', 'Em andamento', 1, 5, CAST(SYSTIMESTAMP AT TIME ZONE 'America/Sao_Paulo' AS DATE) + 5, CAST(SYSTIMESTAMP AT TIME ZONE 'America/Sao_Paulo' AS DATE), CAST(SYSTIMESTAMP AT TIME ZONE 'America/Sao_Paulo' AS DATE));
INSERT INTO demandas (titulo, descricao, tipo, prioridade, status, id_projeto, id_responsavel, prazo_finalizacao, data_criacao, data_atualizacao)
VALUES ('Escrever o README', 'Instruções de instalação e uso', 'Documentação', 'Baixa', 'Aberta', 1, NULL, NULL, CAST(SYSTIMESTAMP AT TIME ZONE 'America/Sao_Paulo' AS DATE), CAST(SYSTIMESTAMP AT TIME ZONE 'America/Sao_Paulo' AS DATE));
INSERT INTO demandas (titulo, descricao, tipo, prioridade, status, id_projeto, id_responsavel, prazo_finalizacao, data_criacao, data_atualizacao)
VALUES ('Consulta de notas lenta', 'Demora mais de 10 segundos', 'Melhoria', 'Média', 'Em revisão', 2, 4, CAST(SYSTIMESTAMP AT TIME ZONE 'America/Sao_Paulo' AS DATE) + 12, CAST(SYSTIMESTAMP AT TIME ZONE 'America/Sao_Paulo' AS DATE), CAST(SYSTIMESTAMP AT TIME ZONE 'America/Sao_Paulo' AS DATE));
INSERT INTO demandas (titulo, descricao, tipo, prioridade, status, id_projeto, id_responsavel, prazo_finalizacao, data_criacao, data_atualizacao)
VALUES ('Configurar o Oracle', 'Conexão e arquivo .env', 'Tarefa', 'Alta', 'Concluída', 1, 2, CAST(SYSTIMESTAMP AT TIME ZONE 'America/Sao_Paulo' AS DATE) - 3, CAST(SYSTIMESTAMP AT TIME ZONE 'America/Sao_Paulo' AS DATE), CAST(SYSTIMESTAMP AT TIME ZONE 'America/Sao_Paulo' AS DATE));
INSERT INTO demandas (titulo, descricao, tipo, prioridade, status, id_projeto, id_responsavel, prazo_finalizacao, data_criacao, data_atualizacao)
VALUES ('Tema escuro', 'Opção de tema escuro nas telas', 'Melhoria', 'Baixa', 'Cancelada', 2, NULL, NULL, CAST(SYSTIMESTAMP AT TIME ZONE 'America/Sao_Paulo' AS DATE), CAST(SYSTIMESTAMP AT TIME ZONE 'America/Sao_Paulo' AS DATE));
INSERT INTO demandas (titulo, descricao, tipo, prioridade, status, id_projeto, id_responsavel, prazo_finalizacao, data_criacao, data_atualizacao)
VALUES ('Senha aparece no console', 'A senha fica visível após o login', 'Defeito', 'Crítica', 'Em andamento', 2, 5, CAST(SYSTIMESTAMP AT TIME ZONE 'America/Sao_Paulo' AS DATE) + 1, CAST(SYSTIMESTAMP AT TIME ZONE 'America/Sao_Paulo' AS DATE), CAST(SYSTIMESTAMP AT TIME ZONE 'America/Sao_Paulo' AS DATE));
INSERT INTO demandas (titulo, descricao, tipo, prioridade, status, id_projeto, id_responsavel, prazo_finalizacao, data_criacao, data_atualizacao)
VALUES ('Manual do usuário', 'Explicar como usar cada tela', 'Documentação', 'Média', 'Aberta', 2, 3, CAST(SYSTIMESTAMP AT TIME ZONE 'America/Sao_Paulo' AS DATE) + 20, CAST(SYSTIMESTAMP AT TIME ZONE 'America/Sao_Paulo' AS DATE), CAST(SYSTIMESTAMP AT TIME ZONE 'America/Sao_Paulo' AS DATE));

INSERT INTO comentarios (id_demanda, id_usuario, texto, data_registro) VALUES (1, 2, 'Reproduzi o erro, falta validar no servidor.', CAST(SYSTIMESTAMP AT TIME ZONE 'America/Sao_Paulo' AS DATE));
INSERT INTO comentarios (id_demanda, id_usuario, texto, data_registro) VALUES (2, 5, 'Já terminei o HTML e o CSS.', CAST(SYSTIMESTAMP AT TIME ZONE 'America/Sao_Paulo' AS DATE));

INSERT INTO historico (id_demanda, id_usuario, descricao, data_registro) VALUES (2, 5, 'alterou o status de Aberta para Em andamento', CAST(SYSTIMESTAMP AT TIME ZONE 'America/Sao_Paulo' AS DATE));
INSERT INTO historico (id_demanda, id_usuario, descricao, data_registro) VALUES (4, 3, 'alterou o status de Em andamento para Em revisão', CAST(SYSTIMESTAMP AT TIME ZONE 'America/Sao_Paulo' AS DATE));
INSERT INTO historico (id_demanda, id_usuario, descricao, data_registro) VALUES (6, 1, 'cancelou a demanda', CAST(SYSTIMESTAMP AT TIME ZONE 'America/Sao_Paulo' AS DATE));

COMMIT;
