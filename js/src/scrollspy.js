import Util from './util'


/**
 * --------------------------------------------------------------------------
 * Bootstrap (v4.0.0-alpha.5): scrollspy.js
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * --------------------------------------------------------------------------
 */

const ScrollSpy = (($) => {


  /**
   * ------------------------------------------------------------------------
   * Constants
   * ------------------------------------------------------------------------
   */

  const NAME               = 'scrollspy'
  const VERSION            = '4.0.0-alpha.5'
  const DATA_KEY           = 'bs.scrollspy'
  const EVENT_KEY          = `.${DATA_KEY}`
  const DATA_API_KEY       = '.data-api'
  // 此时$.fn[scrollspy]还未定义，因此为undefined
  const JQUERY_NO_CONFLICT = $.fn[NAME]

  const Default = {
    offset : 10,
    method : 'auto',
    target : ''
  }

  // 分别对应Default对象属性的类型，用于类型检查
  const DefaultType = {
    offset : 'number',
    method : 'string',
    target : '(string|element)'
  }

  // .bs.scrollspy表示命名空间，避免冲突
  const Event = {
    ACTIVATE      : `activate${EVENT_KEY}`,  //activate.bs.scrollspy
    SCROLL        : `scroll${EVENT_KEY}`,  // scroll.bs.scrollspy
    LOAD_DATA_API : `load${EVENT_KEY}${DATA_API_KEY}`  //load.bs.scrollspy.data-api
  }

  const ClassName = {
    DROPDOWN_ITEM : 'dropdown-item',
    DROPDOWN_MENU : 'dropdown-menu',
    NAV_LINK      : 'nav-link',
    NAV           : 'nav',
    ACTIVE        : 'active'
  }

  const Selector = {
    DATA_SPY        : '[data-spy="scroll"]',
    ACTIVE          : '.active',
    LIST_ITEM       : '.list-item',
    LI              : 'li',
    LI_DROPDOWN     : 'li.dropdown',
    NAV_LINKS       : '.nav-link',
    DROPDOWN        : '.dropdown',
    DROPDOWN_ITEMS  : '.dropdown-item',
    DROPDOWN_TOGGLE : '.dropdown-toggle'
  }

  const OffsetMethod = {
    OFFSET   : 'offset',
    POSITION : 'position'
  }


  /**
   * ------------------------------------------------------------------------
   * Class Definition
   * ------------------------------------------------------------------------
   */

  class ScrollSpy {

    // new操作是自动调用
    constructor(element, config) {
      this._element       = element
      this._scrollElement = element.tagName === 'BODY' ? window : element
      this._config        = this._getConfig(config)
      // css元素选择符 ".nav-link, .dropdown-item"
      // TODO: zx this._config.target指的什么？
      this._selector      = `${this._config.target} ${Selector.NAV_LINKS},`
                          + `${this._config.target} ${Selector.DROPDOWN_ITEMS}`
      this._offsets       = []
      this._targets       = []
      this._activeTarget  = null
      this._scrollHeight  = 0

      // 起动监听scroll.bs.scrollspy，this._process为事件处理程序, $.proxy用于指定上下文语境
      $(this._scrollElement).on(Event.SCROLL, $.proxy(this._process, this))

      this.refresh()
      this._process()
    }


    // getters

    static get VERSION() {
      return VERSION
    }

    static get Default() {
      return Default
    }


    // public

    refresh() {
      // 滚动监听对象不为window则autoMethod=position，否则为offset
      let autoMethod = this._scrollElement !== this._scrollElement.window ?
        OffsetMethod.POSITION : OffsetMethod.OFFSET

      let offsetMethod = this._config.method === 'auto' ?
        autoMethod : this._config.method

      let offsetBase = offsetMethod === OffsetMethod.POSITION ?
        this._getScrollTop() : 0

      this._offsets = []
      this._targets = []

      this._scrollHeight = this._getScrollHeight()

      // 选取".nav-link, .dropdown-item"DOM元素数组
      let targets = $.makeArray($(this._selector))

      targets
        .map((element) => {
          let target
          let targetSelector = Util.getSelectorFromElement(element)

          if (targetSelector) {
            target = $(targetSelector)[0]
          }

          if (target && (target.offsetWidth || target.offsetHeight)) {
            // todo (fat): remove sketch reliance on jQuery position/offset
            return [
              $(target)[offsetMethod]().top + offsetBase,
              targetSelector
            ]
          }
          return null
        })
        .filter((item)  => item)
        .sort((a, b)    => a[0] - b[0])
        .forEach((item) => {
          this._offsets.push(item[0])
          this._targets.push(item[1])
        })
    }

    dispose() {
      $.removeData(this._element, DATA_KEY)
      $(this._scrollElement).off(EVENT_KEY)

      this._element       = null
      this._scrollElement = null
      this._config        = null
      this._selector      = null
      this._offsets       = null
      this._targets       = null
      this._activeTarget  = null
      this._scrollHeight  = null
    }


    // private

    _getConfig(config) {
      config = $.extend({}, Default, config)

      if (typeof config.target !== 'string') {
        let id = $(config.target).attr('id')
        if (!id) {
          id = Util.getUID(NAME)
          $(config.target).attr('id', id)
        }
        config.target = `#${id}`
      }

      Util.typeCheckConfig(NAME, config, DefaultType)

      return config
    }

    _getScrollTop() {
      return this._scrollElement === window ?
          this._scrollElement.scrollY : this._scrollElement.scrollTop
    }

    _getScrollHeight() {
      return this._scrollElement.scrollHeight || Math.max(
        document.body.scrollHeight,
        document.documentElement.scrollHeight
      )
    }

    _process() {
      let scrollTop    = this._getScrollTop() + this._config.offset
      let scrollHeight = this._getScrollHeight()
      let maxScroll    = this._config.offset
        + scrollHeight
        - this._scrollElement.offsetHeight

      if (this._scrollHeight !== scrollHeight) {
        this.refresh()
      }

      if (scrollTop >= maxScroll) {
        let target = this._targets[this._targets.length - 1]

        if (this._activeTarget !== target) {
          this._activate(target)
        }
      }

      if (this._activeTarget && scrollTop < this._offsets[0]) {
        this._activeTarget = null
        this._clear()
        return
      }

      for (let i = this._offsets.length; i--;) {
        let isActiveTarget = this._activeTarget !== this._targets[i]
            && scrollTop >= this._offsets[i]
            && (this._offsets[i + 1] === undefined ||
                scrollTop < this._offsets[i + 1])

        if (isActiveTarget) {
          this._activate(this._targets[i])
        }
      }
    }

    _activate(target) {
      this._activeTarget = target

      this._clear()

      let queries = this._selector.split(',')
      queries     = queries.map((selector) => {
        return `${selector}[data-target="${target}"],` +
               `${selector}[href="${target}"]`
      })

      let $link = $(queries.join(','))

      if ($link.hasClass(ClassName.DROPDOWN_ITEM)) {
        $link.closest(Selector.DROPDOWN).find(Selector.DROPDOWN_TOGGLE).addClass(ClassName.ACTIVE)
        $link.addClass(ClassName.ACTIVE)
      } else {
        // todo (fat) this is kinda sus...
        // recursively add actives to tested nav-links
        $link.parents(Selector.LI).find(Selector.NAV_LINKS).addClass(ClassName.ACTIVE)
      }

      $(this._scrollElement).trigger(Event.ACTIVATE, {
        relatedTarget: target
      })
    }

    _clear() {
      $(this._selector).filter(Selector.ACTIVE).removeClass(ClassName.ACTIVE)
    }


    // static  静态方法为构造函数对象方法，非原型方法

    static _jQueryInterface(config) {
      return this.each(function () {
        let data    = $(this).data(DATA_KEY)
        let _config = typeof config === 'object' && config || null

        if (!data) {
          data = new ScrollSpy(this, _config)
          $(this).data(DATA_KEY, data)
        }

        if (typeof config === 'string') {
          if (data[config] === undefined) {
            throw new Error(`No method named "${config}"`)
          }
          data[config]()
        }
      })
    }


  }


  /**
   * ------------------------------------------------------------------------
   * Data Api implementation
   * ------------------------------------------------------------------------
   */
  /*
   * 监听事件load.bs.scrollspy.data-api
   */
  $(window).on(Event.LOAD_DATA_API, () => {
    // 选择包含属性data-spy="scroll"的DOM元素
    let scrollSpys = $.makeArray($(Selector.DATA_SPY))

    for (let i = scrollSpys.length; i--;) {
      let $spy = $(scrollSpys[i])
      // $spy.data()：DOM元素的所有data属性组成的object对象，作为config参数
      ScrollSpy._jQueryInterface.call($spy, $spy.data())
    }
  })


  /**
   * ------------------------------------------------------------------------
   * jQuery
   * ------------------------------------------------------------------------
   */
  // NAME: scrollspy
  $.fn[NAME]             = ScrollSpy._jQueryInterface
  $.fn[NAME].Constructor = ScrollSpy
  $.fn[NAME].noConflict  = function () {
    $.fn[NAME] = JQUERY_NO_CONFLICT
    return ScrollSpy._jQueryInterface
  }

  return ScrollSpy

})(jQuery)

export default ScrollSpy
