const xlsx = require('node-xlsx');

const getJdSku = () => {
  // Parse a file
  console.log('😊 [读取excel中sku数据]');
  const workSheetsFromFile = xlsx.parse(`${__dirname}/resource/wyx.xlsx`);
  const firstSheet = workSheetsFromFile[0];
  const firstSheetData = firstSheet ? firstSheet.data : [];

  firstSheetData.shift();

  const skus = [];

  firstSheetData.forEach((item, index) => {
    const url = item[6];
    if (url && item[item.length - 1] === '汪怡璇') {
      const reg = /\d+/;
      const sku = url.match(reg) ? url.match(reg)[0] : 'sku错误';
      skus.push(sku);
    }
  });

  console.log('✅ [读取sku数据成功]');
  console.log(`✅ [wyx处理数据为: ${skus.length}条]`);

  return skus;
};

module.exports = getJdSku;
