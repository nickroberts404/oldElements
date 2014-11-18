(function(){
	
  //////////////////////////
 ///// Initialize App./////
//////////////////////////

    //Table begins in traditional mode.
    var calculatorMode = false;
    var traditionalMode = true;

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

  /////////////////////////////////////////////
 ///// Functions for Basic Functionality./////
/////////////////////////////////////////////

    // Highlight certain types of elements depending on what color you hover over.
    // Does not change infobox color or add text when in calculator mode. 
    $('#candyWrapper').on('mouseenter', '.chooseType', highlightType)
                      .on('mouseleave', '.chooseType', unhighlightType);

    function highlightType(){
        var type = $(this).attr('class').split(' ').pop();
        $('.element').not('.'+type).addClass('grayscale');
        if(!traditionalMode) return false;
        $('#infobox').addClass(type);
        $('#info-typeBIG').html(type);
    }

    function unhighlightType(){
        var type = $(this).attr('class').split(' ').pop();
        $('.element').not('.'+type).removeClass('grayscale');
        if(!traditionalMode) return false;
        removeInfoboxBackground();
        $('#info-typeBIG').html('');
    }

  //////////////////////////////////////////
 ///// Functions for Traditional Mode./////
//////////////////////////////////////////


    // Executes the code to display or remove info from infobox
    $('#candyWrapper').on('mouseenter', '.element', displayElementInfo)
                      .on('mouseleave', '.element', removeElementInfo);

    function displayElementInfo(){
        if(!traditionalMode) return false;
        var elementID = $(this).attr('id');
        displayBackground(elementID);
        displayGeneric(elementID, '#info-name', '', 'name', '');
        displayGeneric(elementID, '#info-symbol', '', 'symbol', '');
        displayGeneric(elementID, '#info-type', '', 'type', '');
        displayGeneric(elementID, '#info-number', 'Number: ', 'number', '');
        displayGeneric(elementID, '#info-mass', 'Mass: ', 'mass', ' g/mol<sup>-1</sup>');
        displayGeneric(elementID, '#info-density', 'Density: ', 'density', ' g/cm<sup>3</sup>');
        displayGeneric(elementID, '#info-eneg', 'Electronegativity: ', 'electronegativity', '');
        displayGeneric(elementID, '#info-melting', 'Melting: ', 'melting', ' K');
        displayGeneric(elementID, '#info-boiling', 'Boiling: ', 'boiling', ' K');
        displayGeneric(elementID, '#info-specific', 'Specific Heat: ', 'specificheat', ' J/g&#8226;K');
    }

    // Adds appropriate "type" class to infobox as well as a top-border.
    function displayBackground(elementID){
        var infobox = $('#infobox');
        var typeClass = theElements[elementID].type;
        infobox.addClass(typeClass);
        infobox.css('border-top', '1px solid black');
    }

    // A factory function used to display element info in the infobox. Must include necessary spaces and colons in method call.
    function displayGeneric(elementID, selector, title, dataType, prefix){
        var data = theElements[elementID][dataType];
        if(data=='' || data== null) {
            data = '<span class="nodata">no data</span>'; 
            prefix = ''; }
        if(dataType == 'name') data = capitalize(data);
        if(dataType == 'mass') data = Math.round(data * 1000) / 1000;
        $(selector).html(title+data+prefix);
    }

    // Tried resetting html of infobox but this deleted the responsive styles connected to the components.
    function removeElementInfo(){
        if(!traditionalMode) return false;
        removeInfoboxBackground();
        $('#infobox').css('border-top', 'none');
        $('#info-name').html('');
        $('#info-symbol').html('');
        $('#info-type').html('');
        $('#info-number').html('');
        $('#info-mass').html('');
        $('#info-eneg').html('');
        $('#info-density').html('');
        $('#info-boiling').html('');
        $('#info-melting').html('');
        $('#info-specific').html('');
    }

    // Retrieves the last added class on infobox (we assume it is the "type" class) and removes it.
    function removeInfoboxBackground(){
        var infobox = $('#infobox');
        var lastClass = infobox.attr('class').split(' ').pop();
        infobox.removeClass(lastClass);
    }


  //////////////////////////////////////////
 //// Functions for Calculator Mode.//////
/////////////////////////////////////////
    
    var calculated = 0;
    var molecule = [];


    $('#candyWrapper').on('mousedown', '.element', function(event){
        if(!calculatorMode) return false;
        var elementID = $(this).attr('id');
        var button = event.which;
        calculateMass(elementID, button);
        modifyMolecule(elementID, button);
        $('#molecule-container').html(htmlifyMolecule(molecule));

    })

    // Toggles calculator mode.
    $('#calc-button').on('click', toggleCalculator);

    function toggleCalculator(){
        calculatorMode = !calculatorMode;
        traditionalMode = false;
        $('#calculator-container').slideToggle(200);
        if(calculatorMode){
            setTimeout(setCalculator, 200);
        } 
        else{
            traditionalMode = true;
            $('#calculator-screen').html('');
            $('#molecule-container').html('');
            molecule = [];
            calculated = 0;
        }
    }

    function setCalculator(){
        $('#calculator-screen').html(calculated.toFixed(4));
    }

    function calculateMass(elementID, button){
        var mass = parseFloat(theElements[elementID].mass);
        var isPresent = elementIndex(theElements[elementID].symbol)!= -1
        if(button === 1) calculated +=mass;
        if(button === 3 && isPresent) calculated -=mass;
        if(calculated<0) calculated = 0;
        setCalculator();
    }



  ////////////////////////////////////////////
 //// Functions for Molecule Stringing.//////
////////////////////////////////////////////



    function modifyMolecule(elementID, button){
        var element = theElements[elementID];
        var index = elementIndex(element.symbol);
        if(button == 1){
            if (index != -1){
                molecule[index][1]++;
                return true;
            } else{
                molecule.push([element.symbol, 1]);
            }
        } else if(button == 3){
            if (index != -1){
                molecule[index][1]--;
                if(molecule[index][1]<1){
                    molecule.splice(index, 1);
                }
                return true;
            } 
        }
    }

    function elementIndex(symbol){
        for(var i=0; i<molecule.length; i++){
            if(molecule[i][0] == symbol) return i;
        }
        return -1;
    }

    function htmlifyMolecule(molecule){
        var htmlMolecule = ''
        for(var i=0; i<molecule.length; i++){
            htmlMolecule += molecule[i][0]
            if(molecule[i][1] > 1) htmlMolecule +='<sub>'+molecule[i][1]+'</sub>';
        }
        return htmlMolecule;
    }

  ///////////////////////////////////////////////
 ///// Functions for Initializing the Table.////
///////////////////////////////////////////////


    // Appends various values to the periodic table.
    function writeToTable(dataType){
    	for (element in theElements){
    		var elementID = '#a'+theElements[element].number;
    		if(dataType == 'mass') var dataValue = Math.round(theElements[element][dataType] * 100) / 100;
            else var dataValue = theElements[element][dataType];
            $(elementID).append('<div class="'+dataType+'">'+dataValue+'</div>');
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


  ///////////////////////////////////////////////////
 //// Functions for Resizing and Ratio Control./////
///////////////////////////////////////////////////


    // Changes dimensions upon resizing the window.
    $(window).on('resize', function(){
        blockDimensions();
        for(ratioList in ratios){
            dynamicDimensions(ratioList, ratios[ratioList]);
        }
    });

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



  ///////////////////////////
 //// Random Functions./////
///////////////////////////

    // Capitalizes first letter of a string. Used to display element name.
    function capitalize(string){
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    // Disable context menu when right-clicking an element.
    $('.element').bind('contextmenu', function() {
        return false;
    });
    
})();
