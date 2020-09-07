const xlsx = require('node-xlsx');
const fs = require('fs');
const Config = require('../config')

const reduceTwoDimension = (arr) => {
  return Array.prototype.concat.apply([], arr);
};

class ExportExcel {
  static wyxSheetDataWithPrice(values, sheetData) {
    const result = [];
    const spiderResults = reduceTwoDimension(values);
    sheetData.forEach((sheetItem, index) => {
      if (index > Config.startLine) {
        const url = sheetItem[Config.urlIndex] || '';
        let sheetSku = '';
        const reg = /\d+/;
        sheetSku = url.match(reg) ? url.match(reg)[0] : '';

        const target =
          spiderResults.find((item) => item.sku === sheetSku) || {};
        if (target.sku) {
          sheetItem[2] = target.product;
          sheetItem[3] = target.price;
          sheetItem[4] = target.vender;
          sheetItem[5] = target.isSelf ? '京东自营' : '第三方';
          // sheetItem[6] = url;
        }
      }
      result.push(sheetItem);
    });

    ExportExcel.exportExcel(result);
  }

  static exportExcel(data) {
    const buffer = xlsx.build([{ name: 'wyxSheet', data }]);
    fs.writeFile(`./export/${+new Date()}.xlsx`, buffer, () => {
      console.log(`🌹 大功告成`);
    });
  }

  static writeFile(data) {
    fs.writeFile(`./export/${+new Date()}`, data, () => {
      console.log(`🌹 写入告成`);
    });
  }
}

module.exports = ExportExcel;
