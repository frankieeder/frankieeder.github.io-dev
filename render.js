function renderHello() {
  fetch('static/templates/photo_scrollbox.html')
    .then((response) => response.text())
    .then((template) => {
      var rendered = Mustache.render(template,
        {
            title: "Crow's Landing II",
            subtitle: "2020-08-13",
            imgs: [
                "67/DSC00378",
                "67/DSC00384"
            ]
        }
      );
      document.getElementById('target').innerHTML = rendered;
    });
}