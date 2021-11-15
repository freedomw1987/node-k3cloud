const K3Cloud = require('../libs/K3Cloud');

//default Data

module.exports = class K3CloudReccondition extends K3Cloud {

  constructor(config) {
    super(config);
    return this;
  }

  async listReccondition({ cookie, fieldKeys = [], limit, skip, filterString, orderString }) {
    const defaultFieldKeys = require('../defaultData/recconditionList');
    return await this.list({
      cookie: cookie,
      formId: "BD_RecCondition",
      fieldKeys: [...defaultFieldKeys, ...fieldKeys],
      limit: limit,
      skip: skip,
      filterString: filterString,
      orderString: orderString
    })
  }

  async listOneReccondition({ cookie, fieldKeys = [], limit, skip, filterString, orderString }) {
    const resp = await this.listReccondition({
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

  async saveReccondition({ cookie, data }) {
    const defaultValue = require("../defaultData/recconditionSave");
    const model = {
      ...defaultValue.Model,
      ...data.Model
    }
    return await this.save({
      cookie: cookie,
      formId: "BD_RecCondition",
      data: {
        ...defaultValue,
        ...data,
        Model: model
      }
    });
  }


}