let etapaAtual = 1;
let enderecoEntrega = null;
let metodoPagamento = null;
let pedidoData = null;

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    verificarCarrinho();
    carregarResumo();
    configurarEventListeners();
    updateCartCount();
});

function verificarCarrinho() {
    const carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
    if (carrinho.length === 0) {
        alert('Seu carrinho está vazio!');
        window.location.href = 'produtos.html';
        return;
    }

    // Verificar se está logado
    const usuario = JSON.parse(localStorage.getItem('usuarioLogado'));
    if (!usuario) {
        alert('Por favor, faça login para finalizar a compra.');
        window.location.href = 'login.html';
        return;
    }
}

function carregarResumo() {
    const carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
    const resumoContainer = document.getElementById('resumoItens');
    let subtotal = 0;

    let html = '';
    carrinho.forEach(item => {
        const itemSubtotal = item.preco * item.quantidade;
        subtotal += itemSubtotal;
        
        html += `
            <div class="order-summary-item">
                <img src="${item.imagem}" alt="${item.nome}" class="product-thumb">
                <div class="flex-grow-1">
                    <h6 class="mb-1">${item.nome}</h6>
                    <small class="text-muted">Qtd: ${item.quantidade}</small>
                </div>
                <div class="text-end">
                    <div class="fw-bold">R$ ${itemSubtotal.toFixed(2).replace('.', ',')}</div>
                </div>
            </div>
        `;
    });

    resumoContainer.innerHTML = html;

    // Calcular totais
    const frete = subtotal > 100 ? 0 : 12.50;
    const total = subtotal + frete;

    // Atualizar valores
    document.getElementById('resumoSubtotal').textContent = `R$ ${subtotal.toFixed(2).replace('.', ',')}`;
    document.getElementById('resumoFrete').textContent = subtotal > 100 ? 'GRÁTIS' : `R$ ${frete.toFixed(2).replace('.', ',')}`;
    document.getElementById('resumoTotal').textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;

    // Salvar dados do pedido
    pedidoData = {
        itens: carrinho,
        subtotal: subtotal,
        frete: frete,
        total: total,
        data: new Date().toISOString()
    };
}

function configurarEventListeners() {
    // Métodos de pagamento
    document.querySelectorAll('.payment-method').forEach(method => {
        method.addEventListener('click', function() {
            document.querySelectorAll('.payment-method').forEach(m => {
                m.classList.remove('selected');
                m.querySelector('.payment-details')?.classList.add('hidden');
            });
            
            this.classList.add('selected');
            const input = this.querySelector('input[type="radio"]');
            input.checked = true;
            metodoPagamento = input.value;

            // Mostrar detalhes do cartão se selecionado
            if (metodoPagamento === 'cartao') {
                this.querySelector('.payment-details')?.classList.remove('hidden');
            }
        });
    });

    // Máscara para CEP
    document.getElementById('cep').addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length <= 8) {
            value = value.replace(/(\d{5})(\d)/, '$1-$2');
            e.target.value = value;
        }
    });

    // Máscara para telefone
    document.getElementById('telefoneContato').addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length <= 11) {
            value = value.replace(/(\d{2})(\d)/, '($1) $2');
            value = value.replace(/(\d{5})(\d)/, '$1-$2');
            e.target.value = value;
        }
    });
}

function avancarEtapa() {
    if (!validarEtapaAtual()) {
        return;
    }

    // Salvar dados da etapa atual
    if (etapaAtual === 1) {
        salvarEndereco();
    }

    // Esconder etapa atual
    document.getElementById(`step${etapaAtual}`).classList.add('hidden');
    
    // Avançar etapa
    etapaAtual++;
    
    // Mostrar próxima etapa
    document.getElementById(`step${etapaAtual}`).classList.remove('hidden');
    
    // Atualizar indicador de etapas
    atualizarIndicadorEtapas();
    
    // Atualizar botões
    atualizarBotoes();
}

function voltarEtapa() {
    // Esconder etapa atual
    document.getElementById(`step${etapaAtual}`).classList.add('hidden');
    
    // Voltar etapa
    etapaAtual--;
    
    // Mostrar etapa anterior
    document.getElementById(`step${etapaAtual}`).classList.remove('hidden');
    
    // Atualizar indicador de etapas
    atualizarIndicadorEtapas();
    
    // Atualizar botões
    atualizarBotoes();
}

