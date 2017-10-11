var config = {
	apiKey: "AIzaSyDHtPLBEckaSzTLao6gAAwO1ZGoAWYHm6A",
	authDomain: "train-schedule-d14bb.firebaseapp.com",
	databaseURL: "https://train-schedule-d14bb.firebaseio.com",
	projectId: "train-schedule-d14bb",
	storageBucket: "train-schedule-d14bb.appspot.com",
	messagingSenderId: "897292646843"
};
firebase.initializeApp(config);
var database = firebase.database();


$("#add-train").on("click", function(event){
	event.preventDefault();

	var data = {}; //holds the object that contains relevant table data that is passed to the firebase database
	var currTime = moment(); //get the current time
	var freq = $("#freq-input").val().trim(); //get the frequency of train arrivals from user input
	var firstTime = moment($("#first-time").val().trim(), "hh:mm a"); //get the first arrival of train and convert to a time
	var diff = "";
	//var diff = firstTime.diff(currTime, 'minutes'); //calculate the difference in minutes between current time and first arrival time
	var numArrivals = 0; //holds the number of arrivals between first arrival time and current time
	var minSinceFirstTime = 0; //holds the number of minutes that has transpired between first arrival time and most recent train arrival time
	var mostRecentArrival = ""; //holds the time for the most recent train arrival
	var minToNextArrival = 0; //holds the minutes until the next train arrival
	var timeNextArrival = ""; //holds the time of the next train arrival

	function(currTime, firstTime, freq){
		diff = firstTime.diff(currTime, 'minutes');
	}
	
	/*special case for when the current time is before the first train time, set next arrival time equal to the first train time and the minutes to next arrival equal to the difference between the current time and the first train time*/
	if(diff > 0){
		timeNextArrival = firstTime.format("hh:mm a");
		minToNextArrival = firstTime.diff(currTime, 'minutes');
	}

	/*for majority of cases when current time is after first train time, first calculate the number of arrivals between current time and first arrival time, then round it down to 0. Then calculate the number of minutes between the first arrival time and the most recent arrival time, followed by determining the most recent arrival time by adding the minutes between first arrival and most recent arrival. Then we can calculate the minutes to the next arrival by subtracting the difference between the current time and the most recent arrival time from the frequency. We can then determinen the next arrival time by adding this to the current time.*/
	else{
	  	numArrivals = diff/freq | 0;
	  	minSinceFirstTime = Math.abs(numArrivals * freq);
	  	mostRecentArrival = firstTime.add(minSinceFirstTime, 'minutes');
		minToNextArrival = freq - currTime.diff(mostRecentArrival, 'm');
		timeNextArrival = currTime.add(minToNextArrival, 'm').format("hh:mm a");
	}

	//stores the data into the data object
	data.name = $("#name-input").val().trim();
	data.dest = $("#dest-input").val().trim();
	data.freq = freq;
	data.nextArrival = timeNextArrival;
	data.minaway = minToNextArrival;

	//pushes the data object to the database
	database.ref().push(data);

});

//gets a snapshot of the data in the firebase database, then uses the data there to add to the corresponding table elements on the HTML page, then appends them to the table. 
database.ref().on("child_added", function(snapshot){
	var trainData = snapshot.val();

	var row = $("<tr>");
	var nameEl = $("<td>");
	nameEl.text(trainData.name);
	var destEl = $("<td>");
	destEl.text(trainData.dest);
	var freqEl = $("<td>");
	freqEl.text(trainData.freq);
	var nextArrivalEl = $("<td>");
	nextArrivalEl.text(trainData.nextArrival);
	var minAwayEl = $("<td>");
	minAwayEl.text(trainData.minaway);
	row.append(nameEl, destEl, freqEl, nextArrivalEl, minAwayEl);
	  
	$("#trains").append(row);
})