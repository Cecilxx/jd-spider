const fetch = require('node-fetch');
const Queue = require('../utils/queue');
const path = require('path');
const xlsx = require('node-xlsx');
const fs = require('fs');
const colors = require('colors');
const argv = process.argv;
const {
  citys_A,
  citys_B,
  citys_C,
  citys_D,
  citys_E,
  citys_F,
  citys_G,
  citys_H,
  citys_J,
  citys_K,
  citys_L,
  citys_M,
  citys_N,
  citys_P,
  citys_Q,
  citys_R,
  citys_S,
  citys_T,
  citys_W,
  citys_X,
  citys_Y,
  citys_Z,
} = require('./city');

const CITYS = {
  A: citys_A,
  B: citys_B,
  C: citys_C,
  D: citys_D,
  E: citys_E,
  F: citys_F,
  G: citys_G,
  H: citys_H,
  J: citys_J,
  K: citys_K,
  L: citys_L,
  M: citys_M,
  N: citys_N,
  P: citys_P,
  Q: citys_Q,
  R: citys_R,
  S: citys_S,
  T: citys_T,
  W: citys_W,
  X: citys_X,
  Y: citys_Y,
  Z: citys_Z,
};

const delay = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, 2000);
  });
};

class SKSpider {
  constructor(citys, cityType) {
    this.result = [];
    this.citys = citys;
    this.cityType = cityType;
    this.PAGE_SIZE = 1000;
    this.PAGE_INDEX = 1;
  }

  async request(cityName, next) {
    await delay();
    const url =
      'https://sjz.ihotels.cc/ethank-sjz-web/rest/hotelResource/v2.5/queryHotelList';
    const body = {
      // brandNameList: [],
      // activityNameList: [],
      // serviceNameList: [],
      // distance: '',
      // commentLeave: '',
      beginDate: '2021-11-12',
      endDate: '2021-11-13',
      cityName: cityName || '上海',
      // areaList: [],
      // keyword: '',
      openType: '1',
      pageIndex: this.PAGE_INDEX++,
      pageSize: this.PAGE_SIZE,
      // sortOpt: '',
      // sortType: '',
      lat: 31.125005712939302,
      lon: 121.36050096583894,
      // memberId: '',
      price: '0-*',
      // landmarkId: [],
      // memberLevel: '',
      // memberCardLevel: '',
      channel: 17,
      deviceType: '',
      tagVersion: '5.0.0',
      deviceName: '',
      code: '',
      token: '',
    };
    console.log(
      `---当前请求参数 ${body.cityName} ${body.pageIndex} ${body.pageSize}`
        .yellow
    );
    let hotelList = [];
    try {
      const response = await fetch(url, {
        method: 'post',
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' },
      });
      const json = await response.json();
      const retValue = (json && json.retValue) || null;

      if (retValue && retValue.hotelList) {
        hotelList = retValue.hotelList;
      }
      console.log(`---当前请求结果 ${hotelList.length || 0}`.green);
      console.log(`---当前请求结果Code ${json.retCode}`.red);
      // 添加结果
      if (!this.result[body.cityName]) {
        this.result[body.cityName] = [];
      }
      this.result[body.cityName] = this.result[body.cityName].concat(hotelList);
      // 最后一页 返回所有结果
      if (hotelList && hotelList.length < this.PAGE_SIZE) {
        next();
        return;
      }
      await this.request(cityName, next);
    } catch (error) {
      console.log(';errr', error);
      // 添加结果
      if (!this.result[body.cityName]) {
        this.result[body.cityName] = [];
      }
      this.result[body.cityName] = this.result[body.cityName].concat(hotelList);
      next();
    }
  }

  exportExcel(result) {
    const bufferData = [];
    Object.keys(result).forEach((cityName) => {
      const sheetTitle = [
        '酒店',
        '品牌',
        '城市',
        '商圈/行政区',
        '装修时间',
        '开业时间',
        '评论数',
        '评分',
      ];
      const sheetData = [sheetTitle];
      const currentResult = result[cityName];
      currentResult.forEach((hotelInfo) => {
        const data = [];
        const areas =
          (hotelInfo.areaName && hotelInfo.areaName.split('-')) || [];
        data[0] = hotelInfo.hotelName;
        data[1] = hotelInfo.brandName;
        data[2] = areas[1];
        data[3] = areas[2];
        data[4] = '';
        data[5] = hotelInfo.startDate;
        data[6] = hotelInfo.commentCount;
        data[7] = hotelInfo.score;
        sheetData.push([...data]);
      });

      bufferData.push({
        name: cityName,
        data: sheetData,
      });
    });

    const buffer = xlsx.build(bufferData);

    fs.writeFile(`./export/${this.cityType}.xlsx`, buffer, () => {
      console.log(`🌹 大功告成`);
    });
  }

  asyncQueue() {
    return new Queue();
  }

  asyncFn(cityName) {
    return (next) => {
      this.PAGE_INDEX = 1;
      this.request(cityName, next);
    };
  }

  async addQueue() {
    const fns = this.citys.map((cityName) => this.asyncFn(cityName));
    await this.asyncQueue()
      .add(...fns)
      .run();
  }

  async start() {
    console.log('【爬虫开始】'.green);
    console.log('【抓取中】'.green);
    await this.addQueue();
    console.log('【数据获取完成】'.green);
    Object.keys(this.result).forEach((key) => {
      console.log(`---${key}，${this.result[key].length}条数据`);
    });
    this.exportExcel(this.result);
  }
}

const init = async () => {
  const result = {};
  let cityNum = 0;
  let hotelNum = 0;
  for (const key in CITYS) {
    if (Object.hasOwnProperty.call(CITYS, key)) {
      const element = CITYS[key];
      const skSpider = new SKSpider(element, key);
      await skSpider.start();
      result[key] = skSpider.result;
    }
  }
  Object.keys(result).forEach((key) => {
    // { shanghai: hotel[] }
    const cur = result[key];
    Object.keys(cur).forEach((item) => {
      const values = cur[item];
      cityNum = cityNum + 1;
      hotelNum = hotelNum + values.length;
    });
  });
  console.log('cityNum', cityNum);
  console.log('hotelNum', hotelNum);
};

init();
