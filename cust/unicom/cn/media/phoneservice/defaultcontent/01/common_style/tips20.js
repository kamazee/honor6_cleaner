// swipe.min.js
window.Swipe=function(b,a){if(!b){return null}var c=this;this.options=a||{};this.index=this.options.startSlide||0;this.speed=this.options.speed||300;this.callback=this.options.callback||function(){};this.callbackBegin=this.options.callbackBegin||function(){};this.delay=this.options.auto||0;this.container=b;this.element=this.container.children[0];this.container.style.overflow="hidden";this.element.style.listStyle="none";this.element.style.margin=0;this.setup();this.begin();if(this.element.addEventListener){this.element.addEventListener("touchstart",this,false);this.element.addEventListener("touchmove",this,false);this.element.addEventListener("touchend",this,false);this.element.addEventListener("touchcancel",this,false);this.element.addEventListener("webkitTransitionEnd",this,false);this.element.addEventListener("msTransitionEnd",this,false);this.element.addEventListener("oTransitionEnd",this,false);this.element.addEventListener("transitionend",this,false);window.addEventListener("resize",this,false)}};Swipe.prototype={setup:function(){this.slides=this.element.children;this.length=this.slides.length;if(this.length<2){return null}this.width=Math.ceil(("getBoundingClientRect" in this.container)?this.container.getBoundingClientRect().width:this.container.offsetWidth);if(this.width===0&&typeof window.getComputedStyle==="function"){this.width=window.getComputedStyle(this.container,null).width.replace("px","")}if(!this.width){return null}var b=this.container.style.visibility;this.container.style.visibility="hidden";this.element.style.width=Math.ceil(this.slides.length*this.width)+"px";var a=this.slides.length;while(a--){var c=this.slides[a];c.style.width=this.width+"px";c.style.display="table-cell";c.style.verticalAlign="top"}this.slide(this.index,0);this.container.style.visibility=b},slide:function(a,c){var b=this.element.style;if(c==undefined){c=this.speed}b.webkitTransitionDuration=b.MozTransitionDuration=b.msTransitionDuration=b.OTransitionDuration=b.transitionDuration=c+"ms";b.MozTransform=b.webkitTransform="translate3d("+-(a*this.width)+"px,0,0)";b.msTransform=b.OTransform="translateX("+-(a*this.width)+"px)";this.transitionBegin(a);this.index=a},getPos:function(){return this.index},prev:function(a){this.delay=a||0;clearTimeout(this.interval);if(this.index){this.slide(this.index-1,this.speed)}else{this.slide(this.length-1,this.speed)}},next:function(a){this.delay=a||0;clearTimeout(this.interval);if(this.index<this.length-1){this.slide(this.index+1,this.speed)}else{this.slide(0,this.speed)}},begin:function(){var a=this;this.interval=(this.delay)?setTimeout(function(){a.next(a.delay)},this.delay):0},stop:function(){this.delay=0;clearTimeout(this.interval)},resume:function(){this.delay=this.options.auto||0;this.begin()},handleEvent:function(a){switch(a.type){case"touchstart":this.onTouchStart(a);break;case"touchmove":this.onTouchMove(a);break;case"touchcancel":case"touchend":this.onTouchEnd(a);break;case"webkitTransitionEnd":case"msTransitionEnd":case"oTransitionEnd":case"transitionend":this.transitionEnd(a);break;case"resize":this.setup();break}},transitionBegin:function(a){this.callbackBegin(a)},transitionEnd:function(a){if(this.delay){this.begin()}this.callback(a,this.index,this.slides[this.index])},onTouchStart:function(a){this.start={pageX:a.touches[0].pageX,pageY:a.touches[0].pageY,time:Number(new Date())};this.isScrolling=undefined;this.deltaX=0;this.element.style.MozTransitionDuration=this.element.style.webkitTransitionDuration=0;a.stopPropagation()},onTouchMove:function(a){if(a.touches.length>1||a.scale&&a.scale!==1){return}this.deltaX=a.touches[0].pageX-this.start.pageX;if(typeof this.isScrolling=="undefined"){this.isScrolling=!!(this.isScrolling||Math.abs(this.deltaX)<Math.abs(a.touches[0].pageY-this.start.pageY))}if(!this.isScrolling){a.preventDefault();clearTimeout(this.interval);this.deltaX=this.deltaX/((!this.index&&this.deltaX>0||this.index==this.length-1&&this.deltaX<0)?(Math.abs(this.deltaX)/this.width+1):1);this.element.style.MozTransform=this.element.style.webkitTransform="translate3d("+(this.deltaX-this.index*this.width)+"px,0,0)";a.stopPropagation()}},onTouchEnd:function(c){var b=Number(new Date())-this.start.time<250&&Math.abs(this.deltaX)>20||Math.abs(this.deltaX)>this.width/2,a=!this.index&&this.deltaX>0||this.index==this.length-1&&this.deltaX<0;if(!this.isScrolling){this.slide(this.index+(b&&!a?(this.deltaX<0?1:-1):0),this.speed)}c.stopPropagation()}};

// tips20
if(document.getElementById('reel')){

	var selectors = document.getElementById('modNav').children;

	function setTab(elem) {
		for (var i = 0; i < selectors.length; i++) {
			selectors[i].className = selectors[i].className.replace('cur',' ');
		}
		elem.className += ' cur';
	}
	
	var tab_index = new Swipe(document.getElementById('reel'), {
		startSlide: 0,
		speed: 350,
		callbackBegin: function(idx) {
			setTab(selectors[idx]);
		}
	});
}

function returnMenu(){
	window.jsInterface.returnMenu();
}

function searchContent(){
	window.jsInterface.searchContent();
}

function goParent(){
	var back_href = document.getElementById("backLink");
	if(back_href){
		if(back_href.getAttribute("href").indexOf("returnMenu") >= 0){
			returnMenu();
		}
		else{
			window.location.href = back_href.getAttribute("href");
		}
	}
	else{
		window.history.go(-1);
	}
}

function isDeviceSuit(){
	var dWidth = document.documentElement.clientWidth || document.body.clientWidth;
	var dHeight = document.documentElement.clientHeight || document.body.clientHeight;
  	alert("屏幕物理宽度：" + dWidth + ", 屏幕物理高度：" + dHeight + ", 密度比： " + window.devicePixelRatio );
}

function isOwnPage(){
	/*var themeColor = window.jsInterface.getSkinHexColor();
	if(themeColor == "ffe05a6d"){
		document.getElementsByTagName("body")[0].className += " pink";
	}
	else if(themeColor == "ff9e7837"){
		document.getElementsByTagName("body")[0].className += " white";
	}
	else if(themeColor == "ccdc7832"){
		document.getElementsByTagName("body")[0].className += " taste";
	}
	else if(themeColor == "ff23a7d9"){
		// 蓝色无需给body赋值
	}*/
	window.jsInterface.setOwnPage();
}

document.body.onload = isOwnPage;

