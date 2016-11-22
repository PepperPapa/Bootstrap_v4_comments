import Util from './util'


/**
 * --------------------------------------------------------------------------
 * Bootstrap (v4.0.0-alpha.5): carousel.js
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * --------------------------------------------------------------------------
 */

/* by zx:
 * Bootstrap模块变量的基本结构(适用于所有Bootstrap js模块)
 * 1. 定义常量：包括版本信息、事件、选择器、默认配置、类名等
 * 2. 定义同名类，如Carousel类，该类定义了共有方法和私有方法
 * 3. 需要监听的DOM的元素起动事件监听并制定响应处理接口为2中的类的响应接口方法
 * 4. 扩展原型方法至jQuery原型对象，一般为$.fn.xxx，xxx-一般为模块名称，如carousel
 */

const Carousel = (($) => {


  /**
   * ------------------------------------------------------------------------
   * Constants
   * ------------------------------------------------------------------------
   */

  const NAME                = 'carousel'
  const VERSION             = '4.0.0-alpha.5'
  const DATA_KEY            = 'bs.carousel'
  // TODO: `${}`这个是什么语法，ES6才有吗？
  const EVENT_KEY           = `.${DATA_KEY}`
  const DATA_API_KEY        = '.data-api'
  const JQUERY_NO_CONFLICT  = $.fn[NAME]
  const TRANSITION_DURATION = 600
  const ARROW_LEFT_KEYCODE  = 37 // KeyboardEvent.which value for left arrow key
  const ARROW_RIGHT_KEYCODE = 39 // KeyboardEvent.which value for right arrow key

  const Default = {
    interval : 5000,
    keyboard : true,
    slide    : false,
    pause    : 'hover',
    wrap     : true
  }

  const DefaultType = {
    interval : '(number|boolean)',
    keyboard : 'boolean',
    slide    : '(boolean|string)',
    pause    : '(string|boolean)',
    wrap     : 'boolean'
  }

  const Direction = {
    NEXT     : 'next',
    PREVIOUS : 'prev'
  }

  const Event = {
    SLIDE          : `slide${EVENT_KEY}`,  // slide.bs.carousel
    SLID           : `slid${EVENT_KEY}`,   // slid.bs.carousel
    KEYDOWN        : `keydown${EVENT_KEY}`,
    MOUSEENTER     : `mouseenter${EVENT_KEY}`,
    MOUSELEAVE     : `mouseleave${EVENT_KEY}`,
    LOAD_DATA_API  : `load${EVENT_KEY}${DATA_API_KEY}`, // load.bs.carousel.data-api
    CLICK_DATA_API : `click${EVENT_KEY}${DATA_API_KEY}` //click.bs.carousel.data-api
  }

  const ClassName = {
    CAROUSEL : 'carousel',
    ACTIVE   : 'active',
    SLIDE    : 'slide',
    RIGHT    : 'right',
    LEFT     : 'left',
    ITEM     : 'carousel-item'
  }

  const Selector = {
    ACTIVE      : '.active',
    ACTIVE_ITEM : '.active.carousel-item',
    ITEM        : '.carousel-item',
    NEXT_PREV   : '.next, .prev',
    INDICATORS  : '.carousel-indicators',
    DATA_SLIDE  : '[data-slide], [data-slide-to]',
    DATA_RIDE   : '[data-ride="carousel"]'
  }


  /**
   * ------------------------------------------------------------------------
   * Class Definition
   * ------------------------------------------------------------------------
   */

  class Carousel {

    constructor(element, config) {
      this._items             = null
      this._interval          = null
      this._activeElement     = null

      this._isPaused          = false
      this._isSliding         = false

      this._config            = this._getConfig(config)
      this._element           = $(element)[0]
      this._indicatorsElement = $(this._element).find(Selector.INDICATORS)[0]

      this._addEventListeners()
    }


    // getters

    static get VERSION() {
      return VERSION
    }

    // 默认配置
    static get Default() {
      return Default
    }


    // public
    // 播放下一个slide
    next() {
      // 内部变量_isSliding表示是否处于动画状态
      if (!this._isSliding) {
        // Direction.Next: "next"
        this._slide(Direction.NEXT)
      }
    }

    nextWhenVisible() {
      // Don't call next when the page isn't visible
      if (!document.hidden) {
        this.next()
      }
    }

    // 播放上一个slide
    prev() {
      if (!this._isSliding) {
        // Direction.PREVIOUS: "prev"
        this._slide(Direction.PREVIOUS)
      }
    }

    // 暂停播放slide，event为事件对象，动态生成
    pause(event) {
      // _isPaused表示当前是否处于暂停播放slide的状态
      // event为null应该是表示人为调用的情况，非事件触发
      if (!event) {
        this._isPaused = true
      }

      // Selector.NEXT_PREV: ".next, .prev"
      if ($(this._element).find(Selector.NEXT_PREV)[0] &&
        Util.supportsTransitionEnd()) {
        Util.triggerTransitionEnd(this._element)
        this.cycle(true)
      }

      // 清除超时设定，即暂停动画
      clearInterval(this._interval)
      this._interval = null
    }

    // 启动循环播放slide
    cycle(event) {
      if (!event) {
        this._isPaused = false
      }

      if (this._interval) {
        clearInterval(this._interval)
        this._interval = null
      }

      // 启动超时设定，即启动循环播放
      if (this._config.interval && !this._isPaused) {
        // $.proxy为jQuery函数对象方法，作用类似与bind指定方法的调用对象固定为carousel对象
        this._interval = setInterval(
          $.proxy(document.visibilityState ? this.nextWhenVisible : this.next, this), this._config.interval
        )
      }
    }

    // 跳转至序号为index的slide
    to(index) {
      // Selector.ACTIVE_ITEM: "active.carousel-item"
      this._activeElement = $(this._element).find(Selector.ACTIVE_ITEM)[0]

      let activeIndex = this._getItemIndex(this._activeElement)

      // 非法参数直接返回
      if (index > (this._items.length - 1) || index < 0) {
        return
      }

      // 正在动画中
      if (this._isSliding) {
        // 绑定slid.bs.carousel事件处理函数（slide动画过渡结束后触发），.one方法表示仅触发一次
        $(this._element).one(Event.SLID, () => this.to(index))
        return
      }

      if (activeIndex === index) {
        this.pause()
        this.cycle()
        return
      }

      let direction = index > activeIndex ?
        Direction.NEXT :
        Direction.PREVIOUS

      this._slide(direction, this._items[index])
    }

    dispose() {
      // 取消事件监听EVENT_KEY: ".bs.carousel"
      $(this._element).off(EVENT_KEY)
      // 移除元素的data-bs.carousel属性
      $.removeData(this._element, DATA_KEY)

      // 初始化内部变量
      this._items             = null
      this._config            = null
      this._element           = null
      this._interval          = null
      this._isPaused          = null
      this._isSliding         = null
      this._activeElement     = null
      this._indicatorsElement = null
    }


    // private
    // 读取配置，实例化对象是调用
    _getConfig(config) {
      config = $.extend({}, Default, config)
      // 配置参数类型检查
      Util.typeCheckConfig(NAME, config, DefaultType)
      return config
    }

    // 配置监听事件 DOM2级方法
    _addEventListeners() {
      // 按键处理函数，$.proxy将this._keydown函数的调用对象指向this，即当前jQuery对象
      if (this._config.keyboard) {
        $(this._element)
          .on(Event.KEYDOWN, $.proxy(this._keydown, this))
      }

      // 'ontouchstart'事件为移动设备，点击触摸屏触发，这里取非表示不支持ontouchstart事件
      // 'MOUSEENTER': mouseenter.bs.carousel  该事件触发暂停播放slide
      // 'MOUSELEAVE': mouseleave.bs.carousel  该事件触发循环播放slide
      if (this._config.pause === 'hover' &&
        !('ontouchstart' in document.documentElement)) {
        $(this._element)
          .on(Event.MOUSEENTER, $.proxy(this.pause, this))
          .on(Event.MOUSELEAVE, $.proxy(this.cycle, this))
      }
    }

    // keydown.bs.carousel事件处理函数
    _keydown(event) {
      // 阻止默认行为
      event.preventDefault()

      // input或textarea元素的按键事件直接返回，不处理
      if (/input|textarea/i.test(event.target.tagName)) {
        return
      }

      switch (event.which) {
        case ARROW_LEFT_KEYCODE:
          this.prev()
          break
        case ARROW_RIGHT_KEYCODE:
          this.next()
          break
        default:
          return
      }
    }

    // 获取slide元素的index序号
    _getItemIndex(element) {
      // Selector.ITM: ".carousel-item"
      this._items = $.makeArray($(element).parent().find(Selector.ITEM))
      return this._items.indexOf(element)
    }

    // 根据方向参数"nex","prev"获取当前active slide元素的下一个元素
    _getItemByDirection(direction, activeElement) {
      let isNextDirection = direction === Direction.NEXT
      let isPrevDirection = direction === Direction.PREVIOUS
      let activeIndex     = this._getItemIndex(activeElement)
      let lastItemIndex   = (this._items.length - 1)
      let isGoingToWrap   = (isPrevDirection && activeIndex === 0) ||
                            (isNextDirection && activeIndex === lastItemIndex)

      if (isGoingToWrap && !this._config.wrap) {
        return activeElement
      }

      let delta     = direction === Direction.PREVIOUS ? -1 : 1
      let itemIndex = (activeIndex + delta) % this._items.length

      return itemIndex === -1 ?
        this._items[this._items.length - 1] : this._items[itemIndex]
    }

    // 触发slide.bs.carousel事件，_slide方法调用即立刻触发
    _triggerSlideEvent(relatedTarget, directionalClassname) {
      // 自定义slide.bs.carousel事件
      let slideEvent = $.Event(Event.SLIDE, {
        relatedTarget,
        direction: directionalClassname
      })

      // 触发事件
      $(this._element).trigger(slideEvent)

      return slideEvent
    }

    // 设置element为当前active的indicator
    _setActiveIndicatorElement(element) {
      // this._indicatorsElement表示class为"carousel-indicators"的元素
      if (this._indicatorsElement) {
        // Selector.ACTIVE: ".active"
        // ClassName.ACTIVE: "active"
        $(this._indicatorsElement)
          .find(Selector.ACTIVE)
          .removeClass(ClassName.ACTIVE)

        let nextIndicator = this._indicatorsElement.children[
          this._getItemIndex(element)
        ]

        // 设置Element为当前acticve的indicator元素
        if (nextIndicator) {
          $(nextIndicator).addClass(ClassName.ACTIVE)
        }
      }
    }

    // 播放slide函数，
    // direction表示slide的方向，影响动画的方向
    // Element为目标slide元素
    _slide(direction, element) {
      // this._element表示class为"carousel"的元素， Selector.ACTIVE_ITEM: ".active.carousel-item"
      let activeElement = $(this._element).find(Selector.ACTIVE_ITEM)[0]
      // TODO: zx || 后面的语句“activeElement && this._getItemByDirection(direction, activeElement)”如何理解？
      let nextElement   = element || activeElement &&
        this._getItemByDirection(direction, activeElement)

      // 转换为布尔值
      let isCycling = Boolean(this._interval)

      // 获取slide的方向
      let directionalClassName = direction === Direction.NEXT ?
        ClassName.LEFT :
        ClassName.RIGHT

      // 如果nextElement非null且包含active类名，表示已完成slide动作，动画中状态置为false
      if (nextElement && $(nextElement).hasClass(ClassName.ACTIVE)) {
        this._isSliding = false
        return
      }

      // 监听slide.bs.carousel事件，slideEvent为jQuery对象
      let slideEvent = this._triggerSlideEvent(nextElement, directionalClassName)
      // jQuery对象方法isDefaultPrevented返回是否调用了preventDefault()方法
      if (slideEvent.isDefaultPrevented()) {
        return
      }

      if (!activeElement || !nextElement) {
        // some weirdness is happening, so we bail
        return
      }

      this._isSliding = true

      // 如果当前为循环播放，调用_slide会暂停循环播放
      if (isCycling) {
        this.pause()
      }

      this._setActiveIndicatorElement(nextElement)

      // slid.bs.carousel事件，slide结束后触发
      let slidEvent = $.Event(Event.SLID, {
        relatedTarget: nextElement,
        direction: directionalClassName
      })

      // 如果支持过渡特性，且包含"slide"类
      if (Util.supportsTransitionEnd() &&
        $(this._element).hasClass(ClassName.SLIDE)) {

        $(nextElement).addClass(direction)

        Util.reflow(nextElement)

        $(activeElement).addClass(directionalClassName)
        $(nextElement).addClass(directionalClassName)

        // 过渡动画，仅触发一次
        $(activeElement)
          .one(Util.TRANSITION_END, () => {
            $(nextElement)
              .removeClass(directionalClassName)
              .removeClass(direction)

            // 下一个slide添加active类
            $(nextElement).addClass(ClassName.ACTIVE)

            // 当前slide去除active、direction、directionalClassName(布尔值)
            $(activeElement)
              .removeClass(ClassName.ACTIVE)
              .removeClass(direction)
              .removeClass(directionalClassName)

            this._isSliding = false // 清除动画中标识
            // 触发slid.bs.carousel事件
            // TODO: zx 为什么使用setTimeout而不是直接触发事件？
            setTimeout(() => $(this._element).trigger(slidEvent), 0)

          })
          .emulateTransitionEnd(TRANSITION_DURATION)  // 600ms过渡时间

      } else { // 不支持过渡特性
        $(activeElement).removeClass(ClassName.ACTIVE) // 当前slide去除active
        $(nextElement).addClass(ClassName.ACTIVE) // 下一个slide增加active

        this._isSliding = false // 清除动画状态标识
        $(this._element).trigger(slidEvent)  // 触发slid.bs.carousel事件
      }

      // 重新恢复循环播放
      if (isCycling) {
        this.cycle()
      }
    }


    // static

    static _jQueryInterface(config) {
      // 由于是jquery对象调用该方法，this为jquery对象，可能是多个对象
      return this.each(function () {
        // 这里的this表示dom元素
        let data      = $(this).data(DATA_KEY)
        let _config = $.extend({}, Default, $(this).data())

        // 参数为object表示要修改配置，如参数{ interval: 2000 }
        if (typeof config === 'object') {
          $.extend(_config, config)
        }

        let action = typeof config === 'string' ? config : _config.slide

        // data为null就重新设置dom元素的data-bs.carousel属性的值
        if (!data) {
          data = new Carousel(this, _config)
          $(this).data(DATA_KEY, data)
        }

        // config为数字表示要跳转的slide序号
        if (typeof config === 'number') {
          data.to(config)
        } else if (typeof action === 'string') {
          if (data[action] === undefined) {
            throw new Error(`No method named "${action}"`)
          }
          data[action]()
        } else if (_config.interval) {
          data.pause()
          data.cycle()
        }
      })
    }

    static _dataApiClickHandler(event) {
      // 通过data-taget属性查找target元素，返回data-target指向的元素
      let selector = Util.getSelectorFromElement(this)

      if (!selector) {
        return
      }

      let target = $(selector)[0]

      if (!target || !$(target).hasClass(ClassName.CAROUSEL)) {
        return
      }

      let config     = $.extend({}, $(target).data(), $(this).data())
      // 这里this指的是点击的DOM元素，为carousel-indicators的子元素
      let slideIndex = this.getAttribute('data-slide-to')

      if (slideIndex) {
        config.interval = false
      }

      // 调用该方法会Carousel对象实例写入target元素的data-bs.carousel属性
      Carousel._jQueryInterface.call($(target), config)

      if (slideIndex) {
        // $(target).data(DATA_KEY)实际为Carousel对象，因此具有to方法
        // DATA_KEY: "bs.carousel"
        $(target).data(DATA_KEY).to(slideIndex)
      }

      event.preventDefault()
    }

  }


  /**
   * ------------------------------------------------------------------------
   * Data Api implementation
   * ------------------------------------------------------------------------
   */

  /* by zx:
   * --- 监听事件实现click响应 用户无需额外添加js代码了 ---
   * 监听事件：click.bs.carousel   所有的事件都有一个bs的命名空间，这个表示Bootstrap，晕了很久
   * 响应dom元素：包含属性data-slide和data-slide-to的元素
   */
  $(document)
    .on(Event.CLICK_DATA_API, Selector.DATA_SLIDE, Carousel._dataApiClickHandler)

  /* by zx:
   * --- 监听事件实现循环轮播 用户无需额外添加js代码了 ---
   * 监听事件：load.bs.carousel.data-api
   * 需要执行轮播的dom元素：data-ride="carousel"的元素
   */
  $(window).on(Event.LOAD_DATA_API, () => {
    $(Selector.DATA_RIDE).each(function () {
      let $carousel = $(this)
      Carousel._jQueryInterface.call($carousel, $carousel.data())
    })
  })


  /**
   * ------------------------------------------------------------------------
   * jQuery
   * ------------------------------------------------------------------------
   */

  /* by zx:
   * --- jQuery插件扩展：原型扩展，jQuery对象可调用 ---
   * 扩展了原型方法：$.fn.carousel
   */
  $.fn[NAME]             = Carousel._jQueryInterface
  $.fn[NAME].Constructor = Carousel
  $.fn[NAME].noConflict  = function () {
    $.fn[NAME] = JQUERY_NO_CONFLICT
    return Carousel._jQueryInterface
  }

  return Carousel

})(jQuery)

export default Carousel
