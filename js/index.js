$(document).ready(function () {

 	var loadHTML = '<div class="load">';
 	loadHTML += '<span></span>';
 	loadHTML += '<span></span>';
 	loadHTML += '<span></span>';
 	loadHTML += '</div>';
  
	var favourites = JSON.parse(localStorage.getItem("TWL-favourites"));
	$('#favourites-section').html(loadHTML); //display loading animation
	displayFavouritesSection();
	
	// WHEN STAR IS CLICKED
	$(document).on("click",".result-item .title i", function () {

		var resultItem = $(this).parents(".result-item");
		var clickedResultKey = resultItem.attr("data-key");
		var newFavourite = true;

		$.each(favourites, function name(key, val) {
			if(val == clickedResultKey){
				newFavourite = false;
			}
		});

		if(newFavourite == true){
			addFavourite(resultItem, clickedResultKey);
		}
		else{
			removeFavourite(clickedResultKey);
		}
	});

	// REMOME ITEM FROM FAVOURITES
	function removeFavourite(key){
		$(".result-item[data-key='" + key + "']").removeClass("favourited"); //remove class
		favourites.splice($.inArray(key, favourites), 1);
	   	localStorage.setItem("TWL-favourites", JSON.stringify(favourites));
		displayFavouritesSection();
	}

	// ADD ITEM TO FAVOURITES
	function addFavourite(element, key){
		element.addClass("favourited"); //add class
		favourites.push(key);
		localStorage.setItem("TWL-favourites", JSON.stringify(favourites));
		displayFavouritesSection();
	}

	// DISPLAY FAVOURITES SECTION (if there are any favourites)
	function displayFavouritesSection(){
		if(favourites == null){
			favourites = [];
		}
		if(favourites.length == 0){
			$("#favourites-section").hide();
		}
		else{
			$("#favourites-section").show();
			displayFavouriteItems();
		}
	}

	// LOAD INFORMATION INTO THE FAVOURITES SECTION
	function displayFavouriteItems(){

		$.getJSON('https://secure.toronto.ca/cc_sr_v1/data/swm_waste_wizard_APR?limit=1000', function(data){
			var output = "";
			output += "<h2>Favourites</h2>"

			$.each(favourites, function name(key, val) {

				output += '<div class="result-item favourited" data-key="' + val + '">';
        		output += '<div class="title">';
		        output += '<span><i class="fas fa-star"></i></span>';
          		output += '<h3>' + data[val].title + '</h3>';
        		output += '</div>';

        		var html = $('<textarea />').html(data[val].body).text();
        		output += '<div class="description">';
          		output += html;
        		output += '</div>';
        		output += '</div>';
			});

			$('#favourites-section').html(output);
		});
	}

	//set default text to prompt the user to perform a search
	var defaultSearchPromptText = '<div class="no-results">';
	defaultSearchPromptText += 'Enter a keyword above to search for waste items <br/> in the Toronto Waste Wizard database';
	defaultSearchPromptText += '</div>';

	$('#results-section').html(defaultSearchPromptText);

	// CLEAR SEARCH RESULTS
	$('#search-input').on("input", function() {
		var searchKeyword = $('#search-input').val();
		if(searchKeyword == ""){
			$('#results-section').empty();

			$('#results-section').html(defaultSearchPromptText);

			setHeightOfFavourites();
		}
	});

	var specialChars = "!@#$%^&*()?:{}|<>]\\";

	// DISPLAY RESULTS WHEN FORM IS SUBMITTED
	$('#search-form').submit(function(e){

		e.preventDefault();

		var searchKeyword = $('#search-input').val();

		if(searchKeyword != ""){

			//check if keyword has special characters (and add a backslash before the special char)
			for(var i = 0; i < searchKeyword.length; i++){
				for(var j = 0; j < specialChars.length; j++){
	        		if(searchKeyword[i] == specialChars[j]){
						searchKeyword = [searchKeyword.slice(0, i), "\\", searchKeyword.slice(i)].join('');
						i++;
						break;
					}
				}
		    }

		    //create regexp from search
			var myExp = new RegExp(searchKeyword, "i");

			$('#results-section').html(loadHTML); //display loading animation

			$.getJSON('https://secure.toronto.ca/cc_sr_v1/data/swm_waste_wizard_APR?limit=1000', function(data){
				var output = "";

				$.each(data, function name(key, val) {

					if(val.title.search(myExp) != -1 || 
						val.body.search(myExp) != -1 || 
						val.category.search(myExp) != -1 || 
						val.keywords.search(myExp) != -1){
						output += '<div class="result-item" data-key="' + key + '">';
		        		output += '<div class="title">';
		        		output += '<span><i class="fas fa-star"></i></span>';
		          		output += '<h3>' + val.title + '</h3>';
		        		output += '</div>';

		        		var html = $('<textarea />').html(val.body).text();
		        		output += '<div class="description">';
		          		output += html;
		        		output += '</div>';
		        		output += '</div>';
					}
				});

				if(output == ""){ //if no results found
					output += '<div class="no-results">';
					output += 'Sorry, we couldn\'t find any matches for ' + $('#search-input').val();
					output += '<p>Please try searching with another term</p>';
	        		output += '</div>';
				}

				$('#results-section').html(output); //add text to results section
				addFavouriteClasses(); //add class to favourited items
				setHeightOfFavourites();
			});
		}

		setHeightOfFavourites();
	});

	function addFavouriteClasses(){
		$.each(favourites, function name(key, val) {
			$('[data-key="' + val + '"]').addClass("favourited");
		});
	}


	setHeightOfFavourites();

	function setHeightOfFavourites(){
		var height = parseInt($('.container').css('min-height'))
			- $('#header-section').outerHeight() 
			- $('#search-section').outerHeight() 
			- $('#results-section').outerHeight()
			- 20;

		if(height < 0){
			height = 0;
		}
		$('#favourites-section').css('min-height', height);
	}

	$( window ).resize(function() {
		setHeightOfFavourites();
	});

});
