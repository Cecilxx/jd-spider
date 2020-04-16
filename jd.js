const _ = require('lodash');
const superagent = require('superagent');
const cheerio = require('cheerio');
const getJdSku = require('./getJdSku');
const queue = require('./queue');

console.log('😊 [程序启动]');
console.log('🚗 [运行中]');

const allSkus = getJdSku();
const singleNums = 30;
const groupNums = Math.ceil(allSkus.length / singleNums);
let time = 1;
let timer = null;

const setTimer = () => {
  timer = setInterval(() => {
    console.log(`🚗 [运行时间:${time++}秒]`);
  }, 1000);
};

const clearTimer = () => {
  clearInterval(timer);
  timer = null;
};

setTimer();

const start = (index, next) => {
  const jdSkus = allSkus.slice(index * singleNums, (index + 1) * singleNums);
  console.log(`😊 [第${index + 1}批次处理条数: ${jdSkus.length}]`);
  const spiderJDh5Item = (sku, resolve, reject) => {
    const url = `https://item.m.jd.com/product/${sku}.html`;
    superagent
      .get(url)
      .set(
        'cookie',
        'shshshfpa=0e337f07-f1f9-f663-9993-765cc7a34b1b-1572677090; shshshfpb=mm494o84QVKs85O4pmEhLSg%3D%3D; __jdu=1381573350; areaId=2; PCSYCityID=CN_310000_310100_310113; user-key=7fb3a49a-c58e-4daf-9a2e-c427546b3805; cn=0; unpl=V2_ZzNtbRAHShBwXxNdcktdB2JWEl1LUhAVJlgVXSkaWVUwVBpdclRCFnQUR1FnGFQUZwUZWEtcQRdFCEdkeB5fA2AFEFlBZxVLK14bADlNDEY1WnwHBAJfF3ILQFJ8HlQMZAEUbXJUQyV1CXZUeRBcAWEBEFlDZ3MSRTh2UX8YXQdnMxNtQ2cBQSkOQVV%2bHVVIZwEbXUZRQRdxCXZVSxo%3d; __jdv=76161171|google-search|t_262767352_googlesearch|cpc|kwd-362776698237_0_ca844fd88c034d1184b1bab8c24aff91|1586425806501; ipLoc-djd=2-2824-51920-0; mt_xid=V2_52007VwMQW11cVFgdTRhsUGQGRwBdWwFGT0waVRliBUBQQQsBXUtVSQ4HYwMRVgleVA8ceRpdBmYfE1dBWFNLH0wSWAFsBxViX2hSah9KEV8MZAYTW21YUVkd; __jdc=122270672; 3AB9D23F7A4B3C9B=M2KAWC56K5UJWMFPTTCBAWHJOWUUMZJT3A7KVMJNJQYZKK3JTY6I6G3GRFOF3VOQ6QHQWRTNEVRK52MRKJDZQJGPUI; wxa_level=1; retina=1; webp=1; bsid=92d956ac14c35d959ef1ac22ab00db31; pdtk=GTyDuGQ4bVOQZu2S2Vlrem1qjJUyDAaEumyUYdjFlX%2FNBLmp2LH56l3Aq9gCsP%2Fd; warehistory="100002951018,67070210232,4214138,100002069201,3721579,100012075540,100012058000,1574547754,40906835858,2525384,62861334695,100002115391,100008743188,100002115389,"; wq_logid=1586514916.1435049094; cid=9; wqmnx1=MDEyNjM5OGkudTJ0R1ZseVlONlBNLnRlIDZlLkxlbzNTN0ZkLTJVKSY%3D; __jda=122270672.1381573350.1572579804.1586507511.1586514916.27; __jdb=122270672.1.1381573350|27.1586514916; mba_muid=1381573350; mba_sid=15865149166636965101014317405.1; __wga=1586514917854.1586514917854.1586514917854.1586514917854.1.1; sc_width=1440; autoOpenApp_downCloseDate_auto=1586514918280_21600000; __jd_ref_cls=MDownLoadFloat_AppArouseA1; shshshfp=b059c65bbc86f0b32e85f8210d15d7aa; shshshsID=1c3f5c8dbb4780d8128a5c519d5b7f68_1_1586514918715; visitkey=11945490660773122; PPRD_P=UUID.1381573350-LOGID.1586514917926.217591426; sk_history=100002951018%2C'
      )
      .set(
        'user-agent',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.149 Safari/537.36'
      )
      .end((err, res) => {
        if (err) {
          clearTimer();
          return console.error(err);
        }
        try {
          const $ = cheerio.load(res.text);
          const result = {};
          // 获取价格，商品名
          const buyArea = $('#buyArea');
          const $buyArea = $(buyArea);
          const priceWrap = $buyArea.children('#priceWrap');
          const fnWrap = $buyArea.children('.fn_wrap');
          const price = priceWrap
            .children('#priceBlock')
            .children('#priceSale')
            .text()
            .trim();
          const favWrap = fnWrap.children('#favWrap');
          const itemName = favWrap.children('#itemName');
          const product = itemName.text().trim();

          // 获取供应商信息
          const reg2 = /<script>window\._itemInfo=\((\S*)\);<\/script><script>window\._itemSpecSkus=/;
          const reg3 = /"vender":"(\S*)","linkphone"/;
          const r1 = _.trim(res.text.replace(/\n/g, '').replace(/\s/g, ''));
          const r2 = r1.match(reg2);
          const r3 = r2 && r2[1];
          if (r3) {
            const vender = r3.match(reg3) && r3.match(reg3)[1];
            result.isSelf = r3.indexOf('self_D') > -1;
            result.vender = vender;
          }
          // price也可从obj中取
          result.price = price;
          result.product = product;
          result.sku = sku;
          result.origin = `https://item.jd.com/${sku}.html`;
          result.fetchUrl = url;
          result.date = new Date();
          resolve(result);
        } catch (error) {
          reject({ error, url });
        }
      });
  };
  const ps = jdSkus.map((sku) => {
    return new Promise((resolve, reject) => {
      spiderJDh5Item(sku, resolve, reject);
    });
  });

  return Promise.all(ps)
    .then((values) => {
      console.log(`✅ [第${index + 1}批次处理完成]`);
      next(values);
    })
    .catch((e) => {
      console.log(`❌ [第${index + 1}批次处理失败]`);
      next([]);
    });
};

const asyncQueue = new queue();
const asyncFn = (i) => {
  return (next) => {
    start(i, next);
  };
};
const fns = [...Array(groupNums)].map((item, index) => asyncFn(index));
asyncQueue
  .add(...fns)
  .run()
  .then((values) => {
    console.log('values.length', values.length);
    clearTimer();
  })
  .catch((e) => {
    console.error(e);
    clearTimer();
  });
