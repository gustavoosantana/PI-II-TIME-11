// Autor do arquivo: Gabriel Lopes Londe Rodrigues
// Usuario que entrou pela tela de login (guardado pelo login.js).
// Sem login, a pagina manda de volta para a tela de login.
const usuarioLogado = JSON.parse(sessionStorage.getItem("usuario") || "null")

if (!usuarioLogado) {
    window.location.href = "login.html"
}
