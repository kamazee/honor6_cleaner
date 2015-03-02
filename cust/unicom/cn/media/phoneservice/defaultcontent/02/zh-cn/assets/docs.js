var resizePackagesNav;
var classesNav;
var devdocNav;
var sidenav;
var content;
var HEADER_HEIGHT = 86;
var cookie_namespace = 'eprobj';
var NAV_PREF_TREE = "tree";
var NAV_PREF_PANELS = "panels";
var nav_pref;
var toRoot;				//basepath
var isMobile = false; 	// 是否是手机
var isIE6 = false; 		// 是否是 IE6
var docLangage;            //文档语言

// 注册onload事件
function addLoadEvent(newfun) {
  var current = window.onload;
  if (typeof window.onload != 'function') {
    window.onload = newfun;
  } else {
    window.onload = function() {
      current();
      newfun();
    }
  }
}

var agent = navigator['userAgent'].toLowerCase();//获取浏览器userAgent
// 如果是手机浏览器，设置标志，do mobile setup 
if ((agent.indexOf("mobile") != -1) ||      // android, iphone, ipod 
    (agent.indexOf("blackberry") != -1) ||
    (agent.indexOf("webos") != -1) ||
    (agent.indexOf("mini") != -1)) {        // opera mini browsers 
  isMobile = true;
  addLoadEvent(mobileSetup);
//如果不是手机浏览器是ie6, set the onresize event for IE6, and others
} else if (agent.indexOf("msie 6") != -1) {
  isIE6 = true;
  addLoadEvent(function() {
   //改变窗口大小触发事件
    window.onresize = resizeAll;
  });
} else {
 //其它浏览器
  addLoadEvent(function() {
    window.onresize = resizeHeight;
  });
}

//手机终端调用参数设置
function mobileSetup() {
  $("body").css({'overflow':'auto'});
  $("html").css({'overflow':'auto'});
  $("#body-content").css({'position':'relative', 'top':'0'});
  $("#doc-content").css({'overflow':'visible', 'border-left':'3px solid #DDD'});
  $("#side-nav").css({'padding':'0'});
  $("#nav-tree").css({'overflow-y': 'auto'});
}

/* 导入 lists.js 文件
Loading this in the head was slowing page load time 
addLoadEvent( function() {
  var lists = document.createElement("script");
  lists.setAttribute("type","text/javascript");
  lists.setAttribute("src", "../../reference/lists.js");
  document.getElementsByTagName("head")[0].appendChild(lists);
} );
*/
addLoadEvent( function() {
  $("pre:not(.no-pretty-print)").addClass("prettyprint");
//  prettyPrint();
} );

//获取basepath
function setToRoot() {
	toRoot = $("epro_basedir").val();
	  if(typeof(toRoot)  == "undefined" || toRoot==null || toRoot=="null"){
	    toRoot="";
	  }
  // 搜索js中使用
}

function restoreWidth(navWidth) {
  var windowWidth = $(window).width() + "px";
  content.css({marginLeft:parseInt(navWidth) + 6 + "px"}); //account for 6px-wide handle-bar

  if (isIE6) {
    content.css({width:parseInt(windowWidth) - parseInt(navWidth) - 6 + "px"}); // necessary in order for scrollbars to be visible
  }

  sidenav.css({width:navWidth});
  resizePackagesNav.css({width:navWidth});
  classesNav.css({width:navWidth});
  $("#packages-nav").css({width:navWidth});
}

function restoreHeight(packageHeight) {
  var windowHeight = ($(window).height() - HEADER_HEIGHT);
  var swapperHeight = windowHeight - 13;
  $("#swapper").css({height:swapperHeight + "px"});
  sidenav.css({height:windowHeight + "px"});
  content.css({height:windowHeight + "px"});
  resizePackagesNav.css({maxHeight:swapperHeight + "px", height:packageHeight});
  classesNav.css({height:swapperHeight - parseInt(packageHeight) + "px"});
  $("#packages-nav").css({height:parseInt(packageHeight) - 6 + "px"}); //move 6px to give space for the resize handle
  devdocNav.css({height:sidenav.css("height")});
  $("#nav-tree").css({height:swapperHeight + "px"});
}

