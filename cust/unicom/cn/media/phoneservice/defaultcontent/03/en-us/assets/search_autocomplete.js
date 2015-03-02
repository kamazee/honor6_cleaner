var gSelectedIndex = -1;
var gSelectedID = -1;
var gMatches = new Array();
var gLastText = "";
var ROW_COUNT = 12;
var gInitialized = false;
var DEFAULT_TEXT = "";


function set_row_selected(row, selected)
{
    var c1 = row.cells[0];
    if (selected) {
        c1.className = "jd-autocomplete jd-selected";
    } else {
        c1.className = "jd-autocomplete";
    }
}

//设置行值
function set_row_values(toRoot, row, match)
{
    var link = row.cells[0].childNodes[0];
    link.innerHTML = match.__hilabel || match.label;
    link.href = toRoot + match.link
}

//结果表单
function sync_selection_table(toRoot)
{
    var filtered = document.getElementById("search_filtered");
    var r; //表格td
    var i; //迭代tr
    gSelectedID = -1;

    filtered.onmouseover = function() { 
        if(gSelectedIndex >= 0) {
          set_row_selected(this.rows[gSelectedIndex], false);
          gSelectedIndex = -1;
        }
    }

    //初始化表单
    if (!gInitialized) {
        for (i=0; i<ROW_COUNT; i++) {
            var r = filtered.insertRow(-1);
            var c1 = r.insertCell(-1);
            c1.className = "jd-autocomplete";
            var link = document.createElement("a");
            //当鼠标按下时设置跳转链接
            c1.onmousedown = function() {
                window.location = this.firstChild.getAttribute("href");
            }
            c1.onmouseover = function() {
                this.className = this.className + " jd-selected";
            }
            c1.onmouseout = function() {
                this.className = "jd-autocomplete";
            }
            c1.appendChild(link);
        }
        gInitialized = true;
    }

    //如果有结果，使该表可见，初始化结果的信息
    if (gMatches.length > 0) {
        document.getElementById("search_filtered_div").className = "showing";
        var N = gMatches.length < ROW_COUNT ? gMatches.length : ROW_COUNT;
        for (i=0; i<N; i++) {
            r = filtered.rows[i];
            r.className = "show-row";
            set_row_values(toRoot, r, gMatches[i]);
            set_row_selected(r, i == gSelectedIndex);
            if (i == gSelectedIndex) {
                gSelectedID = gMatches[i].id;
            }
        }
        //隐藏没有匹配到的行
        for (; i<ROW_COUNT; i++) {
            r = filtered.rows[i];
            r.className = "no-display";
        }
    } else {
        document.getElementById("search_filtered_div").className = "no-display";
    }
}

function search_changed(e, kd)
{
    var search = document.getElementById("search_autocomplete");
    var text = search.value.replace(/(^ +)|( +$)/g, '');

    // 13 = enter
    if (e.keyCode == 13) {
        document.getElementById("search_filtered_div").className = "no-display";
        if (kd && gSelectedIndex >= 0) {
            window.location = toRoot + gMatches[gSelectedIndex].link;
            return false;
        } else if (gSelectedIndex < 0) {
            return true;
        }
    }
    // 38 -- arrow up
    else if (kd && (e.keyCode == 38)) {
        if (gSelectedIndex >= 0) {
            gSelectedIndex--;
        }
        sync_selection_table(toRoot);
        return false;
    }
    // 40 -- arrow down
    else if (kd && (e.keyCode == 40)) {
        if (gSelectedIndex < gMatches.length-1
                        && gSelectedIndex < ROW_COUNT-1) {
            gSelectedIndex++;
        }
        sync_selection_table(toRoot);
        return false;
    }
    else if (!kd) {
        gMatches = new Array();
        matchedCount = 0;
        gSelectedIndex = -1;
        for (var i=0; i<DATA.length; i++) {
            var s = DATA[i];
            //修改从内容中查找
            if (text.length != 0 &&
                  (s.label.toLowerCase().indexOf(text.toLowerCase()) != -1 || s.content.toLowerCase().indexOf(text.toLowerCase()) != -1)) {
                  	  if( s.label.toLowerCase().indexOf(text.toLowerCase()) == -1){
                  	   	//如果目录中没有
                  	  	var indexof=s.content.toLowerCase().indexOf(text.toLowerCase());
                  	  	var length=s.content.toLowerCase().length;
                  	    var start=5;
                	  	var end=5;
                	  	start=indexof>=start?(indexof-start):0;
                	  	end=(indexof+end)<=length?(indexof+end):length;
                	   	s.label="["+s.content.substring(start,end)+"]";
                  	  }
                gMatches[matchedCount] = s;
                matchedCount++;
            }
        }
        rank_autocomplete_results(text);
        for (var i=0; i<gMatches.length; i++) {
            var s = gMatches[i];
            if (gSelectedID == s.id) {
                gSelectedIndex = i;
            }
        }
        highlight_autocomplete_result_labels(text);
        sync_selection_table(toRoot);
        return true; 
    }
}

