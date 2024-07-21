const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true
}));

let users = [];  // To store registered users
let orders = []; // To store orders

const adminCredentials = { username: 'admin', password: 'admin123' };

app.post('/register', (req, res) => {
    const { name, username, password, mobile, email } = req.body;
    if (users.find(user => user.username === username)) {
        return res.status(400).send('Username already exists');
    }
    users.push({ name, username, password, mobile, email });
    res.send('Registration successful');
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const user = users.find(user => user.username === username && user.password === password);
    if (user) {
        req.session.loggedIn = true;
        req.session.username = username;
        res.sendStatus(200);
    } else {
        res.sendStatus(401);
    }
});

app.get('/is-logged-in', (req, res) => {
    res.json({ loggedIn: req.session.loggedIn });
});

app.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).send('Could not log out.');
        } else {
            res.status(200).send('Logout successful.');
        }
    });
});

let products = [
    { id: 1, name: 'Hoodie', price: 10, imageUrl: '/images/product1.jpg' },
    { id: 2, name: 'Red Sweatshirt', price: 15, imageUrl: '/images/product2.jpg' },
    { id: 3, name: 'Green Sweatshirt', price: 20, imageUrl: '/images/product3.jpg' },
    { id: 4, name: 'Blue Sweater', price: 20, imageUrl: '/images/product4.jpg' },
];

app.post('/add-to-cart', (req, res) => {
    if (!req.session.loggedIn) {
        return res.status(401).send('You need to log in first.');
    }

    const productId = req.body.productId;

    if (!req.session.cart) {
        req.session.cart = [];
    }

    const existingProduct = req.session.cart.find(item => item.id === productId);

    if (existingProduct) {
        existingProduct.quantity += 1;
    } else {
        const product = products.find(p => p.id === productId);
        if (product) {
            req.session.cart.push({ ...product, quantity: 1 });
        }
    }

    res.status(200).send('Product added to cart.');
});

app.post('/remove-from-cart', (req, res) => {
    if (!req.session.loggedIn) {
        return res.status(401).send('You need to log in first.');
    }

    const productId = req.body.productId;

    if (req.session.cart) {
        req.session.cart = req.session.cart.filter(item => item.id !== productId);
    }

    res.status(200).send('Product removed from cart.');
});

app.get('/products', (req, res) => {
    res.json(products);
});

app.get('/cart-page', (req, res) => {
    if (!req.session.loggedIn) {
        return res.status(401).send('You need to log in first.');
    }

    if (req.session.cart) {
        res.json(req.session.cart);
    } else {
        res.status(200).json([]);
    }
});

// Fetch order history
app.get('/order-history', (req, res) => {
    if (!req.session.loggedIn) {
        return res.status(401).send('You need to log in first.');
    }

    const userOrders = orders.filter(order => order.username === req.session.username);
    res.json(userOrders);
});

// Track a specific order by ID
app.get('/order/:id', (req, res) => {
    if (!req.session.loggedIn) {
        return res.status(401).send('You need to log in first.');
    }

    const orderId = parseInt(req.params.id, 10);
    const order = orders.find(o => o.id === orderId && o.username === req.session.username);

    if (order) {
        res.json(order);
    } else {
        res.status(404).send('Order not found.');
    }
});

app.post('/checkout', (req, res) => {
    if (!req.session.loggedIn) {
        return res.status(401).send('You need to log in first.');
    }

    const { name, address, contactNo } = req.body;

    const order = {
        id: orders.length + 1,
        username: req.session.username,
        name,
        address,
        contactNo,
        cart: req.session.cart,
        date: new Date().toISOString(),
        status: 'Pending'
    };

    orders.push(order);
    console.log('Order details:', { name, address, contactNo, cart: req.session.cart });
    req.session.cart = [];

    res.send('Order successfully placed! Please pay COD.');
});

// Admin login route
app.post('/admin-login', (req, res) => {
    const { username, password } = req.body;
    if (username === adminCredentials.username && password === adminCredentials.password) {
        req.session.adminLoggedIn = true;
        res.sendStatus(200);
    } else {
        res.sendStatus(401);
    }
});

// Fetch orders by username (admin)
app.get('/fetch-orders', (req, res) => {
    if (!req.session.adminLoggedIn) {
        return res.status(401).send('Admin not logged in.');
    }

    const username = req.query.username;
    const userOrders = orders.filter(order => order.username === username);
    res.json(userOrders);
});

// Update order status (admin)
app.post('/update-order-status', (req, res) => {
    if (!req.session.adminLoggedIn) {
        return res.status(401).send('Admin not logged in.');
    }

    const { orderId, status } = req.body;
    const order = orders.find(o => o.id === orderId);
    if (order) {
        order.status = status;
        res.sendStatus(200);
    } else {
        res.status(404).send('Order not found.');
    }
});

app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
