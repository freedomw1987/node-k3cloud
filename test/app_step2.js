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
  const body = { Fid: 438797 };
  const { Fid } = body;

  // const wp2k3 = new WP2K3();
  // await wp2k3.auth();


  await sql.connect(config.mssql.dns);
  const result = await sql.query(`SELECT * FROM [dbo].[T_AR_RECEIVEBILLENTRY] WHERE [FID] = ${Fid}`);

  if (!result.recordset || result.recordset.length === 0) return false;

  _.each(result.recordset, async (entry) => {
    if (entry.FRECEIVEITEMTYPE !== '1' && /^WPORDER[0-9]+$/i.test(entry.FRECEIVEITEM) === false) return;
    const match = /^WPORDER([0-9]+)$/.exec(entry.FRECEIVEITEM);
    const orderId = match[1];

    //add Woocommerce note for order
    let note = moment(new Date(entry.FPOSTDATE)).format('YYYY年MM月DD日') + ' 付款: MOP' + entry.FRECAMOUNTFOR_E;
    WooCommerce.post(`orders/${orderId}/notes`, {
      note: note,
      customer_note: true
    }).then((response) => {
      console.log('Woocommerce add note:', response.data);
    }).catch((error) => {
      console.log(error.response.data);
    });

    //get AR total
    console.log('pay:', await updateSaleOrderStatus(entry))



  });







  // console.log('resp:', resp);
  return;
})()