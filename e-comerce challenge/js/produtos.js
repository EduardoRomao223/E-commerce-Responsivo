// Dados dos produtos (depois vamos migrar para JSON)
const produtos = [
    {
        id: 1,
        nome: "Caixa de Presente Floral",
        categoria: "caixas",
        preco: 25.00,
        estoque: 15,
        imagem: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=400",
        descricao: "Caixa decorada com flores artesanais"
    },
    {
        id: 2,
        nome: "Sacola Kraft Personalizada",
        categoria: "sacolas",
        preco: 12.00,
        estoque: 30,
        imagem: "https://images.unsplash.com/photo-1607083206968-13611e3d76db?w=400",
        descricao: "Sacola de papel kraft com alça de corda"
    },
    {
        id: 3,
        nome: "Kit Tags Decorativas",
        categoria: "tags",
        preco: 18.00,
        estoque: 20,
        imagem: "https://images.unsplash.com/photo-1607082349566-187342175e2f?w=400",
        descricao: "Conjunto com 10 tags artesanais variadas"
    },
    {
        id: 4,
        nome: "Caixa Luxo com Laço",
        categoria: "caixas",
        preco: 45.00,
        estoque: 8,
        imagem: "https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=400",
        descricao: "Caixa rígida com acabamento premium"
    },
    {
        id: 5,
        nome: "Sacola Colorida Média",
        categoria: "sacolas",
        preco: 15.00,
        estoque: 25,
        imagem: "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=400",
        descricao: "Sacola de papel colorido decorada"
    },
    {
        id: 6,
        nome: "Cesta Decorativa",
        categoria: "embalagens",
        preco: 55.00,
        estoque: 5,
        imagem: "https://th.bing.com/th/id/R.7266325767d493fc2201ca6fe0b88be5?rik=EwOrtgkGkU73Zw&riu=http%3a%2f%2f1.bp.blogspot.com%2f-Z9J7wBvEmtc%2fTb8kASlRtdI%2fAAAAAAAAA-0%2fLYtUfMFKllk%2fs1600%2fCesta%252B005.jpg&ehk=WpXdmHeie2l1ru4VanUK%2bzvvE8yXzv6YjrXycNXk6bo%3d&risl=&pid=ImgRaw&r=0",
        descricao: "Cesta de vime com decoração artesanal"
    }
];

function renderProducts(productsToRender = produtos) {
    const grid = document.getElementById('productsGrid');
    
    if (productsToRender.length === 0) {
        grid.innerHTML = `
            <div class="col-12 text-center py-5">
                <i class="fas fa-search fa-3x text-muted mb-3"></i>
                <h4>Nenhum produto encontrado</h4>
                <p class="text-muted">Tente alterar os filtros de busca</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = productsToRender.map(produto => `
        <div class="col-md-6 col-lg-4 mb-4" data-category="${produto.categoria}">
            <div class="product-card">
                <div class="position-relative">
                    <span class="badge-category">${produto.categoria.charAt(0).toUpperCase() + produto.categoria.slice(1)}</span>
                    <span class="stock-badge">${produto.estoque} em estoque</span>
                    <img src="${produto.imagem}" alt="${produto.nome}" class="product-img">
                </div>
                <div class="card-body p-4">
                    <h5 class="card-title">${produto.nome}</h5>
                    <p class="text-muted small mb-2">${produto.descricao}</p>
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <span class="price">R$ ${produto.preco.toFixed(2).replace('.', ',')}</span>
                        <span class="text-muted small">Cód: ${produto.id.toString().padStart(3, '0')}</span>
                    </div>
                    <button class="btn btn-primary w-100 add-to-cart" data-product-id="${produto.id}">
                        <i class="fas fa-cart-plus"></i> Adicionar ao Carrinho
                    </button>
                </div>
            </div>
        </div>
    `).join('');

    // Adicionar event listeners aos botões
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', function() {
            const productId = parseInt(this.getAttribute('data-product-id'));
            addToCart(productId);
        });
    });
}

function filterProducts(category) {
    if (category === 'all') {
        renderProducts();
    } else {
        const filtered = produtos.filter(produto => produto.categoria === category);
        renderProducts(filtered);
    }
}

function sortProducts(criteria) {
    const sorted = [...produtos];
    
    switch(criteria) {
        case 'name':
            sorted.sort((a, b) => a.nome.localeCompare(b.nome));
            break;
        case 'price-low':
            sorted.sort((a, b) => a.preco - b.preco);
            break;
        case 'price-high':
            sorted.sort((a, b) => b.preco - a.preco);
            break;
        case 'stock':
            sorted.sort((a, b) => b.estoque - a.estoque);
            break;
    }
    
    renderProducts(sorted);
}

function addToCart(productId) {
    const produto = produtos.find(p => p.id === productId);
    
    if (!produto) {
        alert('Produto não encontrado!');
        return;
    }

    if (produto.estoque <= 0) {
        alert('Desculpe, este produto está fora de estoque!');
        return;
    }

    // Recupera o carrinho atual do localStorage ou cria um novo
    let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
    
    // Verifica se o produto já está no carrinho
    const itemExistente = carrinho.find(item => item.id === productId);
    
    if (itemExistente) {
        // Se já existe, aumenta a quantidade
        if (itemExistente.quantidade < produto.estoque) {
            itemExistente.quantidade += 1;
        } else {
            alert(`Desculpe, só temos ${produto.estoque} unidades em estoque.`);
            return;
        }
    } else {
        // Se não existe, adiciona novo item
        carrinho.push({
            id: produto.id,
            nome: produto.nome,
            preco: produto.preco,
            imagem: produto.imagem,
            descricao: produto.descricao,
            quantidade: 1,
            estoque: produto.estoque
        });
    }
    
    // Salva o carrinho atualizado no localStorage
    localStorage.setItem('carrinho', JSON.stringify(carrinho));
    
    // Atualiza o contador do carrinho
    updateCartCount();
    
    // Feedback visual
    showAddToCartFeedback(produto.nome);
}

function showAddToCartFeedback(productName) {
    const toast = document.createElement('div');
    toast.className = 'alert alert-success position-fixed top-0 end-0 m-3';
    toast.style.zIndex = '9999';
    toast.innerHTML = `
        <i class="fas fa-check-circle me-2"></i>
        <strong>${productName}</strong> adicionado ao carrinho!
        <a href="pages/carrinho.html" class="alert-link ms-2">Ver carrinho</a> <!-- Ajustado -->
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

function updateCartCount() {
    const carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
    const totalItens = carrinho.reduce((total, item) => total + item.quantidade, 0);
    
    // Atualiza em todas as páginas
    const cartCountElements = document.querySelectorAll('#cartCount');
    cartCountElements.forEach(element => {
        element.textContent = totalItens;
    });
}

function updateCartCount() {
    // Esta função atualizaria o contador do carrinho
    // Por enquanto é apenas um exemplo
    const cartCount = document.getElementById('cartCount');
    const currentCount = parseInt(cartCount.textContent) || 0;
    cartCount.textContent = currentCount + 1;
}

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    renderProducts();
    
    // Event listeners para filtros
    document.querySelectorAll('.filter-btn').forEach(button => {
        button.addEventListener('click', function() {
            document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            filterProducts(this.getAttribute('data-category'));
        });
    });
    
    // Event listener para ordenação
    document.getElementById('sortProducts').addEventListener('change', function() {
        sortProducts(this.value);
    });
});