const K3Cloud = require('../src/');

const k3cloud = new K3Cloud({
  baseURL: 'http://103.231.252.83:8081',
  accid: "616392643d7fb6",
  username: "Administrator",
  appid: "winfullyLambda",
  appsecret: "28ecd1f20b524bc5bf1835ef2c4984e8"
});

const addClient = async ({
  name,
  phone,
  email,
  address,
  orgId,
  currencyId,
  recconditionId,
  taxRateId
}) => {
  const cookie = await k3cloud.auth();

  const client = await k3cloud.client.listOneClient({
    cookie: cookie,
    filterString: `FName = '${name}' AND FTEL = '${phone}'`
  });

  if (client) {
    return {
      ...client,
      Id: client.FCUSTID,
      Number: client.FNumber
    };
  } else {
    return await k3cloud.client.saveClient({
      cookie: cookie,
      data: {
        Model: {
          FName: name,
          FTEL: phone,
          F_PAEZ_Text1: email,
          FADDRESS: address,
          FCreateOrgId: {
            FNumber: orgId
          },
          FUseOrgId: {
            FNumber: orgId
          },
          FTRADINGCURRID: {
            FNumber: currencyId
          },
          FRECCONDITIONID: {
            FNumber: recconditionId
          },
          FTaxRate: {
            FNumber: taxRateId
          },
          FIsTrade: "true",
          FISCREDITCHECK: "true",
          FInvoiceType: "1",
          FT_BD_CUSTCONTACT: [
            {
              "FENTRYID": "0",
              "FNUMBER1": "",
              "FNAME1": name,
              "FADDRESS1": address,
              "FTRANSLEADTIME1": "0",
              "FMOBILE": phone,
              "FIsDefaultConsignee": "true",
              "FIsDefaultSettle": "true",
              "FIsDefaultPayer": "true",
              "FIsUsed": "true"
            }
          ]
        }
      }
    })
  }
}


(async () => {

  const cookie = await k3cloud.auth();
  const org = await k3cloud.org.getOrg({
    cookie: cookie,
    data: {
      Number: '102'
    }
  });
  if (!!!org.Id) {
    console.warn('ERP cannot get this org!');
    return false;
  } else {
    // console.log('organisation:', org);
  }
  //Currency
  const currency = await k3cloud.currency.listOneCurrency({
    cookie: cookie,
    filterString: "FCODE='MOP'"
  });
  //Reccondition
  const reccondtion = await k3cloud.reccondition.listOneReccondition({
    cookie: cookie,
    filterString: "FName like '%预收款%'"
  });

  //TaxRate
  const taxRate = await k3cloud.taxRate.listOneTaxRate({
    cookie: cookie,
    filterString: "FName = '17%增值税'"
  });
  // console.log('taxRate:', taxRate);

  const client = await addClient({
    name: 'David Chu 3(Test20211115)',
    phone: '85366297530',
    email: 'davidaasm@gmail.com',
    address: 'test address',
    orgId: org.Number,
    currencyId: currency.FNumber,
    recconditionId: reccondtion.FNumber,
    taxRateId: taxRate.FNumber
  });

  // console.log(client);

  if (client?.FCUSTID) {
    const resp = await k3cloud.client.auditClient({
      cookie: cookie,
      data: {
        createOrgId: org.Number,
        Numbers: [
          client.Number
        ]
      }
    });
  } else {
    const resp = await k3cloud.client.submitClient({
      cookie: cookie,
      data: {
        createOrgId: org.Number,
        Numbers: [
          client.Number
        ]
      }
    });

    if (!!resp?.ResponseStatus?.IsSuccess) {
      const resp = await k3cloud.client.auditClient({
        cookie: cookie,
        data: {
          createOrgId: org.Number,
          Numbers: [
            client.Number
          ]
        }
      });
    }
  }



})()
