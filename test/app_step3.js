const _ = require("lodash");
const moment = require('moment');
const sql = require('mssql');
const WooCommerceAPI = require("@woocommerce/woocommerce-rest-api").default;


// const WP2K3 = require('./WP2K3');
const myEvent = require('./event/event.json');
const config = require('./config.json');
const WooCommerce = new WooCommerceAPI(config.woocommerce);

const updateSaleOrderStatus = async (entry) => {
  await sql.connect(config.mssql.dns);

  const result = await sql.query`SELECT * FROM [dbo].[T_AR_RECEIVEBILLENTRY] WHERE [FRECEIVEITEM] = '${entry.FRECEIVEITEM}'`;

  const recTotal = _.reduce(result.recordset, (prev, curr) => +prev + +curr.FRECAMOUNTFOR_E, 0);

  const ARResult = await sql.query`SELECT SUM(salePlan.[FRECADVANCEAMOUNT]) AS SUM_FRECADVANCEAMOUNT FROM [dbo].[T_SAL_ORDER] as sale LEFT JOIN [T_SAL_ORDERPLAN] as salePlan ON salePlan.[FID]=sale.[FID] WHERE sale.[FBILLNO] = '${entry.FRECEIVEITEM}'`;

  const totalAR = _.reduce(ARResult.recordset, (prev, curr) => +prev + +curr.SUM_FRECADVANCEAMOUNT, 0);

  return (+recTotal >= +totalAR);
}


(async () => {
  // const body = JSON.parse(myEvent.body);
  const body = { Fid: 313545 };
  const { Fid } = body;

  // const wp2k3 = new WP2K3();
  // await wp2k3.auth();


  await sql.connect(config.mssql.dns);
  const result = await sql.query(`SELECT * FROM [dbo].[T_SAL_OUTSTOCK] WHERE [FID] = ${Fid}`);

  if (!result.recordset || result.recordset.length === 0) return false;

  _.each(result.recordset, async (entry) => {
    if (/^WPORDER[0-9]+$/i.test(entry.F_PAEZ_TEXT) === false) return;
    const match = /^WPORDER([0-9]+)$/.exec(entry.F_PAEZ_TEXT);
    const orderId = match[1];

    const relOutStock = await sql.query(`SELECT * FROM [dbo].[T_SAL_OUTSTOCK] WHERE [FID] = ${Fid}`);

    /**
     * SELECT outstockentry.* 
FROM [dbo].[T_SAL_OUTSTOCK] as outstock
LEFT JOIN [dbo].[T_SAL_OUTSTOCKENTRY] as outstockentry ON outstockentry.[FID]=outstock.[FID]
WHERE outstock.[F_PAEZ_TEXT] like 'WPORDER%';
     */
    console.log('relOutStock: ', relOutStock.recordset);
    //add Woocommerce note for order

  });







  // console.log('resp:', resp);
  return;
})()