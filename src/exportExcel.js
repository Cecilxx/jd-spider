const xlsx = require('node-xlsx');
const fs = require('fs');
let id = 0;

module.exports = (data) => {
  const buffer = xlsx.build([{ name: 'wyxSheet', data }]);

  fs.writeFile(`./export/wyx_${id}.xlsx`, buffer, () => {
    console.log(`🌹 大功告成: wyx_${id}.xlsx`);
  });
};
