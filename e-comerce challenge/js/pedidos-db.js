import { supabase } from './supabase.js'

// ✅ SALVAR PEDIDO NO BANCO (FUNÇÃO ÚNICA)
export async function salvarPedidoNoBanco(pedidoData) {
    try {
        const usuario = JSON.parse(localStorage.getItem('usuarioLogado'))
        if (!usuario) throw new Error('Faça login primeiro')
        
        console.log('💾 Salvando pedido no banco...', pedidoData)
        
        // 1. Cria o pedido
        const { data: pedido, error } = await supabase
            .from('pedidos')
            .insert([
                {
                    usuario_id: usuario.id,
                    numero_pedido: 'AM' + Date.now(),
                    subtotal: pedidoData.subtotal,
                    frete: pedidoData.frete,
                    total: pedidoData.total,
                    endereco_entrega: pedidoData.endereco,
                    metodo_pagamento: pedidoData.metodoPagamento,
                    status: 'confirmado'
                }
            ])
            .select()
        
        if (error) throw error
        
        console.log('✅ Pedido salvo:', pedido)
        
        // 2. Salva os itens
        await salvarItensPedido(pedido[0].id, pedidoData.itens)
        
        return pedido[0]
        
    } catch (error) {
        console.error('❌ Erro ao salvar pedido:', error)
        throw new Error('Erro ao salvar pedido: ' + error.message)
    }
}

// SALVAR ITENS DO PEDIDO
async function salvarItensPedido(pedidoId, itens) {
    const itensParaSalvar = itens.map(item => ({
        pedido_id: pedidoId,
        produto_id: item.id,
        nome_produto: item.nome,
        preco: item.preco,
        quantidade: item.quantidade,
        subtotal: item.preco * item.quantidade
    }))

    const { error } = await supabase
        .from('pedido_itens')
        .insert(itensParaSalvar)
    
    if (error) throw error
}

// BUSCAR PEDIDOS DO USUÁRIO
export async function buscarMeusPedidos() {
    try {
        const usuario = JSON.parse(localStorage.getItem('usuarioLogado'))
        if (!usuario) {
            console.log('❌ Usuário não logado')
            return []
        }
        
        console.log('🔍 Buscando pedidos do usuário:', usuario.id)
        
        const { data, error } = await supabase
            .from('pedidos')
            .select(`
                *,
                pedido_itens (*)
            `)
            .eq('usuario_id', usuario.id)
            .order('data_pedido', { ascending: false })
        
        if (error) {
            console.error('❌ Erro ao buscar pedidos:', error)
            throw error
        }
        
        console.log('✅ Pedidos encontrados:', data?.length || 0)
        return data || []
        
    } catch (error) {
        console.error('❌ Erro ao buscar pedidos:', error)
        return []
    }
}

// BUSCAR TODOS OS PEDIDOS (PARA ADMIN)
export async function buscarTodosPedidos() {
    try {
        console.log('🔍 Buscando TODOS os pedidos...')
        
        const { data, error } = await supabase
            .from('pedidos')
            .select(`
                *,
                pedido_itens (*),
                usuarios (nome, email)
            `)
            .order('data_pedido', { ascending: false })

        if (error) {
            console.error('❌ Erro ao buscar pedidos:', error)
            throw error
        }
        
        console.log('✅ Total de pedidos encontrados:', data?.length || 0)
        return data || []
        
    } catch (error) {
        console.error('❌ Erro ao buscar pedidos:', error)
        return []
    }
}