function readCookie(cookie) {
  var myCookie = cookie_namespace+"_"+cookie+"=";
  if (document.cookie) {
    var index = document.cookie.indexOf(myCookie);
    if (index != -1) {
      var valStart = index + myCookie.length;
      var valEnd = document.cookie.indexOf(";", valStart);
      if (valEnd == -1) {
        valEnd = document.cookie.length;
      }
      var val = document.cookie.substring(valStart, valEnd);
      return val;
    }
  }
  return 0;
}

function writeCookie(cookie, val, section, expiration) {
  if (val==undefined) return;
  section = section == null ? "_" : "_"+section+"_";
  if (expiration == null) {
    var date = new Date();
    date.setTime(date.getTime()+(10*365*24*60*60*1000)); // default expiration is one week
    expiration = date.toGMTString();
  }
  document.cookie = cookie_namespace + section + cookie + "=" + val + "; expires=" + expiration+"; path=/";
} 

function init() {
  $("#side-nav").css({position:"absolute",left:0});
  content = $("#doc-content");
  resizePackagesNav = $("#resize-packages-nav");
  classesNav = $("#classes-nav");
  sidenav = $("#side-nav");
  devdocNav = $("#devdoc-nav");

  var cookiePath = "nomobile_";

  if (!isMobile) {
    $("#resize-packages-nav").resizable({handles: "s", resize: function(e, ui) { resizePackagesHeight(); } });
    $("#side-nav").resizable({handles: "e", resize: function(e, ui) { resizeWidth(); } });
    var cookieWidth = readCookie(cookiePath+'width');
    var cookieHeight = readCookie(cookiePath+'height');
    if (cookieWidth) {
      restoreWidth(cookieWidth);
    } else if ($("#side-nav").length) {
      resizeWidth();
    }
    if (cookieHeight) {
      restoreHeight(cookieHeight);
    } else {
      resizeHeight();
    }
  }

  if (devdocNav.length) { // only dev guide and sdk 
    highlightNav(location.href); 
  }
  
  setMenliCSS();
  setLangage();
  //点击内容链接
  contentOnclick();
}

//获取当前文档语言
function setLangage(){
	var myArray=new Array();
	myArray = document.getElementsByTagName("meta");
	for(var i=0;i<myArray.length;i++){
		if(myArray[i].name.indexOf('Language')>0 || myArray[i].name.indexOf('language')>0){
			docLangage=myArray[i].content;
		}
	}
}

//设置 当前目录 的css 并定位滑动条
function  setMenliCSS(){
	var myArray=new Array();
	var url=location.href;
	var  ddd = document.getElementById("devdoc-nav");
		kdocTitle = document.title;//标题 
	if(ddd!='null' && ddd!=null){
		myArray = ddd.getElementsByTagName("a");//所有a标签
		for(var i=0;i<myArray.length;i++){
			myArray[i].onclick =setSideHight;
		   var content1=myArray[i].innerHTML;
		   
		   //根据title值判断是否是当前文档
		   if(content1==kdocTitle )	{
		   	   //var test = $.cookie('side-nav-height');
		   	    var test=readCookie('side-nav-height');
		   	    var height=url;
		   	    //通过url传值
		   	    height=height.substring(height.indexOf("=")+1,height.indexOf("&&liSize"));
		   	    if(test!=height){
		   	    	test=height;
		   	    }
		   	    ddd.scrollTop=test;
		   	    ddd.scrollTop=test;		   	   	   	  	  
		   }		    		   	
		}
		
		var liSize=url.substring(url.indexOf("liSize=")+7);
		if(typeof(myArray[liSize] )!= "undefined"){
			myArray[liSize].className="menli";	
		}		
	}
		
}

