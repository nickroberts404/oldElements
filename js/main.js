(function(){
	
    // Initializes element dimensions.
    blockDimensions();
    
    // Initializes colors of elements.
    colorTable();

    // Inserts the element's symbol, atomic number, and atomic mass into the periodic table. 
    // Order is not important because they're absolutely positioned.
    writeToTable('number');
    writeToTable('symbol');
    writeToTable('mass');

    //Cycles through the list of ratios and applies them.
	for(ratioList in ratios){
		dynamicDimensions(ratioList, ratios[ratioList]);
	}

    // Changes dimensions upon resizing the window.
    $(window).on('resize', function(){
    	blockDimensions();
    	for(ratioList in ratios){
			dynamicDimensions(ratioList, ratios[ratioList]);
		}
    });

    // Executes the code to display or remove info from infobox
    $('#candyWrapper').on('mouseenter', '.element', displayElementInfo)
     				  .on('mouseleave', '.element', removeElementInfo);
    
    function displayElementInfo(){
    	var elementID = $(this).attr('id');
    	displayBackground(elementID);
    	displayGeneric(elementID, '#info-name', '', 'name', '');
    	displayGeneric(elementID, '#info-symbol', '', 'symbol', '');
    	displayGeneric(elementID, '#info-type', 'Type: ', 'type', '');
    	displayGeneric(elementID, '#info-number', 'Number: ', 'number', '');
    	displayGeneric(elementID, '#info-mass', 'Mass: ', 'mass', ' g/cm3');
    	displayGeneric(elementID, '#info-eneg', 'eNeg: ', 'electronegativity', '');
    }

    function displayBackground(elementID){
    	typeClass = theElements[elementID].type;
    	$('#infobox').addClass(typeClass);
    }

    function displayGeneric(elementID, selector, title, dataType, prefix){
    	var data = theElements[elementID][dataType];
    	if(data=='' || data== null) data = '<span class="nodata">no data</span>';
    	if(dataType == 'name') data = capitalize(data);
    	if(dataType == 'mass') data = Math.round(data * 1000) / 1000;
    	$(selector).html(title+data+prefix);
    }

    function removeElementInfo(){
    	var lastClass = $('#infobox').attr('class').split(' ').pop();
    	$('#infobox').removeClass(lastClass)
    				 .html('<div id="info-name"></div>'+
		                    '<div id="info-symbol"></div>'+
		                    '<div id="info-type"></div>'+
		                    '<div id="info-number"></div>'+
		                    '<div id="info-mass"></div>'+
		                    '<div id="info-eneg"></div>'+
		                    '<div id="info-density"></div>'+
		                    '<div id="info-boiling"></div>'+
		                    '<div id="info-melting"></div>'+
		                    '<div id="info-specific"></div>');
    }

    function capitalize(string){
    	return string.charAt(0).toUpperCase() + string.slice(1);
    }

    // Dynamically changes the dimensions of elements to fit in the window.
    function blockDimensions(){
        var newWidth = $('#candyWrapper').width()/18;
        $('td').css('width', newWidth)
        	   .css('height', newWidth);
    }

    // Takes a class (as a string) and an object that relates certain properties 
    // to ratios relying on the window's current width.
    function dynamicDimensions(selector, properties){
    	var windowWidth = window.innerWidth;
    	var theSelector = $(selector);
    	for(property in properties){
    		var style = property;
    		var ratio = properties[property];
    		newDimension = windowWidth*ratio
    		theSelector.css(style, newDimension);
    	}
    }
    
    // Appends a class to the elements based on their type.
    function colorTable(){
        for (element in theElements){
            var elementID = '#a'+theElements[element].number;
            var elementClass = theElements[element].type;
            $(elementID).addClass(elementClass);
        }
    }

    // Appends various values to the periodic table.
    function writeToTable(dataType){
    	for (element in theElements){
    		var elementID = '#a'+theElements[element].number;
    		if(dataType == 'mass') var dataValue = Math.round(theElements[element][dataType] * 100) / 100;
            else var dataValue = theElements[element][dataType];
            $(elementID).append('<div class="'+dataType+'">'+dataValue+'</div>');
    	}
    }
    
})();
