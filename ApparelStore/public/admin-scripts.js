document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('admin-actions').style.display = 'none'; // Hide actions until logged in
});

function loginAdmin() {
    const username = document.getElementById('admin-username').value;
    const password = document.getElementById('admin-password').value;

    fetch('/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    })
    .then(response => {
        if (response.ok) {
            document.getElementById('admin-actions').style.display = 'block'; // Show actions
            document.getElementById('login-form').style.display = 'none'; // Hide login form
        } else {
            alert('Invalid admin credentials.');
        }
    });
}

function fetchOrders() {
    const username = document.getElementById('fetch-username').value;

    fetch(`/fetch-orders?username=${encodeURIComponent(username)}`)
        .then(response => response.json())
        .then(orders => {
            if (orders.length > 0) {
                const orderList = orders.map(order => `
                    <div class="order">

                        <h3>Order ID: ${order.id}</h3>
                        <p>Date: ${new Date(order.date).toLocaleDateString()}</p>
                        <p>Name: ${order.name}</p>
                        <p>Address: ${order.address}</p>
                        <p>Contact No.: ${order.contactNo}</p>
                        <p>Status: ${order.status}</p>
                        <button onclick="updateOrderStatus(${order.id})">Update Status</button>
                    </div>
                `).join('');
                document.getElementById('orders-list').innerHTML = orderList;
            } else {
                document.getElementById('orders-list').innerHTML = '<p>No orders found.</p>';
            }
        });
}

function updateOrderStatus(orderId) {
    const newStatus = prompt('Enter new status:');
    if (newStatus) {
        fetch('/update-order-status', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderId, status: newStatus })
        })
        .then(response => {
            if (response.ok) {
                alert('Order status updated.');
                fetchOrders(); // Refresh the order list
            } else {
                alert('Error updating order status.');
            }
        });
    }
}
