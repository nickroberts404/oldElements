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
        displayGeneric(elementID, '#info-mass', 'Mass: ', 'mass', ' g/mol');
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
        modifyMolecule(elementID, button);
        var prettyMolecule = htmlifyMolecule(molecule);
        var uglyMolecule = uglifyMolecule(prettyMolecule);
        $('#calculator-type').val(uglyMolecule);
        calculated = moleculeMass(molecule);
        setCalculator();
        $('#molecule-container').html(prettyMolecule);
    })

    // Toggles calculator mode.
    $('#calc-button').on('click', toggleCalculator);

    $('#calculator-clear').on('click', function(){
        calculatorReset();
        setCalculator();
    });

    $('#calculator-type').on('keyup', typeMass);

    function typeMass(){
        var theString = $('#calculator-type').val();
        if(!hasUnpairedParentheses(theString)){
            molecule = readMolecule(theString);
            var theMass = moleculeMass(molecule);
            if(typeof theMass == "string") {
                $('#calculated-mass').html('');
                $('#prefix').html('');
                $('#error').html(theMass+' is not an element');
            }
            else{
                calculated = theMass;
                setCalculator();
            }
            $('#molecule-container').html(htmlifyMolecule(molecule));
        }
    }

    function toggleCalculator(){
        calculatorMode = !calculatorMode;
        traditionalMode = false;
        $('#calculator-container').slideToggle(200);
        if(calculatorMode){
            setTimeout(setCalculator, 200);
        } 
        else{
            traditionalMode = true;
            calculatorReset();
        }
    }

    function calculatorReset(){
        $('#calculated-mass').html('');
        $('#error').html('');
        $('#prefix').html('');
        $('#molecule-container').html('');
        $('#calculator-clear').html('');
        $('#calculator-type').val('');
        molecule = [];
        calculated = 0;
    }

    function setCalculator(){
        $('#calculated-mass').html(calculated.toFixed(4));
        $('#error').html('');
        $('#prefix').html("g/mol");
        $('#calculator-clear').html("clear");
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

    function moleculeMass(molecule){
        mass = 0;
        for(var i=0; i<molecule.length; i++){
            var mySymbol = molecule[i][0];
            if(typeof mySymbol == "object") mass+=moleculeMass(mySymbol)*molecule[i][1];
            else {
                var assoc = elementsAssoc("symbol", mySymbol, "mass");
                if(assoc == false) return mySymbol;
                else mass += parseFloat(assoc)*molecule[i][1];
            }
        }
        return mass;
    }

    function elementIndex(symbol){
        for(var i=0; i<molecule.length; i++){
            if(molecule[i][0] == symbol) return i;
        }
        return -1;
    }

    // Places the molecule into sweet html format. Basically just adds parentheses and subscript for quantity. Returns some html.
    function htmlifyMolecule(molecule){
        // We'll build the htmlified molecule through concatenation... is that how you spell it?
        var htmlMolecule = ''
        for(var i=0; i<molecule.length; i++){
            //If the symbol variable of this array is another array, we have a parentheses block.
            // Run htmlifyMolecule agin with just this array and place parentheses around it.
            if(typeof molecule[i][0] =="object") htmlMolecule+="("+htmlifyMolecule(molecule[i][0])+")";
            //Everything is good, display the symbol variable!
            else htmlMolecule += molecule[i][0]
            // If the quantity variable is 1, don't display anything. Otherwise add subscript.
            if(molecule[i][1] > 1) htmlMolecule +='<sub>'+molecule[i][1]+'</sub>';
        }
        return htmlMolecule;
    }

    function uglifyMolecule(text){
        text = text.replace(/<sub>/g, '');
        text = text.replace(/<\/sub>/g, '');
        return text;
    }

    // Takes a type of chemical formula from user and formats it in a way that my program can read it. Returns a molecule object.
    function readMolecule(theString){
        // console.log("readMolecule("+theString+")");
        // Initializes molecule array.
        var molecule = [];
        // Sets index as -1, that way the first push will increment the index to 0.
        var index = -1;
        var firstNum = true;
        theString= theString.charAt(0).toUpperCase()+theString.slice(1); 
        // Turns brackets into parentheses. I don't actually know what brackets are for in chemical formulas!
        theString = theString.replace("[", "(");
        theString = theString.replace("]", ")");
        // Iterates through the current string, pushing a new array for every new element 
        //and altering quantity when it gets to a number.
        for(var i=0; i<theString.length; i++){
            // Sets current to the current charcter, beginning with the first.
            var current = theString.charAt(i);
            // isNumber will indicate whether current is a number...shouldn't have even written this.
            var isNumber = !isNaN(current);
            // If it is NOT a number, we either have a parentheses or letter.
            if(!isNumber){
                // current is a parentheses!
                if(current == "("){
                    // Sends findParenSpan the rest of the string(opening parentheses not included) and finds out
                    // how long this parentheses block is. That way I know where to jump my i to, and what
                    // to send to readMolecule.
                    var parenSpan =findParenSpan( theString.slice(i+1), 1);    
                    // Breaks code if parentheses arent matched. I could fix this.  
                    if(parenSpan== 0) return true;
                    // console.log("parenSpan: "+parenSpan);
                    // Just places what I'll send to readMolecule in a little package.
                    // Slices the string into just the parentheses block.
                    var parenBlock = theString.slice(i+1, i+parenSpan-1);
                    // console.log("parenBlock: "+parenBlock);
                    // Creates a recursive call to readMolecule and pushes results into current molecule.
                    // This is to allow multiple layers of parentheses.
                    molecule.push([readMolecule(parenBlock), 1]);
                    // Pushes index forward.
                    firstNum=true;
                    index++;
                    // Pushes i forward, that way the for loop does not iterate over the charcters 
                    // handled in the recursive call.
                    i+=parenSpan-1;
                }
                // current must be a letter. 
                //If its uppercase, we'll create a new element in our molecule.
                else if(current == current.toUpperCase()){
                    // The quantity variable is automatically set to one.
                    molecule.push([current, 1]);
                    // Allows us to add double digit numbers. 
                    firstNum=true;
                    index++;
                } 
                // Neat, its a lowercase letter, it must belong to the last element created.
                // This is why we are keeping track of index.
                else{
                    molecule[index][0]+=current;
                }
            // Oh geez, we have a number. Replace the current index's quantity variable with the number.
            // This works with more than one number. 
            } else if(isNumber){
                if(firstNum) molecule[index][1]=current;
                else molecule[index][1]+=current;
                firstNum=false;
            }
        }
        return molecule;
    }

    // Finds the length that a parentheses block spans.
    function findParenSpan(theString, starting){
        console.log("findParenSpan("+theString+")");
        // Automatic length of one. This is what we will return after string iteration.
        var length = starting;
        // order will be treated like a stack. We start with one because there has definately been one open parentheses.
        // For opening parentheses we will add 1, for closing we will subtract one.
        // Once we get an order of 0, length wil be returned.
        // We can't just search for the next closing parentheses because there may be multiple layers.
        var order = 1;
        for(var i=0; i< theString.length; i++){
            var current = theString.charAt(i);
            length++; 
            if(current == "(") order++;
            else if(current ==")") order--;
            if(order==0) return length;
        }
        // Wait, we have an opening paren but no closing? THE F!?
        // console.log("Unmatched parentheses!");
        return 0;
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

    // Searches for asociating values, for example, what is the mass of an element with symbol "Ni"?
    function elementsAssoc(search, searchValue, target){
        for(element in theElements){
            if(theElements[element][search] == searchValue) return theElements[element][target];
        }
        return false;
    }

    function hasUnpairedParentheses(theString){
        var stack = 0;
        for(var i=0; i<theString.length; i++){
            var current = theString.charAt(i);
            if(current == "(") stack++;
            else if(current == ")") stack--;
        }
        if(stack==0) return false;
        else return true;
    }
    
})();
