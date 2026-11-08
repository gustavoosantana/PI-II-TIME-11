-- Autor do arquivo: Gabriel Lopes Londe Rodrigues
-- Criacao do banco de dados do Sistema de Acompanhamento de Demandas
--
-- As tabelas e colunas seguem os nomes que as rotas ja usam:
--   listagem.rotas.ts  -> demandas, projetos, usuarios
--   cadastro.rotas.ts  -> insert/update em demandas, select em projetos
--
-- Cada comando termina com uma linha contendo apenas "/". Assim o mesmo
-- arquivo roda no SQL Developer, no SQL*Plus e no script banco/rodar.ts.
--
-- O arquivo pode ser rodado de novo: ele apaga as tabelas antigas antes
-- de criar. Os dados de teste sao os mesmos 12 exemplos do dashboard.

-- ---------------------------------------------------------------------
-- 1. Apaga o que ja existir
-- ---------------------------------------------------------------------
BEGIN
    FOR t IN (SELECT table_name FROM user_tables
              WHERE table_name IN ('HISTORICO_STATUS', 'COMENTARIOS', 'DEMANDAS', 'PROJETOS', 'USUARIOS')) LOOP
        EXECUTE IMMEDIATE 'DROP TABLE ' || t.table_name || ' CASCADE CONSTRAINTS';
    END LOOP;
    FOR s IN (SELECT sequence_name FROM user_sequences
              WHERE sequence_name IN ('SEQ_USUARIOS', 'SEQ_PROJETOS', 'SEQ_DEMANDAS', 'SEQ_COMENTARIOS', 'SEQ_HISTORICO')) LOOP
        EXECUTE IMMEDIATE 'DROP SEQUENCE ' || s.sequence_name;
    END LOOP;
END;
/

-- ---------------------------------------------------------------------
-- 2. Tabelas
-- ---------------------------------------------------------------------

-- Pessoas que usam o sistema. O perfil define o que cada uma pode fazer.
CREATE TABLE usuarios (
    id            NUMBER         PRIMARY KEY,
    nome          VARCHAR2(100)  NOT NULL,
    email         VARCHAR2(150)  NOT NULL,
    senha         VARCHAR2(100)  NOT NULL,
    perfil        VARCHAR2(30)   NOT NULL,
    data_criacao  DATE           DEFAULT SYSDATE NOT NULL,
    CONSTRAINT uq_usuarios_email UNIQUE (email),
    CONSTRAINT ck_usuarios_perfil CHECK (perfil IN ('Administrador', 'Lider de Projeto', 'Membro da equipe'))
)
/

-- Projetos aos quais as demandas pertencem. O responsavel e o lider.
CREATE TABLE projetos (
    id              NUMBER         PRIMARY KEY,
    nome            VARCHAR2(100)  NOT NULL,
    descricao       VARCHAR2(1000),
    data_inicio     DATE,
    data_fim        DATE,
    situacao        VARCHAR2(20)   DEFAULT 'Ativo' NOT NULL,
    id_responsavel  NUMBER,
    CONSTRAINT fk_projetos_responsavel FOREIGN KEY (id_responsavel) REFERENCES usuarios (id),
    CONSTRAINT ck_projetos_situacao CHECK (situacao IN ('Ativo', 'Pausado', 'Encerrado')),
    CONSTRAINT ck_projetos_datas CHECK (data_fim IS NULL OR data_inicio IS NULL OR data_fim >= data_inicio)
)
/

-- Demandas de desenvolvimento. A rota de cadastro aceita os valores com
-- e sem acento, por isso as duas formas sao permitidas aqui.
CREATE TABLE demandas (
    id                 NUMBER          PRIMARY KEY,
    titulo             VARCHAR2(150)   NOT NULL,
    descricao          VARCHAR2(4000)  NOT NULL,
    tipo               VARCHAR2(20)    NOT NULL,
    prioridade         VARCHAR2(10)    NOT NULL,
    status             VARCHAR2(20)    DEFAULT 'Aberta' NOT NULL,
    id_projeto         NUMBER          NOT NULL,
    id_responsavel     NUMBER,
    prazo_finalizacao  DATE,
    data_criacao       DATE            DEFAULT SYSDATE NOT NULL,
    data_atualizacao   DATE            DEFAULT SYSDATE NOT NULL,
    CONSTRAINT fk_demandas_projeto FOREIGN KEY (id_projeto) REFERENCES projetos (id),
    CONSTRAINT fk_demandas_responsavel FOREIGN KEY (id_responsavel) REFERENCES usuarios (id),
    CONSTRAINT ck_demandas_tipo CHECK (tipo IN ('Tarefa', 'Defeito', 'Melhoria', 'Documentação', 'Documentacao')),
    CONSTRAINT ck_demandas_prioridade CHECK (prioridade IN ('Crítica', 'Critica', 'Alta', 'Média', 'Media', 'Baixa')),
    CONSTRAINT ck_demandas_status CHECK (status IN ('Aberta', 'Em andamento', 'Em revisão', 'Em revisao', 'Concluída', 'Concluida', 'Cancelada'))
)
/

