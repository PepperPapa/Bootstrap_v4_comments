/*
 * 简单的模态对话框插件
 * 
 */

$(function($) {
  // 常量
  var NAME = "mymodal";
  var CLASS_NAME = `.${NAME}`;
  var DATA_TOGGLE = `[data-toggle=${NAME}]`;
  var SHOW = "show";

  function Mymodal() {
    
  }

  // 监听click事件处理程序
  var $btn = $(DATA_TOGGLE);
  var $mymodal = $(CLASS_NAME);
  $btn.on("click", function(event) {
    event.preventDefault();
    if(!$mymodal.hasClass(SHOW)) {
      $mymodal.css("display", "block");
    }
  });

  // 模态对话框的click监听处理程序
  var $close = $mymodal.find(".close");
  $close.on("click", function(event) {
    $mymodal.css("display", "none");
  });

  // jQuery接口
  $.fn[NAME] = function() {
    console.log("mymodal plugin");
  }
}(jQuery));
