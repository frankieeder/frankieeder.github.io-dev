var DEFAULT_FILTER = 'frankie_eder';
var CURRENT_FILTER = DEFAULT_FILTER;
var args = getUrlVars();
var NAV;
//var Vimeo = require('vimeo').Vimeo;

//console.log("Content:", CONTENT, filteredContent())
// Trigger URL args as filter, if existent
//console.log("argsnav", args, NAV);
if (args.page) {
    CURRENT_FILTER = args.page;
}
//console.log("ahh", CURRENT_FILTER, NAV);

function getUrlVars() {
    /*
    Gets Variables from url input.

    Most relevant is args.page, which we use as our filter
    */
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
        vars[key] = decodeURI(value);
    });
    return vars;
}

function filteredContent() {
    /*
    Returns our Content JSON, but filtered to relevant info using CURRENT_FILTER
    set by getUrlVars();
    */
    var context = {
        filter: CURRENT_FILTER
    };
    console.log("Current Filter:", CURRENT_FILTER);
    function contentFilter(post) {
        //console.log("Attempting to filter post:", post, this.filter);
        return post.tags.includes(this.filter);
    };
    var filtered_contents = CONTENT.contents.filter(contentFilter, context);
    var new_content = {};
    Object.assign(new_content, CONTENT);
    new_content.contents = filtered_contents;
    //console.log("infunf", CURRENT_FILTER, CONTENT, filtered)
    return new_content;
}

function updateNav() {
    /*
    Updates navigation display according to the CURRENT_FILTER

    Returns a list representing the heirarchy of the input filter.
    */

    // Close all navigation
    // Inefficient, but should work fine with the limited number of NAV items
    var navLis = NAV.querySelectorAll('li')
    //console.log("navlis", navLis);
    var targetLi;
    for (var i = 0; i < navLis.length; i++) {
        //console.log('hi before', navLis[i], navLis[i].classList);
        navLis[i].classList.add('nav_inactive');
        navLis[i].classList.remove('nav_active');
        //console.log('hi after', navLis[i], navLis[i].classList);
        if (navLis[i].querySelector('a').textContent == CURRENT_FILTER) {
            targetLi = navLis[i];
        }
    }
    //console.log("targetLi:", targetLi);
    // Expand relevant nav dropdowns if the filter is found
    var hierarchy = [];
    if (targetLi) {
        //console.log(targetLi.tagName);
        // Expand the target and parents
        while (targetLi.tagName == 'LI') {
            var txt = targetLi.querySelector('a').textContent;
            //console.log(targetLi, txt);
            hierarchy.unshift(txt);
            targetLi.classList.add('nav_active');
            targetLi.classList.remove('nav_inactive');
            targetLi = targetLi.parentNode.parentNode; // heirarchy parent is two DOM levels up
        }
    }
    //console.log(hierarchy);
    return hierarchy;
}

function updateHistory(hierarchy) {
    /*
    Updates the url using the heirarchy input.
    */
    var suffix = hierarchy.join("/");
    window.history.pushState('', hierarchy[hierarchy.length-1], suffix);
}

function enableNav() {
    /*
    Enables responsiveness of navigation bar
    */
    // Select all clickable navigation elements
    var navItems = NAV.querySelectorAll('nav a');
    //console.log("Navitemsenablenave", navItems)
    for (var i = 0; i < navItems.length; i++) {
        var li = navItems[i].parentNode;
        // Make sure the parents of all clickable elements are inactive to hide
        li.classList.toggle('nav_inactive');
        var filter_text = navItems[i].textContent.replace(" ", "_ ");
        console.log("Filter_text", filter_text);
        li.id = filter_text;
        // Add Click Functionality
        navItems[i].onclick = function() {
            //console.log('filtering from click?');
            var li = this.parentNode;

            debugger;
            // Toggle Visibility & Color by changing classes
            li.classList.toggle('nav_active');
            li.classList.toggle('nav_inactive');

            var newFilter;
            // Filtering & structure updating
            if (li.classList.contains('nav_active')) {
                // Update Content
                //filterContent(this.textContent);
                newFilter = li.id;
            } else {
                //debugger;
                // TODO: this is potentially not the most elegant solution here.
                var superParent = li.parentNode.parentNode;
                if (superParent.tagName == "NAV") {
                    newFilter = DEFAULT_FILTER;
                } else {
                    newFilter = superParent.id;
                }
                // Update Content
                //filterContent(levelUpClickable.textContent);

            }
            updateFilter(newFilter);
        }
    }
    //console.log('nav anchors after', navItems);
}

