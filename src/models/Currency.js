const K3Cloud = require('../libs/K3Cloud');

//default Data

module.exports = class K3CloudCurrency extends K3Cloud {

  constructor(config) {
    super(config);
    return this;
  }

  async listCurrency({ cookie, fieldKeys = [], limit, skip, filterString, orderString }) {
    const defaultFieldKeys = require('../defaultData/currencyList');
    return await this.list({
      cookie: cookie,
      formId: "BD_Currency",
      fieldKeys: [...defaultFieldKeys, ...fieldKeys],
      limit: limit,
      skip: skip,
      filterString: filterString,
      orderString: orderString
    })
  }

  async listOneCurrency({ cookie, fieldKeys = [], limit, skip, filterString, orderString }) {
    const resp = await this.listCurrency({
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

  async saveCurrency({ cookie, data }) {
    const defaultValue = require("../defaultData/currencySave");
    const model = {
      ...defaultValue.Model,
      ...data
    }
    return await this.save({
      cookie: cookie,
      formId: "BD_Currency",
      data: {
        ...defaultValue,
        Model: model
      }
    });
  }


}