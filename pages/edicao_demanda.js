const API_BASE_URL = "http://localhost:3000";
const erro_nome = document.getElementById("erro_nome");
const erro_desc = document.querySelector("#erro_desc");
const erro_assoc = document.querySelector("#erro_assoc");
const erro_tipos = document.querySelector("#erro_tipos")
const erro_prio = document.querySelector("#erro_prio")
const erro_status = document.querySelector("#erro_status")
const erro_prazo = document.querySelector("#erro_prazo")
const erro_data = document.querySelector("#erro_prazo")
const campo_nome = document.querySelector(".campo_nome");
const campo_desc = document.querySelector(".campo_desc")
const campo_assoc = document.querySelector(".campo_assoc")
const campo_data = document.querySelector(".data")
const botao = document.querySelector(".botao");

function mostrarErroCampo(elemento) {
    elemento.style.display = "flex";
    window.scrollTo({ top: 0, behavior: "smooth" });
}

function mostrarErro(json) {
    alert(json.mensagem || json.erro || "Ocorreu um erro ao processar a solicitação.");
}

async function obterIdProjeto(nomeProjeto) {
    const resposta = await fetch(`${API_BASE_URL}/projetos`);
    const projetos = await resposta.json();
    if (!resposta.ok) {
        mostrarErro(projetos);
        return null;
    }

    const projeto = projetos.find((item) =>
        item.nome.trim().toLowerCase() === nomeProjeto.trim().toLowerCase()
    );

    if (!projeto) {
        mostrarErro({ mensagem: "Projeto associado não encontrado." });
        return null;
    }

    return projeto.id;
}

async function atualizarDemanda() {
    const id = new URLSearchParams(window.location.search).get("id");

    try {
        const id_projeto = await obterIdProjeto(campo_assoc.value);
        if (id_projeto === null) {
            return;
        }

        const campo_tipo = document.querySelector('input[name="Tipo"]:checked');
        const campo_prioridade = document.querySelector('input[name="Prioridade"]:checked');
        const campo_status_selecionado = document.querySelector('input[name="Status"]:checked');
        const demanda = {
            titulo: campo_nome.value.trim(),
            descricao: campo_desc.value.trim(),
            tipo: campo_tipo.value,
            prioridade: campo_prioridade.value,
            status: campo_status_selecionado.value,
            id_projeto,
            data_finalizacao: campo_data.value || null
        };

        const resposta = await fetch(`${API_BASE_URL}/demandas/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(demanda)
        });
        const resultado = await resposta.json();
        if (!resposta.ok) {
            mostrarErro(resultado);
            return;
        }

        alert(resultado.mensagem || "Demanda atualizada!");
    } catch (erro) {
        mostrarErro({ mensagem: erro.message || "Erro ao atualizar a demanda." });
    }
}

botao.addEventListener("click", async (e) => {
    e.preventDefault();

    if (!campo_nome.value.trim()) {
        mostrarErroCampo(erro_nome);
    } else if (!campo_desc.value.trim()) {
        mostrarErroCampo(erro_desc);
    } else if (!campo_assoc.value.trim()) {
        mostrarErroCampo(erro_assoc);
    } else if (!document.querySelector('input[name="Tipo"]:checked')) {
        mostrarErroCampo(erro_tipos);
    } else if (!document.querySelector('input[name="Prioridade"]:checked')) {
        mostrarErroCampo(erro_prio);
    } else if (!document.querySelector('input[name="Status"]:checked')) {
        mostrarErroCampo(erro_status);
    } else {
        await atualizarDemanda();
    }
});