//设置 当前目录 的css 并定位滑动条
function  contentOnclick(){
	var myArray=new Array();
	var  content = document.getElementById("doc-content");
	if(content!='null' && content!=null){
		myArray = content.getElementsByTagName("a");//所有a标签
		for(var i=0;i<myArray.length;i++){
			myArray[i].onclick =setContentOnclickSideHight;		   
		}
	}		
}
//保存滑动块高度（目录连接）
function setSideHight(obj){
	 var  ddd = document.getElementById("devdoc-nav");
	 var myArray=new Array();
     myArray = ddd.getElementsByTagName("a");//所有a标签
     var liSize=0;//页面传值 解决名称相同问题
     for(var i=0;i<myArray.length;i++){
		if(myArray[i]==this){
			liSize=i;
		}	
	}
	 this.href=this.href+"?scroollTop="+ddd.scrollTop+"&&liSize="+liSize;
	 loaction.href=this.href;
     //$.cookie('side-nav-height',ddd.scrollTop);	
     //var test = $.cookie('side-nav-height'); 
      writeCookie('side-nav-height',ddd.scrollTop,null,null);
      
}
//保存滑动块高度(内容链接）
function setContentOnclickSideHight(){
   	var myArray=new Array();
	var  ddd = document.getElementById("devdoc-nav");
	if(ddd!='null' && ddd!=null){
		myArray = ddd.getElementsByTagName("a");//所有a标签
		for(var i=0;i<myArray.length;i++){
			myArray[i].onclick =setSideHight;
		   var content1=myArray[i].innerHTML;
		   
		   //根据title值判断是否是当前文档
		   if(content1==this.innerHTML )	{
		   	    this.href=this.href+"?scroollTop="+ddd.scrollTop;
	            loaction.href=this.href; 
		   	  	 writeCookie('side-nav-height',i*20,null,null);       
		   }		   		   	
		}
		
	}  
}
function highlightNav(fullPageName) {
  var lastSlashPos = fullPageName.lastIndexOf("/");
  var firstSlashPos;
  if (fullPageName.indexOf("/guide/") != -1) {
    firstSlashPos = fullPageName.indexOf("/guide/");
  } else if (fullPageName.indexOf("/sdk/") != -1) {
    firstSlashPos = fullPageName.indexOf("/sdk/");
  } else if (fullPageName.indexOf("/resources/") != -1) {
    firstSlashPos = fullPageName.indexOf("/resources/");
  }
  if (lastSlashPos == (fullPageName.length - 1)) { // if the url ends in slash (add 'index.html')
    fullPageName = fullPageName + "index.html";
  }
  var htmlPos = fullPageName.lastIndexOf(".html", fullPageName.length);
  var pathPageName = fullPageName.slice(firstSlashPos, htmlPos + 5);
  var link = $("#devdoc-nav a[href$='"+ pathPageName+"']");
  if ((link.length == 0) && ((fullPageName.indexOf("/guide/") != -1) || (fullPageName.indexOf("/resources/") != -1))) { 
// if there's no match, then let's backstep through the directory until we find an index.html page that matches our ancestor directories (only for dev guide and resources)
    lastBackstep = pathPageName.lastIndexOf("/");
    while (link.length == 0) {
      backstepDirectory = pathPageName.lastIndexOf("/", lastBackstep);
      link = $("#devdoc-nav a[href$='"+ pathPageName.slice(0, backstepDirectory + 1)+"index.html']");
      lastBackstep = pathPageName.lastIndexOf("/", lastBackstep - 1);
      if (lastBackstep == 0) break;
    }
  }

  // add 'selected' to the <li> or <div> that wraps this <a>
  link.parent().addClass('selected');

  // if we're in a toggleable root link (<li class=toggle-list><div><a>)
  if (link.parent().parent().hasClass('toggle-list')) {
    toggle(link.parent().parent(), false); // open our own list
    // then also check if we're in a third-level nested list that's toggleable
    if (link.parent().parent().parent().is(':hidden')) {
      toggle(link.parent().parent().parent().parent(), false); // open the super parent list
    }
  }
  // if we're in a normal nav link (<li><a>) and the parent <ul> is hidden
  else if (link.parent().parent().is(':hidden')) {
    toggle(link.parent().parent().parent(), false); // open the parent list
    // then also check if the parent list is also nested in a hidden list
    if (link.parent().parent().parent().parent().is(':hidden')) {
      toggle(link.parent().parent().parent().parent().parent(), false); // open the super parent list
    }
  }
}

/* Resize the height of the nav panels in the reference,
 * and save the new size to a cookie */
function resizePackagesHeight() {
  var windowHeight = ($(window).height() - HEADER_HEIGHT);
  var swapperHeight = windowHeight - 13; // move 13px for swapper link at the bottom
  resizePackagesNav.css({maxHeight:swapperHeight + "px"});
  classesNav.css({height:swapperHeight - parseInt(resizePackagesNav.css("height")) + "px"});

  $("#swapper").css({height:swapperHeight + "px"});
  $("#packages-nav").css({height:parseInt(resizePackagesNav.css("height")) - 6 + "px"}); //move 6px for handle

  var basePath = getBaseUri(location.pathname);
  var section = basePath.substring(1,basePath.indexOf("/",1));
  writeCookie("height", resizePackagesNav.css("height"), section, null);
}

