// JavaScript Document
var content = document.getElementsByClassName("content");
var toCenter = document.getElementsByClassName("menu_row");
var filters = new Set();

function filterContent(filter) {
    // shows all content if you pass in ''
    if (filter == '') {
        filters = new Set();
    } else if (filters.has(filter)) {
        filters.delete(filter);
    } else {
        filters.add(filter);
    }
    
    console.log(filters);
	for (var i = 0; i < content.length; i++) {
		if (classInFilters(content[i])) {
			content[i].style.display = "inline-block";
		} else {
            content[i].style.display = "none";
        }
	}
}

function classInFilters(el) {
    var classes = el.className.split(' ');
    console.log(classes)
    var hasAllFilters = true;
    for (let filter of filters) {
        console.log(filter);
        hasAllFilters = hasAllFilters && classes.includes(filter);
    }
    return hasAllFilters;
}


function centerButtonText() {
    //console.log(toCenter);
    for (var i = 0; i < toCenter.length; i++) {
        //console.log(toCenter[i].style['height'])
        toCenter[i].style['lineHeight'] = toCenter[i].style['height'];
        //console.log(toCenter[i].style['lineHeight'])
	}
}
centerButtonText();

function enableNavigation() {
    var nav = document.getElementsByClassName('nav')[0];
    var dropDowns = nav.getElementsByTagName('ul');
    for (var i = 1; i < dropDowns.length; i++) { // Skip first, main ul
        dropDowns[i].classList.toggle('header_dropdown_ul');
        var adjacentTxtEl = dropDowns[i].parentNode.querySelector('a');
        console.log(adjacentTxtEl);
        adjacentTxtEl.onclick = function() {
            console.log(this);
            filterContent(this.textContent);
            var dropdown = this.parentElement.querySelector("ul");
            dropdown.classList.toggle("active");
            dropdown.classList.toggle("header_dropdown_ul");
        };
    }
}
enableNavigation();
