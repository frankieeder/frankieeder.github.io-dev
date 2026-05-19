var DEFAULT_FILTER = 'frankie_eder';
var CURRENT_FILTER = DEFAULT_FILTER;
var args = getUrlVars();
var NAV;

// Trigger URL args as filter, if existent
if (args.page) {
    CURRENT_FILTER = args.page;
}

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

function flattenMultiPhotoCards(contents) {
    var flattened = [];
    for (var i = 0; i < contents.length; i++) {
        var content = contents[i];
        var hasMultiPhotoScrollbox = false;
        var scrollboxRowIndex = -1;
        var scrollboxRow = null;

        for (var j = 0; j < content.rows.length; j++) {
            if (content.rows[j].type_photo_scrollbox &&
                content.rows[j].scrollcontent &&
                content.rows[j].scrollcontent.length > 1) {
                hasMultiPhotoScrollbox = true;
                scrollboxRowIndex = j;
                scrollboxRow = content.rows[j];
                break;
            }
        }

        if (hasMultiPhotoScrollbox) {
            for (var k = 0; k < scrollboxRow.scrollcontent.length; k++) {
                var newContent = {
                    tags: content.tags.slice(),
                    release_date: content.release_date,
                    rows: [],
                    is_multi_photo_group_item: true,
                    is_last_in_multi_photo_group: (k === scrollboxRow.scrollcontent.length - 1)
                };

                for (var m = 0; m < content.rows.length; m++) {
                    if (m === scrollboxRowIndex) {
                        var newScrollboxRow = JSON.parse(JSON.stringify(scrollboxRow));
                        newScrollboxRow.scrollcontent = [scrollboxRow.scrollcontent[k]];
                        newContent.rows.push(newScrollboxRow);
                    } else {
                        newContent.rows.push(content.rows[m]);
                    }
                }

                flattened.push(newContent);
            }
        } else {
            flattened.push(content);
        }
    }
    return flattened;
}

function filteredContent() {
    /*
    Returns the relevant content from our content JSON, but filtered as follows:
    - Only includes content containing CURRENT_FILTER in the tags
    - Only includes content with no release_date, or release_date < current datetime
    set by getUrlVars();
    - Flattens multi-photo cards into individual cards
    */
    var context = {
        filter: CURRENT_FILTER
    };
    //console.log("Current Filter:", CURRENT_FILTER);
    function contentFilter(post) {
        var released = true;
        if (this.filter === '_all') { // For debugging, will show all content.
            return true;
        }
        if (post.release_date) {
            var release_date = new Date(post.release_date);
            var now = new Date();
            released = release_date < now;
        }
        return post.tags.includes(this.filter) && released;
    };
    var filtered_contents = CONTENT.contents.filter(contentFilter, context);
    var flattened_contents = flattenMultiPhotoCards(filtered_contents);
    var new_content = {};
    Object.assign(new_content, CONTENT);
    new_content.contents = flattened_contents;
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
    var targetLi;
    for (var i = 0; i < navLis.length; i++) {
        navLis[i].classList.add('nav_inactive');
        navLis[i].classList.remove('nav_active');
        if (navLis[i].id == CURRENT_FILTER) {
            targetLi = navLis[i];
        }
    }
    // Expand relevant nav dropdowns if the filter is found
    var hierarchy = [];
    if (targetLi) {
        // Expand the target and parents
        while (targetLi.tagName == 'LI') {
            var txt = targetLi.id;
            hierarchy.unshift(txt);
            targetLi.classList.add('nav_active');
            targetLi.classList.remove('nav_inactive');
            targetLi = targetLi.parentNode.parentNode; // heirarchy parent is two DOM levels up
        }
    }
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
    for (var i = 0; i < navItems.length; i++) {
        var li = navItems[i].parentNode;
        // Make sure the parents of all clickable elements are inactive to hide
        li.classList.toggle('nav_inactive');
        var filter_text = navItems[i].textContent.replace(" ", "_");
        //console.log("Filter_text", filter_text);
        if (li.id === "") {
            li.id = filter_text;
        }
        // Add Click Functionality
        navItems[i].onclick = function() {
            var li = this.parentNode;

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
}

function getTemplates() {
    /*
    Gets our template files, returning as a list of Promises.
    */
    var timestamp = Date.now();
    return [
        fetch('static/templates/contents.mustache?v=' + timestamp),
        fetch('static/templates/photo_scrollbox.mustache?v=' + timestamp),
        fetch('static/templates/image.mustache?v=' + timestamp),
        fetch('static/templates/vimeo_embed.mustache?v=' + timestamp),
        fetch('static/templates/youtube_embed.mustache?v=' + timestamp),
        fetch('static/templates/soundcloud_embed.mustache?v=' + timestamp),
        fetch('static/templates/bandcamp_embed.mustache?v=' + timestamp),
        fetch('static/templates/standard_button.mustache?v=' + timestamp),
        fetch('static/templates/table.mustache?v=' + timestamp),
        fetch('static/templates/columns.mustache?v=' + timestamp),
    ];
}

function renderBody() {
    /*
    Renders our filtered content using the active CURRENT_FILTER.
    */
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
                    youtube_embed: templates[4],
                    soundcloud_embed: templates[5],
                    bandcamp_embed: templates[6],
                    standard_button: templates[7],
                    table: templates[8],
                    columns: templates[9],
                }
                var rendered = Mustache.render(templates[0], filteredContent(), partials);
                document.getElementById('contents').innerHTML = rendered;

                constrainVideoHeights();
                prepVimeoThumbnails();
            }
        )
      },
      (error) => {
         console.log(error);
      }
    );
}

