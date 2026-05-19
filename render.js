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
        var scrollboxRowIndex = -1;
        var scrollboxRow = null;
        var sameTypeIndexes = null;  // indices of the duplicated type, if any
        var typeCounts = { image: [], vimeo: [], youtube: [] };

        for (var j = 0; j < content.rows.length; j++) {
            var row = content.rows[j];
            if (row.type_photo_scrollbox && row.scrollcontent && row.scrollcontent.length > 1) {
                scrollboxRowIndex = j;
                scrollboxRow = row;
            } else if (row.type_image) typeCounts.image.push(j);
            else if (row.type_vimeo) typeCounts.vimeo.push(j);
            else if (row.type_youtube) typeCounts.youtube.push(j);
        }

        // Split into one tile per media item when MULTIPLE of the SAME type
        // exist (e.g. two vimeos, two images).  Different-type combinations
        // (scrollbox + vimeo) are thematically grouped — keep composed.
        for (var t in typeCounts) {
            if (typeCounts[t].length > 1) {
                sameTypeIndexes = typeCounts[t];
                break;
            }
        }

        if (scrollboxRow && !sameTypeIndexes && typeCounts.image.length + typeCounts.vimeo.length + typeCounts.youtube.length === 0) {
            // Pure photo gallery — split per scrollbox photo.
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
                        var splitScrollbox = JSON.parse(JSON.stringify(scrollboxRow));
                        splitScrollbox.scrollcontent = [scrollboxRow.scrollcontent[k]];
                        newContent.rows.push(splitScrollbox);
                    } else {
                        newContent.rows.push(content.rows[m]);
                    }
                }
                flattened.push(newContent);
            }
        } else if (sameTypeIndexes) {
            // Multiple of the same media type — split into one tile each.
            for (var k = 0; k < sameTypeIndexes.length; k++) {
                var newContent = {
                    tags: content.tags.slice(),
                    release_date: content.release_date,
                    rows: [],
                    is_multi_photo_group_item: true,
                    is_last_in_multi_photo_group: (k === sameTypeIndexes.length - 1)
                };
                for (var m = 0; m < content.rows.length; m++) {
                    var r = content.rows[m];
                    var isSplittable = (r.type_image && typeCounts.image.length > 1) ||
                                       (r.type_vimeo && typeCounts.vimeo.length > 1) ||
                                       (r.type_youtube && typeCounts.youtube.length > 1);
                    if (!isSplittable || m === sameTypeIndexes[k]) {
                        newContent.rows.push(r);
                    }
                }
                flattened.push(newContent);
            }
        } else {
            // Single media, mixed types, or text-only — keep as one tile.
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
                constrainImageHeights();
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
        videoContainer.style.removeProperty('--video-aspect-ratio');
        videoContainer.style.removeProperty('width');
        videoContainer.style.removeProperty('height');
        delete videoContainer.dataset.fitDone;
    }
    if (lightboxVideo) {
        lightboxVideo.removeAttribute('src');
    }

    var buyPrintContainer = document.querySelector(".buy-print-container");
    if (buyPrintContainer) {
        buyPrintContainer.style.display = '';
    }

    var contentCard = img_elem ? img_elem.closest('.content') : null;
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
    var lightboxIm = document.getElementById("lightbox-im");
    delete lightboxIm.dataset.fitDone;
    lightboxIm.style.width = '';
    lightboxIm.style.height = '';
    lightboxIm.onload = fitImageToLightbox;
    lightboxIm.src = im_path;
    lightboxIm.style.display = 'block';
    if (lightboxIm.complete && lightboxIm.naturalWidth > 0) {
        fitImageToLightbox();
    }

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

    var lightboxIm = document.getElementById("lightbox-im");
    lightboxIm.removeAttribute('src');
    lightboxIm.style.display = 'block';
    lightboxIm.style.width = '';
    lightboxIm.style.height = '';
    delete lightboxIm.dataset.fitDone;
    lightboxIm.onload = null;
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

    var contentCard = event && event.target ? event.target.closest('.content') : null;
    populateLightboxText(contentCard);

    var videoContainer = document.getElementById("lightbox-video-container");
    var lightboxVideo = document.getElementById("lightbox-video");

    var paddingPct = parseFloat(aspectRatio);
    if (Number.isFinite(paddingPct) && paddingPct > 0) {
        videoContainer.style.setProperty('--video-aspect-ratio', 100 / paddingPct);
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

    requestAnimationFrame(function () { requestAnimationFrame(fitVideoToLightbox); });
}

function fitMediaToViewport(aspectRatio, captionHeight) {
    var M = Math.max(24, Math.min(window.innerWidth, window.innerHeight) * 0.05);
    var maxH = Math.max(80, window.innerHeight - 2 * M - captionHeight);
    var maxW = Math.max(80, window.innerWidth - 2 * M);
    var width = Math.min(maxH * aspectRatio, maxW);
    return { width: width, height: width / aspectRatio };
}

