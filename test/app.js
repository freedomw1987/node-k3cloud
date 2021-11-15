const WP2K3 = require('./WP2K3');
const myEvent = require('./event/event.json');


(async () => {
  const body = JSON.parse(myEvent.body);

  const wp2k3 = new WP2K3();
  await wp2k3.auth();

  const client = await wp2k3.addClient({
    name: (body?.billing?.company) ? body?.billing?.company : body?.billing?.lastname + ' ' + body?.billing?.firstname,
    phone: body?.billing?.phone,
    email: body?.billing?.email,
    address: body?.billing?.address_1 + ", \n" + body?.billing?.address_2 + ", \n" + body?.billing?.city + ", \n" + body?.billing?.state + ", \n" + body?.billing?.country
  });

  console.log('sale_order\'s client: ', client);

  const saleOrder = await wp2k3.addSaleOrder({
    ...body,
    client: client
  });

  console.log('sale_order: ', saleOrder);
})()
