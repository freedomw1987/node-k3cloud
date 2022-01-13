const K32WP = require('./K32WP');

const k32wp = new K32WP();

(async () => {
  const result = await k32wp.getInventory();
  result.map(async (inv) => {
    const product = await k32wp.updateWPProductStockBySKU(inv?.SKU, +inv?.FBASEQTY || 0);
    console.log('update product:', product);
  })
})()