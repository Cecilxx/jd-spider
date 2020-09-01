const path = require('path');
const xlsx = require('node-xlsx');

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
    firstSheetData.forEach((item, index) => {
      if (index > 0) {
        const url = item[0] || '';
        const reg = /\d+/;
        const sku = url.match(reg) ? url.match(reg)[0] : '';
        if (sku) {
          skus.push(sku);
        }
      }
      sheetData.push(item);
    });
    console.log('✅ [获取sku数据成功]');
    console.log(`✅ [处理数据为: ${skus.length}条]`);

    return {
      skus,
      sheetData,
    };
  }
}

module.exports = ParseExcel;
