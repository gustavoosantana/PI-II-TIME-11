const API_BASE_URL = "http://localhost:3000";

// Seleciona as mensagens de erro e os campos do formulário
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
const campo_tipos = document.querySelectorAll('input[name="Tipo"]');
const campo_prio = document.querySelectorAll('input[name="Prioridade"]');
const campo_status = document.querySelectorAll('input[name="Status"]');
const campo_data = document.querySelector(".data")
const botao = document.querySelector(".botao");

// Executa a validação ao clicar no botão de cadastro
botao.addEventListener("click", async (e) => {
    e.preventDefault()
    // Verifica se os campos de texto obrigatórios foram preenchidos

    if (campo_nome.value === "") {
        erro_nome.style.display = "flex"
        window.scrollTo({           //faz a pagina rolar para cima, ajudando o usúario a perceber o erro
        top: 0,
        behavior: "smooth"
        });
    }
    else if (campo_desc.value === "") {
        erro_desc.style.display = "flex"
        window.scrollTo({
        top: 0,
        behavior: "smooth"
        });
    }

    else if (campo_assoc.value === "") {
        erro_assoc.style.display = "flex"
        window.scrollTo({
        top: 0,
        behavior: "smooth"
        });
    }

    // Tipo e prioridade sao obrigatorios na rota de cadastro
    else if (!document.querySelector('input[name="Tipo"]:checked')) {
        erro_tipos.style.display = "flex"
    }

    else if (!document.querySelector('input[name="Prioridade"]:checked')) {
        erro_prio.style.display = "flex"
    }

    else {
        await formularioDemanda()
    }

})


async function listarProjetos() {
    const URL = `${API_BASE_URL}/projetos`;
    
    try {
        const resposta = await fetch(URL);
        const resultado = await resposta.json();
        if (!resposta.ok) {
            mostrarErro(resultado);
            return [];
        }
        return resultado;
    } 
    catch (erro) {
        mostrarErro({ mensagem: erro.message || "Falha ao buscar projetos." });
        return [];
    }
}

async function criarDemanda(demanda) {
    const URL = `${API_BASE_URL}/demandas`;
    try {
        const resposta = await fetch(URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(demanda)
        });
        const resultado = await resposta.json();
        if (!resposta.ok) {
            mostrarErro(resultado);
            return;
        }
        return resultado;
    } catch (erro) {
        mostrarErro({ mensagem: erro.message || "Falha ao cadastrar demanda." });
    }
}

async function formularioDemanda() {
    // O projeto e digitado pelo nome, mas a rota precisa do id dele
    const projetos = await listarProjetos();
    const projeto = projetos.find((p) =>
        p.nome.trim().toLowerCase() === campo_assoc.value.trim().toLowerCase()
    );

    if (!projeto) {
        mostrarErro({ mensagem: "Projeto não encontrado. Projetos cadastrados: " + projetos.map((p) => p.nome).join(", ") });
        return;
    }

    const status = document.querySelector('input[name="Status"]:checked');

    const demanda = {
        titulo: campo_nome.value.trim(),
        descricao: campo_desc.value.trim(),
        tipo: document.querySelector('input[name="Tipo"]:checked').value,
        prioridade: document.querySelector('input[name="Prioridade"]:checked').value,
        status: status ? status.value : "Aberta",
        id_projeto: projeto.id,
        data_finalizacao: campo_data.value || null
    };

    const resultado = await criarDemanda(demanda);

    // Cadastrou: avisa e abre a listagem, onde a demanda nova ja aparece
    if (resultado) {
        alert(resultado.mensagem || "Demanda cadastrada!");
        window.location.href = "listagem.html";
    }
}

// Sugere os projetos do banco enquanto o usuario digita o projeto associado
async function sugerirProjetos() {
    const lista = document.createElement("datalist");
    lista.id = "lista_projetos";
    (await listarProjetos()).forEach((p) => {
        const opcao = document.createElement("option");
        opcao.value = p.nome;
        lista.appendChild(opcao);
    });
    document.body.appendChild(lista);
    campo_assoc.setAttribute("list", "lista_projetos");
}

sugerirProjetos();

function mostrarErro(json) {
    alert(json.mensagem || json.erro || "Ocorreu um erro ao processar a solicitação.");
}