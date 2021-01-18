// Built from http://www.askyb.com/javascript/load-json-file-locally-by-js-without-jquery/
function loadJSON(callback) {
    var xobj = new XMLHttpRequest();
    console.log(xobj)
    xobj.overrideMimeType("application/json");
    xobj.open('GET', 'default_args.json', true);
    xobj.onreadystatechange = function () {
        console.log("inside function:", xobj);
        if (xobj.readyState == 4 && xobj.status == "200") {

        // .open will NOT return a value but simply returns undefined in async mode so use a callback
        callback(xobj.responseText);

        }
    }
    xobj.send(null);

}

// Call to function with anonymous callback
loadJSON(function(response) {
    // Do Something with the response e.g.
    jsonresponse = JSON.parse(response);

    // Assuming json data is wrapped in square brackets as Drew suggests
    console.log(jsonresponse);

});