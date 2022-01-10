const _ = require("lodash");
const moment = require('moment');
const sql = require('mssql');
const WooCommerceAPI = require("@woocommerce/woocommerce-rest-api").default;


const K32WP = require('./K32WP');
const myEvent = require('./event/event.json');
const config = require('./config.json');
const WooCommerce = new WooCommerceAPI(config.woocommerce);


(async () => {
  // const body = JSON.parse(myEvent.body);
  const body = { Fid: 438797 };
  const { Fid } = body;

  const k32wp = new K32WP();
  // await wp2k3.auth();


  const result = await k32wp.getRecevibleBillEntry(Fid);

  if (!result || result.length === 0) return false;

  _.each(result, async (entry) => {
    if (entry.FRECEIVEITEMTYPE !== '1' && /^WPORDER[0-9]+$/i.test(entry.FRECEIVEITEM) === false) return;

    //add Woocommerce note for order
    const note = moment(new Date(entry.FPOSTDATE)).format('YYYY年MM月DD日') + ' 付款: MOP' + entry.FRECAMOUNTFOR_E;
    k32wp.addWPOrderNote(entry.FRECEIVEITEM, note);

    await k32wp.updateWPOrderStatus(entry.FRECEIVEITEM)



  });







  // console.log('resp:', resp);
  return;
})()