function rank_autocomplete_results(query) {
    query = query || '';
    if (!gMatches || !gMatches.length)
      return;

    var _lastSearch = function(s, re) {
      if (s == '')
        return -1;
      var l = -1;
      var tmp;
      while ((tmp = s.search(re)) >= 0) {
        if (l < 0) l = 0;
        l += tmp;
        s = s.substr(tmp + 1);
      }
      return l;
    };

    var _countChar = function(s, c) {
      var n = 0;
      for (var i=0; i<s.length; i++)
        if (s.charAt(i) == c) ++n;
      return n;
    };

    var queryLower = query.toLowerCase();
    var queryAlnum = (queryLower.match(/\w+/) || [''])[0];
    var partPrefixAlnumRE = new RegExp('\\b' + queryAlnum);
    var partExactAlnumRE = new RegExp('\\b' + queryAlnum + '\\b');

    var _resultScoreFn = function(result) {
        var score = 1.0;
        var labelLower = result.label.toLowerCase();
        var t;
        t = _lastSearch(labelLower, partExactAlnumRE);
        if (t >= 0) {
            var partsAfter = _countChar(labelLower.substr(t + 1), '.');
            score *= 200 / (partsAfter + 1);
        } else {
            t = _lastSearch(labelLower, partPrefixAlnumRE);
            if (t >= 0) {
                var partsAfter = _countChar(labelLower.substr(t + 1), '.');
                score *= 20 / (partsAfter + 1);
            }
        }

        return score;
    };

    for (var i=0; i<gMatches.length; i++) {
        gMatches[i].__resultScore = _resultScoreFn(gMatches[i]);
    }

    gMatches.sort(function(a,b){
        var n = b.__resultScore - a.__resultScore;
        if (n == 0)  
            n = (a.label < b.label) ? -1 : 1;
        return n;
    });
}

//高亮显示
function highlight_autocomplete_result_labels(query) {
    query = query || '';
    if (!gMatches || !gMatches.length)
      return;

    var queryLower = query.toLowerCase();
    //匹配字符
    var queryAlnumDot = (queryLower.match(/[^\s\.]+/) || [''])[0];
    var queryRE = new RegExp(
        '(' + queryAlnumDot.replace(/\./g, '\\.') + ')', 'ig');
    for (var i=0; i<gMatches.length; i++) {
        gMatches[i].__hilabel = gMatches[i].label.replace(
            queryRE, '<b><font color=red>$1</font></b>');
    }
}

function search_focus_changed(obj, focused)
{
    if (focused) {
        if(obj.value == DEFAULT_TEXT){
            obj.value = "";
            obj.style.color="#000000";
        }
    } else {
        if(obj.value == ""){
          obj.value = DEFAULT_TEXT;
          obj.style.color="#aaaaaa";
        }
        document.getElementById("search_filtered_div").className = "no-display";
    }
}

//提交搜索
function submit_search() {
  search_onsubmit();
  return false;
}

//提交搜索
function search_onsubmit(){
	var matchedCount=0;
	var search = document.getElementById("search_autocomplete");
    var text = search.value.replace(/(^ +)|( +$)/g, '');
    for (var i=0; i<DATA1.length; i++) {
          var s = DATA1[i];
          /**修改从内容中查找**/
          if (text.length != 0 && (s.label.toLowerCase().indexOf(text.toLowerCase()) != -1 || s.content.toLowerCase().indexOf(text.toLowerCase()) != -1)) {
                 gMatches[matchedCount] = s;
                matchedCount++;
           }
      }
      /**显示**/
      showResult(gMatches,text);
}

/**显示结果**/
function showResult(gMatches,text){
	var resultText="搜索结果："; 
	var recodeText="条";
	if(docLangage!='zh-cn'){
		resultText="resluts : ";
		recodeText=" records";
	}
	document.getElementById("jd-header").innerHTML=resultText+"0"+recodeText;
	var objMyTable = document.getElementById("showTable");
	for(var i=objMyTable.rows.length-1;i>=0;i--)
  {
  objMyTable.deleteRow(i);
  }

	text = text || '';
    if (!gMatches || !gMatches.length)
      return;

    var queryLower = text.toLowerCase();
    //匹配字符
    var queryAlnumDot = (queryLower.match(/[^\s\.]+/) || [''])[0];
    var queryRE = new RegExp(
        '(' + queryAlnumDot.replace(/\./g, '\\.') + ')', 'ig');
	for (var i=0; i<gMatches.length; i++) {
	      /**创建行与列的对象**/
	　　var index = objMyTable.rows.length-1;
	　　var nextRow = objMyTable.insertRow(index);/**要新增的行，从倒数第二行开始新增的**/
	　　/**单元格箱号**/
	　　var newCellCartonNo = nextRow.insertCell(-1);
	　　var cartonNoName = "name";
	　　
   	  	var indexof=gMatches[i].content.toLowerCase().indexOf(text.toLowerCase());
        var length=gMatches[i].content.toLowerCase().length;
        var start=30;
        var end=40;
        start=indexof>=start?(indexof-start):0;
        end=(indexof+end)<=length?(indexof+end):length;
        gMatches[i].content=gMatches[i].content.substring(start,end);
        
	    gMatches[i]._label = gMatches[i].label.replace(
            queryRE, '<b><font color=red>$1</font></b>');
        gMatches[i]._content = gMatches[i].content.replace(
            queryRE, '<b><font color=red>$1</font></b>');
     　　newCellCartonNo.innerHTML = "<a href="+toRoot+gMatches[i].link+">"+gMatches[i]._label+"</a><br/><br/>"+gMatches[i]._content+"<br/><br/>";
	　　newCellCartonNo.setAttribute("className","tablerclass");  
     }
     document.getElementById("jd-header").innerHTML=resultText+gMatches.length+recodeText;
	document.getElementById("jd-content").innerHTML="";
}


