// Vazio = o mesmo servidor que entregou a pagina (funciona local e no Render)
const API_BASE_URL = "";
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

// Preenche a lista de projetos com o que existe no banco
async function preencherProjetos() {
    const resposta = await fetch(`${API_BASE_URL}/projetos`);
    const projetos = await resposta.json();
    if (!resposta.ok) {
        mostrarErro(projetos);
        return;
    }
    projetos.forEach((p) => campo_assoc.add(new Option(p.nome, p.id)));
}

async function atualizarDemanda() {
    const id = new URLSearchParams(window.location.search).get("id");

    try {
        const id_projeto = Number(campo_assoc.value);

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
            data_finalizacao: campo_data.value || null,
            id_usuario: usuarioLogado?.id // o servidor confere a permissao do perfil
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

        // Volta para os detalhes da demanda, ja com os dados novos
        window.location.href = "detalhes.demanda.html?id=" + id;
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

// Ao abrir a tela, preenche o formulario com os dados atuais da demanda
async function carregarDemanda() {
    const id = new URLSearchParams(window.location.search).get("id");
    if (!id) {
        mostrarErro({ mensagem: "Abra a edição pela tela de Detalhes da demanda." });
        return;
    }

    try {
        await preencherProjetos();
        const resposta = await fetch(`${API_BASE_URL}/api/demanda/${id}?usuario=${usuarioLogado?.id}`);
        const dados = await resposta.json();
        if (!resposta.ok) {
            mostrarErro(dados);
            return;
        }

        // Sem permissao para alterar esta demanda: avisa e volta aos detalhes
        if (!dados.podeAlterar) {
            mostrarErro({ mensagem: dados.motivo });
            window.location.href = "detalhes.demanda.html?id=" + id;
            return;
        }

        const demanda = dados.demanda;
        campo_nome.value = demanda.titulo;
        campo_desc.value = demanda.descricao;
        // Seleciona na lista o projeto atual da demanda (a API devolve o nome)
        const opcao = [...campo_assoc.options].find((o) => o.text === demanda.projeto);
        if (opcao) campo_assoc.value = opcao.value;
        campo_data.value = demanda.prazo || "";

        // Marca a opcao de cada grupo que tem o mesmo valor da demanda
        const marcar = (grupo, valor) => {
            document.querySelectorAll(`input[name="${grupo}"]`).forEach((opcao) => {
                opcao.checked = opcao.value === valor;
            });
        };
        marcar("Tipo", demanda.tipo);
        marcar("Prioridade", demanda.prioridade);
        marcar("Status", demanda.status);
    } catch (erro) {
        mostrarErro({ mensagem: erro.message || "Erro ao carregar a demanda." });
    }
}

carregarDemanda();
