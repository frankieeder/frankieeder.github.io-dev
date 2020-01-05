// JavaScript Document
var content = document.getElementsByClassName("content");
var toCenter = document.getElementsByClassName("menu_row");
var filters = new Set();

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

function enableNavigation() {
    var nav = document.getElementsByClassName('nav')[0];
    var dropDowns = nav.getElementsByTagName('ul');
    for (var i = 1; i < dropDowns.length; i++) { // Skip first, main ul
        dropDowns[i].classList.toggle('header_dropdown_ul');
        var adjacentTxtEl = dropDowns[i].parentNode.querySelector('a');
        adjacentTxtEl.onclick = function() {
            var dropdown = this.parentElement.querySelector("ul");
            dropdown.classList.toggle("active");
            dropdown.classList.toggle("header_dropdown_ul");
        };
    }
    
    var navOptions = nav.querySelectorAll('li a');
    for (var i = 0; i < navOptions.length; i++) {
        navOptions[i].onclick = function() {
            console.log(this);
            filterContent(this.textContent);
            var dropdown = this.parentElement.querySelector("ul");
            if (dropdown) {
                dropdown.classList.toggle("active");
                dropdown.classList.toggle("header_dropdown_ul");
            }
        };
    }
}
enableNavigation();
