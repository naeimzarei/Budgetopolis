$(document).ready(function() {

	//console.log("ready");
	var happiness = 85;

	var generateHappiness = function(happiness){
		if(happiness >= 81){
			//display super happy face
			console.log("super Happy");
			$('#face').attr("src", "./images/superHappy.png");
			createHappyPopup(happiness);
		} else if(happiness >= 61 && happiness < 81){
			//display happy face
			$('#face').attr("src", "./images/happy.png");
			createHappyPopup(happiness);
		} else if(happiness >= 41 && happiness < 61){
			//display neutral face
			$('#face').attr("src", "./images/neutral.png");
			createHappyPopup(happiness);
		} else if(happiness >= 21 && happiness < 41){
			//display sad face
			$('#face').attr("src", "./images/sad.png");
			createHappyPopup(happiness);
		} else{
			//display super sad face
			$('#face').attr("src", "./images/superSad.png");
			createHappyPopup(happiness);
		}
	}

	var createHappyPopup = function(happiness){
		$('#hPopup').hover(function () {
			$('.speech-bubble').text("Your approval rating is " + happiness + "%. Make decisions supporting your values to make your citizens happy!");
    		$('.speech-bubble').css({"display" : "block"});
  		}, function () {
    		$('.speech-bubble').css({"display" : "none"});
  		}
		);
	}

	generateHappiness(happiness);

});