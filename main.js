App = {};
function getRootCss(property) {
    return $(document.documentElement).css(property);
}

function setRootCss(property, value) {
    return $(document.documentElement).css(property, value);
}
$(function () {
    App.ProgressBar = new ProgressBarCommon(_.range(100), '');
    App.ProgressBar.render();
    App.ProgressBar.start();
});