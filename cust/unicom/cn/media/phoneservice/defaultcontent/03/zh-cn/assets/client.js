function returnMenu()
{
	window.jsInterface.returnMenu();
}

function searchContent()
{
	window.jsInterface.searchContent();
}

function goParent()
{   
    var obj = document.getElementById("parentUrl");
    if (obj != null && obj.value != null && obj.value != "")
    {
        var targUrl = obj.value;
        window.location.href = targUrl;
    }    
    else
    {
        returnMenu();
    }    
}
