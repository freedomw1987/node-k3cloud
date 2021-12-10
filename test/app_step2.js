const _ = require("lodash");
const moment = require('moment');
const sql = require('mssql');
const WooCommerceAPI = require("@woocommerce/woocommerce-rest-api").default;


const WP2K3 = require('./WP2K3');
const myEvent = require('./event/event.json');
const config = require('./config.json');


(async () => {
  // const body = JSON.parse(myEvent.body);
  const body = { Fid: 438797 };
  const { Fid } = body;

  const wp2k3 = new WP2K3();
  await wp2k3.auth();

  const WooCommerce = new WooCommerceAPI(config.woocommerce);

  await sql.connect(config.mssql.dns);
  const result = await sql.query(`SELECT * FROM [dbo].[T_AR_RECEIVEBILLENTRY] WHERE [FID] = ${Fid}`);

  if (!result.recordset || result.recordset.length === 0) return false;

  _.each(result.recordset, (entry) => {
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

    // const result = await sql.query(`SELECT * FROM [dbo].[T_AR_RECEIVEBILLENTRY] WHERE [FID] = ${Fid}`);



  });







  // console.log('resp:', resp);
  return;
})()