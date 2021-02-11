function getTemplates() {
    var components = fetch('static/templates/contents.mustache');
    var photo_scrollbox = fetch('static/templates/photo_scrollbox.mustache');
    return [components, photo_scrollbox];
}

function renderBody() {
    console.log(CONTENT)
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
                    photo_scrollbox: templates[1]
                }
                var rendered = Mustache.render(templates[0], CONTENT, partials);
                document.getElementById('target').innerHTML = rendered;
            }
        )
        console.log(result, template_texts);
      },
      (error) => {
         console.log(error);
      }
    );
}