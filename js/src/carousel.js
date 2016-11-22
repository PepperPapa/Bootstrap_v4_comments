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
        this._slide(Direction.NEXT)
      }
    }

    nextWhenVisible() {
      // Don't call next when the page isn't visible
      if (!document.hidden) {
        this.next()
      }
    }

    prev() {
      if (!this._isSliding) {
        this._slide(Direction.PREVIOUS)
      }
    }

    pause(event) {
      if (!event) {
        this._isPaused = true
      }

      if ($(this._element).find(Selector.NEXT_PREV)[0] &&
        Util.supportsTransitionEnd()) {
        Util.triggerTransitionEnd(this._element)
        this.cycle(true)
      }

      clearInterval(this._interval)
      this._interval = null
    }

    cycle(event) {
      if (!event) {
        this._isPaused = false
      }

      if (this._interval) {
        clearInterval(this._interval)
        this._interval = null
      }

      if (this._config.interval && !this._isPaused) {
        this._interval = setInterval(
          $.proxy(document.visibilityState ? this.nextWhenVisible : this.next, this), this._config.interval
        )
      }
    }

    to(index) {
      this._activeElement = $(this._element).find(Selector.ACTIVE_ITEM)[0]

      let activeIndex = this._getItemIndex(this._activeElement)

      if (index > (this._items.length - 1) || index < 0) {
        return
      }

      if (this._isSliding) {
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
      $(this._element).off(EVENT_KEY)
      $.removeData(this._element, DATA_KEY)

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

    _getConfig(config) {
      config = $.extend({}, Default, config)
      Util.typeCheckConfig(NAME, config, DefaultType)
      return config
    }

    _addEventListeners() {
      if (this._config.keyboard) {
        $(this._element)
          .on(Event.KEYDOWN, $.proxy(this._keydown, this))
      }

      if (this._config.pause === 'hover' &&
        !('ontouchstart' in document.documentElement)) {
        $(this._element)
          .on(Event.MOUSEENTER, $.proxy(this.pause, this))
          .on(Event.MOUSELEAVE, $.proxy(this.cycle, this))
      }
    }

    _keydown(event) {
      event.preventDefault()

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

    _getItemIndex(element) {
      this._items = $.makeArray($(element).parent().find(Selector.ITEM))
      return this._items.indexOf(element)
    }

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


    _triggerSlideEvent(relatedTarget, directionalClassname) {
      let slideEvent = $.Event(Event.SLIDE, {
        relatedTarget,
        direction: directionalClassname
      })

      $(this._element).trigger(slideEvent)

      return slideEvent
    }

    _setActiveIndicatorElement(element) {
      if (this._indicatorsElement) {
        $(this._indicatorsElement)
          .find(Selector.ACTIVE)
          .removeClass(ClassName.ACTIVE)

        let nextIndicator = this._indicatorsElement.children[
          this._getItemIndex(element)
        ]

        if (nextIndicator) {
          $(nextIndicator).addClass(ClassName.ACTIVE)
        }
      }
    }

    _slide(direction, element) {
      let activeElement = $(this._element).find(Selector.ACTIVE_ITEM)[0]
      let nextElement   = element || activeElement &&
        this._getItemByDirection(direction, activeElement)

      let isCycling = Boolean(this._interval)

      let directionalClassName = direction === Direction.NEXT ?
        ClassName.LEFT :
        ClassName.RIGHT

      if (nextElement && $(nextElement).hasClass(ClassName.ACTIVE)) {
        this._isSliding = false
        return
      }

      let slideEvent = this._triggerSlideEvent(nextElement, directionalClassName)
      if (slideEvent.isDefaultPrevented()) {
        return
      }

      if (!activeElement || !nextElement) {
        // some weirdness is happening, so we bail
        return
      }

      this._isSliding = true

      if (isCycling) {
        this.pause()
      }

      this._setActiveIndicatorElement(nextElement)

      let slidEvent = $.Event(Event.SLID, {
        relatedTarget: nextElement,
        direction: directionalClassName
      })

      if (Util.supportsTransitionEnd() &&
        $(this._element).hasClass(ClassName.SLIDE)) {

        $(nextElement).addClass(direction)

        Util.reflow(nextElement)

        $(activeElement).addClass(directionalClassName)
        $(nextElement).addClass(directionalClassName)

        $(activeElement)
          .one(Util.TRANSITION_END, () => {
            $(nextElement)
              .removeClass(directionalClassName)
              .removeClass(direction)

            $(nextElement).addClass(ClassName.ACTIVE)

            $(activeElement)
              .removeClass(ClassName.ACTIVE)
              .removeClass(direction)
              .removeClass(directionalClassName)

            this._isSliding = false

            setTimeout(() => $(this._element).trigger(slidEvent), 0)

          })
          .emulateTransitionEnd(TRANSITION_DURATION)

      } else {
        $(activeElement).removeClass(ClassName.ACTIVE)
        $(nextElement).addClass(ClassName.ACTIVE)

        this._isSliding = false
        $(this._element).trigger(slidEvent)
      }

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
      let selector = Util.getSelectorFromElement(this)

      if (!selector) {
        return
      }

      let target = $(selector)[0]

      if (!target || !$(target).hasClass(ClassName.CAROUSEL)) {
        return
      }

      let config     = $.extend({}, $(target).data(), $(this).data())
      let slideIndex = this.getAttribute('data-slide-to')

      if (slideIndex) {
        config.interval = false
      }

      Carousel._jQueryInterface.call($(target), config)

      if (slideIndex) {
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
