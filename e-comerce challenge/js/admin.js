import { supabase } from './supabase.js';
import { buscarTodosPedidos } from './pedidos-db.js';
import { buscarTodosProdutos, criarProduto, atualizarProduto, excluirProduto } from './produtos-db.js';

let todosPedidos = [];
let todosProdutos = [];

// Inicialização
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🔄 Admin.js iniciando...');
    await carregarTodosPedidos();
    await carregarTodosProdutos();
    carregarEstatisticas();
    updateCartCount();
    configurarFiltrosAdmin();
});

// CARREGAR PEDIDOS
async function carregarTodosPedidos() {
    try {
        console.log('📦 Carregando pedidos...');
        const pedidos = await buscarTodosPedidos();
        console.log('Pedidos carregados:', pedidos);
        todosPedidos = pedidos;
        exibirPedidosAdmin(todosPedidos);
    } catch (error) {
        console.error('❌ Erro ao carregar pedidos:', error);
        document.getElementById('adminPedidosContainer').innerHTML = `
            <div class="alert alert-danger">
                ❌ Erro ao carregar pedidos: ${error.message}
            </div>
        `;
    }
}

function exibirPedidosAdmin(pedidos) {
    const container = document.getElementById('adminPedidosContainer');
    console.log('🎯 Exibindo pedidos:', pedidos.length);

    if (pedidos.length === 0) {
        container.innerHTML = `
            <div class="text-center py-5">
                <i class="fas fa-box-open fa-3x text-muted mb-3"></i>
                <h4>Nenhum pedido encontrado</h4>
                <p class="text-muted">Não há pedidos no sistema ainda.</p>
            </div>
        `;
        return;
    }

    let html = '';
    
    pedidos.forEach(pedido => {
        const dataPedido = new Date(pedido.data_pedido).toLocaleDateString('pt-BR');
        const total = parseFloat(pedido.total).toFixed(2).replace('.', ',');
        const endereco = pedido.endereco_entrega || {};
        
        html += `
            <div class="admin-pedido-card" data-status="${pedido.status}">
                <div class="admin-pedido-header">
                    <div>
                        <div class="pedido-cliente">Pedido #${pedido.numero_pedido}</div>
                        <small class="text-muted">
                            ${dataPedido} • ${endereco.cidade || 'N/A'}/${endereco.estado || 'N/A'} • R$ ${total}
                        </small>
                    </div>
                    <div class="pedido-actions">
                        <span class="status-badge status-${pedido.status}">
                            ${getStatusText(pedido.status)}
                        </span>
                        <select class="form-select form-select-sm" onchange="atualizarStatusPedido('${pedido.id}', this.value)" style="width: auto;">
                            <option value="confirmado" ${pedido.status === 'confirmado' ? 'selected' : ''}>Confirmado</option>
                            <option value="preparando" ${pedido.status === 'preparando' ? 'selected' : ''}>Preparando</option>
                            <option value="enviado" ${pedido.status === 'enviado' ? 'selected' : ''}>Enviado</option>
                            <option value="entregue" ${pedido.status === 'entregue' ? 'selected' : ''}>Entregue</option>
                            <option value="cancelado" ${pedido.status === 'cancelado' ? 'selected' : ''}>Cancelado</option>
                        </select>
                        <button class="btn btn-outline-primary btn-sm" onclick="verDetalhesPedidoAdmin('${pedido.id}')">
                            <i class="fas fa-eye"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}

// CARREGAR PRODUTOS
async function carregarTodosProdutos() {
    try {
        console.log('🛍️ Carregando produtos...');
        const produtos = await buscarTodosProdutos();
        console.log('Produtos carregados:', produtos);
        todosProdutos = produtos;
        exibirProdutosAdmin(todosProdutos);
    } catch (error) {
        console.error('❌ Erro ao carregar produtos:', error);
        document.getElementById('adminProdutosContainer').innerHTML = `
            <div class="alert alert-danger">
                ❌ Erro ao carregar produtos: ${error.message}
            </div>
        `;
    }
}

function exibirProdutosAdmin(produtos) {
    const container = document.getElementById('adminProdutosContainer');
    console.log('🎯 Exibindo produtos:', produtos.length);

    if (produtos.length === 0) {
        container.innerHTML = `
            <div class="col-12 text-center py-5">
                <i class="fas fa-box-open fa-3x text-muted mb-3"></i>
                <h4>Nenhum produto cadastrado</h4>
                <button class="btn btn-primary mt-3" onclick="novoProduto()">
                    <i class="fas fa-plus"></i> Adicionar Primeiro Produto
                </button>
            </div>
        `;
        return;
    }

    let html = '';
    
    produtos.forEach(produto => {
        html += `
            <div class="col-md-6 col-lg-4 mb-4">
                <div class="produto-admin-card">
                    <div class="produto-admin-header">
                        <img src="${produto.imagem || 'https://via.placeholder.com/80'}" 
                             alt="${produto.nome}" 
                             class="produto-admin-img">
                        <div class="produto-admin-info">
                            <h6>${produto.nome}</h6>
                            <div class="produto-admin-meta">
                                <div>R$ ${parseFloat(produto.preco).toFixed(2).replace('.', ',')}</div>
                                <div>Estoque: ${produto.estoque}</div>
                                <div>Categoria: ${produto.categoria}</div>
                            </div>
                        </div>
                    </div>
                    <div class="produto-admin-actions">
                        <button class="btn btn-outline-primary btn-sm" onclick="editarProdutoAdmin(${produto.id})">
                            <i class="fas fa-edit"></i> Editar
                        </button>
                        <button class="btn btn-outline-danger btn-sm" onclick="excluirProdutoAdmin(${produto.id})">
                            <i class="fas fa-trash"></i> Excluir
                        </button>
                        ${produto.destaque ? '<span class="badge badge-destaque ms-2">Destaque</span>' : ''}
                    </div>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}

// ESTATÍSTICAS
function carregarEstatisticas() {
    console.log('📊 Carregando estatísticas...');
    
    // Total de vendas
    document.getElementById('totalVendas').textContent = todosPedidos.length;
    
    // Receita total
    const receitaTotal = todosPedidos.reduce((total, pedido) => total + parseFloat(pedido.total || 0), 0);
    document.getElementById('totalReceita').textContent = `R$ ${receitaTotal.toFixed(2).replace('.', ',')}`;
    
    // Pedidos pendentes
    const pendentes = todosPedidos.filter(p => p.status === 'confirmado' || p.status === 'preparando').length;
    document.getElementById('pedidosPendentes').textContent = pendentes;
    
    // Produtos ativos
    document.getElementById('produtosAtivos').textContent = todosProdutos.length;
    
    console.log('📊 Estatísticas:', {
        vendas: todosPedidos.length,
        receita: receitaTotal,
        pendentes: pendentes,
        produtos: todosProdutos.length
    });
}

// FUNÇÕES ADMIN
async function atualizarStatusPedido(pedidoId, novoStatus) {
    try {
        console.log(`🔄 Atualizando pedido ${pedidoId} para status: ${novoStatus}`);
        
        const { error } = await supabase
            .from('pedidos')
            .update({ status: novoStatus })
            .eq('id', pedidoId);

        if (error) throw error;

        // Atualizar visualização
        await carregarTodosPedidos();
        carregarEstatisticas();
        
        console.log('✅ Status atualizado com sucesso!');
        
    } catch (error) {
        console.error('❌ Erro ao atualizar status:', error);
        alert('❌ Erro ao atualizar status: ' + error.message);
    }
}

async function salvarProdutoAdmin() {
    try {
        const produtoData = {
            nome: document.getElementById('produtoNome').value,
            categoria: document.getElementById('produtoCategoria').value,
            preco: parseFloat(document.getElementById('produtoPreco').value),
            estoque: parseInt(document.getElementById('produtoEstoque').value),
            imagem: document.getElementById('produtoImagem').value,
            descricao: document.getElementById('produtoDescricao').value,
            destaque: document.getElementById('produtoDestaque').checked
        };

        const produtoId = document.getElementById('produtoId').value;

        let resultado;
        if (produtoId) {
            // Editar
            resultado = await atualizarProduto(produtoId, produtoData);
        } else {
            // Novo
            resultado = await criarProduto(produtoData);
        }

        // Fechar modal e recarregar
        const modal = bootstrap.Modal.getInstance(document.getElementById('modalProduto'));
        modal.hide();
        
        await carregarTodosProdutos();
        carregarEstatisticas();
        
        alert('✅ Produto salvo com sucesso!');
        
    } catch (error) {
        console.error('❌ Erro ao salvar produto:', error);
        alert('❌ Erro ao salvar produto: ' + error.message);
    }
}

async function editarProdutoAdmin(produtoId) {
    const produto = todosProdutos.find(p => p.id === produtoId);
    if (!produto) {
        alert('❌ Produto não encontrado!');
        return;
    }

    document.getElementById('modalProdutoTitle').textContent = 'Editar Produto';
    document.getElementById('produtoId').value = produto.id;
    document.getElementById('produtoNome').value = produto.nome;
    document.getElementById('produtoCategoria').value = produto.categoria;
    document.getElementById('produtoPreco').value = produto.preco;
    document.getElementById('produtoEstoque').value = produto.estoque;
    document.getElementById('produtoImagem').value = produto.imagem || '';
    document.getElementById('produtoDescricao').value = produto.descricao || '';
    document.getElementById('produtoDestaque').checked = produto.destaque || false;

    const modal = new bootstrap.Modal(document.getElementById('modalProduto'));
    modal.show();
}

function novoProduto() {
    document.getElementById('modalProdutoTitle').textContent = 'Adicionar Produto';
    document.getElementById('formProduto').reset();
    document.getElementById('produtoId').value = '';

    const modal = new bootstrap.Modal(document.getElementById('modalProduto'));
    modal.show();
}

async function excluirProdutoAdmin(produtoId) {
    if (!confirm('⚠️ Tem certeza que deseja excluir este produto?')) return;

    try {
        await excluirProduto(produtoId);
        await carregarTodosProdutos();
        carregarEstatisticas();
        alert('✅ Produto excluído com sucesso!');
    } catch (error) {
        console.error('❌ Erro ao excluir produto:', error);
        alert('❌ Erro ao excluir produto: ' + error.message);
    }
}

function configurarFiltrosAdmin() {
    // Filtros de pedidos
    document.getElementById('filterAdminStatus')?.addEventListener('change', filtrarPedidosAdmin);
    document.getElementById('searchAdminOrders')?.addEventListener('input', filtrarPedidosAdmin);
    document.getElementById('filterDate')?.addEventListener('change', filtrarPedidosAdmin);
}

function filtrarPedidosAdmin() {
    const status = document.getElementById('filterAdminStatus')?.value || 'all';
    const termo = document.getElementById('searchAdminOrders')?.value.toLowerCase() || '';
    const periodo = document.getElementById('filterDate')?.value || 'all';

    let pedidosFiltrados = todosPedidos;

    // Filtrar por status
    if (status !== 'all') {
        pedidosFiltrados = pedidosFiltrados.filter(p => p.status === status);
    }

    // Filtrar por termo de busca
    if (termo) {
        pedidosFiltrados = pedidosFiltrados.filter(p => 
            p.numero_pedido.toLowerCase().includes(termo) ||
            (p.endereco_entrega && p.endereco_entrega.cidade && p.endereco_entrega.cidade.toLowerCase().includes(termo))
        );
    }

    // Filtrar por período
    if (periodo !== 'all') {
        const hoje = new Date();
        pedidosFiltrados = pedidosFiltrados.filter(p => {
            const dataPedido = new Date(p.data_pedido);
            
            switch(periodo) {
                case 'today':
                    return dataPedido.toDateString() === hoje.toDateString();
                case 'week':
                    const umaSemanaAtras = new Date(hoje.getTime() - 7 * 24 * 60 * 60 * 1000);
                    return dataPedido >= umaSemanaAtras;
                case 'month':
                    const umMesAtras = new Date(hoje.getFullYear(), hoje.getMonth() - 1, hoje.getDate());
                    return dataPedido >= umMesAtras;
                default:
                    return true;
            }
        });
    }

    exibirPedidosAdmin(pedidosFiltrados);
}

function getStatusText(status) {
    const statusMap = {
        'confirmado': '✅ Confirmado',
        'preparando': '👨‍🍳 Preparando',
        'enviado': '🚚 Enviado', 
        'entregue': '📦 Entregue',
        'cancelado': '❌ Cancelado'
    };
    return statusMap[status] || status;
}

function updateCartCount() {
    const carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
    const totalItens = carrinho.reduce((total, item) => total + item.quantidade, 0);
    
    const cartCountElements = document.querySelectorAll('#cartCount');
    cartCountElements.forEach(element => {
        element.textContent = totalItens;
    });
}

function verDetalhesPedidoAdmin(pedidoId) {
    const pedido = todosPedidos.find(p => p.id === pedidoId);
    if (pedido) {
        alert(`📦 Detalhes do Pedido #${pedido.numero_pedido}\n\nStatus: ${getStatusText(pedido.status)}\nTotal: R$ ${parseFloat(pedido.total).toFixed(2)}\nItens: ${pedido.pedido_itens?.length || 0}`);
    }
}

// Tornar funções globais
window.atualizarStatusPedido = atualizarStatusPedido;
window.salvarProdutoAdmin = salvarProdutoAdmin;
window.editarProdutoAdmin = editarProdutoAdmin;
window.novoProduto = novoProduto;
window.excluirProdutoAdmin = excluirProdutoAdmin;
window.verDetalhesPedidoAdmin = verDetalhesPedidoAdmin;