const xlsx = require('node-xlsx');
const fs = require('fs');

const reduceTwoDimension = (arr) => {
  return Array.prototype.concat.apply([], arr);
};

class ExportExcel {
  static wyxSheetDataWithPrice(values, sheetData) {
    const result = [];
    const spiderResults = reduceTwoDimension(values);
    sheetData.forEach((sheetItem, index) => {
      if (index > 0) {
        const url = sheetItem[0] || '';
        let sheetSku = '';
        const reg = /\d+/;
        sheetSku = url.match(reg) ? url.match(reg)[0] : '';

        const target =
          spiderResults.find((item) => item.sku === sheetSku) || {};
        if (target.sku) {
          sheetItem[0] = target.product;
          sheetItem[1] = target.price;
          sheetItem[2] = target.vender;
          sheetItem[3] = target.isSelf ? '京东自营' : '第三方';
          sheetItem[4] = target.origin;
          // sheetItem[10] = target.isSelf ? '京东自营' : '';
          // sheetItem[11] = target.vender;
        }
      } else {
        sheetItem[0] = '商品名称';
        sheetItem[1] = '商品价格';
        sheetItem[2] = '店铺名称';
        sheetItem[3] = '是否自营';
        sheetItem[4] = '链接';
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
