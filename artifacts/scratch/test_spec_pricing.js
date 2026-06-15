async function testSpecPricing() {
  try {
    const catRes = await fetch('http://localhost:5000/api/products');
    const prods = await catRes.json();
    console.log('Successfully fetched products, count:', prods.length);
    console.log('First product sizes column:', prods[0]?.sizes);
  } catch (e) {
    console.error('Fetch failed:', e.message);
  }
}
testSpecPricing();
