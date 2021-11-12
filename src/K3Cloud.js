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
    console.log(this.config)
    const { accid, username = "Administrator", appid, appsecret } = this.config;
    const parameters = [accid, username, appid, appsecret, 2052];
    const { headers, data } = await this.instance.post(apiPath.apiPath, { parameters })
    const { IsSuccessByAPI } = data;
    if (!IsSuccessByAPI) return null
    if (IsSuccessByAPI) {
      const cookie = headers['set-cookie'] || []
      return cookie.join(';')
    }
  }



}