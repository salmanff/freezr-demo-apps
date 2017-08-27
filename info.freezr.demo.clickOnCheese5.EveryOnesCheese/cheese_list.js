/* cheese_list.js - info.freezr.demo.clickOnCheese5.EveryOnesCheese

	 credits... Buzzer sound: www.wavsource.com/sfx/sfx.htm
 	Cheese Picture: pixabay.com/en/cheese-dairy-dairy-product-151032/
*/

freezr.initPageScripts = function() {

	document.addEventListener('click', function (evt) {
		//onsole.log('touch start '+evt.target.id);
		if (freezr.utils.startsWith(evt.target.id,"cheesepict")) {
			choosePict(evt.target.id);
		} else if (freezr.utils.startsWith(evt.target.id,"sharepict")) {
			sharePict(evt.target);
		}  
	});


	var pictList = document.getElementsByTagName("IMG");
	if (pictList.length>0) {
		var theId;
		for (var i=0; i<pictList.length; i++) {
			theId = pictList[i].id.slice(11);
			if (freezr.utils.startsWith(pictList[i].id,'cheesepict')){
				pictList[i].src = freezr.utils.filePathFromId(theId,{'permission_name':'cheesepict'});
				if (pictList[i].getAttribute("data-access") == "info.freezr.demo.clickOnCheese5.EveryOnesCheese/cheese_share") {
					changeButtClass(theId, true)
				}
			}
		}
	}

}

var choosePict = function(targetId) {
	var real_id=targetId.slice(11);
	console.log("chose "+real_id);
	freezr.db.write({"pict_id":real_id}, {collection:'chosen-cheese'}, chosePict);
}
var chosePict = function(return_json) {
	return_json = freezr.utils.parse(return_json);
	if (return_json.error) {
		alert("got an error choosing picture")
	} else {
		window.open("index","_self");
	}
}
var sharePict = function(target) {
	var real_id=target.id.slice(10);
	var current_class = target.className;
	if (current_class == "cheesebutt pending"){
		console.log("wait")
	} else {
		var grant = (current_class=="cheesebutt unshared")? "grant":"deny";
		target.className = "cheesebutt pending";
		target.innerHTML = "..."
		console.log("share "+real_id+" share? "+grant);
		freezr.perms.setObjectAccess(shared, "cheese_share", real_id, {'shared_with_group':'logged_in', 'action':grant})
	}
}
var shared = function (return_json) {
	return_json = freezr.utils.parse(return_json);
	if (return_json.error) {
		alert("Error choosing picture")
		console.log(return_json)
	} else {
		theId = return_json.data_object_id
		changeButtClass(theId,return_json.grant);
	}
}
var changeButtClass = function (theId, shared){
	var sharebutt = document.getElementById("sharepict_"+theId);
	sharebutt.innerHTML = shared? "Stop Sharing this":"share";
	sharebutt.className = shared? "cheesebutt shared": "cheesebutt unshared";
}
