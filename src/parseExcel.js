const path = require('path');
const xlsx = require('node-xlsx');
const Config = require('../config');

class ParseExcel {
  static parseExcel(resource) {
    console.log('😊 [解析excel]');
    const resourcePath = path.join(__dirname, resource);
    const workSheetsFromFile = xlsx.parse(resourcePath);
    console.log('✅ [解析excel成功]');

    console.log('😊 [获取sku数据]');
    const firstSheet = workSheetsFromFile[0];
    const firstSheetData = firstSheet ? firstSheet.data : [];
    const skus = [];
    const sheetData = [];
    const stbSkus = [];
    firstSheetData.forEach((item, index) => {
      if (index >= Config.startLine - 1) {
        const url = item[Config.urlIndex - 1] || '';
        const stbSku = item[Config.stbSkuIndex - 1] || '';
        const reg = /\d+/;
        const sku = url.match(reg) ? url.match(reg)[0] : '';
        if (sku) {
          skus.push(sku);
          stbSkus.push(stbSku);
        }
      }
      sheetData.push(item);
    });
    console.log('✅ [获取sku数据成功]');
    console.log(`✅ [处理数据为: ${skus.length}条]`);
    return {
      skus,
      sheetData,
      stbSkus,
    };
  }
}

module.exports = ParseExcel;
