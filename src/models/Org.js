const K3Cloud = require('../libs/K3Cloud');

//default Data

module.exports = class K3CloudOrg extends K3Cloud {

  constructor(config) {
    super(config);
    return this;
  }

  async getOrg({ cookie, data = {} }) {
    const defaultObject = require('../defaultData/orgGet');

    return await this.get({
      cookie: cookie,
      formId: "ORG_Organizations",
      data: {
        ...defaultObject,
        ...data
      }
    });
  }

  async listOrg({ cookie, fieldKeys = [], limit, skip, filterString, orderString }) {
    const defaultFieldKeys = require('../defaultData/orgList');
    return await this.list({
      cookie: cookie,
      formId: "ORG_Organizations",
      fieldKeys: [...defaultFieldKeys, ...fieldKeys],
      limit: limit,
      skip: skip,
      filterString: filterString,
      orderString: orderString
    })
  }


}