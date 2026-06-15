async function testOrder() {
  try {
    // 1. Get products list first to find a valid product ID
    const prodRes = await fetch('http://localhost:5000/api/products');
    const prods = await prodRes.json();
    const product = prods.data?.[0] || prods?.[0];
    if (!product) {
      console.log('No products found to make a test order.');
      return;
    }
    console.log('Using product for test order:', product.name, '(ID:', product.id, ')');

    // 2. Make an order request with desk delivery
    const orderPayload = {
      fullName: 'Test Client',
      phone: '0550998877',
      wilaya: 'Oran (31)',
      commune: 'Oran',
      shippingType: 'desk',
      items: [
        {
          productId: Number(product.id),
          quantity: 1,
          size: 'Standard',
          color: 'Default'
        }
      ]
    };

    const orderRes = await fetch('http://localhost:5000/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderPayload)
    });

    const orderResult = await orderRes.json();
    console.log('Create order response status:', orderRes.status);
    console.log('Order created:', orderResult);
  } catch (e) {
    console.error('Test failed:', e.message);
  }
}

testOrder();
