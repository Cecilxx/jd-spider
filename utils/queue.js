module.exports = (() => {
  let self;
  class Queue {
    constructor() {
      self = this;
      self.list = [];
      self.values = [];
      self.index = 0;
      self.resolve = null;
      self.reject = null;
    }
    // 执行下一个任务
    next(value) {
      self.values.push(value);
      if (self.index === self.list.length - 1) {
        self.resolve(self.values);
        return;
      }
      const fn = self.list[++self.index];
      if (typeof fn === 'function') {
        fn(self.next);
      } else {
        self.reject('next执行错误');
      }
    }
    // 添加任务
    add(...fn) {
      self.list.push(...fn);
      return this;
    }
    // 执行第一个任务
    run() {
      return new Promise((resolve, reject) => {
        self.resolve = resolve;
        self.reject = reject;
        const fn = self.list[self.index];
        if (typeof fn === 'function') {
          fn(self.next);
        } else {
          self.reject('run执行报错');
        }
      });
    }
  }
  return Queue;
})();
