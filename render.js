var DEFAULT_FILTER = 'frankie_eder';
var CURRENT_FILTER = DEFAULT_FILTER;
var args = getUrlVars();
var NAV;

// Trigger URL args as filter, if existent
console.log("argsnav", args, NAV);
if (args.page) {
    CURRENT_FILTER = args.page;
}
console.log("ahh", CURRENT_FILTER, NAV);

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
    function contentFilter(post) {
        console.log("Attempting to filter post:", post, this.filter);
        return post.tags.includes(this.filter);
    };
    var filtered = CONTENT.contents.filter(contentFilter, context);
    console.log("infunf", CURRENT_FILTER, CONTENT, filtered)
    return {contents: filtered};
}
console.log(CURRENT_FILTER, CONTENT, filteredContent())

function updateNav() {
    /*
    Updates navigation display according to the CURRENT_FILTER

    Returns a list representing the heirarchy of the input filter.
    */

    // Close all navigation
    // Inefficient, but should work fine with the limited number of NAV items
    var navLis = NAV.querySelectorAll('li')
    console.log("navlis", navLis);
    var targetLi;
    for (var i = 0; i < navLis.length; i++) {
        console.log('hi before', navLis[i], navLis[i].classList);
        navLis[i].classList.add('nav_inactive');
        navLis[i].classList.remove('nav_active');
        console.log('hi after', navLis[i], navLis[i].classList);
        if (navLis[i].querySelector('a').textContent == CURRENT_FILTER) {
            targetLi = navLis[i];
        }
    }
    console.log("targetLi:", targetLi);
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
    console.log("Navitemsenablenave", navItems)
    for (var i = 0; i < navItems.length; i++) {
        var li = navItems[i].parentNode;
        // Make sure the parents of all clickable elements are inactive to hide
        li.classList.toggle('nav_inactive');
        li.id = navItems[i].textContent;
        // Add Click Functionality
        navItems[i].onclick = function() {
            //console.log('filtering from click?');
            var li = this.parentNode;

            // Toggle Visibility & Color by changing classes
            li.classList.toggle('nav_active');
            li.classList.toggle('nav_inactive');

            var newFilter;
            // Filtering & structure updating
            if (li.classList.contains('nav_active')) {
                // Update Content
                //filterContent(this.textContent);
                newFilter = this.textContent;
            } else {
                //debugger;
                var superParent = li.parentNode.parentNode;
                if (superParent.tagName == "NAV") {
                    newFilter = DEFAULT_FILTER;
                } else {
                    var levelUpClickable = superParent.querySelector('a');
                    newFilter = levelUpClickable.textContent;
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
    return [contents, photo_scrollbox, image];
}

function renderBody() {
    /*
    Renders our filtered content using the active CURRENT_FILTER.
    */
    console.log("RENDERING CONTENT", CONTENT, filteredContent());
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
                    image: templates[2]
                }
                console.log("Partials:", partials)
                var rendered = Mustache.render(templates[0], filteredContent(), partials);
                document.getElementById('contents').innerHTML = rendered;
            }
        )
        console.log(result, template_texts);
      },
      (error) => {
         console.log(error);
      }
    );
}

function initializeNav() {
    /*

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
