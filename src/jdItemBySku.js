const _ = require('lodash');
const superagent = require('superagent');
const cheerio = require('cheerio');
const ParseExcel = require('./parseExcel');
const Download = require('./download');
const Queue = require('../utils/queue');
const ExportExcel = require('./exportExcel');
const path = require('path');
const argv = process.argv;

console.log('😊 [程序启动]');
console.log('🚗 [运行中]');

const { skus: allSkus, sheetData } = ParseExcel.parseExcel('../resource/wyx.xlsx');
const wyxSkus = allSkus.slice(0);
const singleNums = 5;
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

  handleDownloadImge({ images, detailImages, sku  }) {
    const isDownloadImg = this.getTypeByArgv('-img');
    const isDownloadDetailImg = this.getTypeByArgv('-detail');
    const ps = []
    if (isDownloadImg) {
      if (images.length) {
        ps.push(this.dowloadImage(images, sku, '主图'))
      } else {
        ps.push(Promise.reject(`sku: ${sku} 主图链接获取失败`))
      }
    } else {
      ps.push(Promise.reject(`sku: ${sku} 无需下载主图`))
    }
    if (isDownloadDetailImg) {
      if (detailImages.length) {
        ps.push(this.dowloadImage(detailImages, sku, '详图'))
      } else {
        ps.push(Promise.reject(`sku: ${sku} 详图链接获取失败`))
      }
    } else {
      ps.push(Promise.reject(`sku: ${sku} 无需下载详图`))
    }

    Promise.all(ps).then(() => {
      console.log('sku: %s 全部下载完成', sku);
      // Download.zip(sku)
    }).catch((e) => {
      console.log(`[error] ${e}`)
    })
    // Download.zip('6810863')
  }

  dowloadImage(images, sku, type) {
    return Download.dowloadImg(images, sku, type).then(() => {
      if (type === '主图') {
        console.log('sku: %s 主图下载完毕', sku);
      }
      if (type === '详图') {
        console.log('sku:%s 详图下载完毕', sku);
      }
    }).catch(err => {
      console.log(err)
    });
  }

  getDetailImages(sku, urlType = 'pc') {
    const pcDetailUrl = `https://wqsitem.jd.com/detail/${urlType === 'pc' ? '0' : `${sku}`}_d${sku}_normal.html`;
    return new Promise((resolve, reject) => {
      superagent
        .get(pcDetailUrl)
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
          const reg = /background-image:url\((\S*)\)[;]?/g;
          const reg2 = /background-image:url\((\S*)\)[;]?/;
          const reg3 = /src=\\"(\S*)\\">/g
          const reg4 = /src=\\"(\S*)\\">/
          const reg5 = /^http[s]?:/
          const bgImages = res.text.match(reg);
          const srcImages = res.text.match(reg3);
          const detailImages = [];
          function getResultImages (images, reg) {
            images.map((bg) => {
              let url = bg.match(reg) ? bg.match(reg)[1] : '';
              if (url) {
                if (!reg5.test(url)) {
                  url = `https:${url}`
                }
                detailImages.push(url);
              }
            });
          }
          getResultImages(bgImages || srcImages || [], bgImages ? reg2 : reg4);
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
          this.clearTimer();
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
          let detailImages = await this.getDetailImages(sku);
          if (!detailImages.length) {
            detailImages = await this.getDetailImages(sku, 'h5')
          }
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
          this.handleDownloadImge({ images, detailImages, sku });
        } catch (error) {
          reject({ error, url });
        }
      });
  }

  spider(index, next) {
    const jdSkus = wyxSkus.slice(index * singleNums, (index + 1) * singleNums);
    const ps = jdSkus.map((sku) => {
      return new Promise((resolve, reject) => {
        this.spiderItem(sku, resolve, reject);
      });
    });

    const process = `第${index + 1}/${groupNums}`
    console.log(`😊 [${process}批处理条数: ${jdSkus.length}]`);

    return Promise.all(ps)
      .then((values) => {
        console.log(`✅ [${process}批爬虫完成]`);
        next(values);
      })
      .catch((e) => {
        console.log(`❌ [${process}批爬虫失败]`);
        console.log(e)
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
        // ExportExcel.wyxSheetDataWithPrice(values, sheetData)
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
