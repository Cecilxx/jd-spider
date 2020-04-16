const xlsx = require('node-xlsx');

const parse = () => {
  console.log('😊 [解析excel]');
  const workSheetsFromFile = xlsx.parse(`${__dirname}/resource/wyx.xlsx`);
  console.log('✅ [解析excel成功]');

  const firstSheet = workSheetsFromFile[0];
  const firstSheetData = firstSheet ? firstSheet.data : [];
  const wyxSkus = [];

  console.log('😊 [获取sku数据]');
  const wyxSheetData = [];

  firstSheetData.forEach((item, index) => {
    if (index > 0) {
      const url = item[6];
      if (url && item[item.length - 1] === '汪怡璇') {
        const reg = /\d+/;
        const sku = url.match(reg) ? url.match(reg)[0] : 'sku错误';
        wyxSkus.push(sku);
        wyxSheetData.push(item);
      }
    } else {
      // item[10] = '是否京东自营';
      // item[11] = '店铺名';
      wyxSheetData.push(item);
    }
  });

  console.log('✅ [获取sku数据成功]');
  console.log(`✅ [wyx处理数据为: ${wyxSkus.length}条]`);

  return {
    wyxSkus,
    wyxSheetData,
  };
};

module.exports = parse;
