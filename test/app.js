const K3Cloud = require('../src');

const k3cloud = new K3Cloud({
  baseURL: 'http://103.231.252.83:8081',
  accid: "616392643d7fb6",
  username: "Administrator",
  appid: "winfullyLambda",
  appsecret: "28ecd1f20b524bc5bf1835ef2c4984e8"
});

k3cloud.auth().then((cookie) => {
  console.log('cookie: ', cookie)
});
