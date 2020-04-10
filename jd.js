const skus = require('./sku');
const _ = require('lodash');
const superagent = require('superagent');
const cheerio = require('cheerio');
const jdSkus = skus.jsSku;

const start = () => {
  console.log('😊 [启动]');
  console.log('🚀 [运行中]');
  const spiderJDh5Item = (sku, resolve, reject) => {
    const url = `https://item.m.jd.com/product/${sku}.html`;
    superagent
      .get(url)
      .set(
        'cookie',
        'shshshfpa=0e337f07-f1f9-f663-9993-765cc7a34b1b-1572677090; shshshfpb=mm494o84QVKs85O4pmEhLSg%3D%3D; __jdu=1381573350; areaId=2; PCSYCityID=CN_310000_310100_310113; user-key=7fb3a49a-c58e-4daf-9a2e-c427546b3805; cn=0; unpl=V2_ZzNtbRAHShBwXxNdcktdB2JWEl1LUhAVJlgVXSkaWVUwVBpdclRCFnQUR1FnGFQUZwUZWEtcQRdFCEdkeB5fA2AFEFlBZxVLK14bADlNDEY1WnwHBAJfF3ILQFJ8HlQMZAEUbXJUQyV1CXZUeRBcAWEBEFlDZ3MSRTh2UX8YXQdnMxNtQ2cBQSkOQVV%2bHVVIZwEbXUZRQRdxCXZVSxo%3d; 3AB9D23F7A4B3C9B=M2KAWC56K5UJWMFPTTCBAWHJOWUUMZJT3A7KVMJNJQYZKK3JTY6I6G3GRFOF3VOQ6QHQWRTNEVRK52MRKJDZQJGPUI; __jdv=76161171|google-search|t_262767352_googlesearch|cpc|kwd-362776698237_0_ca844fd88c034d1184b1bab8c24aff91|1586425806501; __jda=122270672.1381573350.1572579804.1586410502.1586425714.20; __jdc=122270672; shshshfp=1d7d32c2dce417196d9a77f628506f74; ipLoc-djd=2-2824-51920-0; shshshsID=fa356e5189da49f7c7aee7c6681f2a3d_14_1586426862140; __jdb=122270672.15.1381573350|20.1586425714'
      )
      .set(
        'user-agent',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.149 Safari/537.36'
      )
      .end((err, res) => {
        if (err) {
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
          result.url = `https://item.jd.com/${sku}.html`;
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

  let time = 1;
  let timer = setInterval(() => {
    console.log(`🚀 [运行时间:${time++}秒]`);
  }, 1000);
  Promise.all(ps)
    .then((values) => {
      console.log('🙆 [成功, 结束]');
      console.log(values);
    })
    .catch((e) => {
      console.log('❌ [失败, 结束]');
      console.error(e);
    })
    .finally(() => {
      clearInterval(timer);
      timer = null;
    });
};

start();