-- Comentarios feitos na tela de Detalhes da Demanda
CREATE TABLE comentarios (
    id            NUMBER          PRIMARY KEY,
    id_demanda    NUMBER          NOT NULL,
    id_usuario    NUMBER,
    texto         VARCHAR2(2000)  NOT NULL,
    data_criacao  DATE            DEFAULT SYSDATE NOT NULL,
    CONSTRAINT fk_comentarios_demanda FOREIGN KEY (id_demanda) REFERENCES demandas (id) ON DELETE CASCADE,
    CONSTRAINT fk_comentarios_usuario FOREIGN KEY (id_usuario) REFERENCES usuarios (id)
)
/

-- Toda mudanca de status fica registrada aqui
CREATE TABLE historico_status (
    id               NUMBER        PRIMARY KEY,
    id_demanda       NUMBER        NOT NULL,
    id_usuario       NUMBER,
    status_anterior  VARCHAR2(20),
    status_novo      VARCHAR2(20)  NOT NULL,
    data_alteracao   DATE          DEFAULT SYSDATE NOT NULL,
    CONSTRAINT fk_historico_demanda FOREIGN KEY (id_demanda) REFERENCES demandas (id) ON DELETE CASCADE,
    CONSTRAINT fk_historico_usuario FOREIGN KEY (id_usuario) REFERENCES usuarios (id)
)
/

CREATE INDEX ix_demandas_projeto ON demandas (id_projeto)
/
CREATE INDEX ix_demandas_responsavel ON demandas (id_responsavel)
/
CREATE INDEX ix_comentarios_demanda ON comentarios (id_demanda)
/
CREATE INDEX ix_historico_demanda ON historico_status (id_demanda)
/

-- ---------------------------------------------------------------------
-- 3. Numeracao automatica do id
--    Sequencia + trigger funciona em qualquer versao do Oracle XE.
--    O insert da rota de cadastro nao manda o id, quem preenche e o trigger.
-- ---------------------------------------------------------------------
CREATE SEQUENCE seq_usuarios START WITH 1 INCREMENT BY 1 NOCACHE
/
CREATE SEQUENCE seq_projetos START WITH 1 INCREMENT BY 1 NOCACHE
/
CREATE SEQUENCE seq_demandas START WITH 1 INCREMENT BY 1 NOCACHE
/
CREATE SEQUENCE seq_comentarios START WITH 1 INCREMENT BY 1 NOCACHE
/
CREATE SEQUENCE seq_historico START WITH 1 INCREMENT BY 1 NOCACHE
/

CREATE OR REPLACE TRIGGER trg_usuarios_id
BEFORE INSERT ON usuarios FOR EACH ROW
WHEN (NEW.id IS NULL)
BEGIN
    SELECT seq_usuarios.NEXTVAL INTO :NEW.id FROM dual;
END;
/

CREATE OR REPLACE TRIGGER trg_projetos_id
BEFORE INSERT ON projetos FOR EACH ROW
WHEN (NEW.id IS NULL)
BEGIN
    SELECT seq_projetos.NEXTVAL INTO :NEW.id FROM dual;
END;
/

CREATE OR REPLACE TRIGGER trg_demandas_id
BEFORE INSERT ON demandas FOR EACH ROW
WHEN (NEW.id IS NULL)
BEGIN
    SELECT seq_demandas.NEXTVAL INTO :NEW.id FROM dual;
END;
/

CREATE OR REPLACE TRIGGER trg_comentarios_id
BEFORE INSERT ON comentarios FOR EACH ROW
WHEN (NEW.id IS NULL)
BEGIN
    SELECT seq_comentarios.NEXTVAL INTO :NEW.id FROM dual;
END;
/

CREATE OR REPLACE TRIGGER trg_historico_id
BEFORE INSERT ON historico_status FOR EACH ROW
WHEN (NEW.id IS NULL)
BEGIN
    SELECT seq_historico.NEXTVAL INTO :NEW.id FROM dual;
END;
/

-- ---------------------------------------------------------------------
-- 4. Dados de teste
--    Os mesmos usuarios do login.ts e as mesmas 12 demandas do
--    dashboard.dados.ts, para os numeros das telas baterem.
-- ---------------------------------------------------------------------
INSERT INTO usuarios (nome, email, senha, perfil) VALUES ('Responsável 1', 'teste1@gmail.com', '123', 'Administrador')
/
INSERT INTO usuarios (nome, email, senha, perfil) VALUES ('Responsável 2', 'teste2@gmail.com', '456', 'Lider de Projeto')
/
INSERT INTO usuarios (nome, email, senha, perfil) VALUES ('Responsável 3', 'teste3@gmail.com', '789', 'Membro da equipe')
/

