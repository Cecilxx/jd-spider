# jd-spider
爬取京东商品详情页信息：价格，主图，详情图，店铺信息等

## 启动方式

```
npm run jd
```
or
```
npm run jdImg
```

## 需要的数据
1. 将需要爬取的详情页的链接保存在excel中，并放在resource目录下
2. 更改parseExcel.js中的解析的文件为resouce下文件路径
3. excel建议用resouce中的模版，若不一致，则需要修改相关代码

## 导出项
1. 商品名称
2. 价格
3. 店铺名称
4. 是否为自营
5. 链接

## 图片下载
1. img_开头为主图（轮播图）
2. detail_开头为详情图
3. 按sku建立文件夹
