const _ = require('lodash');
const moment = require('moment');
const sql = require('mssql');
const WooCommerceAPI = require("@woocommerce/woocommerce-rest-api").default;
const config = require('./config.json');

Array.prototype.getIndexBy = (name, value) => {
  for (var i = 0; i < this.length; i++) {
    if (this[i][name] == value) {
      return i;
    }
  }
  return -1;
}


module.exports = class K32WP {

  constructor() {
    this.WooCommerce = new WooCommerceAPI(config.woocommerce);
  }

  /**
   * 使用收據單的FID, 獲取ERP 收據單明細
   * @param {string} Fid 
   * @returns {Array} T_AR_RECEIVEBILLENTRY 
   */
  async getRecevibleBillEntry(Fid) {
    await sql.connect(config.mssql.dns);
    const { recordset: result } = await sql.query(`SELECT * FROM [dbo].[T_AR_RECEIVEBILLENTRY] WHERE [FID] = ${Fid}`);
    return result;
  }

  /**
   * 使用銷售出庫單的FID, 獲取ERP 銷售出庫單
   * @param {string} Fid 
   * @returns {Array} T_SAL_OUTSTOCK 
   */
  async getOutStock(Fid) {
    await sql.connect(config.mssql.dns);
    const { recordset: result } = await sql.query(`SELECT * FROM [dbo].[T_SAL_OUTSTOCK] WHERE [FID] = ${Fid}`);
    return result;
  }

  /**
   * 判斷WP的訂單，在ERP是否已經全數支付
   * @param {string} FBILLNO K3Cloud SaleOrder FBILLNO
   * @returns bool
   */
  async isAllPaid(FBILLNO) {
    await sql.connect(config.mssql.dns);

    const { recordset: result } = await sql.query`SELECT * FROM [dbo].[T_AR_RECEIVEBILLENTRY] WHERE [FRECEIVEITEM] = '${FBILLNO}'`;

    const recTotal = _.reduce(result, (prev, curr) => +prev + +curr.FRECAMOUNTFOR_E, 0);

    const { recordset: ARResult } = await sql.query`SELECT SUM(salePlan.[FRECADVANCEAMOUNT]) AS SUM_FRECADVANCEAMOUNT FROM [dbo].[T_SAL_ORDER] as sale LEFT JOIN [T_SAL_ORDERPLAN] as salePlan ON salePlan.[FID]=sale.[FID] WHERE sale.[FBILLNO] = '${FBILLNO}'`;

    const totalAR = _.reduce(ARResult, (prev, curr) => +prev + +curr.SUM_FRECADVANCEAMOUNT, 0);

    return (+recTotal >= +totalAR);
  }

  /**
   * 判斷WP上的貨品是否在ERP 已經全部送貨
   * @param {string} FBILLNO K3Cloud SaleOrder FBILLNO
   * @returns bool
   */
  async isAllOutStock(FBILLNO) {
    await sql.connect(config.mssql.dns);

    const match = /^WPORDER([0-9]+)$/.exec(FBILLNO);
    const orderId = match[1];

    const { data: order } = await this.WooCommerce.get(`orders/${orderId}`);
    const { line_items } = order;

    const { recordset: relOutStock } = await sql.query(`
      SELECT 
        SUM(outstockentry.[FREALQTY]) AS SUM_FREALQTY, outstockentry.[FMATERIALID], material.[FNUMBER] as sku
      FROM [dbo].[T_SAL_OUTSTOCK] as outstock 
      LEFT JOIN [dbo].[T_SAL_OUTSTOCKENTRY] AS 
        outstockentry ON outstockentry.[FID]=outstock.[FID] 
      LEFT JOIN [dbo].[T_BD_MATERIAL] AS
        material ON material.[FMATERIALID]=outstockentry.[FMATERIALID]
      WHERE outstock.[F_PAEZ_TEXT] = '${FBILLNO}' 
      GROUP BY outstockentry.[FMATERIALID], material.[FNUMBER];`);

    let newLineItems = [];
    let orderOutStockItem = [];
    _.each(line_items, (row) => {
      let webSkus = row?.sku.split('+').reduce((prev, curr) => {
        const index = prev.getIndexBy("sku", curr + '');
        if (index > -1) {
          prev[index].qty = +prev[index].qty + 1;
        } else {
          prev.push({
            sku: curr + '',
            qty: 1
          })
        }
        return prev
      }, []);
      let allout = 0;

      _.each(webSkus, (wsku) => {
        const outStock = relOutStock.find((outStockItem) => outStockItem.sku + '' === wsku.sku + '') || { SUM_FREALQTY: 0 };
        if (+outStock?.SUM_FREALQTY >= +wsku?.qty) allout++
      });
      // console.log('allout:', allout);
      // console.log('webSkus.length: ', webSkus.length);
      //if allout >= webSkus length , that mean all out stock
      if (+allout >= webSkus.length) {
        newLineItems.push({
          id: row?.id,
          meta_data: [
            {
              key: '__rpwospp-item-status',
              value: {
                status_data: {
                  label: '已送貨',
                  color: '',
                  note: ''
                },
                time: +moment().format('X')
              }
            }
          ]
        });
        orderOutStockItem.push(row);
      } else {
        newLineItems.push({
          id: row?.id,
          meta_data: [
            {
              key: '__rpwospp-item-status',
              value: {
                status_data: {
                  label: '待送貨',
                  color: '',
                  note: ''
                },
                time: +moment().format('X')
              }
            }
          ]
        });
      }
    });

    return orderOutStockItem.length >= line_items.length;
  }


  /**
   * 變更WP上的訂單的送貨及結帳狀態
   *  @param {string} FBILLNO K3Cloud SaleOrder FBILLNO
   *  @void
   */
  async updateWPOrderStatus(FBILLNO) {
    const _isAllOutStock = await this.isAllOutStock(FBILLNO);
    const _isAllPaid = await this.isAllPaid(FBILLNO);

    //update status for wordpress order
    if (/^WPORDER([0-9]+)$/.test(FBILLNO)) {
      const match = /^WPORDER([0-9]+)$/.exec(FBILLNO);
      const orderId = match[1];
      let updateStatus = {};
      if (!!_isAllOutStock && !!_isAllPaid) {
        updateStatus = { status: 'paid_delivered' }
      } else if (!!_isAllOutStock && !_isAllPaid) {
        updateStatus = { status: 'nonpay_delivered' }
      } else if (!_isAllOutStock && !_isAllPaid) {
        updateStatus = { status: 'nonpay_nondeliver' }
      } else if (!_isAllOutStock && !!_isAllPaid) {
        updateStatus = { status: 'paid_nondeliver' }
      }
      this.WooCommerce.put(`orders/${orderId}`, updateStatus)
        .then((response) => {
          console.log('Woocommerce update status:', response.data);
        }).catch((error) => {
          console.log(error.response.data);
        });
    }
  }

  /**
   * 在WP上的訂單 新增備註
   * @param {string} FBILLNO K3Cloud SaleOrder FBILLNO
   * @param {string} note WP order note content
   * @void 
   */
  addWPOrderNote(FBILLNO, note) {
    if (/^WPORDER([0-9]+)$/.test(FBILLNO)) {
      const match = /^WPORDER([0-9]+)$/.exec(FBILLNO);
      const orderId = match[1];
      this.WooCommerce.post(`orders/${orderId}/notes`, {
        note: note,
        customer_note: true
      }).then((response) => {
        console.log('Woocommerce add note:', response.data);
      }).catch((error) => {
        console.log(error.response.data);
      });
    }

  }

}