INSERT INTO projetos (nome, descricao, data_inicio, data_fim, situacao, id_responsavel)
VALUES ('Projeto 1', 'Projeto de exemplo para os testes', DATE '2026-08-01', DATE '2026-12-15', 'Ativo', 1)
/
INSERT INTO projetos (nome, descricao, data_inicio, data_fim, situacao, id_responsavel)
VALUES ('Projeto 2', 'Segundo projeto de exemplo', DATE '2026-09-01', NULL, 'Ativo', 2)
/

INSERT INTO demandas (titulo, descricao, tipo, prioridade, status, id_projeto, id_responsavel, prazo_finalizacao)
VALUES ('Exemplo 1', 'Descrição do exemplo 1', 'Defeito', 'Crítica', 'Aberta', 1, 1, DATE '2026-10-20')
/
INSERT INTO demandas (titulo, descricao, tipo, prioridade, status, id_projeto, id_responsavel, prazo_finalizacao)
VALUES ('Exemplo 2', 'Descrição do exemplo 2', 'Tarefa', 'Alta', 'Em andamento', 1, 2, DATE '2026-10-30')
/
INSERT INTO demandas (titulo, descricao, tipo, prioridade, status, id_projeto, id_responsavel, prazo_finalizacao)
VALUES ('Exemplo 3', 'Descrição do exemplo 3', 'Documentação', 'Baixa', 'Aberta', 2, NULL, NULL)
/
INSERT INTO demandas (titulo, descricao, tipo, prioridade, status, id_projeto, id_responsavel, prazo_finalizacao)
VALUES ('Exemplo 4', 'Descrição do exemplo 4', 'Melhoria', 'Média', 'Em revisão', 1, 3, DATE '2026-10-22')
/
INSERT INTO demandas (titulo, descricao, tipo, prioridade, status, id_projeto, id_responsavel, prazo_finalizacao)
VALUES ('Exemplo 5', 'Descrição do exemplo 5', 'Defeito', 'Crítica', 'Em andamento', 2, 2, DATE '2026-10-19')
/
INSERT INTO demandas (titulo, descricao, tipo, prioridade, status, id_projeto, id_responsavel, prazo_finalizacao)
VALUES ('Exemplo 6', 'Descrição do exemplo 6', 'Melhoria', 'Baixa', 'Concluída', 1, 1, DATE '2026-09-30')
/
INSERT INTO demandas (titulo, descricao, tipo, prioridade, status, id_projeto, id_responsavel, prazo_finalizacao)
VALUES ('Exemplo 7', 'Descrição do exemplo 7', 'Tarefa', 'Média', 'Aberta', 2, 3, DATE '2026-11-15')
/
INSERT INTO demandas (titulo, descricao, tipo, prioridade, status, id_projeto, id_responsavel, prazo_finalizacao)
VALUES ('Exemplo 8', 'Descrição do exemplo 8', 'Documentação', 'Média', 'Cancelada', 1, NULL, NULL)
/
INSERT INTO demandas (titulo, descricao, tipo, prioridade, status, id_projeto, id_responsavel, prazo_finalizacao)
VALUES ('Exemplo 9', 'Descrição do exemplo 9', 'Defeito', 'Alta', 'Aberta', 1, 1, DATE '2026-10-25')
/
INSERT INTO demandas (titulo, descricao, tipo, prioridade, status, id_projeto, id_responsavel, prazo_finalizacao)
VALUES ('Exemplo 10', 'Descrição do exemplo 10', 'Tarefa', 'Baixa', 'Em revisão', 2, 3, DATE '2026-11-05')
/
INSERT INTO demandas (titulo, descricao, tipo, prioridade, status, id_projeto, id_responsavel, prazo_finalizacao)
VALUES ('Exemplo 11', 'Descrição do exemplo 11', 'Melhoria', 'Alta', 'Aberta', 1, NULL, DATE '2026-11-20')
/
INSERT INTO demandas (titulo, descricao, tipo, prioridade, status, id_projeto, id_responsavel, prazo_finalizacao)
VALUES ('Exemplo 12', 'Descrição do exemplo 12', 'Defeito', 'Média', 'Concluída', 2, 2, DATE '2026-10-15')
/

INSERT INTO comentarios (id_demanda, id_usuario, texto) VALUES (2, 2, 'Comecei a implementação.')
/
INSERT INTO historico_status (id_demanda, id_usuario, status_anterior, status_novo) VALUES (2, 2, 'Aberta', 'Em andamento')
/

COMMIT
/
