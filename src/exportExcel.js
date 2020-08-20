const xlsx = require('node-xlsx');
const fs = require('fs');

const reduceTwoDimension = (arr) => {
  return Array.prototype.concat.apply([], arr);
};

class ExportExcel {
  static wyxSheetDataWithPrice(values, wyxSheetData) {
    const result = [];
    const spiderResults = reduceTwoDimension(values);
    wyxSheetData.forEach((sheetItem, index) => {
      if (index > 0) {
        const url = sheetItem[6];
        let sheetSku = '';
        if (url) {
          const reg = /\d+/;
          sheetSku = url.match(reg) ? url.match(reg)[0] : '';
        }
        const target =
          spiderResults.find((item) => item.sku === sheetSku) || {};
        if (target.sku) {
          sheetItem[8] = target.price;
          // sheetItem[10] = target.isSelf ? '京东自营' : '';
          // sheetItem[11] = target.vender;
        }
      }
      result.push(sheetItem);
    });

    return result;
  }

  static exportExcel(data) {
    const buffer = xlsx.build([{ name: 'wyxSheet', data }]);
    fs.writeFile(`./export/wyx.xlsx`, buffer, () => {
      console.log(`🌹 大功告成`);
    });
  }

  static writeFile(data) {
    fs.writeFile(`./export/${+new Date()}`, data, () => {
      console.log(`🌹 写入告成`);
    });
  }
}

module.exports = ExportExcel