function fitVideoToLightbox() {
    var container = document.getElementById("lightbox-video-container");
    var caption = document.querySelector(".lightbox-caption-container");
    if (!container || !caption || container.style.display === 'none') return;

    var aspectRatio = parseFloat(getComputedStyle(container).getPropertyValue('--video-aspect-ratio'));
    if (!Number.isFinite(aspectRatio) || aspectRatio <= 0) aspectRatio = 16 / 9;

    var dims = fitMediaToViewport(aspectRatio, caption.offsetHeight);
    container.style.width = dims.width + 'px';
    container.style.height = dims.height + 'px';
    container.dataset.fitDone = '1';
}

function fitImageToLightbox() {
    var img = document.getElementById("lightbox-im");
    var caption = document.querySelector(".lightbox-caption-container");
    if (!img || !caption || img.style.display === 'none') return;
    if (!img.naturalWidth || !img.naturalHeight) return;

    var dims = fitMediaToViewport(img.naturalWidth / img.naturalHeight, caption.offsetHeight);
    img.style.width = dims.width + 'px';
    img.style.height = dims.height + 'px';
    img.dataset.fitDone = '1';
}

window.addEventListener('resize', function () {
    fitVideoToLightbox();
    fitImageToLightbox();
});


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
    var TILE_HEIGHT = 300;
    document.querySelectorAll('.content').forEach(function (card) {
        var mediaItems = card.querySelectorAll('.iframe-container, .scrollbox');
        if (mediaItems.length === 0) return;
        // Composed tiles (multiple media sub-rows) split the tile-height
        // budget evenly so the card matches its single-media neighbors.
        var perItemHeight = Math.floor(TILE_HEIGHT / mediaItems.length);

        var iframeWidths = [];
        mediaItems.forEach(function (item) {
            if (item.classList.contains('iframe-container')) {
                resizeIframeContainer(item, perItemHeight);
                var w = parseFloat(item.style.width);
                if (w > 0) iframeWidths.push(w);
            } else if (item.classList.contains('scrollbox')) {
                item.style.maxHeight = perItemHeight + 'px';
                item.querySelectorAll('img').forEach(function (img) {
                    img.style.maxHeight = perItemHeight + 'px';
                });
            }
        });

        // For composed tiles, force every sub-row to the same width as the
        // (narrowest) aspect-locked iframe — iframes can't be stretched
        // without distorting, scrollboxes can scroll horizontally to absorb
        // the size difference.
        if (mediaItems.length > 1 && iframeWidths.length > 0) {
            var targetWidth = Math.min.apply(null, iframeWidths);
            mediaItems.forEach(function (item) {
                if (item.classList.contains('scrollbox')) {
                    item.style.width = targetWidth + 'px';
                    item.style.maxWidth = targetWidth + 'px';
                    item.style.overflowX = 'auto';
                    item.style.overflowY = 'hidden';
                }
            });
        }
    });
}

function resizeIframeContainer(container, maxHeight) {
    var iframe = container.querySelector('iframe');
    if (!iframe) return;

    var parent = container.parentElement;
    var styleAttr = (container.getAttribute('style') || parent.getAttribute('style') || '');
    var paddingTopMatch = styleAttr.match(/padding-top:\s*([\d.]+)%/);
    var paddingTop = paddingTopMatch ? parseFloat(paddingTopMatch[1]) : null;

    if (!paddingTop || isNaN(paddingTop)) {
        var computedStyle = window.getComputedStyle(container);
        var computedPaddingPx = parseFloat(computedStyle.paddingTop);
        var containerWidth = parseFloat(computedStyle.width);
        if (computedPaddingPx > 0 && containerWidth > 0) {
            paddingTop = (computedPaddingPx / containerWidth) * 100;
        }
    }

    var calculatedWidth = paddingTop > 0
        ? maxHeight / (paddingTop / 100)
        : maxHeight * (16 / 9);

    container.style.paddingTop = '0';
    container.style.width = calculatedWidth + 'px';
    container.style.height = maxHeight + 'px';
    container.style.maxHeight = maxHeight + 'px';
    container.style.removeProperty('--video-aspect-ratio');
}

function constrainImageHeights() {
    var maxHeight = 300;
    var imgs = document.querySelectorAll('.content img');
    for (var i = 0; i < imgs.length; i++) {
        (function (img) {
            if (img.closest('.scrollbox')) return;  // scrollbox thumbnails have their own sizing
            var apply = function () {
                if (!img.naturalWidth || !img.naturalHeight) return;
                if (img.naturalHeight <= maxHeight) return;
                var aspect = img.naturalWidth / img.naturalHeight;
                img.style.height = maxHeight + 'px';
                img.style.width = (maxHeight * aspect) + 'px';
                img.removeAttribute('width');
            };
            if (img.complete) apply();
            else img.addEventListener('load', apply, { once: true });
        })(imgs[i]);
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