/* Resize the height of the side-nav and doc-content divs,
 * which creates the frame effect */
function resizeHeight() {
  var docContent = $("#doc-content");

  // Get the window height and always resize the doc-content and side-nav divs
  var windowHeight = ($(window).height() - HEADER_HEIGHT);
  docContent.css({height:windowHeight + "px"});
  $("#side-nav").css({height:windowHeight + "px"});

  var href = location.href;
  // If in the reference docs, also resize the "swapper", "classes-nav", and "nav-tree"  divs
  if (href.indexOf("/reference/") != -1) {
    var swapperHeight = windowHeight - 13;
    $("#swapper").css({height:swapperHeight + "px"});
    $("#classes-nav").css({height:swapperHeight - parseInt(resizePackagesNav.css("height")) + "px"});
    $("#nav-tree").css({height:swapperHeight + "px"});

  // Also resize the "devdoc-nav" div
  } else if ($("#devdoc-nav").length) {
    $("#devdoc-nav").css({height:sidenav.css("height")});
  }

  // Hide the "Go to top" link if there's no vertical scroll
  if ( parseInt($("#jd-content").css("height")) <= parseInt(docContent.css("height")) ) {
    $("a[href='#top']").css({'display':'none'});
  } else {
    $("a[href='#top']").css({'display':'inline'});
  }
}

/* Resize the width of the "side-nav" and the left margin of the "doc-content" div,
 * which creates the resizable side bar */
function resizeWidth() {
  var windowWidth = $(window).width() + "px";
  var sidenav = $("#side-nav");
  if (sidenav.length) {
    var sidenavWidth = sidenav.css("width");
  } else {
    var sidenavWidth = 0;
  }
  content.css({marginLeft:parseInt(sidenavWidth) + 6 + "px"}); //account for 6px-wide handle-bar

  if (isIE6) {
    content.css({width:parseInt(windowWidth) - parseInt(sidenavWidth) - 6 + "px"}); // necessary in order to for scrollbars to be visible
  }

  resizePackagesNav.css({width:sidenavWidth});
  classesNav.css({width:sidenavWidth});
  $("#packages-nav").css({width:sidenavWidth});

  if (sidenav.length) { // Must check if the nav exists because IE6 calls resizeWidth() from resizeAll() for all pages
    var basePath = getBaseUri(location.pathname);
    var section = basePath.substring(1,basePath.indexOf("/",1));
    writeCookie("width", sidenavWidth, section, null);
  }
}

/* 针对ie6的设置
 * because it can't properly perform auto width for "doc-content" div,
 * avoiding this for all browsers provides better performance */
function resizeAll() {
  resizeHeight();
  resizeWidth();
}

function getBaseUri(uri) {
  var intlUrl = (uri.substring(0,6) == "/intl/");
  if (intlUrl) {
    base = uri.substring(uri.indexOf('intl/')+5,uri.length);
    base = base.substring(base.indexOf('/')+1, base.length);
      //alert("intl, returning base url: /" + base);
    return ("/" + base);
  } else {
      //alert("not intl, returning uri as found.");
    return uri;
  }
}


function loadLast(cookiePath) {
  var location = window.location.href;
  if (location.indexOf("/"+cookiePath+"/") != -1) {
    return true;
  }
  var lastPage = readCookie(cookiePath + "_lastpage");
  if (lastPage) {
    window.location = lastPage;
    return false;
  }
  return true;
}

$(window).unload(function(){
  var path = getBaseUri(location.pathname);
  if (path.indexOf("/reference/") != -1) {
    writeCookie("lastpage", path, "reference", null);
  } else if (path.indexOf("/guide/") != -1) {
    writeCookie("lastpage", path, "guide", null);
  } else if (path.indexOf("/resources/") != -1) {
    writeCookie("lastpage", path, "resources", null);
  }
});

function toggle(obj, slide) {
  var ul = $("ul:first", obj);
  var li = ul.parent();
  if (li.hasClass("closed")) {
    if (slide) {
      ul.slideDown("fast");
    } else {
      ul.show();
    }
    li.removeClass("closed");
    li.addClass("open");
    $(".toggle-img", li).attr("title", "hide pages");
  } else {
    ul.slideUp("fast");
    li.removeClass("open");
    li.addClass("closed");
    $(".toggle-img", li).attr("title", "show pages");
  }
}

