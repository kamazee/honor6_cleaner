function returnMenu(){
	window.jsInterface.returnMenu();
}

function searchContent(){
	window.jsInterface.searchContent(3);
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

function isOwnPage(){
	var themeColor = window.jsInterface.getSkinHexColor();
	if(themeColor == "ffe05a6d"){
		document.getElementsByTagName("body")[0].className = "pink";
	}
	else if(themeColor == "ff9e7837"){
		document.getElementsByTagName("body")[0].className = "white";
	}
	else if(themeColor == "ccdc7832"){
		document.getElementsByTagName("body")[0].className = "taste";
	}
	else if(themeColor == "ff23a7d9"){
		// 蓝色无需给body赋�?
	}
	window.jsInterface.setOwnPage();
}

document.body.onload =isOwnPage;
