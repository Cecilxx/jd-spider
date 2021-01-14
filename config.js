module.exports = {
  // url所在的位置，1为第一列
  urlIndex: 2,
  // 从第几行开始, 1为第一行
  startLine: 2,
  // 导出项放从第几列开始, 1为第一行
  exportIndex: 2,
  // 是否下载轮播图
  downloadMainImg: true,
  // 是否下载详情图
  downloadDetailImg: true,
  // 是否导出excel
  exportExcel: false,
  // resource下文件名称
  resource: 'wyx.xlsx',
  // 每批次处理数
  singleNums: 5,
  // stbSku所在的列, 1为第一列
  stbSkuIndex: 1,
  // 文件夹命名规则, stbSku, jdSku
  imageDirType: 'stbSku',
};
