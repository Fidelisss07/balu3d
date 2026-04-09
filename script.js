// State Management
let products = [];
let cart = [];
let orders = [];
let currentUser = null;
let currentSlide = 0;
let carouselInterval;

// Sample Products (will be replaced by admin)
const sampleProducts = [
    {
        id: 1,
        name: "Action Figure Spider-Man",
        description: "Figura articulada do Homem-Aranha com detalhes incríveis. Perfeita para colecionadores.",
        price: 149.90,
        category: "action-figures",
        featured: true,
        images: ["https://images.unsplash.com/photo-1635805737259-2e1c6a0c8f5b?w=400"]
    },
    {
        id: 2,
        name: "Capacivo do Mandalorian",
        description: "Réplica em alta definição do capacete do Mandalorian. Impressão 3D de qualidade premium.",
        price: 299.90,
        category: "decoracao",
        featured: true,
        images: ["https://images.unsplash.com/photo-1608889476561-6242cfdbf622?w=400"]
    },
    {
        id: 3,
        name: "Suporte para Headset Gamer",
        description: "Suporte personalizado para headset com design geek. Mantenha seu setup organizado.",
        price: 89.90,
        category: "acessorios",
        featured: false,
        images: ["https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=400"]
    },
    {
        id: 4,
        name: "Pokémon Charizard",
        description: "Charizard em pose dinâmica. Detalhes impressionantes e pintura à mão.",
        price: 179.90,
        category: "action-figures",
        featured: true,
        images: ["https://images.unsplash.com/photo-1613771404721-c5b1c1a7a8c7?w=400"]
    },
    {
        id: 5,
        name: "Luminária Death Star",
        description: "Luminária em formato da Estrela da Morte de Star Wars. LED incluso.",
        price: 199.90,
        category: "decoracao",
        featured: false,
        images: ["https://images.unsplash.com/photo-1563089145-599997674d42?w=400"]
    },
    {
        id: 6,
        name: "Portal Gun Rick and Morty",
        description: "Réplica funcional da Portal Gun. Efeitos sonoros e luminosos.",
        price: 249.90,
        category: "games",
        featured: true,
        images: ["https://images.unsplash.com/photo-1589254065878-42c9da997008?w=400"]
    },
    {
        id: 7,
        name: "Dragon Ball Z - Goku SSJ",
        description: "Goku Super Saiyajin em pose de combate. Base inclusa.",
        price: 189.90,
        category: "action-figures",
        featured: false,
        images: ["https://images.unsplash.com/photo-1578632767115-351597cf0116?w=400"]
    },
    {
        id: 8,
        name: "Organizador de Cabos",
        description: "Conjunto de organizadores de cabos com tema gamer. Pacote com 5 unidades.",
        price: 49.90,
        category: "acessorios",
        featured: false,
        images: ["https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=400"]
    }
];

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
    loadCart();
    loadOrders();
    initCarousel();
    renderFeaturedProducts();
    renderAllProducts();
    startAutoCarousel();
});

// Local Storage Functions
function loadProducts() {
    const stored = localStorage.getItem('balu3d_products');
    if (stored) {
        products = JSON.parse(stored);
    } else {
        products = sampleProducts;
        saveProducts();
    }
}

function saveProducts() {
    localStorage.setItem('balu3d_products', JSON.stringify(products));
}

function loadCart() {
    const stored = localStorage.getItem('balu3d_cart');
    if (stored) {
        cart = JSON.parse(stored);
        updateCartCount();
    }
}

function saveCart() {
    localStorage.setItem('balu3d_cart', JSON.stringify(cart));
    updateCartCount();
}

function loadOrders() {
    const stored = localStorage.getItem('balu3d_orders');
    if (stored) {
        orders = JSON.parse(stored);
    }
}

function saveOrders() {
    localStorage.setItem('balu3d_orders', JSON.stringify(orders));
}

