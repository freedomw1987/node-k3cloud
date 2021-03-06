const K3Cloud = require("./libs/K3Cloud");
//models
const K3CloudClient = require('./models/Client');
const K3CloudOrg = require('./models/Org');
const K3CloudCurrency = require("./models/Currency");
const K3CloudReccondition = require("./models/Reccondition");
const K3CloudTaxRate = require("./models/TaxRate");
const K3CloudSaleOrder = require("./models/SaleOrder");
const K3CloudReceiveBill = require("./models/ReceiveBill");


module.exports = class K3CloudIndex extends K3Cloud {

  constructor(config) {
    super(config);
    this.client = new K3CloudClient(config);
    this.org = new K3CloudOrg(config);
    this.currency = new K3CloudCurrency(config);
    this.reccondition = new K3CloudReccondition(config);
    this.taxRate = new K3CloudTaxRate(config);
    this.saleOrder = new K3CloudSaleOrder(config);
    this.receiveBill = new K3CloudReceiveBill(config);
    return this;
  }


}
