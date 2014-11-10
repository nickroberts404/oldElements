(function(){
    dimensions();
    $(window).on('resize', function(){
        dimensions();
        return true;
    });
    // Dynamically changes the dimensions of elements to fit in the window.
    function dimensions(){
        var newWidth = $('#candyWrapper').width();
        var tableData = $('td');
        tableData.css('width', newWidth/18);
        tableData.css('height', newWidth/18);
        return true;
    }
})();