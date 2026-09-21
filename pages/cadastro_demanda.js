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
botao.addEventListener("click", (e) => {
    e.preventDefault()
    // Verifica se os campos de texto obrigatórios foram preenchidos

    if (campo_nome.value === "") {
        erro_nome.style.display = "flex"
        window.scrollTo({           //faz a pagina rolar para cima, ajudando o usúario a perceber o erro
        top: 0,
        behavior: "smooth"
        });
    }
    if (campo_desc.value === "") {
        erro_desc.style.display = "flex"
        window.scrollTo({
        top: 0,
        behavior: "smooth"
        });
    }

    if (campo_assoc.value === "") {
        erro_assoc.style.display = "flex"
        window.scrollTo({
        top: 0,
        behavior: "smooth"
        });
    }

//     tipo = false

//     campo_tipos.forEach((check) => {
//         if(check.checked) {
//             tipo = true
//         }
//     })

//     if(!tipo) {
//         erro_tipos.style.display="flex";
//     }

//     prio = false
//     campo_prio.forEach((check) => {
//          if(check.checked) {
//             tipo = true
//         }
//     })

//     if(!prio) {
//         erro_prio.style.display="flex";
//     }

//     statys = false
//     campo_status.forEach((check) => {
//          if(check.checked) {
//             status = true
//         }
//     })

//     if(!statys) {
//         erro_status.style.display="flex";
//     }

//     if(campo_data.value === "") {
//         erro_data.style.display = "flex";
//     }
})