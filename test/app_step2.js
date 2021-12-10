const WP2K3 = require('./WP2K3');
const myEvent = require('./event/event.json');


(async () => {
  const body = JSON.parse(myEvent.body);

  const wp2k3 = new WP2K3();
  await wp2k3.auth();

  const so = await wp2k3.getSaleOrder({
    id: 2
  });

  console.log('so:', so);

})()