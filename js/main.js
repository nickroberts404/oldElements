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
    	displayName(elementID);
    	displaySymbol(elementID);
    	displayNumber(elementID);
    	displayMass(elementID);
    	displayENeg(elementID);
    }

    function displayBackground(elementID){
    	typeClass = theElements[elementID].type;
    	$('#infobox').addClass(typeClass);
    }

    function displayName(elementID){
    	var name = capitalize(theElements[elementID].name);
    	$('#info-name').html(name);
    }

    function displaySymbol(elementID){
    	var symbol = theElements[elementID].symbol;
    	$('#info-symbol').html(symbol);
    }

    function displayNumber(elementID){
    	var number = theElements[elementID].number;
    	$('#info-number').html('Number: '+number);
    }

    function displayMass(elementID){
    	var mass = theElements[elementID].mass;
    	$('#info-mass').html('Mass: '+mass+' g/cm3');
    }

    function displayENeg(elementID){
    	var eneg = theElements[elementID].electronegativity;
    	if(eneg =='') eneg = '<span class="nodata">no data</span>'
    	$('#info-eneg').html('eNeg: '+eneg);
    }

    function removeElementInfo(){
    	$('#info-name').html('');
    	$('#info-symbol').html('');
    	$('#info-number').html('');
    	$('#info-mass').html('');
    	$('#info-eneg').html('');
    	var lastClass = $('#infobox').attr('class').split(' ').pop();
    	$('#infobox').removeClass(lastClass);
    }

    function capitalize(string){
    	return string.charAt(0).toUpperCase() + string.slice(1);
    }

    // Dynamically changes the dimensions of elements to fit in the window.
    function blockDimensions(){
        var newWidth = $('#candyWrapper').width()/18;
        $('td').css('width', newWidth)
        	   .css('height', newWidth);
        console.log("Width: "+$('td').width()+" Height: "+$('td').height());
    }

    // Takes a class (as a string) and an object that relates certain properties 
    // to ratios relying on the window's current width.
    function dynamicDimensions(selector, properties){
    	console.log(selector+"-----"+properties);
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
