import { supabase } from './supabase.js'

// BUSCAR TODOS OS PRODUTOS
export async function buscarTodosProdutos() {
    try {
        const { data, error } = await supabase
            .from('produtos')
            .select('*')
            .order('nome')

        if (error) throw error
        return data || []
        
    } catch (error) {
        console.error('Erro ao buscar produtos:', error)
        return []
    }
}

// BUSCAR PRODUTO POR ID
export async function buscarProdutoPorId(id) {
    try {
        const { data, error } = await supabase
            .from('produtos')
            .select('*')
            .eq('id', id)
            .single()

        if (error) throw error
        return data
        
    } catch (error) {
        console.error('Erro ao buscar produto:', error)
        return null
    }
}

// CRIAR NOVO PRODUTO
export async function criarProduto(produtoData) {
    try {
        const { data, error } = await supabase
            .from('produtos')
            .insert([produtoData])
            .select()

        if (error) throw error
        return data[0]
        
    } catch (error) {
        throw new Error('Erro ao criar produto: ' + error.message)
    }
}

// ATUALIZAR PRODUTO
export async function atualizarProduto(id, produtoData) {
    try {
        const { data, error } = await supabase
            .from('produtos')
            .update(produtoData)
            .eq('id', id)
            .select()

        if (error) throw error
        return data[0]
        
    } catch (error) {
        throw new Error('Erro ao atualizar produto: ' + error.message)
    }
}

// EXCLUIR PRODUTO
export async function excluirProduto(id) {
    try {
        const { error } = await supabase
            .from('produtos')
            .delete()
            .eq('id', id)

        if (error) throw error
        return true
        
    } catch (error) {
        throw new Error('Erro ao excluir produto: ' + error.message)
    }
}

// BUSCAR PRODUTOS POR CATEGORIA
export async function buscarProdutosPorCategoria(categoria) {
    try {
        const { data, error } = await supabase
            .from('produtos')
            .select('*')
            .eq('categoria', categoria)
            .order('nome')
        if (error) throw error
        return data || []
        
    } catch (error) {
        console.error('Erro ao buscar produtos por categoria:', error)
        return []
    }
}

// BUSCAR PRODUTOS POR FAIXA DE PREÇO

export async function buscarProdutosPorFaixaPreco(precoMin, precoMax) {
    try {
        const { data, error } = await supabase
            .from('produtos')
            .select('*')
            .gte('preco', precoMin)
            .lte('preco', precoMax)
            .order('nome')
        if (error) throw error
        return data || []

    } catch (error) {
        console.error('Erro ao buscar produtos por faixa de preço:', error)
        return []
    }
}

// BUSCAR PRODUTOS POR NOME (BUSCA SIMPLES)
export async function buscarProdutosPorNome(nome) {
    try {
        const { data, error } = await supabase
            .from('produtos')
            .select('*')
            .ilike('nome', `%${nome}%`)
            .order('nome')
        if (error) throw error
        return data || []
    } catch (error) {
        console.error('Erro ao buscar produtos por nome:', error)
        return []
    }
}

// BUSCAR PRODUTOS COM FILTROS
export async function buscarProdutosComFiltros({ categoria, precoMin, precoMax, nome }) {
    try {
        let query = supabase.from('produtos').select('*')
        if (categoria) {
            query = query.eq('categoria', categoria)
        }
        if (precoMin !== undefined) {
            query = query.gte('preco', precoMin)
        }
        if (precoMax !== undefined) {
            query = query.lte('preco', precoMax)
        }
        if (nome) {
            query = query.ilike('nome', `%${nome}%`)
        }
        const { data, error } = await query.order('nome')
        if (error) throw error
        return data || []
    }
    catch (error) {
        console.error('Erro ao buscar produtos com filtros:', error)
        return []
    }
}