function buildToggleLists() {
  $(".toggle-list").each(
    function(i) {
      $("div:first", this).append("<a class='toggle-img' href='#' title='show pages' onClick='toggle(this.parentNode.parentNode, true); return false;'></a>");
      $(this).addClass("closed");
    });
}

function getNavPref() {
  var v = readCookie('reference_nav');
  if (v != NAV_PREF_TREE) {
    v = NAV_PREF_PANELS;
  }
  return v;
}

function chooseDefaultNav() {
  nav_pref = getNavPref();
  if (nav_pref == NAV_PREF_TREE) {
    $("#nav-panels").toggle();
    $("#panel-link").toggle();
    $("#nav-tree").toggle();
    $("#tree-link").toggle();
  }
}

function swapNav() {
  if (nav_pref == NAV_PREF_TREE) {
    nav_pref = NAV_PREF_PANELS;
  } else {
    nav_pref = NAV_PREF_TREE;
    init_default_navtree(toRoot);
  }
  var date = new Date();
  date.setTime(date.getTime()+(10*365*24*60*60*1000)); // keep this for 10 years
  writeCookie("nav", nav_pref, "reference", date.toGMTString());

  $("#nav-panels").toggle();
  $("#panel-link").toggle();
  $("#nav-tree").toggle();
  $("#tree-link").toggle();

  if ($("#nav-tree").is(':visible')) scrollIntoView("nav-tree");
  else {
    scrollIntoView("packages-nav");
    scrollIntoView("classes-nav");
  }
}

function scrollIntoView(nav) {
  var navObj = $("#"+nav);
  if (navObj.is(':visible')) {
    var selected = $(".selected", navObj);
    if (selected.length == 0) return;
    if (selected.is("div")) selected = selected.parent();

    var scrolling = document.getElementById(nav);
    var navHeight = navObj.height();
    var offsetTop = selected.position().top;
    if (selected.parent().parent().is(".toggle-list")) offsetTop += selected.parent().parent().position().top;
    if(offsetTop > navHeight - 92) {
      scrolling.scrollTop = offsetTop - navHeight + 92;
    }
  }
}

function changeTabLang(lang) {
  var nodes = $("#header-tabs").find("."+lang);
  for (i=0; i < nodes.length; i++) { // for each node in this language 
    var node = $(nodes[i]);
    node.siblings().css("display","none"); // hide all siblings 
    if (node.not(":empty").length != 0) { //if this languages node has a translation, show it 
      node.css("display","inline");
    } else { //otherwise, show English instead 
      node.css("display","none");
      node.siblings().filter(".en").css("display","inline");
    }
  }
}

function changeNavLang(lang) {
  var nodes = $("#side-nav").find("."+lang);
  for (i=0; i < nodes.length; i++) { // for each node in this language 
    var node = $(nodes[i]);
    node.siblings().css("display","none"); // hide all siblings 
    if (node.not(":empty").length != 0) { // if this languages node has a translation, show it 
      node.css("display","inline");
    } else { // otherwise, show English instead 
      node.css("display","none");
      node.siblings().filter(".en").css("display","inline");
    }
  }
}

function changeDocLang(lang) {
  changeTabLang(lang);
  changeNavLang(lang);
}

function changeLangPref(lang, refresh) {
  var date = new Date();
  expires = date.toGMTString(date.setTime(date.getTime()+(10*365*24*60*60*1000))); // keep this for 50 years
  //alert("expires: " + expires)
  writeCookie("pref_lang", lang, null, expires);
  //changeDocLang(lang);
  if (refresh) {
    l = getBaseUri(location.pathname);
    window.location = l;
  }
}

function loadLangPref() {
  var lang = readCookie("pref_lang");
  if (lang != 0) {
    $("#language").find("option[value='"+lang+"']").attr("selected",true);
  }
}


function toggleContent(obj) {
  var button = $(obj);
  var div = $(obj.parentNode);
  var toggleMe = $(".toggle-content-toggleme",div);
  if (button.hasClass("show")) {
    toggleMe.slideDown();
    button.removeClass("show").addClass("hide");
  } else {
    toggleMe.slideUp();
    button.removeClass("hide").addClass("show");
  }
  $("span", button).toggle();
}
