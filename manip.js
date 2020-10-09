// JavaScript Document
var content = document.getElementsByClassName("content");
var nav = document.getElementsByTagName('nav')[0];
var DEFAULT_FILTER = 'frankie_eder';


function getUrlVars() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
        vars[key] = decodeURI(value);
    });
    return vars;
}
var args = getUrlVars();

function filterContent(filter) {
    showContent(filter);
    var hierarchy = updateNav(filter);
    updateHistory(hierarchy);
}

function showContent(filter) {
    if (!filter) { // Set to default
        console.log('Setting Default Filter')
        filter = DEFAULT_FILTER;
    }
    filter = filter.replace(/ /g, "_");
    var found = false;
	for (var i = 0; i < content.length; i++) {
		if (content[i].classList.contains(filter)) {
			content[i].style.display = "inline-block";
            found = true;
		} else {
            content[i].style.display = "none";
        }
	}
    return found;
}

function updateNav(filter) {
    // Returns a list representing the heirarchy of the input filter.

    // Close all navigation
    // Inefficient, but should work fine with the limited number of nav items
    var navLis = nav.querySelectorAll('li')
    //console.log(navLis);
    var targetLi;
    for (var i = 0; i < navLis.length; i++) {
        //console.log('hi', navLis[i], navLis[i].classList);
        navLis[i].classList.add('nav_inactive');
        navLis[i].classList.remove('nav_active');
        //console.log('hi', navLis[i], navLis[i].classList);
        if (navLis[i].querySelector('a').textContent == filter) {
            targetLi = navLis[i];
        }
    }
    //console.log(targetLi);
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
    var suffix = hierarchy.join("/");
    window.history.pushState('', hierarchy[hierarchy.length-1], suffix);
}

function enableNav() {
    // Select all clickable navigation elements
    var navItems = nav.querySelectorAll('nav a');
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

            // Filtering & structure updating
            if (li.classList.contains('nav_active')) {
                // Update Content
                filterContent(this.textContent);
            } else {
                var levelUpClickable = li.parentNode.parentNode.querySelector('a');
                // Update Content
                filterContent(levelUpClickable.textContent);
            }
        }
    }
    //console.log('nav anchors after', navItems);
}

function startVimeoLoops() {
    //console.log("Iframes incoming...");
    var vimeos = document.querySelectorAll('.thumbnails iframe');
    //console.log("HELLO", vimeos.length)
    for (var i = 0; i < vimeos.length; i++) {
        var interv = 1000
        console.log("Setting interval...", vimeos[i].getAttribute("playstart"), vimeos[i].getAttribute("playloop"));
        var player = new Vimeo.Player(vimeos[i]);
        player.setCurrentTime(vimeos[i].getAttribute("playstart"));
        setInterval(
            function(p, t) {
                console.log("running player", p, t);
                p.setCurrentTime(t);
            },
            vimeos[i].getAttribute("playloop"),
            player,
            vimeos[i].getAttribute("playstart")
        );
    }
    //console.log("Iframes incoming...", iframes);

}
enableNav();
console.log(args['page']);
startVimeoLoops();
filterContent(args['page']);
console.log("TEST");


/* https://gist.github.com/rosszurowski/67f04465c424a9bc0dae*/
function lerpColor(a, b, amount) {

    var ah = parseInt(a.replace(/#/g, ''), 16),
        ar = ah >> 16, ag = ah >> 8 & 0xff, ab = ah & 0xff,
        bh = parseInt(b.replace(/#/g, ''), 16),
        br = bh >> 16, bg = bh >> 8 & 0xff, bb = bh & 0xff,
        rr = ar + amount * (br - ar),
        rg = ag + amount * (bg - ag),
        rb = ab + amount * (bb - ab);

    return '#' + ((1 << 24) + (rr << 16) + (rg << 8) + rb | 0).toString(16).slice(1);
}
