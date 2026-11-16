// AUTORIA: GUSTAVO

// Abrir a tela de login encerra a sessao anterior (botao Sair)
sessionStorage.removeItem('usuario')

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

form.addEventListener('submit', async (e) => {
    e.preventDefault()
    const email = CampoEmail.value.trim()
    const senha = CampoSenha.value

    emailError.textContent = ''
    senhaError.textContent = ''
    CampoEmail.classList.remove('error')
    CampoSenha.classList.remove('error')

    if (email === '') {
        emailError.textContent = 'Insira um email válido'
        CampoEmail.classList.add('error')
    }
    if (senha === '') {
        senhaError.textContent = 'Informe a senha'
        CampoSenha.classList.add('error')
    }
    if (email === '' || senha === '') return

    // Confere e-mail e senha no banco pela rota POST /login
    try {
        const resposta = await fetch('/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, senha })
        })
        const json = await resposta.json()

        if (!resposta.ok) {
            senhaError.textContent = json.mensagem || 'Email ou senha incorretos'
            CampoSenha.classList.add('error')
            return
        }

        // Guarda quem entrou, para as outras telas saberem o usuario
        sessionStorage.setItem('usuario', JSON.stringify(json))
        window.location.href = 'dashboard.html'
    } catch (erro) {
        senhaError.textContent = 'Servidor indisponível'
    }
})
