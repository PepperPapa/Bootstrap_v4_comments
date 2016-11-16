# Boostrap v4 学习记录
> 主要包括在源码中添加注释，增加理解的简单练习示例

## * 源码目录结构
```
bootstrap/
├── dist/
│   ├── css/ --编译整合后的scss文件，可用于产品开发
│   └── js/  --编译整合后的js文件，可用于产品开发
├── js/
│   ├── dist/  --针对src对应的es6语法的js文件转换为对应的es5文件
│   └── src/   --针对组件开发的源js文件，使用了es6语法
└── scss/  --scss源码文件
```

## * jQuery FAQ
1. $ == jQuery, jQuery表示的是什么哪？

2. $.fn == $.prototype, 为什么要有fn？
prototype表示原型，拼写过长，jQuery的插件扩展都是基于原型的，
而且属于高级特性，对用户应该隐藏。增加fn方法主要是拼写方便，对用户隐藏了原型拼写，
扩展方法直接使用如下类似的代码：
```
$.fn.xx = function(){}
```

3. $.fn.init又是做什么用途的？