function validarEtapaAtual() {
    if (etapaAtual === 1) {
        // Validar endereço
        const camposObrigatorios = ['cep', 'numero', 'rua', 'bairro', 'cidade', 'estado', 'telefoneContato'];
        for (let campo of camposObrigatorios) {
            const input = document.getElementById(campo);
            if (!input.value.trim()) {
                alert(`Por favor, preencha o campo ${campo.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
                input.focus();
                return false;
            }
        }
        return true;
    }
    
    if (etapaAtual === 2) {
        // Validar método de pagamento
        if (!metodoPagamento) {
            alert('Por favor, selecione um método de pagamento');
            return false;
        }
        
        if (metodoPagamento === 'cartao') {
            // Validar dados do cartão (simplificado)
            const inputs = document.querySelectorAll('.payment-details input');
            for (let input of inputs) {
                if (!input.value.trim()) {
                    alert('Por favor, preencha todos os dados do cartão');
                    input.focus();
                    return false;
                }
            }
        }
        return true;
    }
    
    return true;
}

function salvarEndereco() {
    enderecoEntrega = {
        cep: document.getElementById('cep').value,
        numero: document.getElementById('numero').value,
        rua: document.getElementById('rua').value,
        complemento: document.getElementById('complemento').value,
        bairro: document.getElementById('bairro').value,
        cidade: document.getElementById('cidade').value,
        estado: document.getElementById('estado').value,
        telefone: document.getElementById('telefoneContato').value
    };
}

function atualizarIndicadorEtapas() {
    const steps = document.querySelectorAll('.checkout-step');
    steps.forEach((step, index) => {
        step.classList.remove('step-active', 'step-completed');
        if (index + 1 === etapaAtual) {
            step.classList.add('step-active');
        } else if (index + 1 < etapaAtual) {
            step.classList.add('step-completed');
        }
    });
}

function atualizarBotoes() {
    const btnVoltar = document.getElementById('btnVoltar');
    const btnContinuar = document.getElementById('btnContinuar');
    const btnFinalizar = document.getElementById('btnFinalizar');

    if (etapaAtual === 1) {
        btnVoltar.classList.add('hidden');
        btnContinuar.classList.remove('hidden');
        btnFinalizar.classList.add('hidden');
    } else if (etapaAtual === 2) {
        btnVoltar.classList.remove('hidden');
        btnContinuar.classList.remove('hidden');
        btnFinalizar.classList.add('hidden');
    } else if (etapaAtual === 3) {
        btnVoltar.classList.remove('hidden');
        btnContinuar.classList.add('hidden');
        btnFinalizar.classList.remove('hidden');
        prepararConfirmacao();
    }
}

function prepararConfirmacao() {
    // Preparar resumo para confirmação
    const resumoHtml = `
        <p><strong>Subtotal:</strong> R$ ${pedidoData.subtotal.toFixed(2).replace('.', ',')}</p>
        <p><strong>Frete:</strong> ${pedidoData.frete === 0 ? 'GRÁTIS' : `R$ ${pedidoData.frete.toFixed(2).replace('.', ',')}`}</p>
        <p><strong>Total:</strong> R$ ${pedidoData.total.toFixed(2).replace('.', ',')}</p>
        <p><strong>Itens:</strong> ${pedidoData.itens.length}</p>
        <p><strong>Método:</strong> ${metodoPagamento.toUpperCase()}</p>
    `;
    
    document.getElementById('resumoPedidoConfirmacao').innerHTML = resumoHtml;

    // Preparar endereço para confirmação
    const enderecoHtml = `
        <p>${enderecoEntrega.rua}, ${enderecoEntrega.numero}</p>
        <p>${enderecoEntrega.complemento ? enderecoEntrega.complemento + '<br>' : ''}</p>
        <p>${enderecoEntrega.bairro} - ${enderecoEntrega.cidade}/${enderecoEntrega.estado}</p>
        <p>CEP: ${enderecoEntrega.cep}</p>
        <p>Tel: ${enderecoEntrega.telefone}</p>
    `;
    
    document.getElementById('enderecoConfirmacao').innerHTML = enderecoHtml;
}

async function finalizarPedido() {
    try {
        // Mostrar loading
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'loading-overlay';
        loadingDiv.innerHTML = `
            <div class="text-center">
                <div class="spinner-border mb-3" role="status">
                    <span class="visually-hidden">Processando...</span>
                </div>
                <h5>Processando seu pedido...</h5>
            </div>
        `;
        document.body.appendChild(loadingDiv);

        // Combinar dados do pedido
        const pedidoCompleto = {
            ...pedidoData,
            endereco: enderecoEntrega,
            metodoPagamento: metodoPagamento,
            status: 'confirmado',
            numeroPedido: 'AM' + Date.now()
        };

        // Salvar pedido (vamos implementar isso depois)
        await salvarPedido(pedidoCompleto);

        // Atualizar número do pedido na confirmação
        document.getElementById('numeroPedido').textContent = pedidoCompleto.numeroPedido;

        // Limpar carrinho
        localStorage.removeItem('carrinho');
        updateCartCount();

        // Remover loading
        loadingDiv.remove();

        // Mostrar mensagem de sucesso
        alert('Pedido realizado com sucesso! Número: ' + pedidoCompleto.numeroPedido);

    } catch (error) {
        console.error('Erro ao finalizar pedido:', error);
        alert('Erro ao processar pedido. Tente novamente.');
    }
}

async function salvarPedido(pedido) {
    try {
        console.log('💾 Tentando salvar pedido...', pedido);
        
        // Importar a função do Supabase
        const { salvarPedidoNoBanco } = await import('./pedidos-db.js');
        
        // Salvar no banco
        const pedidoSalvo = await salvarPedidoNoBanco(pedido);
        console.log('✅ Pedido salvo no banco:', pedidoSalvo);
        
        return pedidoSalvo;
        
    } catch (error) {
        console.error('❌ Erro ao salvar no banco:', error);
        
        // Fallback: salvar no localStorage
        console.log('🔄 Usando fallback localStorage...');
        const pedidos = JSON.parse(localStorage.getItem('pedidos')) || [];
        pedidos.push(pedido);
        localStorage.setItem('pedidos', JSON.stringify(pedidos));
        localStorage.setItem('ultimoPedido', JSON.stringify(pedido));
        
        return pedido;
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