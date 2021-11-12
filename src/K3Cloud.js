const axios = require('axios');
const apiPath = require('./k3ApiPath');

module.exports = class k3Cloud {

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



}