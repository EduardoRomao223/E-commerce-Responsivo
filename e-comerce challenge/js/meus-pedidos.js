import { buscarMeusPedidos } from './pedidos-db.js';

// Inicialização
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🔄 Meus-pedidos.js iniciando...');
    console.log('👤 Usuário logado:', JSON.parse(localStorage.getItem('usuarioLogado')));
    await carregarPedidos();
    updateCartCount();
    configurarFiltros();
});

async function carregarPedidos() {
    try {
        console.log('📦 Buscando meus pedidos...');
        const pedidos = await buscarMeusPedidos();
        console.log('✅ Pedidos carregados:', pedidos);
        exibirPedidos(pedidos);
    } catch (error) {
        console.error('❌ Erro ao carregar pedidos:', error);
        document.getElementById('pedidosContainer').innerHTML = `
            <div class="alert alert-danger">
                <i class="fas fa-exclamation-triangle me-2"></i>
                ❌ Erro ao carregar pedidos: ${error.message}
            </div>
        `;
    }
}

function exibirPedidos(pedidos) {
    const container = document.getElementById('pedidosContainer');
    const semPedidos = document.getElementById('semPedidos');

    console.log('🎯 Exibindo pedidos:', pedidos.length);

    if (pedidos.length === 0) {
        container.classList.add('hidden');
        semPedidos.classList.remove('hidden');
        return;
    }

    container.classList.remove('hidden');
    semPedidos.classList.add('hidden');

    let html = '';
    
    pedidos.forEach(pedido => {
        const dataPedido = new Date(pedido.data_pedido).toLocaleDateString('pt-BR');
        const total = parseFloat(pedido.total || 0).toFixed(2).replace('.', ',');
        const subtotal = parseFloat(pedido.subtotal || 0).toFixed(2).replace('.', ',');
        const frete = parseFloat(pedido.frete || 0).toFixed(2).replace('.', ',');
        
        html += `
            <div class="pedido-card" data-status="${pedido.status}">
                <div class="pedido-header">
                    <div class="pedido-info">
                        <h5>Pedido #${pedido.numero_pedido}</h5>
                        <div class="pedido-meta">
                            <span class="me-3"><i class="fas fa-calendar me-1"></i> ${dataPedido}</span>
                            <span><i class="fas fa-dollar-sign me-1"></i> R$ ${total}</span>
                        </div>
                    </div>
                    <span class="status-badge status-${pedido.status}">
                        ${getStatusText(pedido.status)}
                    </span>
                </div>

                <div class="pedido-items">
                    ${(pedido.pedido_itens || []).map(item => `
                        <div class="pedido-item">
                            <div class="item-details">
                                <h6>${item.nome_produto || 'Produto'}</h6>
                                <small class="text-muted">Qtd: ${item.quantidade || 1} • R$ ${parseFloat(item.preco || 0).toFixed(2).replace('.', ',')} cada</small>
                            </div>
                            <div class="item-price">
                                R$ ${((parseFloat(item.preco || 0) * (item.quantidade || 1))).toFixed(2).replace('.', ',')}
                            </div>
                        </div>
                    `).join('')}
                </div>

                <div class="pedido-totals">
                    <div class="totals-row">
                        <span>Subtotal:</span>
                        <span>R$ ${subtotal}</span>
                    </div>
                    <div class="totals-row">
                        <span>Frete:</span>
                        <span>R$ ${frete}</span>
                    </div>
                    <div class="totals-row">
                        <span>Total:</span>
                        <span>R$ ${total}</span>
                    </div>
                </div>

                <div class="pedido-actions">
                    <button class="btn btn-outline-primary btn-sm" onclick="verDetalhesPedido('${pedido.id}')">
                        <i class="fas fa-eye me-1"></i> Ver Detalhes
                    </button>
                    <button class="btn btn-outline-secondary btn-sm" onclick="rastrearPedido('${pedido.numero_pedido}')">
                        <i class="fas fa-truck me-1"></i> Rastrear
                    </button>
                    ${pedido.status === 'confirmado' ? `
                        <button class="btn btn-outline-danger btn-sm" onclick="cancelarPedido('${pedido.id}')">
                            <i class="fas fa-times me-1"></i> Cancelar
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
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

function configurarFiltros() {
    const filterStatus = document.getElementById('filterStatus');
    const searchOrders = document.getElementById('searchOrders');
    
    if (filterStatus) {
        filterStatus.addEventListener('change', function() {
            const status = this.value;
            const pedidos = document.querySelectorAll('.pedido-card');
            
            pedidos.forEach(pedido => {
                if (status === 'all' || pedido.getAttribute('data-status') === status) {
                    pedido.style.display = 'block';
                } else {
                    pedido.style.display = 'none';
                }
            });
        });
    }

    if (searchOrders) {
        searchOrders.addEventListener('input', function() {
            const termo = this.value.toLowerCase();
            const pedidos = document.querySelectorAll('.pedido-card');
            
            pedidos.forEach(pedido => {
                const textoPedido = pedido.textContent.toLowerCase();
                if (textoPedido.includes(termo)) {
                    pedido.style.display = 'block';
                } else {
                    pedido.style.display = 'none';
                }
            });
        });
    }
}

function verDetalhesPedido(pedidoId) {
    alert(`📦 Detalhes do pedido ${pedidoId}\n\nEm desenvolvimento...`);
}

function rastrearPedido(numeroPedido) {
    alert(`🚚 Rastreamento do pedido ${numeroPedido}\n\nEm desenvolvimento...`);
}

function cancelarPedido(pedidoId) {
    if (confirm('⚠️ Tem certeza que deseja cancelar este pedido?')) {
        alert(`✅ Pedido ${pedidoId} cancelado com sucesso!\n\nEm desenvolvimento...`);
    }
}

function updateCartCount() {
    const carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
    const totalItens = carrinho.reduce((total, item) => total + item.quantidade, 0);
    
    const cartCountElements = document.querySelectorAll('#cartCount');
    cartCountElements.forEach(element => {
        element.textContent = totalItens;
    });
}

// Tornar funções globais
window.verDetalhesPedido = verDetalhesPedido;
window.rastrearPedido = rastrearPedido;
window.cancelarPedido = cancelarPedido;