// Carousel Functions
function initCarousel() {
    const slidesContainer = document.getElementById('carousel-slides');
    const dotsContainer = document.getElementById('carousel-dots');
    
    const carouselImages = [
        "https://images.unsplash.com/photo-1615663245857-acda5b2b1587?w=1200",
        "https://images.unsplash.com/photo-1635805737259-2e1c6a0c8f5b?w=1200",
        "https://images.unsplash.com/photo-1608889476561-6242cfdbf622?w=1200"
    ];
    
    slidesContainer.innerHTML = '';
    dotsContainer.innerHTML = '';
    
    carouselImages.forEach((img, index) => {
        const slide = document.createElement('div');
        slide.className = 'carousel-slide';
        slide.innerHTML = `<img src="${img}" alt="Slide ${index + 1}">`;
        slidesContainer.appendChild(slide);
        
        const dot = document.createElement('div');
        dot.className = 'carousel-dot' + (index === 0 ? ' active' : '');
        dot.onclick = () => goToSlide(index);
        dotsContainer.appendChild(dot);
    });
}

function moveCarousel(direction) {
    const slides = document.querySelectorAll('.carousel-slide');
    const dots = document.querySelectorAll('.carousel-dot');
    
    currentSlide += direction;
    
    if (currentSlide >= slides.length) {
        currentSlide = 0;
    } else if (currentSlide < 0) {
        currentSlide = slides.length - 1;
    }
    
    updateCarousel(slides, dots);
}

function goToSlide(index) {
    const slides = document.querySelectorAll('.carousel-slide');
    const dots = document.querySelectorAll('.carousel-dot');
    
    currentSlide = index;
    updateCarousel(slides, dots);
}

function updateCarousel(slides, dots) {
    const slidesContainer = document.getElementById('carousel-slides');
    slidesContainer.style.transform = `translateX(-${currentSlide * 100}%)`;
    
    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentSlide);
    });
}

function startAutoCarousel() {
    carouselInterval = setInterval(() => {
        moveCarousel(1);
    }, 5000);
}

// Page Navigation
function showPage(pageName) {
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => page.classList.remove('active'));
    
    const targetPage = document.getElementById(pageName + '-page');
    if (targetPage) {
        targetPage.classList.add('active');
    }
    
    // Close mobile menu if open
    const navMenu = document.querySelector('.nav-menu');
    navMenu.classList.remove('active');
    
    window.scrollTo(0, 0);
    
    // Load specific page data
    if (pageName === 'cart') {
        renderCart();
    } else if (pageName === 'checkout') {
        renderCheckout();
    } else if (pageName === 'orders') {
        renderOrders();
    } else if (pageName === 'admin') {
        checkAdminAuth();
    }
}

// Mobile Menu
function toggleMobileMenu() {
    const navMenu = document.querySelector('.nav-menu');
    navMenu.classList.toggle('active');
}

// Product Rendering
function renderFeaturedProducts() {
    const container = document.getElementById('featured-products');
    const featured = products.filter(p => p.featured);
    
    container.innerHTML = featured.map(product => createProductCard(product)).join('');
}

function renderAllProducts(filter = 'todos') {
    const container = document.getElementById('all-products');
    let filtered = products;
    
    if (filter !== 'todos') {
        filtered = products.filter(p => p.category === filter);
    }
    
    container.innerHTML = filtered.map(product => createProductCard(product)).join('');
}

