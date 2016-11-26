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
1. ($ == jQuery)jQuery表示的是什么哪？
jQuery本身就是一个函数，该函数的作用是选择DOM元素，因此jQuery的核心思想就是匹配
元素并对其进行操作。

2. $.fn == $.prototype, 为什么要有fn？
prototype表示原型，拼写过长，jQuery的插件扩展都是基于原型的，因为原型上的方法
及数据对于所有的对应实例都是共享的，而且处于封装性的考虑，原型拼写对用户应该隐藏，应
提供更友好的接口。增加fn方法主要是拼写方便，对用户隐藏了原型拼写，扩展方法直接使用
如下类似的代码：
```
$.fn.xx = function(){}
```

3. $.fn.init又是做什么用途的？
jQuery本身就是一个函数，调用jQuery函数返回的是jQuery对象，jQuery对象实际上就是
$.fn.init这个构造函数的实例（new操作符），
接着可能还会有疑问为什么不返回jQuery的实例哪？ 
答：如果直接返回jQuery的实例会出现循环调用而出现死循环，因此必须借用别的构
造函数来返回实例。
那为什么是$.fn.init这个构造函数哪？ 
答：$和jQuery是仅有的暴露给全局环境的变量，直接从jQuery中引出构造函数会减少不必要
的变量暴露，另外$.fn实际就是jQuery的原型对象，因此直接增加一个init构造函数来表示
jQuery对象的构造函数非常合适。

4. $.fn.init.prototype == $.prototype为什么？
调用jQuery方法返回的实际上是$.fn.init构造函数的实例对象，将jQuery的原型即
jQuery.prototype赋值给$.fn.init.prototype，这样就可以将jQuery的原型方法
和jQuery对象共享，jQuery对象（$.fn.init的实例）就可以访问jQuery原型的所有方法了。

5. 为什么$可以直接调用原型的方法，比如$.each方法，不应该是实例才能调用原型的方法吗？
以each方法为例，该方法继续jQuery.extend方法进行扩展，因此jQuery.each实际上属于
jQuery函数对象的方法，因此可以直接调用；另外jQuery源码中有如下语句：
```
jQuery.extend = jQuery.fn.extend = function() {}
```
可见jQuery的原型扩展方法和jQuery本身扩展方法都指向同一个函数，$.fn.extend用于扩展
原型属性和方法，$.extend用于本身属性和方法的扩展。

## * alert组件demo

## * carsouel轮播组件demo

## * scrollspy滚动监听组件demo

## * SCSS预处理器主要功能
1. 变量：以$符号定义变量。
2. 嵌套：注意过多层次嵌套不是最佳实践。
3. 子文件：以_开头的scss文件被认为是scss的子文件，需要由另外的文件使用@import命令导入，不会转化为css文件。
4. @import: 传统的css使用@import命令会导致额外的http请求，scss预处理器会事先整个文件而不会产生额外的http请求。
5. mixin: @maxin命令创建mixin，使用@include调用定义的mixin。
6. 扩展和继承：使用@extend命令继承共享的样式。
7. 操作符：使用+ - * / %等运算法进行基本的数学运算

