const _ = require("lodash");
const K3Cloud = require('../libs/K3Cloud');

//default Data
module.exports = class K3CloudReceiveBill extends K3Cloud {

  constructor(config) {
    super(config);
    return this;
  }

  async listReceiveBill({ cookie, fieldKeys = [], limit, skip, filterString, orderString }) {
    const defaultFieldKeys = require('../defaultData/receiveBillList');
    return await this.list({
      cookie: cookie,
      formId: "AR_RECEIVEBILL",
      fieldKeys: [...defaultFieldKeys, ...fieldKeys],
      limit: limit,
      skip: skip,
      filterString: filterString,
      orderString: orderString
    });
  }

  async listOneReceiveBill({ cookie, fieldKeys = [], limit, skip, filterString, orderString }) {
    const resp = await this.listReceiveBill({
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

  async saveReceiveBill({ cookie, data }) {
    const defaultValue = require("../defaultData/receiveBillSave");
    const model = {
      ...defaultValue.Model,
      ...data.Model
    }
    console.log('MODEL: ', JSON.stringify(model, null, 3))
    return await this.save({
      cookie: cookie,
      formId: "AR_RECEIVEBILL",
      data: {
        ...defaultValue,
        ...data,
        Model: model
      }
    });
  }

  async submitReceiveBill({ cookie, data }) {
    const defaultValue = require("../defaultData/submit");
    return await this.submit({
      cookie: cookie,
      formId: "AR_RECEIVEBILL",
      data: {
        ...defaultValue,
        ...data
      }
    });
  }


  async auditReceiveBill({ cookie, data }) {
    const defaultValue = require("../defaultData/submit");
    return await this.audit({
      cookie: cookie,
      formId: "AR_RECEIVEBILL",
      data: {
        ...defaultValue,
        ...data
      }
    });
  }


}