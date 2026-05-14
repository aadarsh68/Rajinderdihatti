// Example: Testing the checkout endpoint
// This example shows how to call the checkout API after user is logged in

// 1. User logs in first (sets userId cookie)
const loginResponse = await fetch('http://localhost:3000/api/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include', // important: sends cookies
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123'
  })
});

// 2. Then call checkout (userId cookie is automatically sent)
const checkoutResponse = await fetch('http://localhost:3000/api/checkout', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include', // important: sends cookies
  body: JSON.stringify({
    shippingAddress: '123 Main St, New York, NY 10001',
    phone: '9876543210'
  })
});

const result = await checkoutResponse.json();

// Expected successful response:
// {
//   "success": true,
//   "order": {
//     "id": "clk123...",
//     "total": 1500,
//     "status": "pending",
//     "items": [
//       {
//         "id": "item1...",
//         "orderId": "clk123...",
//         "productId": "prod1...",
//         "quantity": 2,
//         "price": 750,
//         "product": { ... }
//       }
//     ],
//     "createdAt": "2024-01-15T10:30:00Z"
//   }
// }

// Expected error response (if not logged in):
// {
//   "error": "Unauthorized: Please log in first"
// }
