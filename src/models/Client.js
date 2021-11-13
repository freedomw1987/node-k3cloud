const K3Cloud = require('../libs/K3Cloud');

//default Data

module.exports = class K3CloudClient extends K3Cloud {

  constructor(config) {
    super(config);
    return this;
  }

  async listClient({ cookie, fieldKeys = [], limit, skip, filterString, orderString }) {
    const defaultFieldKeys = require('../defaultData/clientList');
    return await this.list({
      cookie: cookie,
      formId: "BD_Customer",
      fieldKeys: [...defaultFieldKeys, ...fieldKeys],
      limit: limit,
      skip: skip,
      filterString: filterString,
      orderString: orderString
    })
  }

  async listOneClient({ cookie, fieldKeys = [], limit, skip, filterString, orderString }) {
    const resp = await this.listClient({
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

  async saveClient({ cookie, data }) {
    const defaultValue = require("../defaultData/clientSave");
    const model = {
      ...defaultValue.Model,
      ...data.Model
    }
    // console.log('MODEL: ', JSON.stringify(model, null, 3))
    return await this.save({
      cookie: cookie,
      formId: "BD_Customer",
      data: {
        ...defaultValue,
        ...data,
        Model: model
      }
    });
  }

  async submitClient({ cookie, data }) {
    const defaultValue = require("../defaultData/submit");
    return await this.submit({
      cookie: cookie,
      formId: "BD_Customer",
      data: {
        ...defaultValue,
        ...data
      }
    });
  }


}