function getTemplates() {
    /*
    Gets our template files, returning as a list.
    */
    var contents = fetch('static/templates/contents.mustache');
    var photo_scrollbox = fetch('static/templates/photo_scrollbox.mustache');
    var image = fetch('static/templates/image.mustache');
    var vimeo_embed = fetch('static/templates/vimeo_embed.mustache');
    return [contents, photo_scrollbox, image, vimeo_embed];
}

function renderBody() {
    /*
    Renders our filtered content using the active CURRENT_FILTER.
    */
    //console.log("RENDERING CONTENT", CONTENT, filteredContent());
    partials = {};
    Promise.all(getTemplates()).then(
      (result) => {
        var template_texts = [];
        for (var i = 0; i < result.length; i++) {
            template_texts[i] = result[i].text();
        }
        Promise.all(template_texts).then(
            templates => {
                var partials = {
                    photo_scrollbox: templates[1],
                    image: templates[2],
                    vimeo_embed: templates[3],
                }
                //console.log("Partials:", partials)
                var rendered = Mustache.render(templates[0], filteredContent(), partials);
                document.getElementById('contents').innerHTML = rendered;

                prepVimeoThumbnails(); // TODO: is this the best place?
            }
        )
        //console.log(result, template_texts);
      },
      (error) => {
         //console.log(error);
      }
    );
}

function initializeNav() {
    /*
    Initializes navigation after page load // TODO: ALL OF THESE NEED BETTER DOCS
    */
    //console.log(document, NAV);
    NAV = document.getElementsByTagName('nav')[0];
    //console.log(document, NAV);
    enableNav();
    refreshNav();

}

function refreshNav() {
    var hierarchy = updateNav(CURRENT_FILTER);
    updateHistory(hierarchy);
}

function updateFilter(tag) {
    CURRENT_FILTER = tag;
    refreshNav();
    renderBody();
}

function initializePage() {
    initializeNav();
    renderBody();
}

