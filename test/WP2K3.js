const moment = require('moment');
const _ = require('lodash');
const K3Cloud = require('../src');
const config = require('./config.json');

module.exports = class WP2K3 {

  constructor() {
    this.k3cloud = new K3Cloud(config);
  }

  async auth() {
    this.cookie = await this.k3cloud.auth();

    //Org
    this.org = await this.k3cloud.org.getOrg({
      cookie: this.cookie,
      data: {
        Number: '102.08'
      }
    });
    //Currency
    this.currency = await this.k3cloud.currency.listOneCurrency({
      cookie: this.cookie,
      filterString: "FCODE='MOP'"
    });
    //Reccondition
    this.reccondtion = await this.k3cloud.reccondition.listOneReccondition({
      cookie: this.cookie,
      filterString: "FName like '%预收款%'"
    });
    //TaxRate
    this.taxRate = await this.k3cloud.taxRate.listOneTaxRate({
      cookie: this.cookie,
      filterString: "FName = '17%增值税'"
    });
  }

  async addClient({ name, phone, email, address }) {
    let client;

    //preClient
    const preClient = await this.k3cloud.client.listOneClient({
      cookie: this.cookie,
      filterString: `FName = '${name}' AND FTEL = '${phone}'`
    });

    if (preClient) {
      client = {
        ...preClient,
        Id: preClient.FCUSTID,
        Number: preClient.FNumber
      };
    } else {
      client = await this.k3cloud.client.saveClient({
        cookie: this.cookie,
        data: {
          Model: {
            FName: name,
            FTEL: phone,
            F_PAEZ_Text1: email,
            FADDRESS: address,
            FCreateOrgId: {
              FNumber: this.org.Number
            },
            FUseOrgId: {
              FNumber: this.org.Number
            },
            FTRADINGCURRID: {
              FNumber: this.currency.FNumber
            },
            FRECCONDITIONID: {
              FNumber: this.reccondtion.FNumber
            },
            FTaxRate: {
              FNumber: this.taxRate.FNumber
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
      });
    }

    if (client?.FCUSTID) {
      const resp = await this.k3cloud.client.auditClient({
        cookie: this.cookie,
        data: {
          createOrgId: this.org.Number,
          Numbers: [
            client.Number
          ]
        }
      });
    } else {
      const resp = await this.k3cloud.client.submitClient({
        cookie: this.cookie,
        data: {
          createOrgId: this.org.Number,
          Numbers: [
            client.Number
          ]
        }
      });

      if (!!resp?.ResponseStatus?.IsSuccess) {
        await this.k3cloud.client.auditClient({
          cookie: this.cookie,
          data: {
            createOrgId: this.org.Number,
            Numbers: [
              client.Number
            ]
          }
        });
      }
    }

    return client;
  }

  async addSaleOrder({ client, date_created, line_items, order_key, shipping, id }) {
    let data = {
      Model: {
        FBillNo: `WPORDER${id}`,
        FBillTypeID: {
          FNumber: 'XSDD01_SYS' //標準銷售訂單
        },
        FSaleOrgId: {
          FNumber: this.org.Number
        },
        FDate: moment(new Date(date_created)).format('YYYY-MM-DD'),
        FReceiveId: {
          FNumber: client.Number
        },
        FReceiveAddress: shipping?.address_1 + ", \n" + shipping?.address_2 + ", \n" + shipping?.city + ", \n" + shipping?.state + ", \n" + shipping?.country,
        FCustId: {
          FNumber: client.Number,
        },
        FSalerId: {
          FNumber: '00001' //kent
        },
        FSettleId: { //09 刷卡
          FNumber: "10" //電子支付
        },
        FSaleOrderFinance: {
          FSettleCurrId: {
            FNumber: this.currency.FNumber
          },
          FRecConditionId: {
            FNumber: this.reccondtion.FNumber
          }
        },
        FSaleOrderEntry: []
      }
    };
    _.each(line_items, (row) => {
      data.Model.FSaleOrderEntry.push({
        FEntryID: 0,
        FMaterialId: {
          FNumber: row.sku
        },
        FUnitID: {
          FNumber: "jian" //件
        },
        FQty: row.quantity,
        FPrice: row.price,
        FDeliveryDate: moment(new Date(date_created)).format('YYYY-MM-DD'),
        FReserveType: "1",
        FStockOrgId: {
          FNumber: '102.01'
        },
        FOwnerId: {
          FNumber: '102.01'
        }
      })
    });

    const saleOrder = await this.k3cloud.saleOrder.saveSaleOrder({
      cookie: this.cookie,
      data: data
    });

    const resp = await this.k3cloud.saleOrder.submitSaleOrder({
      cookie: this.cookie,
      data: {
        createOrgId: this.org.Number,
        Numbers: [
          saleOrder.Number
        ]
      }
    });

    if (!!resp?.ResponseStatus?.IsSuccess) {
      await this.k3cloud.saleOrder.auditSaleOrder({
        cookie: this.cookie,
        data: {
          createOrgId: this.org.Number,
          Numbers: [
            saleOrder.Number
          ]
        }
      });
    }

    return saleOrder;
  }

}