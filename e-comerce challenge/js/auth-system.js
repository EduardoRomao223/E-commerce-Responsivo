import { supabase } from './supabase.js'

// CADASTRAR USUÁRIO
export async function cadastrarUsuario(nome, email, senha, telefone) {
    try {
        // Cria hash da senha
        const senhaHash = await hashSenha(senha)
        
        // Insere no banco
        const { data, error } = await supabase
            .from('usuarios')
            .insert([
                { nome, email, senha_hash: senhaHash, telefone }
            ])
            .select()
        
        if (error) throw error
        
        // Salva no localStorage
        localStorage.setItem('usuarioLogado', JSON.stringify(data[0]))
        return data[0]
        
    } catch (error) {
        throw new Error('Erro ao cadastrar: ' + error.message)
    }
}

// FAZER LOGIN
export async function fazerLogin(email, senha) {
    try {
        // Busca usuário
        const { data, error } = await supabase
            .from('usuarios')
            .select('*')
            .eq('email', email)
            .single()
        
        if (error) throw new Error('Usuário não encontrado')
        
        // Verifica senha
        const senhaCorreta = await verificarSenha(senha, data.senha_hash)
        if (!senhaCorreta) throw new Error('Senha incorreta')
        
        // Salva sessão
        localStorage.setItem('usuarioLogado', JSON.stringify(data))
        return data
        
    } catch (error) {
        throw error
    }
}

// FUNÇÕES DE SENHA
async function hashSenha(senha) {
    const encoder = new TextEncoder()
    const data = encoder.encode(senha)
    const hash = await crypto.subtle.digest('SHA-256', data)
    return Array.from(new Uint8Array(hash))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')
}

async function verificarSenha(senha, hash) {
    return (await hashSenha(senha)) === hash
}

// VERIFICAR SE ESTÁ LOGADO
export function usuarioEstaLogado() {
    return JSON.parse(localStorage.getItem('usuarioLogado'))
}

// FAZER LOGOUT
export function logout() {
    localStorage.removeItem('usuarioLogado')
    window.location.reload()
}

export function atualizarNavbar() {
    const usuario = usuarioEstaLogado();
    const navLogin = document.getElementById('navLogin');
    const navUser = document.getElementById('navUser');
    const navAdmin = document.getElementById('navAdmin');
    const userName = document.getElementById('userName');
    
    if (usuario && navLogin && navUser && userName) {
        navLogin.classList.add('hidden');
        navUser.classList.remove('hidden');
        userName.textContent = usuario.nome.split(' ')[0]; // Primeiro nome
        
        // Mostrar link admin se for administrador
        if (navAdmin && usuario.email === 'admin@artemimo.com.br') { // Altere para o email do admin
            navAdmin.classList.remove('hidden');
        }
    }
}

// Chamar automaticamente quando o script carregar
document.addEventListener('DOMContentLoaded', function() {
    atualizarNavbar();
});