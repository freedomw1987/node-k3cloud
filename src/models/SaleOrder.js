const K3Cloud = require('../libs/K3Cloud');

//default Data
module.exports = class K3CloudSaleOrder extends K3Cloud {

  constructor(config) {
    super(config);
    return this;
  }

  async listSaleOrder({ cookie, fieldKeys = [], limit, skip, filterString, orderString }) {
    const defaultFieldKeys = require('../defaultData/saleOrderList');
    return await this.list({
      cookie: cookie,
      formId: "SAL_SaleOrder",
      fieldKeys: [...defaultFieldKeys, ...fieldKeys],
      limit: limit,
      skip: skip,
      filterString: filterString,
      orderString: orderString
    });
  }

  async listOneSaleOrder({ cookie, fieldKeys = [], limit, skip, filterString, orderString }) {
    const resp = await this.listSaleOrder({
      cookie: cookie,
      fieldKeys: fieldKeys,
      limit: limit,
      skip: skip,
      filterString: filterString,
      orderString: orderString
    });
    if (!!resp && resp.length > 0) {
      return resp[0]
    } else {
      return null;
    }
  }

  async saveSaleOrder({ cookie, data }) {
    const defaultValue = require("../defaultData/saleOrderSave");
    const model = {
      ...defaultValue.Model,
      ...data.Model
    }
    // console.log('MODEL: ', JSON.stringify(model, null, 3))
    return await this.save({
      cookie: cookie,
      formId: "SAL_SaleOrder",
      data: {
        ...defaultValue,
        ...data,
        Model: model
      }
    });
  }

  async submitSaleOrder({ cookie, data }) {
    const defaultValue = require("../defaultData/submit");
    return await this.submit({
      cookie: cookie,
      formId: "SAL_SaleOrder",
      data: {
        ...defaultValue,
        ...data
      }
    });
  }


  async auditSaleOrder({ cookie, data }) {
    const defaultValue = require("../defaultData/submit");
    return await this.audit({
      cookie: cookie,
      formId: "SAL_SaleOrder",
      data: {
        ...defaultValue,
        ...data
      }
    });
  }


}