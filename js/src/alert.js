/*
 * 理解源代码的思路：
 * 1.首先使用简单的示例，能够做到关闭alert提示框
 * 2.整体浏览源代码的结构，做到有个大致的印象，有没有导入其他的模块
 * 3.找到关键的入口，如找到相应click事件的代码，一步步牵出各个子函数的意图
 * 4.以上过程着重理解业务处理流程，不要在语法层面纠缠不清，等彻底明白了整个处理流程后再详细消化不熟悉的语法
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

      this._removeElement(rootElement)
    }

    dispose() {
      $.removeData(this._element, DATA_KEY)
      this._element = null
    }


    // private

    _getRootElement(element) {
      let selector = Util.getSelectorFromElement(element)
      let parent   = false

      if (selector) {
        parent = $(selector)[0]
      }

      if (!parent) {
        parent = $(element).closest(`.${ClassName.ALERT}`)[0]
      }

      return parent
    }

    _triggerCloseEvent(element) {
      let closeEvent = $.Event(Event.CLOSE)

      $(element).trigger(closeEvent)
      return closeEvent
    }

    _removeElement(element) {
      $(element).removeClass(ClassName.IN)

      if (!Util.supportsTransitionEnd() ||
          !$(element).hasClass(ClassName.FADE)) {
        this._destroyElement(element)
        return
      }

      $(element)
        .one(Util.TRANSITION_END, $.proxy(this._destroyElement, this, element))
        .emulateTransitionEnd(TRANSITION_DURATION)
    }

    _destroyElement(element) {
      $(element)
        .detach()
        .trigger(Event.CLOSED)
        .remove()
    }


    // static

    static _jQueryInterface(config) {
      return this.each(function () {
        let $element = $(this)
        let data     = $element.data(DATA_KEY)

        if (!data) {
          data = new Alert(this)
          $element.data(DATA_KEY, data)
        }

        if (config === 'close') {
          data[config](this)
        }
      })
    }

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
   * 监听click事件并处理关闭动作，包含data-miss="alert"属性不需要额外编写js代码既可以实现关闭alert提示框
   * 
   * Event.CLICK_DATA_API: 监听click事件，".bs.alert.data-api"应该是表示命名空间，TODO: 待进一步更新
   * Selector.DISMISS: 表示属性data-miss="alert"的元素响应click事件
   * Alert._handleDismiss为响应处理函数
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
   * NAME: "alert"
   * jQuery.fn == jQuery.prototype返回true，也就是jQuery的原型就是jQuery.fn,目的是为了实现方法的共享
   * jQuery.fn["alert"]就等同于jQuery.prototype.alert,因此jQuery对象就具有了alert方法，如$(".alert").alert("close")
   */
  $.fn[NAME]             = Alert._jQueryInterface
  $.fn[NAME].Constructor = Alert
  $.fn[NAME].noConflict  = function () {
    $.fn[NAME] = JQUERY_NO_CONFLICT
    return Alert._jQueryInterface
  }

  return Alert

})(jQuery)

// by zx: 使用了es6 export语法导出变量Alert
export default Alert
