// Funções para manipular o carrinho
function loadCartItems() {
    const carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
    const cartContainer = document.querySelector('.card-body.p-4');
    
    if (carrinho.length === 0) {
        showEmptyCart();
        return;
    }
    
    let html = '';
    let subtotalTotal = 0;
    
    carrinho.forEach(item => {
        const itemSubtotal = item.preco * item.quantidade;
        subtotalTotal += itemSubtotal;
        
        html += `
            <div class="cart-item d-flex" data-product-id="${item.id}">
                <div class="flex-shrink-0">
                    <img src="${item.imagem}" 
                         alt="${item.nome}" 
                         class="cart-item-img">
                </div>
                <div class="flex-grow-1 ms-4">
                    <div class="d-flex justify-content-between align-items-start">
                        <div>
                            <h5 class="mb-1">${item.nome}</h5>
                            <p class="text-muted small mb-2">${item.descricao}</p>
                            <div class="d-flex align-items-center">
                                <span class="text-primary fw-bold me-3">R$ ${item.preco.toFixed(2).replace('.', ',')}</span>
                                <span class="text-muted small">Estoque: ${item.estoque}</span>
                            </div>
                        </div>
                        <button class="btn btn-link text-danger p-0" onclick="removeItem(this)">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                    <div class="d-flex justify-content-between align-items-center mt-3">
                        <div class="quantity-control">
                            <button class="quantity-btn" onclick="decreaseQuantity(this)">
                                <i class="fas fa-minus"></i>
                            </button>
                            <input type="number" class="quantity-input" value="${item.quantidade}" min="1" max="${item.estoque}" 
                                   onchange="updateQuantity(this)">
                            <button class="quantity-btn" onclick="increaseQuantity(this)">
                                <i class="fas fa-plus"></i>
                            </button>
                        </div>
                        <div class="text-end">
                            <small class="text-muted d-block">Subtotal</small>
                            <span class="h5 mb-0 text-primary">R$ ${itemSubtotal.toFixed(2).replace('.', ',')}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
    
    cartContainer.innerHTML = html;
    updateOrderSummary(subtotalTotal);
    updateCartCount();
    document.getElementById('cartWithItems').classList.remove('d-none');
    document.getElementById('emptyCart').classList.add('d-none');
}

function decreaseQuantity(button) {
    const input = button.nextElementSibling;
    if (parseInt(input.value) > 1) {
        input.value = parseInt(input.value) - 1;
        updateCartItem(input);
    }
}

function increaseQuantity(button) {
    const input = button.previousElementSibling;
    const max = parseInt(input.max);
    if (parseInt(input.value) < max) {
        input.value = parseInt(input.value) + 1;
        updateCartItem(input);
    } else {
        alert(`Desculpe, só temos ${max} unidades em estoque.`);
    }
}

function updateQuantity(input) {
    const value = parseInt(input.value);
    const max = parseInt(input.max);
    
    if (value < 1) {
        input.value = 1;
    } else if (value > max) {
        input.value = max;
        alert(`Desculpe, só temos ${max} unidades em estoque.`);
    }
    
    updateCartItem(input);
}

function updateCartItem(input) {
    const itemElement = input.closest('.cart-item');
    const productId = parseInt(itemElement.getAttribute('data-product-id'));
    const quantidade = parseInt(input.value);
    
    // Atualiza no localStorage
    let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
    const itemIndex = carrinho.findIndex(item => item.id === productId);
    
    if (itemIndex !== -1) {
        carrinho[itemIndex].quantidade = quantidade;
        localStorage.setItem('carrinho', JSON.stringify(carrinho));
        
        // Atualiza o subtotal visual
        const preco = carrinho[itemIndex].preco;
        const subtotal = preco * quantidade;
        const subtotalElement = itemElement.querySelector('.h5.mb-0.text-primary');
        subtotalElement.textContent = `R$ ${subtotal.toFixed(2).replace('.', ',')}`;
        
        // Atualiza o resumo geral
        updateOrderSummary();
    }
}

function removeItem(button) {
    if (confirm('Tem certeza que deseja remover este item do carrinho?')) {
        const itemElement = button.closest('.cart-item');
        const productId = parseInt(itemElement.getAttribute('data-product-id'));
        
        // Remove do localStorage
        let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
        carrinho = carrinho.filter(item => item.id !== productId);
        localStorage.setItem('carrinho', JSON.stringify(carrinho));
        
        // Remove do HTML
        itemElement.remove();
        
        // Verifica se ainda há itens no carrinho
        const cartItems = document.querySelectorAll('.cart-item');
        if (cartItems.length === 0) {
            showEmptyCart(); // ✅ CORRIGIDO
        } else {
            updateOrderSummary();
        }
        
        updateCartCount();
    }
}

function updateOrderSummary() {
    const carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
    let subtotal = 0;
    
    carrinho.forEach(item => {
        subtotal += item.preco * item.quantidade;
    });
    
    const frete = subtotal > 100 ? 0 : 12.50;
    const total = subtotal + frete;
    
    // Atualiza na página
    const subtotalElement = document.querySelector('.summary-card .d-flex.justify-content-between.mb-2 span:last-child');
    const freteElement = document.querySelectorAll('.summary-card .d-flex.justify-content-between.mb-2 span:last-child')[1];
    const totalElement = document.querySelector('.summary-card .h5.text-primary');
    
    if (subtotalElement) subtotalElement.textContent = `R$ ${subtotal.toFixed(2).replace('.', ',')}`;
    if (freteElement) freteElement.textContent = subtotal > 100 ? 'GRÁTIS' : `R$ ${frete.toFixed(2).replace('.', ',')}`;
    if (totalElement) totalElement.textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
}

function showEmptyCart() {
    document.getElementById('cartWithItems').classList.add('d-none');
    document.getElementById('emptyCart').classList.remove('d-none');
}

// Função para redirecionar corretamente
function proceedToCheckout() {
    const carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
    if (carrinho.length === 0) {
        alert('Seu carrinho está vazio!');
        return;
    }
    
    // Verificar se está logado
    const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));
    if (!usuarioLogado) {
        alert('Por favor, faça login para finalizar a compra.');
        if (window.location.pathname.includes('/pages/')) {
            window.location.href = 'login.html';
        } else {
            window.location.href = 'pages/login.html';
        }
        return;
    }
    
    // Redirecionar para checkout
    if (window.location.pathname.includes('/pages/')) {
        window.location.href = 'checkout.html';
    } else {
        window.location.href = 'pages/checkout.html';
    }
}

// Atualiza o contador do carrinho na navbar
function updateCartCount() {
    const carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
    const totalItens = carrinho.reduce((total, item) => total + item.quantidade, 0);
    
    const cartCountElements = document.querySelectorAll('#cartCount');
    cartCountElements.forEach(element => {
        element.textContent = totalItens;
    });
}

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    loadCartItems();
    updateCartCount();
});