function createProductCard(product) {
    const image = product.images[0] || 'https://via.placeholder.com/400x300?text=Produto';
    return `
        <div class="product-card">
            <div class="product-image">
                <img src="${image}" alt="${product.name}">
            </div>
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                <p class="product-description">${product.description}</p>
                <p class="product-price">R$ ${product.price.toFixed(2).replace('.', ',')}</p>
                <div class="product-actions">
                    <button class="btn-add-cart" onclick="addToCart(${product.id})">
                        <i class="fas fa-shopping-cart"></i> Adicionar
                    </button>
                    <button class="btn-view-details" onclick="viewProductDetails(${product.id})">
                        <i class="fas fa-eye"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Filter Products
function filterProducts(category) {
    const buttons = document.querySelectorAll('.filter-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    renderAllProducts(category);
}

// Cart Functions
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({
            ...product,
            quantity: 1
        });
    }
    
    saveCart();
    showNotification('Produto adicionado ao carrinho! 🛒');
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    renderCart();
}

function updateQuantity(productId, change) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(productId);
        } else {
            saveCart();
            renderCart();
        }
    }
}

function updateCartCount() {
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById('cart-count').textContent = count;
}

function renderCart() {
    const container = document.getElementById('cart-items');
    
    if (cart.length === 0) {
        container.innerHTML = '<p style="text-align: center; padding: 40px; color: var(--text-gray);">Seu carrinho está vazio 😢</p>';
        document.getElementById('cart-subtotal').textContent = 'R$ 0,00';
        document.getElementById('cart-shipping').textContent = 'R$ 0,00';
        document.getElementById('cart-total').textContent = 'R$ 0,00';
        return;
    }
    
    container.innerHTML = cart.map(item => `
        <div class="cart-item">
            <img src="${item.images[0]}" alt="${item.name}">
            <div class="cart-item-info">
                <h4 class="cart-item-name">${item.name}</h4>
                <p class="cart-item-price">R$ ${item.price.toFixed(2).replace('.', ',')}</p>
                <div class="cart-item-quantity">
                    <button class="quantity-btn" onclick="updateQuantity(${item.id}, -1)">-</button>
                    <span class="quantity-display">${item.quantity}</span>
                    <button class="quantity-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
                </div>
            </div>
            <button class="remove-item" onclick="removeFromCart(${item.id})">
                <i class="fas fa-trash"></i> Remover
            </button>
        </div>
    `).join('');
    
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = subtotal > 0 ? 25.00 : 0;
    const total = subtotal + shipping;
    
    document.getElementById('cart-subtotal').textContent = `R$ ${subtotal.toFixed(2).replace('.', ',')}`;
    document.getElementById('cart-shipping').textContent = `R$ ${shipping.toFixed(2).replace('.', ',')}`;
    document.getElementById('cart-total').textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
}

// Checkout
function renderCheckout() {
    const container = document.getElementById('checkout-items');
    
    if (cart.length === 0) {
        showPage('cart');
        return;
    }
    
    container.innerHTML = cart.map(item => `
        <div style="display: flex; gap: 10px; margin-bottom: 10px; align-items: center;">
            <img src="${item.images[0]}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 5px;">
            <div>
                <p style="font-size: 0.9rem;">${item.name}</p>
                <p style="color: var(--primary-color); font-weight: 600;">${item.quantity}x R$ ${item.price.toFixed(2).replace('.', ',')}</p>
            </div>
        </div>
    `).join('');
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0) + 25;
    document.getElementById('checkout-total').textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
}

function processCheckout(event) {
    event.preventDefault();
    
    if (cart.length === 0) {
        showNotification('Seu carrinho está vazio!');
        return;
    }
    
    const orderNumber = Math.floor(Math.random() * 1000000);
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0) + 25;
    
    const order = {
        id: orderNumber,
        date: new Date().toLocaleDateString('pt-BR'),
        status: 'pending',
        items: [...cart],
        total: total,
        customer: {
            name: document.getElementById('checkout-name').value,
            cpf: document.getElementById('checkout-cpf').value,
            address: document.getElementById('checkout-address').value,
            number: document.getElementById('checkout-number').value,
            neighborhood: document.getElementById('checkout-neighborhood').value,
            city: document.getElementById('checkout-city').value,
            state: document.getElementById('checkout-state').value,
            cep: document.getElementById('checkout-cep').value
        },
        payment: document.querySelector('input[name="payment"]:checked').value
    };
    
    orders.unshift(order);
    saveOrders();
    
    cart = [];
    saveCart();
    updateCartCount();
    
    document.getElementById('order-number').textContent = orderNumber;
    showPage('confirmation');
}

// Auth Functions
function showAuthForm(formType) {
    document.querySelectorAll('.auth-form').forEach(form => form.classList.remove('active'));
    document.getElementById(formType + '-form').classList.add('active');
}

function handleLogin(event) {
    event.preventDefault();
    // Simulate login
    currentUser = { email: event.target.email.value };
    showNotification('Login realizado com sucesso! 🎉');
    showPage('home');
}

function handleRegister(event) {
    event.preventDefault();
    // Simulate registration
    currentUser = { email: event.target.email.value };
    showNotification('Cadastro realizado com sucesso! Bem-vindo! 🎉');
    showPage('home');
}

// Orders
function renderOrders() {
    const container = document.getElementById('orders-list');
    
    if (orders.length === 0) {
        container.innerHTML = '<p style="text-align: center; padding: 40px; color: var(--text-gray);">Você ainda não fez nenhuma compra 😢</p>';
        return;
    }
    
    container.innerHTML = orders.map(order => `
        <div class="order-card">
            <div class="order-header">
                <span class="order-number-display">Pedido #${order.id}</span>
                <span class="order-status ${order.status}">${getStatusText(order.status)}</span>
            </div>
            <div class="order-items">
                ${order.items.map(item => `
                    <div class="order-item">
                        <img src="${item.images[0]}" alt="${item.name}">
                        <div>
                            <p>${item.name}</p>
                            <p style="color: var(--primary-color); font-weight: 600;">${item.quantity}x R$ ${item.price.toFixed(2).replace('.', ',')}</p>
                        </div>
                    </div>
                `).join('')}
            </div>
            <p class="order-total">Total: R$ ${order.total.toFixed(2).replace('.', ',')}</p>
            <button class="btn-primary" style="margin-top: 15px;" onclick="trackOrderById(${order.id})">
                <i class="fas fa-search-location"></i> Rastrear Pedido
            </button>
        </div>
    `).join('');
}

function getStatusText(status) {
    const statuses = {
        pending: 'Pendente',
        processing: 'Em Processamento',
        shipped: 'Enviado',
        delivered: 'Entregue'
    };
    return statuses[status] || status;
}

// Tracking
function trackOrder() {
    const code = document.getElementById('tracking-code').value;
    const result = document.getElementById('tracking-result');
    
    const order = orders.find(o => o.id.toString() === code);
    
    if (!order) {
        result.innerHTML = '<p style="text-align: center; color: var(--text-gray);">Pedido não encontrado 😕</p>';
        return;
    }
    
    result.innerHTML = `
        <div class="tracking-timeline">
            <div class="tracking-step completed">
                <p class="tracking-step-date">${order.date}</p>
                <h4 class="tracking-step-title">Pedido Realizado</h4>
                <p class="tracking-step-desc">Seu pedido foi confirmado!</p>
            </div>
            <div class="tracking-step ${order.status === 'processing' ? 'current' : (order.status === 'pending' ? '' : 'completed')}">
                <p class="tracking-step-date">Em andamento</p>
                <h4 class="tracking-step-title">Em Processamento</h4>
                <p class="tracking-step-desc">Preparando seu pedido com carinho</p>
            </div>
            <div class="tracking-step ${order.status === 'shipped' ? 'current' : (['pending', 'processing'].includes(order.status) ? '' : 'completed')}">
                <p class="tracking-step-date">Em breve</p>
                <h4 class="tracking-step-title">Enviado</h4>
                <p class="tracking-step-desc">Pedido saiu para entrega</p>
            </div>
            <div class="tracking-step ${order.status === 'delivered' ? 'current' : ''}">
                <p class="tracking-step-date">A caminho</p>
                <h4 class="tracking-step-title">Entregue</h4>
                <p class="tracking-step-desc">Pedido entregue com sucesso!</p>
            </div>
        </div>
    `;
}

function trackOrderById(orderId) {
    showPage('tracking');
    document.getElementById('tracking-code').value = orderId;
    trackOrder();
}

// Admin Functions
function checkAdminAuth() {
    const password = prompt('Digite a senha de administrador:');
    if (password !== 'admin123') {
        showNotification('Senha incorreta!');
        showPage('home');
        return;
    }
    renderAdminProducts();
    renderAdminOrders();
}

function showAdminSection(section) {
    document.querySelectorAll('.admin-panel').forEach(panel => panel.classList.remove('active'));
    document.querySelectorAll('.admin-menu-btn').forEach(btn => btn.classList.remove('active'));
    
    document.getElementById('admin-' + section).classList.add('active');
    event.target.classList.add('active');
}

function previewImage(input, index) {
    const preview = document.getElementById(`image-preview-${index}`);
    const file = input.files[0];
    
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            preview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
            preview.dataset.image = e.target.result;
        };
        reader.readAsDataURL(file);
    }
}

function addProduct(event) {
    event.preventDefault();
    
    const images = [];
    for (let i = 1; i <= 5; i++) {
        const preview = document.getElementById(`image-preview-${i}`);
        if (preview.dataset.image) {
            images.push(preview.dataset.image);
        }
    }
    
    const newProduct = {
        id: Date.now(),
        name: document.getElementById('product-name').value,
        description: document.getElementById('product-description').value,
        price: parseFloat(document.getElementById('product-price').value),
        category: document.getElementById('product-category').value,
        featured: document.getElementById('product-featured').checked,
        images: images.length > 0 ? images : ['https://via.placeholder.com/400x300?text=Produto']
    };
    
    products.unshift(newProduct);
    saveProducts();
    
    showNotification('Produto cadastrado com sucesso! 🎉');
    event.target.reset();
    
    // Reset image previews
    for (let i = 1; i <= 5; i++) {
        const preview = document.getElementById(`image-preview-${i}`);
        preview.innerHTML = `<input type="file" accept="image/*" onchange="previewImage(this, ${i})"><span class="upload-text"><i class="fas fa-cloud-upload-alt"></i><br>Imagem ${i}</span>`;
        delete preview.dataset.image;
    }
    
    renderAdminProducts();
    renderFeaturedProducts();
    renderAllProducts();
}

function renderAdminProducts() {
    const container = document.getElementById('admin-products-list');
    
    container.innerHTML = `
        <table>
            <thead>
                <tr>
                    <th>Imagem</th>
                    <th>Nome</th>
                    <th>Preço</th>
                    <th>Categoria</th>
                    <th>Ações</th>
                </tr>
            </thead>
            <tbody>
                ${products.map(product => `
                    <tr>
                        <td><img src="${product.images[0]}" class="product-thumb" alt="${product.name}"></td>
                        <td>${product.name}</td>
                        <td>R$ ${product.price.toFixed(2).replace('.', ',')}</td>
                        <td>${product.category}</td>
                        <td>
                            <button class="action-btn edit-btn" onclick="editProduct(${product.id})"><i class="fas fa-edit"></i></button>
                            <button class="action-btn delete-btn" onclick="deleteProduct(${product.id})"><i class="fas fa-trash"></i></button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

function deleteProduct(id) {
    if (confirm('Tem certeza que deseja excluir este produto?')) {
        products = products.filter(p => p.id !== id);
        saveProducts();
        renderAdminProducts();
        renderFeaturedProducts();
        renderAllProducts();
        showNotification('Produto excluído!');
    }
}

function editProduct(id) {
    const product = products.find(p => p.id === id);
    // Implement edit functionality
    showNotification('Funcionalidade de edição em desenvolvimento');
}

function renderAdminOrders() {
    const container = document.getElementById('admin-orders-list');
    
    if (orders.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--text-gray);">Nenhum pedido ainda</p>';
        return;
    }
    
    container.innerHTML = `
        <table>
            <thead>
                <tr>
                    <th>Pedido</th>
                    <th>Cliente</th>
                    <th>Data</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Ações</th>
                </tr>
            </thead>
            <tbody>
                ${orders.map(order => `
                    <tr>
                        <td>#${order.id}</td>
                        <td>${order.customer.name}</td>
                        <td>${order.date}</td>
                        <td>R$ ${order.total.toFixed(2).replace('.', ',')}</td>
                        <td><span class="order-status ${order.status}">${getStatusText(order.status)}</span></td>
                        <td>
                            <select onchange="updateOrderStatus(${order.id}, this.value)" style="padding: 5px; border-radius: 5px; background: var(--dark-bg); color: var(--text-light); border: 1px solid var(--primary-color);">
                                <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pendente</option>
                                <option value="processing" ${order.status === 'processing' ? 'selected' : ''}>Processando</option>
                                <option value="shipped" ${order.status === 'shipped' ? 'selected' : ''}>Enviado</option>
                                <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>Entregue</option>
                            </select>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

function updateOrderStatus(orderId, newStatus) {
    const order = orders.find(o => o.id === orderId);
    if (order) {
        order.status = newStatus;
        saveOrders();
        showNotification('Status atualizado!');
    }
}

function logoutAdmin() {
    showPage('home');
    showNotification('Logout realizado!');
}

// FAQ Toggle
function toggleFAQ(button) {
    button.classList.toggle('active');
    const answer = button.nextElementSibling;
    answer.classList.toggle('active');
}

// Notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: var(--gradient-1);
        color: white;
        padding: 15px 25px;
        border-radius: 10px;
        box-shadow: var(--shadow);
        z-index: 2000;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add animations to stylesheet
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href !== '#') {
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        }
    });
});

// View Product Details (placeholder)
function viewProductDetails(productId) {
    const product = products.find(p => p.id === productId);
    alert(`${product.name}\n\n${product.description}\n\nPreço: R$ ${product.price.toFixed(2).replace('.', ',')}`);
}
