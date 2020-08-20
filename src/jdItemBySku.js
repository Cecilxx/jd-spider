const _ = require('lodash');
const superagent = require('superagent');
const cheerio = require('cheerio');
const ParseExcel = require('./parseExcel');
const Download = require('./download');
const Queue = require('../utils/queue');
const ExportExcel = require('./exportExcel');
const argv = process.argv;

console.log('😊 [程序启动]');
console.log('🚗 [运行中]');

const { skus: allSkus } = ParseExcel.parseExcel('../resource/wyx.xlsx');
const wyxSkus = allSkus.slice(0, 1);
const singleNums = 50;
const groupNums = Math.ceil(wyxSkus.length / singleNums);

class JDSpider {
  constructor() {
    this.time = 1;
    this.timer = null;
  }

  setTimer = () => {
    this.timer = setInterval(() => {
      console.log(`🚗 [运行时间:${time++}秒]`);
    }, 1000);
  };

  clearTimer() {
    clearInterval(this.timer);
    this.timer = null;
  }

  getTypeByArgv(type) {
    return argv.includes(type);
  }

  dowloadImage(images, sku, type) {
    Download.dowloadImg(images, sku, type).then(() => {
      if (type === 'img') {
        console.log('sku: %s 主图全部下载完毕', sku);
      }
      if (type === 'detail') {
        console.log('sku:%s 详图全部下载完毕', sku);
      }
    });
  }

  getDetailImages(sku) {
    const detailUrl = `https://wqsitem.jd.com/detail/${sku}_d${100007792425}_normal.html`;
    return new Promise((resolve, reject) => {
      superagent
        .get(detailUrl)
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
            reject(err);
          }
          const reg = /background-image:url\((\S*)\);/g;
          const reg2 = /background-image:url\((\S*)\);/;
          const bgImages = res.text.match(reg) || [];
          const detailImages = [];
          bgImages.forEach((bg) => {
            const bgUrl = bg.match(reg2) ? `https:${bg.match(reg2)[1]}` : '';
            if (bgUrl) {
              detailImages.push(bgUrl);
            }
          });
          resolve(detailImages);
        });
    });
  }

  getMainImageUrls(res) {
    const reg2 = /<script>window\._itemOnly=\((\S*)\);window\._isLogin=/;
    const r1 = _.trim(res.text.replace(/\n/g, '').replace(/\s/g, ''));
    const r2 = r1.match(reg2);
    const r3 = r2 && r2[1];
    const imgaeDomain = 'https://m.360buyimg.com/mobilecms/s1125x1125_jfs';
    const images = [];
    if (r3) {
      const itemOnly = JSON.parse(r3);
      const { item } = itemOnly;
      if (item.image && item.image.length) {
        item.image.forEach((img) => {
          const imgArr = img.split('/');
          imgArr.shift();
          images.push(`${imgaeDomain}/${imgArr.join('/')}`);
        });
      }
    }

    return images;
  }

  getVender(res) {
    const reg2 = /<script>window\._itemInfo=\((\S*)\);<\/script><script>window\._itemSpecSkus=/;
    const reg3 = /"vender":"(\S*)","linkphone"/;
    const r1 = _.trim(res.text.replace(/\n/g, '').replace(/\s/g, ''));
    const r2 = r1.match(reg2);
    const r3 = r2 && r2[1];
    let isSelf = false;
    let vender = '';
    if (r3) {
      vender = r3.match(reg3) && r3.match(reg3)[1];
      isSelf = r3.indexOf('self_D') > -1;
    }

    return {
      vender,
      isSelf,
    };
  }

  getProduct(res) {
    const $ = cheerio.load(res.text);
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

    return {
      product,
      price,
    };
  }

  spiderItem(sku, resolve, reject) {
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
      .end(async (err, res) => {
        if (err) {
          clearTimer();
          return console.error(err);
        }
        try {
          // 获取价格，商品名
          const { product, price } = this.getProduct(res);
          // 获取供应商信息
          const { vender, isSelf } = this.getVender(res);
          // 获取主图链接
          const images = this.getMainImageUrls(res, sku);
          // 获取详情图链接
          const detailImages = await this.getDetailImages(sku);
          // 结果
          const result = {
            price,
            product,
            sku,
            vender,
            isSelf,
            images,
            detailImages,
            origin: `https://item.jd.com/${sku}.html`,
            fetchUrl: url,
            date: new Date(),
          };
          resolve(result);
          // 下载主图
          const isDownloadImg = this.getTypeByArgv('-img');
          if (isDownloadImg && images.length) {
            this.dowloadImage(images, sku, 'img');
          }
          // 下载详情图
          const isDownloadDetailImg = this.getTypeByArgv('-detail');
          if (isDownloadDetailImg && detailImages.length) {
            this.dowloadImage(detailImages, sku, 'detail');
          }
        } catch (error) {
          reject({ error, url });
        }
      });
  }

  spider(index, next) {
    const jdSkus = wyxSkus.slice(index * singleNums, (index + 1) * singleNums);
    console.log(`😊 [第${index + 1}批处理条数: ${jdSkus.length}]`);
    const ps = jdSkus.map((sku) => {
      return new Promise((resolve, reject) => {
        this.spiderItem(sku, resolve, reject);
      });
    });

    return Promise.all(ps)
      .then((values) => {
        console.log(`✅ [第${index + 1}批爬虫完成]`);
        next(values);
      })
      .catch((e) => {
        console.log(`❌ [第${index + 1}批爬虫失败]`);
        next([]);
      });
  }

  asyncQueue() {
    return new Queue();
  }

  asyncFn(i) {
    return (next) => this.spider(i, next);
  }

  addQueue() {
    const fns = [...Array(groupNums)].map((item, index) => this.asyncFn(index));
    this.asyncQueue()
      .add(...fns)
      .run()
      .then((values) => {
        // 所有批次爬虫的最终结果
        this.clearTimer();
      })
      .catch((e) => {
        this.clearTimer();
        console.log(e);
      });
  }

  start() {
    this.addQueue();
  }
}

const jsSpider = new JDSpider();
jsSpider.start();
