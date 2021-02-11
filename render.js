function renderBody() {
  fetch('static/templates/photo_scrollbox.html')
    .then((response) => response.text())
    .then((template) => {
      var rendered = Mustache.render(template, CONTENT);
      document.getElementById('target').innerHTML = rendered;
    });
}