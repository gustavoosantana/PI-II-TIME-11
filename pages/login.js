// AUTORIA: GUSTAVO

const usuarioCadastrado = {
    email: "exemplo@email.com",
    senha: "123456"
};

const form = document.getElementById('login-form')
const CampoEmail = document.getElementById('email')
const CampoSenha = document.getElementById('senha')
const emailError = document.getElementById('emailError')
const senhaError = document.getElementById('senhaError')
const toggleSenha = document.getElementById('toggleSenha')

toggleSenha.addEventListener('click', () => {
    if (CampoSenha.type === 'password'){
        CampoSenha.type = 'text'
        toggleSenha.classList.remove('fa-eye')
        toggleSenha.classList.add('fa-eye-slash')
    } else {
        CampoSenha.type = 'password'
        toggleSenha.classList.remove('fa-eye-slash')
        toggleSenha.classList.add('fa-eye')
    }
})

form.addEventListener('submit', (e) => {
    const senha = CampoSenha.value.trim().toLowerCase()
    const email = CampoEmail.value.trim()
    let isValid = true

    if(email === '') {
        emailError.textContent = 'Insira um email válido'
        CampoEmail.classList.add('error')
        isValid = false
    } else if(email !== usuarioCadastrado.email) {
        emailError.textContent = 'Email Incorreto'
        CampoEmail.classList.add('error')
        isValid = false
    }
    else {
        emailError.textContent = ''
        CampoEmail.classList.remove('error')
        isValid = true
    }

    if(senha === '') {
        senhaError.textContent = 'Informe a senha'
        CampoSenha.classList.add('error')
        isValid = false
    } else if(senha !== usuarioCadastrado.senha) {
        senhaError.textContent = 'Senha incorreta'
        CampoSenha.classList.add('error')
        isValid = false
    }
    else {
        senhaError.textContent = ''
        CampoSenha.classList.remove('error')
        isValid = true
    }

    if(!isValid) {
        e.preventDefault()
        console.log("Flalhou")
    } else {
        e.preventDefault()
        window.location.href = 'dashboard.html'
        console.log("Passou")
    }
})
 