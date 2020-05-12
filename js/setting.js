var isDarkTheme = false;
document.addEventListener('DOMContentLoaded', function () {
    var elems = document.querySelectorAll('.sidenav');
    var instances = M.Sidenav.init(elems, {});
    var drop = document.querySelectorAll('.dropdown-trigger');
    var drop_instances = M.Dropdown.init(drop, {});
    var drop_in_nav = document.querySelectorAll('.collapsible-header');
    var drop_instances = M.Dropdown.init(drop_in_nav, {});

    value = window.localStorage.getItem('color-theme');
    if (value == null) {
        mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        if (mediaQuery.matches == true) {
            changeDarkMode();
        }
    } else {
        if (value == 'dark'){
            changeDarkMode();
        } else {
            changeLightMode();
        }
    }
});

function setThemeSetting(value) {
    window.localStorage.setItem('color-theme', value);
}

function changeLightMode() {
    document.documentElement.setAttribute('theme', 'light');
    console.log("Light");
    isDarkTheme = false;
    document.getElementById("theme").text = "ダークテーマにする(IE非対応)";
}
function changeDarkMode() {
    document.documentElement.setAttribute('theme', 'dark');
    isDarkTheme = true;
    document.getElementById("theme").text = "ライトテーマにする(IE非対応)";
    console.log("Dark");
}

$(function() {
    $('#theme').click(function(){
        if(isDarkTheme){
            changeLightMode();
            $('#theme').text("ダークテーマにする(IE非対応)");
            setThemeSetting('light');
        } else {
            changeDarkMode();
            $('#theme').text("ライトテーマにする(IE非対応)");
            setThemeSetting('dark');
        }
    })
});

$(document).ready(function(){
    $('.tabs').tabs();
});