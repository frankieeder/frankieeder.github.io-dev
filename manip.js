// JavaScript Document
var content = document.getElementsByClassName("content");
var nav = document.getElementsByTagName('nav')[0];
var DEFAULT_FILTER = 'home';


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
    updateNav(filter);
}

function showContent(filter) {
    if (!filter) { // Set to default
        console.log('Setting Default Filter')
        filter = DEFAULT_FILTER;
    }
	for (var i = 0; i < content.length; i++) {
		if (content[i].classList.contains(filter)) {
			content[i].style.display = "inline-block";
		} else {
            content[i].style.display = "none";
        }
	}
}

function updateNav(filter) {
    // Close all navigation
    // Inefficient, but should work fine with the limited number of nav items
    var navLis = nav.querySelectorAll('li')
    console.log(navLis);
    var targetLi;
    for (var i = 0; i < navLis.length; i++) {
        console.log('hi', navLis[i], navLis[i].classList);
        navLis[i].classList.add('nav_inactive');
        navLis[i].classList.remove('nav_active');
        console.log('hi', navLis[i], navLis[i].classList);
        if (navLis[i].querySelector('a').textContent == filter) {
            targetLi = navLis[i];
        }
    }
    console.log(targetLi);
    // Expand relevant nav dropdowns if the filter is found
    if (targetLi) {
        console.log(targetLi.tagName);
        // Expand the target and parents
        while (targetLi.tagName == 'LI') {
            console.log(targetLi);
            targetLi.classList.add('nav_active');
            targetLi.classList.remove('nav_inactive');
            targetLi = targetLi.parentNode.parentNode; // heirarchy parent is two DOM levels up
        }
    }
}

function enableNav() {
    // Select all clickable navigation elements
    var navItems = nav.querySelectorAll('nav li a');
    for (var i = 0; i < navItems.length; i++) {
        var li = navItems[i].parentNode;
        // Make sure the parents of all clickable elements are inactive to hide
        li.classList.toggle('nav_inactive');
        li.id = navItems[i].textContent;
        // Add Click Functionality
        navItems[i].onclick = function() {
            console.log('filtering from click?');
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
    console.log('nav anchors after', navItems);
}
enableNav();
console.log(args['page']);
filterContent(args['page']);

/*
function constructNavDict() {
    return navDictConstructor(nav);
}
function navDictConstructor(root) {
    var info = {}
    info['elem'] = root;
    info['text'] = root.children[0].text;
    info['children'] = [];
    var dropList = root.children[1];   
    console.log(info, dropList);
    if (dropList) {
        console.log(dropList.children);
        for (var i in dropList.children) {
            console.log(dropList.children[i]);
            info['children'].push(navDictConstructor(dropList.children[i]));            
        }
    }
    return info;
}
var heirarchy = constructNavDict();
console.log(heirarchy);*/

/* kills hover styles
function setButtonColors() {
    var minColor = '#d1e3ff';
    var maxColor = '#173b73';
    var buttonTexts = nav.querySelectorAll('li a');
    console.log(buttonTexts);
    for (var i in buttonTexts) {
        var button = buttonTexts[i];
        var numContent = document.getElementsByClassName(button.text).length;
        var color = lerpColor(minColor, maxColor, numContent / content.length);
        console.log(button, button.style, numContent, color);
        button.style['backgroundColor'] = color;
    }
    //setButtonColorsChildren(nav);
}
setButtonColors();
console.log(document.style);/*
/*
function setButtonColorsChildren(root) {
    var maxColor = '#d1e3ff';
    var minColor = '#173b73';
    var thisAnchor = root.children[0];
    var children = root.children[1];
    for (var i in buttonTexts) {
        
    }
    var thisAnchor = 
}

function filterContent(filter) {
    // shows all content if you pass in ''
    var refresh = false;
    if (filter == '') {
        refresh = true;
    }
	for (var i = 0; i < content.length; i++) {
		if (refresh || content[i].classList.contains(filter)) {
			content[i].style.display = "inline-block";
		} else {
            content[i].style.display = "none";
        }
	}
}

function updateNav(filter) {
    var navDir = filter.split('/');
    var currEl;    
    // Update Current URL
}

function findElementsFromText(root, txt) {
    return  document.evaluate("//a[contains(., '" + txt + "')]", document, null, XPathResult.ANY_TYPE, null );
}
function reconstructNavHierarchyFromLeaf(leaf) {
    var texts = nav.querySelectorAll('li a');
    for (var i = 0; i < texts.length; i++) {}
    
    return heirarchyReconstructor(nav, leaf, "");
}

function heirarchyReconstructor(el, key, prefix) {
    
    console.log(el);
    var currText = el.querySelector('a').textContent;
    if (currText == key) {
        return key;
    }
    var dropDown = el.querySelector('ul')
    if (dropDown) {
        for (var child in dropDown.childNodes) {
            return heirarchyReconstructor(child, key, prefix + currText);
        } 
    }
} */
/*
function enableNavigation() {
    /*var dropDowns = nav.getElementsByTagName('ul');
    for (var i = 1; i < dropDowns.length; i++) { // Skip first, main ul
        dropDowns[i].classList.toggle('header_dropdown_ul');
        var adjacentTxtEl = dropDowns[i].parentNode.querySelector('a');
        adjacentTxtEl.onclick = function() {
            var dropdown = this.parentElement.querySelector("ul");
            dropdown.classList.toggle("active");
            dropdown.classList.toggle("header_dropdown_ul");
        };
    }*\/
    
    var navOptions = nav.querySelectorAll('li a');
    for (var i = 0; i < navOptions.length; i++) {
        var dropdown = navOptions[i].parentElement.querySelector("ul");
        if (dropdown) {
            dropdown.classList.toggle('header_dropdown_ul');
            navOptions[i].onclick = function () {
                var dropdown = this.parentElement.querySelector("ul");
                console.log(this);
                console.log(dropdown);
                dropdown.classList.toggle("active");
                dropdown.classList.toggle("header_dropdown_ul");
            }
        } else {
            navOptions[i].onclick = function() {
                console.log(this);
                filterContent(this.textContent);
            };
        }
    }
}
enableNavigation();*/

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
