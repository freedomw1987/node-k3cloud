const _ = require("lodash");
const moment = require('moment');
const sql = require('mssql');

const K32WP = require('./K32WP');
const myEvent = require('./event/event.json');
const config = require('./config.json');

(async () => {
  // const body = JSON.parse(myEvent.body);
  const body = { Fid: 313548 };
  const { Fid } = body;

  const k32wp = new K32WP();

  const result = await k32wp.getOutStock(Fid);

  if (!result || result.length === 0) return false;

  _.each(result, async (entry) => {
    if (/^WPORDER[0-9]+$/i.test(entry.F_PAEZ_TEXT) === false) return;
    await k32wp.updateWPOrderStatus(entry.F_PAEZ_TEXT);
  });

})()