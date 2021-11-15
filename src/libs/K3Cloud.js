const axios = require('axios');
const apiPath = require('../configs/api');
const keysMapping = require('../utils/keysMapping');

module.exports = class K3Cloud {

  constructor(config) {
    this.config = config;
    this.instance = axios.create({
      baseURL: config.baseURL,
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return this;
  }


  async auth() {
    const { accid, username = "Administrator", appid, appsecret } = this.config;
    const parameters = [accid, username, appid, appsecret, 2052];
    const { headers, data } = await this.instance.post(apiPath.authPath, { parameters })
    const { LoginResultType } = data;
    if (LoginResultType != 1) return null
    if (LoginResultType === 1) {
      const cookie = headers['set-cookie'] || []
      return cookie.join(';')
    }
  }

  async get({ cookie, formId, data }) {
    const payload = {
      formid: formId,
      data
    };
    const resp = await this.instance.post(apiPath.getPath, payload, { headers: { cookie } })
    const results = resp.data
    return results.Result.Result;
  }

  async list({ cookie, formId, fieldKeys, limit, skip, filterString, orderString }) {
    if (!formId || !fieldKeys.length || !cookie) throw new Error('invalid parameters')
    const FormId = formId
    const FieldKeys = fieldKeys.join(',')
    const payload = {
      FormId,
      data: {
        FormId,
        FieldKeys,
        Limit: limit || 0,
        StartRow: skip || 0,
        OrderString: orderString || '',
        FilterString: filterString || ''
      }
    }
    const resp = await this.instance.post(apiPath.listPath, payload, {
      headers: { cookie }
    });
    const results = keysMapping(fieldKeys, resp.data)
    return results
  }


  async listOne({ cookie, formId, fieldKeys, limit, skip, filterString, orderString }) {
    let results = await this.list({
      cookie: cookie,
      formId: formId,
      fieldKeys: fieldKeys,
      limit: limit,
      skip: skip,
      filterString: filterString,
      orderString: orderString
    })
    if (results.length > 0) {
      return results[0]
    } else {
      return null;
    }
  }


  async save({ cookie, formId, data }) {
    const payload = {
      formId: formId,
      data
    }
    // console.log('payload:', JSON.stringify(payload, null, 3))
    const resp = await this.instance.post(apiPath.savePath, payload, {
      headers: { cookie }
    });
    const results = resp.data
    return results.Result;
  }

  async submit({ cookie, formId, data }) {
    // console.log('formId: ', formId);
    const payload = {
      formId: formId,
      data
    }
    // console.log('payload:', JSON.stringify(payload, null, 3))
    const resp = await this.instance.post(apiPath.submitPath, payload, {
      headers: { cookie }
    });
    // console.log('resp: ', JSON.stringify(resp.data, null, 3));
    const results = resp.data
    return results.Result;
  }


  async submit({ cookie, formId, data }) {
    // console.log('formId: ', formId);
    const payload = {
      formId: formId,
      data
    }
    // console.log('payload:', JSON.stringify(payload, null, 3))
    const resp = await this.instance.post(apiPath.submitPath, payload, {
      headers: { cookie }
    });
    // console.log('resp: ', JSON.stringify(resp.data, null, 3));
    const results = resp.data
    return results.Result;
  }

  async audit({ cookie, formId, data }) {
    // console.log('formId: ', formId);
    const payload = {
      formId: formId,
      data
    }
    // console.log('payload:', JSON.stringify(payload, null, 3))
    const resp = await this.instance.post(apiPath.auditPath, payload, {
      headers: { cookie }
    });
    // console.log('resp: ', JSON.stringify(resp.data, null, 3));
    const results = resp.data
    return results.Result;
  }


}