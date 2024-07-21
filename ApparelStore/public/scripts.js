document.addEventListener('DOMContentLoaded', () => {
    fetch('/is-logged-in')
        .then(response => response.json())
        .then(data => {
            if (data.loggedIn) {
                document.getElementById('auth-button').textContent = 'Logout';
            } else {
                document.getElementById('auth-button').textContent = 'Login';
            }
        });
    navigateTo('home');  // Load the home page content by default
});

function toggleMenu() {
    const menu = document.getElementById('toggle-menu');
    menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
}

function navigateTo(page) {
    const mainContent = document.getElementById('main-content');

    switch(page) {
        case 'products':
            fetch('/products.html')
                .then(response => response.text())
                .then(html => {
                    mainContent.innerHTML = html;
                    loadProducts();
                });
            break;
        case 'contact':
            fetch('/contact.html')
                .then(response => response.text())
                .then(html => {
                    mainContent.innerHTML = html;
                });
            break;
        case 'cart':
            fetch('/cart-page')
                .then(response => {
                    if (response.ok) {
                        return response.json();
                    } else {
                        alert('You need to log in first.');
                        navigateTo('login');
                    }
                })
                .then(cartItems => {
                    if (cartItems.length > 0) {
                        const productList = cartItems.map(item => `
                            <div>
                                <img src="${item.imageUrl}" alt="${item.name}" class="product-image">
                                
                                <h3>${item.name}</h3> 
                                <h3>$${item.price} x ${item.quantity} = $${item.price * item.quantity}</h3>
                                <button onclick="removeFromCart(${item.id})">Remove</button>
                            
                            </div>
                        `).join('');
                        mainContent.innerHTML = `
                            
                            <div id="cart-items">${productList}
                            
                            <form id="checkout-form" onsubmit="checkout(event)">
                                <input type="text" id="checkout-name" placeholder="Name" required>
                                <input type="text" id="checkout-address" placeholder="Address" required>
                                <input type="text" id="checkout-contact" placeholder="Contact No." required>
                                <h2>Subtotal: $${cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)}</h2>
                                <button type="submit">Place Order</button>
                            </form>
                        `;
                    } else {
                        mainContent.innerHTML = '<h2>Your cart is empty.</h2>';
                    }
                })
                
            break;
        case 'login':
            fetch('/login.html')
                .then(response => response.text())
                .then(html => {
                    mainContent.innerHTML = html;
                });
            break;
        case 'register':
            fetch('/register.html')
                .then(response => response.text())
                .then(html => {
                    mainContent.innerHTML = html;
                });
            break;
        default:
            mainContent.innerHTML = `
                <div class="text-overlay">
                    <h1>Welcome to Our Online-Store</h1>
                    <p>Your one-stop shop for "All things Fashion"</p>
                </div>
            `;
    }
}

function loadProducts() {
    fetch('/products')
        .then(response => response.json())
        .then(products => {
            const productList = products.map(product => `
                <div class="product">
                    <img src="${product.imageUrl}" alt="${product.name}" class="product-image">
                    <h3>${product.name}</h3>
                    <p>$${product.price}</p>
                    <button onclick="addToCart(${product.id})">Add to Cart</button>
                </div>
            `).join('');
            document.getElementById('product-list').innerHTML = productList;
        });
}

function addToCart(productId) {
    fetch('/add-to-cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId })
    })
    .then(response => {
        if (response.ok) {
            alert('Product added to cart.');
        } else {
            alert('You need to log in first.');
            navigateTo('login');
        }
    });
}

function removeFromCart(productId) {
    fetch('/remove-from-cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId })
    })
    .then(response => {
        if (response.ok) {
            alert('Product removed from cart.');
            navigateTo('cart');
        } else {
            alert('Error removing product from cart.');
        }
    });
}

function checkout(event) {
    event.preventDefault();
    const name = document.getElementById('checkout-name').value;
    const address = document.getElementById('checkout-address').value;
    const contactNo = document.getElementById('checkout-contact').value;

    fetch('/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, address, contactNo })
    })
    .then(response => response.text())
    .then(message => {
        alert(message);
        navigateTo('home');
    });
}

function login() {
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    })
    .then(response => {
        if (response.ok) {
            alert('Login successful.');
            document.getElementById('auth-button').textContent = 'Logout';
            navigateTo('home');
        } else {
            alert('Invalid credentials.');
        }
    });
}

function register() {
    const name = document.getElementById('reg-name').value;
    const username = document.getElementById('reg-username').value;
    const password = document.getElementById('reg-password').value;
    const mobile = document.getElementById('reg-mobile').value;
    const email = document.getElementById('reg-email').value;

    fetch('/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, username, password, mobile, email })
    })
    .then(response => response.text())
    .then(() => {
        alert('Registered successfully. Please login.');
        navigateTo('login');
    });
}

// Fetch order history
function viewOrderHistory() {
    fetch('/order-history')
        .then(response => response.json())
        .then(orders => {
            const orderList = orders.map(order => `
                <div>
                    <h3>Order ID: ${order.id}</h3>
                    <p>Date: ${new Date(order.date).toLocaleDateString()}</p>
                    <button onclick="trackOrder(${order.id})">Track Order</button>
                </div>
            `).join('');
            document.getElementById('main-content').innerHTML = `
                <h2>Your Order History</h2>
                ${orderList}
            `;
        });
}

// Track a specific order
function trackOrder(orderId) {
    fetch(`/order/${orderId}`)
        .then(response => response.json())
        .then(order => {
            document.getElementById('main-content').innerHTML = `
                <div class="order-history-container">
<div>
                <h2>Order ID: ${order.id}</h2>
                <p>Date: ${new Date(order.date).toLocaleDateString()}</p>
                <p>Name: ${order.name}</p>
                <p>Address: ${order.address}</p>
                <p>Contact No.: ${order.contactNo}</p>
                <p class="order-status">Status: ${order.status}</p>
                
</div>              
                    ${order.cart.map(item => `
                        <div class="order-item">
                            <img src="${item.imageUrl}" alt="${item.name}" class="order-image">
                            <div class="order-item-details">
                                <h3>${item.name}</h3>
                                <p>$${item.price} x ${item.quantity} = $${item.price * item.quantity}</p>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        });
}



function handleAuth() {
    const authButton = document.getElementById('auth-button').textContent;

    if (authButton === 'Login') {
        navigateTo('login');
    } else if (authButton === 'Logout') {
        fetch('/logout', {
            method: 'POST'
        })
        .then(response => {
            if (response.ok) {
                document.getElementById('auth-button').textContent = 'Login';
                alert('Logged out successfully.');
                navigateTo('home');
            } else {
                alert('Error logging out.');
            }
        });
    }
}