function initializeNav() {
    /*
    Initializes navigation after page load // TODO: ALL OF THESE NEED BETTER DOCS
    */
    NAV = document.getElementsByTagName('nav')[0];
    enableNav();
    refreshNav();
    NAV.style.display = "block"; // Make Nav visible after it's correctly loaded

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

function disableRightClickAndDrag() {
    /* https://www.infradox.com/disable-right-clicking-dragging-images/ */
    $("img").mousedown(function(e){
         e.preventDefault()
    });

    $("img").on("contextmenu",function(e){
         return false;
    });
}

var STRIPE_PAYMENT_LINK_BASE_URL = 'https://buy.stripe.com/dRm4gz9BrfqS58N5KrdMI1b';
var PAYMENT_LINKS = null;

function loadPaymentLinks() {
    fetch('infra/stripe/payment_links.json')
        .then(response => response.json())
        .then(data => {
            PAYMENT_LINKS = data;
        });
}

function initializePage() {
    disableRightClickAndDrag();
    initializeNav();
    loadPaymentLinks();
    renderBody();
}


//---------
// Lightbox
//---------
function openLightBox(img_elem, caption) {
    pauseBackgroundVideo();

    var videoContainer = document.getElementById("lightbox-video-container");
    var lightboxVideo = document.getElementById("lightbox-video");
    if (videoContainer) {
        videoContainer.style.display = 'none';
        // Drop any per-video aspect ratio set by a prior openVideoLightBox
        // so it doesn't bleed into the next video open.
        videoContainer.style.removeProperty('--video-aspect-ratio');
    }
    if (lightboxVideo) {
        lightboxVideo.removeAttribute('src');
    }

    var buyPrintContainer = document.querySelector(".buy-print-container");
    if (buyPrintContainer) {
        buyPrintContainer.style.display = '';
    }

    var contentCard = null;
    var element = img_elem;
    while (element && !contentCard) {
        if (element.classList && element.classList.contains('content')) {
            contentCard = element;
        } else {
            element = element.parentElement;
        }
    }

    populateLightboxText(contentCard);

    if (caption === '') {
        if (contentCard) {
            var titleElement = contentCard.querySelector('h2.content-text-element');
            if (titleElement) {
                caption = titleElement.textContent;
            }
        }
    }
    if (caption) {
        document.getElementById("lightbox-title").textContent = caption;
    }

    var im_path = img_elem.firstElementChild.src.replace('_thumb', '');
    document.getElementById("lightbox-im").src = im_path;
    document.getElementById("lightbox-im").style.display = 'block';

    var url_parts = im_path.split('/');
    var image_id = url_parts[url_parts.length - 1];
    var request_print_elem = document.getElementById("lighbox-request-print");
    if (request_print_elem) {
        var prefix = 'mailto:frankaeder@gmail.com?subject=';
        var body = "&body=Hello there, I'd like a copy of image id " + image_id;
        request_print_elem.href = prefix + 'frankieeder.com Print Request' + body;
        request_print_elem.style.display = 'block';
    }

    var artwork_id = image_id.replace(/\.[^/.]+$/, '');
    var buy_print_elem = document.getElementById("lightbox-buy-print");
    var buy_print_dropdown = document.getElementById("lightbox-buy-print-dropdown");

    if (buy_print_elem) {
        buy_print_elem.style.display = 'block';
        if (PAYMENT_LINKS && Object.keys(PAYMENT_LINKS).length > 0) {
            buy_print_elem.href = '#';
        } else if (typeof STRIPE_PAYMENT_LINK_BASE_URL !== 'undefined' && STRIPE_PAYMENT_LINK_BASE_URL) {
            var buy_link = STRIPE_PAYMENT_LINK_BASE_URL + '?client_reference_id=' + encodeURIComponent(artwork_id);
            buy_print_elem.href = buy_link;
            buy_print_elem.onclick = null;
        } else {
            buy_print_elem.style.display = 'none';
        }
    }

    if (buy_print_dropdown) {
        buy_print_dropdown.innerHTML = '';
        buy_print_dropdown.style.display = 'none';
        if (PAYMENT_LINKS && Object.keys(PAYMENT_LINKS).length > 0) {
            var sizeOrder = ['4_6', '6_9', '8_12', '12_18', '16_24', '24_36', '32_48'];
            for (var i = 0; i < sizeOrder.length; i++) {
                var sizeKey = sizeOrder[i];
                if (PAYMENT_LINKS[sizeKey]) {
                    var linkData = PAYMENT_LINKS[sizeKey];
                    var priceDollars = (linkData.price_amount / 100).toFixed(2);
                    var sizeLabel = sizeKey.replace('_', '×');
                    var dropdownItem = document.createElement('a');
                    dropdownItem.href = linkData.url + '?client_reference_id=' + encodeURIComponent(artwork_id);
                    dropdownItem.target = '_blank';
                    dropdownItem.className = 'buy-print-dropdown-item';
                    dropdownItem.textContent = sizeLabel + ' - $' + priceDollars;
                    dropdownItem.style.display = 'block';
                    dropdownItem.style.width = '100%';
                    buy_print_dropdown.appendChild(dropdownItem);
                }
            }

            var buy_print_container = buy_print_dropdown.parentElement;
            if (buy_print_container && buy_print_container.classList.contains('buy-print-container')) {
                var dropdownVisible = false;

                buy_print_container.onmouseenter = function() {
                    if (!dropdownVisible) {
                        buy_print_dropdown.style.display = 'block';
                        buy_print_dropdown.style.opacity = '0';
                        setTimeout(function() {
                            buy_print_dropdown.style.transition = 'opacity 0.2s ease';
                            buy_print_dropdown.style.opacity = '1';
                        }, 10);
                    }
                };
                buy_print_container.onmouseleave = function(e) {
                    if (!dropdownVisible && !buy_print_container.contains(e.relatedTarget)) {
                        buy_print_dropdown.style.transition = 'opacity 0.15s ease';
                        buy_print_dropdown.style.opacity = '0';
                        setTimeout(function() {
                            if (!dropdownVisible) {
                                buy_print_dropdown.style.display = 'none';
                            }
                        }, 150);
                    }
                };
                buy_print_dropdown.onmouseenter = function() {
                    if (dropdownVisible) {
                        buy_print_dropdown.style.display = 'block';
                        buy_print_dropdown.style.opacity = '1';
                    }
                };
                buy_print_dropdown.onmouseleave = function(e) {
                    if (!dropdownVisible && !buy_print_container.contains(e.relatedTarget)) {
                        buy_print_dropdown.style.transition = 'opacity 0.15s ease';
                        buy_print_dropdown.style.opacity = '0';
                        setTimeout(function() {
                            if (!dropdownVisible) {
                                buy_print_dropdown.style.display = 'none';
                            }
                        }, 150);
                    }
                };

                var toggleDropdown = function(e) {
                    if (e) {
                        e.preventDefault();
                    }
                    dropdownVisible = !dropdownVisible;
                    buy_print_dropdown.style.display = dropdownVisible ? 'block' : 'none';
                    if (dropdownVisible) {
                        buy_print_dropdown.style.opacity = '0';
                        setTimeout(function() {
                            buy_print_dropdown.style.transition = 'opacity 0.2s ease';
                            buy_print_dropdown.style.opacity = '1';
                        }, 10);
                    } else {
                        buy_print_dropdown.style.transition = 'opacity 0.15s ease';
                        buy_print_dropdown.style.opacity = '0';
                    }
                    return false;
                };

                buy_print_elem.onclick = toggleDropdown;
            }
        }
    }

    var lightbox = document.getElementById("lightbox");
    lightbox.classList.add('visible');
    lightbox.classList.remove('hidden');
}

function populateLightboxText(contentCard) {
    if (!contentCard) {
        return;
    }

    var allElements = contentCard.querySelectorAll('.content-text-element, .content-html-element');
    var titleElement = null;
    var subtitleElement = null;
    var subheaderElement = null;
    var subsubtitleElement = null;
    var creditsElement = null;
    var htmlElements = [];

    for (var i = 0; i < allElements.length; i++) {
        var elem = allElements[i];
        if (elem.tagName === 'H2' && elem.classList.contains('content-text-element') && !titleElement) {
            titleElement = elem;
        } else if (elem.tagName === 'H4' && elem.classList.contains('content-text-element') && !subtitleElement) {
            subtitleElement = elem;
        } else if (elem.tagName === 'H4' && elem.classList.contains('content-text-element') && subtitleElement && !subheaderElement) {
            subheaderElement = elem;
        } else if (elem.tagName === 'H6' && elem.classList.contains('content-text-element') && !subsubtitleElement) {
            subsubtitleElement = elem;
        } else if (elem.tagName === 'H5' && elem.classList.contains('content-text-element') && !creditsElement) {
            creditsElement = elem;
        } else if (elem.classList.contains('content-html-element')) {
            htmlElements.push(elem);
        }
    }

    document.getElementById("lightbox-title").textContent = titleElement ? titleElement.textContent : '';
    document.getElementById("lightbox-subtitle").textContent = subtitleElement ? subtitleElement.textContent : '';
    document.getElementById("lightbox-subheader").textContent = subheaderElement ? subheaderElement.textContent : '';
    document.getElementById("lightbox-subsubtitle").textContent = subsubtitleElement ? subsubtitleElement.textContent : '';
    document.getElementById("lightbox-credits").textContent = creditsElement ? creditsElement.textContent : '';

    var htmlContainer = document.getElementById("lightbox-html");
    htmlContainer.innerHTML = '';
    for (var j = 0; j < htmlElements.length; j++) {
        var htmlContent = htmlElements[j].cloneNode(true);
        htmlContent.classList.remove('content-text-element', 'content-html-element');
        htmlContent.classList.add('lightbox-html-content');
        htmlContainer.appendChild(htmlContent);
    }
}

function closeLightBox() {
    playBackgroundVideo();

    document.getElementById("lightbox-im").removeAttribute('src');
    document.getElementById("lightbox-im").style.display = 'block';
    var videoContainer = document.getElementById("lightbox-video-container");
    var lightboxVideo = document.getElementById("lightbox-video");
    if (videoContainer) {
        videoContainer.style.display = 'none';
    }
    if (lightboxVideo) {
        lightboxVideo.removeAttribute('src');
    }
    document.getElementById("lightbox-title").textContent = '';
    document.getElementById("lightbox-subtitle").textContent = '';
    document.getElementById("lightbox-subheader").textContent = '';
    document.getElementById("lightbox-subsubtitle").textContent = '';
    document.getElementById("lightbox-credits").textContent = '';
    document.getElementById("lightbox-html").innerHTML = '';

    var buy_print_dropdown = document.getElementById("lightbox-buy-print-dropdown");
    if (buy_print_dropdown) {
        buy_print_dropdown.innerHTML = '';
    }

    var lightbox = document.getElementById("lightbox");
    lightbox.classList.remove('visible');
    lightbox.classList.add('hidden');
}

function openVideoLightBox(embedUrl, sourceType, caption, event, aspectRatio) {
    if (event) {
        event.stopPropagation();
    }
    pauseBackgroundVideo();

    document.getElementById("lightbox-im").style.display = 'none';

    var buyPrintContainer = document.querySelector(".buy-print-container");
    if (buyPrintContainer) {
        buyPrintContainer.style.display = 'none';
    }

    // Walk from the click target up to the .content tile so the lightbox
    // pulls title/subtitle/credits from the same source as the image path.
    var contentCard = null;
    var element = event ? event.target : null;
    while (element && !contentCard) {
        if (element.classList && element.classList.contains('content')) {
            contentCard = element;
        } else {
            element = element.parentElement;
        }
    }
    populateLightboxText(contentCard);

    var videoContainer = document.getElementById("lightbox-video-container");
    var lightboxVideo = document.getElementById("lightbox-video");

    // Match the lightbox container to the source video's aspect ratio so
    // non-16:9 videos (square, 4:3, cinematic) aren't letterboxed inside a
    // 16:9 frame.  aspectRatio comes from content.js as a padding-top
    // percentage ("100%" / "75%" / "41.43%"); width/height ratio = 100/X.
    // Empty / missing → fall back to the CSS default (16:9).
    if (aspectRatio) {
        var paddingPct = parseFloat(aspectRatio);
        if (paddingPct > 0 && isFinite(paddingPct)) {
            videoContainer.style.setProperty('--video-aspect-ratio', 100 / paddingPct);
        }
    } else {
        videoContainer.style.removeProperty('--video-aspect-ratio');
    }

    var autoplayUrl = embedUrl.indexOf('?') >= 0 ? embedUrl + '&autoplay=1' : embedUrl + '?autoplay=1';
    lightboxVideo.src = autoplayUrl;
    videoContainer.style.display = 'flex';

    if (caption && !contentCard) {
        document.getElementById("lightbox-title").textContent = caption;
    }

    var lightbox = document.getElementById("lightbox");
    lightbox.classList.remove('hidden');
    lightbox.classList.add('visible');
}


//------------
// Vimeo Stuff (to revisit)
//------------
function pauseBackgroundVideo() {
    var iframe = document.getElementById('fullscreen-bg__video');
    var player = new Vimeo.Player(iframe);
    player.pause();
}

function playBackgroundVideo() {
    var iframe = document.getElementById('fullscreen-bg__video');
    var player = new Vimeo.Player(iframe);
    player.play();
}

function constrainVideoHeights() {
    var iframeContainers = document.querySelectorAll('.content .iframe-container');
    var maxHeight = 300;

    for (var i = 0; i < iframeContainers.length; i++) {
        var container = iframeContainers[i];
        var iframe = container.querySelector('iframe');
        if (!iframe) {
            continue;
        }

        var parent = container.parentElement;
        var styleAttr = (container.getAttribute('style') || parent.getAttribute('style') || '');
        var paddingTopMatch = styleAttr.match(/padding-top:\s*([\d.]+)%/);
        var paddingTop = paddingTopMatch ? parseFloat(paddingTopMatch[1]) : null;

        if (!paddingTop || isNaN(paddingTop)) {
            var computedStyle = window.getComputedStyle(container);
            var computedPadding = computedStyle.paddingTop;
            var computedPaddingPx = parseFloat(computedPadding);
            if (computedPaddingPx && !isNaN(computedPaddingPx)) {
                var containerWidth = parseFloat(computedStyle.width);
                if (containerWidth && !isNaN(containerWidth) && containerWidth > 0) {
                    paddingTop = (computedPaddingPx / containerWidth) * 100;
                }
            }
        }

        var calculatedWidth;
        if (paddingTop && !isNaN(paddingTop) && paddingTop > 0) {
            calculatedWidth = maxHeight / (paddingTop / 100);
        } else {
            calculatedWidth = maxHeight * (16 / 9);
        }

        container.style.paddingTop = '0';
        container.style.width = calculatedWidth + 'px';
        container.style.height = maxHeight + 'px';
        container.style.maxHeight = maxHeight + 'px';
        container.style.removeProperty('--video-aspect-ratio');
    }
}

function prepVimeoThumbnails() {
    var vimeos = document.querySelectorAll('.thumbnails div');
    for (var i = 0; i < vimeos.length; i++) {
        // Nest function to preserve references to distinct local variables
        (function() {
            var vimeo_div_id = vimeos[i].id;
            var player = new Vimeo.Player(vimeo_div_id);

            var start = parseFloat(vimeos[i].getAttribute("loopstart"));
            var init = parseFloat(vimeos[i].getAttribute("loopthumb"));
            if (!init) {
                init = start;
            }
            var interval = parseFloat(vimeos[i].getAttribute("loopend"));
            var end = parseFloat(start) + parseFloat(interval / 1000);

            player.on('timeupdate', function(update) {
                //console.log("time1", update['seconds'], end, interval, (interval / 1000), start, update['seconds'] > end, player);
                if (update['seconds'] > end) {
                    player.setCurrentTime(start);
                }
            });

            var settingoutside = setVideoTime(player, init);
            //console.log(settingoutside);

            player.pause().then(function() {
                //console.log("Paused video.")
            }).catch(function(error) {
                switch (error.name) {
                case 'PasswordError':
                    // The video is password-protected
                    //console.log("PasswordError.", error)
                    break;

                case 'PrivacyError':
                    // The video is private
                    //console.log("PrivacyError.", error)
                    break;

                default:
                    // Some other error occurred
                    //console.log("Other Error.", error)
                    break;
                }
            });
            var setTimePromise = player.setCurrentTime(init);
            var pausePromise = player.pause();
            //console.log("Promises:", setTimePromise, pausePromise);
        })();
    }
}

function setVideoTime(player, seconds) {
	return player.setCurrentTime(seconds).then(function() {
		return player.play();
	});
}

//function styleVimeoEmbeds(element) {
//    /*
//    Styles standalone Vimeo embeds to the correct aspect ratio
//    TODO: Why does this not work? Promises are never fulfilled
//    */
//    var vimeos = document.querySelectorAll('.vimeo_iframe');
//    //debugger;
//    //console.log("HELLO", vimeos.length)
//    for (var i = 0; i < vimeos.length; i++) {
//        (function() {
//            //debugger;
//            var element = vimeos[i];
//            var player = new Vimeo.Player(element);
//
//            // Attempt Styling
//            Promise.all([player.getVideoWidth(), player.getVideoHeight()]).then(function(dimensions) {
//
//                console.log("Vimeo dims a", dimensions);
//                var width = dimensions[0];
//                var height = dimensions[1];
//                var ar = height / width;
//                console.log("Vimeo dims", width, height, ar);
//                element.style['padding-top'] = ar;
//            });
//
//            // Enable looping
//            //var player = new Vimeo.Player(vimeos[i]);
//            var start = parseFloat(element.getAttribute("loopstart"));
//            var init = parseFloat(element.getAttribute("loopthumb") ?? start);
//            var interval = parseFloat(element.getAttribute("loopend"));
//            var end = parseFloat(start) + parseFloat(interval / 1000);
//            player.setCurrentTime(init);
//            player.pause();
//
//            // Enable Looping
//            player.on('timeupdate', function(update) {
//                //console.log("time1", update['seconds'], end, interval, (interval / 1000), start, update['seconds'] > end, player);
//                if (update['seconds'] > end) {
//                    player.setCurrentTime(start);
//                }
//            });
//            // Start playing when start hover
//            element.onmouseenter = function() {
//                //console.log("Attempting to play.", player);
//                player.play();
//            }
//            // Stop playing when stop hover
//            element.onmouseout = function() {
//                //console.log("Attempting to pause.", player);
//                player.pause();
//                player.setCurrentTime(init);
//            }
//        })();
//    }
//
//}