function prepVimeoThumbnails() {
    //console.log("Iframes incoming...");
    //debugger;
    var vimeos = document.querySelectorAll('.thumbnails div');
    //console.log("HELLO", vimeos.length)
    for (var i = 0; i < vimeos.length; i++) {
        // Nest function to preserve references to distinct local variables
        (function() {
            debugger;
            var vimeo_div_id = vimeos[i].id;
            var player = new Vimeo.Player(vimeo_div_id);
            //console.log(player);
            //var destroyed = player.destroy();
            //console.log(player, destroyed);

            var start = parseFloat(vimeos[i].getAttribute("loopstart"));
            var init = parseFloat(vimeos[i].getAttribute("loopthumb") ?? start);
            var interval = parseFloat(vimeos[i].getAttribute("loopend"));
            var end = parseFloat(start) + parseFloat(interval / 1000);

            player.on('timeupdate', function(update) {
                console.log("time1", update['seconds'], end, interval, (interval / 1000), start, update['seconds'] > end, player);
                if (update['seconds'] > end) {
                    player.setCurrentTime(start);
                }
            });

            var settingoutside = setVideoTime(player, init);
            console.log(settingoutside);

            player.pause().then(function() {
                console.log("Paused video.")
            }).catch(function(error) {
                switch (error.name) {
                case 'PasswordError':
                    // The video is password-protected
                    console.log("PasswordError.", error)
                    break;

                case 'PrivacyError':
                    // The video is private
                    console.log("PrivacyError.", error)
                    break;

                default:
                    // Some other error occurred
                    console.log("Other Error.", error)
                    break;
                }
            });
            var setTimePromise = player.setCurrentTime(init);
            var pausePromise = player.pause();
            console.log("Promises:", setTimePromise, pausePromise);
//            var player = new Vimeo.Player(vimeos[i]);
//            console.log("Vimeo Player", i, player, vimeos[i]);
//            var start = parseFloat(vimeos[i].getAttribute("loopstart"));
//            var init = parseFloat(vimeos[i].getAttribute("loopthumb") ?? start);
//            var interval = parseFloat(vimeos[i].getAttribute("loopend"));
//            var end = parseFloat(start) + parseFloat(interval / 1000);
//
//            var setTimePromise = player.setCurrentTime(init);
//            var pausePromise = player.pause();
//
//            // Enable Looping
//            player.on('timeupdate', function(update) {
//                console.log("time1", update['seconds'], end, interval, (interval / 1000), start, update['seconds'] > end, player);
//                if (update['seconds'] > end) {
//                    player.setCurrentTime(start);
//                }
//            });
//            console.log("Promises:", setTimePromise, pausePromise);
//            // Start playing when start hover
//            vimeos[i].onmouseenter = function() {
//                console.log("Attempting to play.", player);
//                console.log("Promises:", setTimePromise, pausePromise);
//                player.play();
//            }
//            // Stop playing when stop hover
//            vimeos[i].onmouseout = function() {
//                console.log("Attempting to pause.", player);
//                console.log("Promises:", setTimePromise, pausePromise);
//                player.pause();
//                player.setCurrentTime(init);
//            }
        })();
    }
    //console.log("Iframes incoming...", iframes);

}

function setVideoTime(player, seconds) {
	return player.setCurrentTime(seconds).then(function() {
		return player.play();
	});
}


function styleVimeoEmbeds(element) {
    /*
    Styles standalone Vimeo embeds to the correct aspect ratio
    TODO: Why does this not work? Promises are never fulfilled
    */
    var vimeos = document.querySelectorAll('.vimeo_iframe');
    //debugger;
    //console.log("HELLO", vimeos.length)
    for (var i = 0; i < vimeos.length; i++) {
        (function() {
            //debugger;
            var element = vimeos[i];
            var player = new Vimeo.Player(element);

            // Attempt Styling
            Promise.all([player.getVideoWidth(), player.getVideoHeight()]).then(function(dimensions) {

                console.log("Vimeo dims a", dimensions);
                var width = dimensions[0];
                var height = dimensions[1];
                var ar = height / width;
                console.log("Vimeo dims", width, height, ar);
                element.style['padding-top'] = ar;
            });

            // Enable looping
            //var player = new Vimeo.Player(vimeos[i]);
            var start = parseFloat(element.getAttribute("loopstart"));
            var init = parseFloat(element.getAttribute("loopthumb") ?? start);
            var interval = parseFloat(element.getAttribute("loopend"));
            var end = parseFloat(start) + parseFloat(interval / 1000);
            player.setCurrentTime(init);
            player.pause();

            // Enable Looping
            player.on('timeupdate', function(update) {
                //console.log("time1", update['seconds'], end, interval, (interval / 1000), start, update['seconds'] > end, player);
                if (update['seconds'] > end) {
                    player.setCurrentTime(start);
                }
            });
            // Start playing when start hover
            element.onmouseenter = function() {
                //console.log("Attempting to play.", player);
                player.play();
            }
            // Stop playing when stop hover
            element.onmouseout = function() {
                //console.log("Attempting to pause.", player);
                player.pause();
                player.setCurrentTime(init);
            }
        })();
    }

}
