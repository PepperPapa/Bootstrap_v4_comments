/*
 * 理解源代码的思路：
 * 1.首先使用简单的示例，能够做到关闭alert提示框
 * 2.整体浏览源代码的结构，做到有个大致的印象，有没有导入其他的模块
 * 3.找到关键的入口，如找到相应click事件的代码，一步步牵出各个子函数的意图
 * 4.以上过程着重理解业务处理流程，不要在语法层面纠缠不清，等彻底明白了整个处理流程后再详细消化不熟悉的语法
 * 5.一时无法理解的内容，可以暂时放一放，知识可能储备还不够，一段时间再回头去看说不定很快就能理解了
 */

/* by zx: 
使用了es6的import语法
*/
import Util from './util'


/**
 * --------------------------------------------------------------------------
 * Bootstrap (v4.0.0-alpha.5): alert.js
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * --------------------------------------------------------------------------
 */

/* by zx:
使用了es6的箭头函数，const局部作用域变量定义
Alert整体的定义形式如下：
const Alert = (($) => {...})(jQuery)

($) => {...}等价于:
function($) {
...
}
*/
const Alert = (($) => {


  /**
   * ------------------------------------------------------------------------
   * Constants
   * ------------------------------------------------------------------------
   */

  const NAME                = 'alert'
  const VERSION             = '4.0.0-alpha.5'
  const DATA_KEY            = 'bs.alert'
  const EVENT_KEY           = `.${DATA_KEY}`
  const DATA_API_KEY        = '.data-api'
  const JQUERY_NO_CONFLICT  = $.fn[NAME]
  const TRANSITION_DURATION = 150

  const Selector = {
    DISMISS : '[data-dismiss="alert"]'
  }

  const Event = {
    // by zx: close.bs.alert
    CLOSE          : `close${EVENT_KEY}`,
    // by zx: closed.bs.alert
    CLOSED         : `closed${EVENT_KEY}`,
    // by zx: click.bs.alert.data-api
    CLICK_DATA_API : `click${EVENT_KEY}${DATA_API_KEY}`   
  }

  const ClassName = {
    ALERT : 'alert',
    FADE  : 'fade',
    IN    : 'in'
  }


  /**
   * ------------------------------------------------------------------------
   * Class Definition
   * ------------------------------------------------------------------------
   */

  class Alert {

    // by zx: new操作符会自动执行该方法
    constructor(element) {
      this._element = element
    }


    // getters
    // by zx: static get是什么语法？
    static get VERSION() {
      return VERSION
    }


    // public

    close(element) {
      /* by zx:
       * 关闭alert提示框方法
       */
      element = element || this._element

      // by zx: 从data-miss="alert"的元素开始找到alert提示框的根元素
      let rootElement = this._getRootElement(element)
      let customEvent = this._triggerCloseEvent(rootElement)

      if (customEvent.isDefaultPrevented()) {
        return
      }

      // by zx: remove rootElement级class=alert的父级元素
      this._removeElement(rootElement)
    }

    dispose() {
      // by zx: remove class=alert元素的data-bs.alert属性，该操作不会导致alert元素消失
      $.removeData(this._element, DATA_KEY)
      this._element = null
    }


    // private
    // by zx: 目的是找到class=alert的父元素，返回的是jquery对象，当前元素是包含data-miss="alert"的button元素
    _getRootElement(element) {
      // 尝试通过data-target或href获取父元素，无数据返回null
      let selector = Util.getSelectorFromElement(element)
      let parent   = false

      if (selector) {
        parent = $(selector)[0]
      }

      if (!parent) {
        // by zx: 如果selector未成功找到父元素，直接查找最近的class="alert"的元素
        // .closest为jquery对象方法，向祖先元素查找最近匹配的元素
        parent = $(element).closest(`.${ClassName.ALERT}`)[0]
      }

      return parent
    }

    /* by zx: 
     * --- 触发自定义事件close.bs.alert ---
     */
    _triggerCloseEvent(element) {
      // $.Event为jQuery函数对象，非原型方法，创建自定义事件对象
      let closeEvent = $.Event(Event.CLOSE)

      // 触发close.bs.alert事件
      $(element).trigger(closeEvent)
      return closeEvent
    }

    _removeElement(element) {
      $(element).removeClass(ClassName.IN)

      // element不包含fade类名或者不支持transition特性，直接去除element
      if (!Util.supportsTransitionEnd() ||
          !$(element).hasClass(ClassName.FADE)) {
        this._destroyElement(element)
        return
      }

      /* bsTransitionEnd事件，目的是增加关闭dom元素的过渡效果
       * emulateTransitionend方法在Util.js中定义
       * $.proxy的目的是使this._destroyelement方法中的this始终指向当前的dom元素
       */      
      $(element)
        .one(Util.TRANSITION_END, $.proxy(this._destroyElement, this, element))
        .emulateTransitionEnd(TRANSITION_DURATION)
    }

    /* by zx:
     * detach方法将dom元素脱离文档流，但是保留jQuery对象数据
     * trigger方法目的是在dom元素脱离文档流后触发closed.bs.alert事件，以供客户使用
     * **** TODO: Event.CLOSED就是字符串，这个事件是如何注册的？****
     * remove方法将dom脱离文档刘，不保存jQuery对象数据
     */
    _destroyElement(element) {
      $(element)
        .detach()
        .trigger(Event.CLOSED)
        .remove()
    }

    /* by zx:
     * static 关键字用来定义类的静态方法。静态方法是指那些不需要对类进行实例化，使用类名就可以直接访问的方法，需要注意的是静态方法不能被实例化的对象调用。静态方法经常用来作为工具函数。
     */
    // static

    static _jQueryInterface(config) {
      // this.each中的this指向jQuery对象
      return this.each(function () {
        // 这里的this指向dom元素
        let $element = $(this)
        // DATA_KEY: "bs.alert"
        // .data方法为jQuery原型方法，读取当前元素的key="bs.alert"的数据
        let data     = $element.data(DATA_KEY)

        if (!data) {
          data = new Alert(this)
          // 相当于设置该dom元素的data-bs.alert属性为data
          $element.data(DATA_KEY, data)
        }

        if (config === 'close') {
          // data为Alert的实例，这里调用close方法
          data[config](this)
        }
      })
    }

    // by zx: 静态方法可以直接通过类名调用，本质为构造函数的方法，而不是原型的方法
    static _handleDismiss(alertInstance) {
      return function (event) {
        if (event) {
          event.preventDefault()
        }
        
        alertInstance.close(this)
      }
    }

  }


  /**
   * ------------------------------------------------------------------------
   * Data Api implementation
   * ------------------------------------------------------------------------
   */

  /* by zx:
   * --- 监听click事件并处理关闭动作，包含data-miss="alert"属性不需要额外编写js代码既可以实现关闭alert提示框 ---
   * 
   * Event.CLICK_DATA_API: 监听click事件，".bs.alert.data-api"应该是表示命名空间，TODO: 待进一步更新
   * Selector.DISMISS: 表示属性data-miss="alert"的元素响应click事件
   * Alert._handleDismiss为响应处理函数,为静态方法，可以直接使用类名进行调用
   */
  $(document).on(
    Event.CLICK_DATA_API,
    Selector.DISMISS,
    Alert._handleDismiss(new Alert())
  )


  /**
   * ------------------------------------------------------------------------
   * jQuery
   * ------------------------------------------------------------------------
   */

  /* by zx:
   * --- jQuery原型扩展：增加alert方法，jQuery对象可以访问该 ---
   * NAME: "alert"
   * jQuery.fn == jQuery.prototype返回true，也就是jQuery的原型就是jQuery.fn,目的是为了实现方法的共享
   * jQuery.fn["alert"]就等同于jQuery.prototype.alert,因此jQuery对象就具有了alert方法，如$(".alert").alert("close")
   */
  $.fn[NAME]             = Alert._jQueryInterface
  $.fn[NAME].Constructor = Alert  
  
  /* by zx:
   * --- noConflict的方法的目的是释放可能冲突的变量，这里是释放$.fn.alert变量 ---
   * 实现的原理是将局部变量JQUERY_NO_CONFLICT赋值给$.fn[NAME]，立即执行函数执行结束后，$.fn.alert就被释放了
   * 但是noConflict函数的返回值仍然可以正常使用
   */
  $.fn[NAME].noConflict  = function () {
    $.fn[NAME] = JQUERY_NO_CONFLICT
    return Alert._jQueryInterface
  }

  return Alert

})(jQuery)

// by zx: 使用了es6 export语法导出变量Alert
export default Alert
