/* index.js - info.freezr.demo.clickOnCheese2.OldBlueCheeseDb

	credits... Buzzer sound: www.wavsource.com/sfx/sfx.htm
 	Cheese Picture: pixabay.com/en/cheese-dairy-dairy-product-151032/
*/

var score = 0;
var top_score = 0;
var START_TIMER = 10000;
var time_reduction_factor = 0.9;
var time_limit = START_TIMER;
var time_counter;
var theCheese;  
var gameHasStarted = false;
var buzz = new Audio("static/buzzer_x.wav"); 


freezr.initPageScripts = function() {
	document.getElementById('user_id').innerHTML = freezr_user_id;
	theCheese = document.getElementById("cheesePict");
	resetCheese();

	document.addEventListener('click', function (evt) {
		console.log('touch start '+evt.target.id);
		handleClick(evt.target.id);
	});

	updateScoresFromDb();

}

var updateScoresFromDb = function() {
	freezr.db.query( 
		{	'collection':'scores',
			'sort_field':'_date_Created',
			'sort_desc':1,
			'count':1
		}, 
		gotLatestScore);
}

var gotLatestScore = function(returnJson) {
	returnJson = freezr.utils.parse(returnJson);
	console.log("got latest data "+JSON.stringify(returnJson));
	if (!returnJson.error && returnJson.data && returnJson.data.results && returnJson.data.results.length>0) {document.getElementById("lastScore").innerHTML = ""+(returnJson.data.results[0].score);}
	freezr.db.query(
		{	'collection':'scores',
			'sort_field':'score',
			'sort_desc':1,
			'count':1
		}, 
		gotHighestScore);	
} 
var gotHighestScore = function(returnJson){
	returnJson = freezr.utils.parse(returnJson);
	console.log("got highest score data "+JSON.stringify(returnJson));
	if (!returnJson.error && returnJson && returnJson.results && returnJson.results.length>0 && returnJson.results[0].score) {
		var newTopScore = parseInt(returnJson.results[0].score);
		top_score = Math.max(top_score,newTopScore);
		document.getElementById("top_score").innerHTML = ""+top_score;
	}
}

var handleClick = function(targetId) {
	clearTimeout(time_counter);
	if (targetId == "cheesePict") {
		score = score + Math.floor((window.innerWidth*window.innerHeight)/50000);
		document.getElementById("score").innerHTML = ""+(score);		
		if (score>top_score) {top_score=score; document.getElementById("top_score").innerHTML = ""+(score);}
		document.getElementById("errorBox").style.display="none";
		gameHasStarted=true;
		resetCheese();
	} else if (gameHasStarted) {
		missed_mouse();
	}
}

var resetCheese = function() {
	var topFactor, leftFactor;

	theCheese.style["-webkit-transition-duration"] = "10ms";
	theCheese.style["-webkit-transform"] = "scale3d(1, 1, 1)";
	theCheese.style["-webkit-transition-timing-function"] = ""

	time_limit = time_limit*time_reduction_factor;
	console.log("resetCheese - time_limit at "+time_limit)

	setTimeout(function() {
		if (score>0) {
			theCheese.style["-webkit-transition-duration"] = time_limit+"ms";
			theCheese.style["-webkit-transform"] = "scale3d(0.1, 0.1, 1)";
			theCheese.style["-webkit-transition-timing-function"] = "cubic-bezier(0, 0.3, .7, 1)";	
			topFactor = Math.random(); 
			leftFactor= Math.random();

			time_counter = setTimeout(function () { 
				timer_ran_out();
			}, time_limit);

		} else {
			topFactor = 0.5; leftFactor=0.5;
		}

		theCheese.style.left = Math.floor((window.innerWidth - 30)*leftFactor)+"px";
		theCheese.style.top = Math.floor((window.innerHeight - 30)*topFactor) + "px";

		console.log("win width "+window.innerWidth+" h "+window.innerHeight );
		console.log("setting mouse at "+Math.floor((window.innerWidth - 30)*leftFactor)+"px"+" "+Math.floor((window.innerHeight - 30)*topFactor) + "px");


	}, 30);

}

var timer_ran_out = function() {
	missed_mouse();
}

var missed_mouse = function (){ 
	gameHasStarted=false;
	clearTimeout(time_counter);
	console.log("missed mouse ");
	document.getElementById("errorBox").style.display="block";
	document.getElementById("lastScore").innerHTML = ""+(score);

	var dateNow = new Date().getTime();
	console.log("Now posting score "+score+" date "+dateNow);

	hideError();
	freezr.db.write({"score":score}, {collection:'scores'}, recordedScore);

	score=0;
	time_limit = START_TIMER;
	document.getElementById("score").innerHTML = "0";
	
	buzz.play();
	
	resetCheese();
}

var showError = function(errorText) {
console.log("Showing error: "+errorText);
  var errorBox=document.getElementById("errorBox");
  errorBox.innerHTML= errorText;
}
var hideError = function() {
  showError("");
}

var recordedScore = function(data) {
	console.log("recordedScore got confirm back "+JSON.stringify(data));
  if (!data) {
    console.log("Could not connect to server");
  } else if (data.error) {
  	showError("SORRY - There was an error storing your score in the freezr database.")
    console.log("Error sending data :"+data.message);
  } else {
    console.log("SUCCESS "+JSON.stringify(data));

  }
}

