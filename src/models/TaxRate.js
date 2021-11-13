const K3Cloud = require('../libs/K3Cloud');

//default Data

module.exports = class K3CloudTaxRate extends K3Cloud {

  constructor(config) {
    super(config);
    return this;
  }

  async listTaxRate({ cookie, fieldKeys = [], limit, skip, filterString, orderString }) {
    const defaultFieldKeys = require('../defaultData/taxRateList');
    return await this.list({
      cookie: cookie,
      formId: "BD_TaxRate",
      fieldKeys: [...defaultFieldKeys, ...fieldKeys],
      limit: limit,
      skip: skip,
      filterString: filterString,
      orderString: orderString
    })
  }

  async listOneTaxRate({ cookie, fieldKeys = [], limit, skip, filterString, orderString }) {
    const resp = await this.listTaxRate({
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

  async saveTaxRate({ cookie, data }) {
    const defaultValue = require("../defaultData/taxRateSave");
    const model = {
      ...defaultValue.Model,
      ...data.Model
    }
    //console.log('MODEL: ', JSON.stringify(model, null, 3))
    return await this.save({
      cookie: cookie,
      formId: "BD_TaxRate",
      data: {
        ...defaultValue,
        ...data,
        Model: model
      }
    });
  }


}