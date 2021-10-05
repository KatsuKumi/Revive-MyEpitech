// ==UserScript==
// @name         My Epitech Revival
// @namespace    http://tampermonkey.net/
// @version      0.6
// @description  Restauration des % de mouli
// @author       You
// @run-at       document-start
// @updateURL    https://github.com/KatsuKumi/Revive-MyEpitech/raw/master/My%20Epitech%20Revival.user.js
// @downloadURL  https://github.com/KatsuKumi/Revive-MyEpitech/raw/master/My%20Epitech%20Revival.user.js
// @require      https://code.jquery.com/jquery-3.5.1.min.js
// @require      https://gist.github.com/raw/2625891/waitForKeyElements.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/nanobar/0.4.2/nanobar.min.js
// @include      https://my.epitech.eu/*
// @grant        none
// ==/UserScript==

var current_index = 0;
var total_project = 0;
var started = 0;

var project_percent = [];

function addGlobalStyle(css) {
    var head, style;
    head = document.getElementsByTagName('head')[0];
    if (!head) { return; }
    style = document.createElement('style');
    style.type = 'text/css';
    style.innerHTML = css.replace(/;/g, ' !important;');
    head.appendChild(style);
}

addGlobalStyle(".nanobar { width: 100%; height: 10px; z-index: 9999; top:0 }");
addGlobalStyle(".project-bar-green>.bar { height: 100%; transition: height .3s; background:#2bd41c;}")
addGlobalStyle(".project-bar-orange>.bar { height: 100%; transition: height .3s; background:#d48d1c;}")
addGlobalStyle(".project-bar-red>.bar { height: 100%; transition: height .3s; background:#ae1010;}")

function get_percent(name) {
    var percent_i = 0;
    project_percent.forEach(function(percent){
        if (percent.name == name) {
             percent_i = percent.percent;
        }
    });
    return (percent_i);
}

function calculate_percent(project) {
    var total = 0;
    var passed = 0;
    for (const [key, skill] of Object.entries(project.results.skills)) {
        total += skill.count;
        passed += skill.passed;
    }
    return ((passed/total*100).toFixed(2));
}

function process_project(project) {
    let percent = calculate_percent(project);
    console.log("Percent for project " + project.project.name + " : " + percent + "%");
    current_index++;
    project_percent.push({"name" : project.project.name, "percent" : percent});
}

function find_color(pourcent) {
    if (pourcent < 25.0)
        return 'project-bar-red';
    else if (pourcent < 75.0)
        return 'project-bar-orange';
    else
        return 'project-bar-green';
}


const origOpen = XMLHttpRequest.prototype.open;
XMLHttpRequest.prototype.open = function() {
    this.addEventListener('load', function() {
        if (this.responseURL.startsWith("https://api.epitest.eu/me/20")) {
            started = 0;
            console.log("#####################REQUEST####################");
            var json = JSON.parse(this.responseText,null,2);
            total_project = json.length;
            json.forEach(project => process_project(project));
        }
        if (this.responseURL.startsWith("https://api.epitest.eu/me/details")) {
            started = 0;
        }
    });
    origOpen.apply(this, arguments);
};

waitForKeyElements(".mdl-typography--text-left", start);
function start() {
    if (started == 0) {
        console.log("#####################STARTED####################");
        console.log(project_percent);
        started = 1;

        if ($(".lint-details")[0]) { // On details page
            var cell = $( ".project-cell" )[0];
            var div = $(cell).children()[0];
            var name = $($(".mdl-typography--text-left")[0]).text();
            $($(".mdl-typography--text-left")[0]).text(name + " : " + get_percent(name) + "%");
            console.log($(cell).children[0]);
            var options = {
                classname: find_color(get_percent(name)),
                target: div
            };
            var nanobar = new Nanobar( options );
            nanobar.go(get_percent(name));
            $(div).css("padding", "0");
            console.log($($(div).children()[1])[0]);
            $($(div).children()[1]).css({"padding-left": "1%", "padding-right": "1%", "padding-top": "1%", "width": "98%"});
            $($(div).children()[2]).css({"padding-left": "1%", "padding-right": "1%", "width": "98%"});
        } else { // On list page
            $( ".project-cell" ).each(function( index ) {
                var name = $($($($($( this ).children()[0]).children()[0]).children()[0]).children()[0]).text();
                $($($($($( this ).children()[0]).children()[0]).children()[0]).children()[0]).html(name + " : " + get_percent(name) + "%");
                console.log(index + ": " + name);
                console.log(find_color(name) + " : " + name);
                var options = {
                    classname: find_color(get_percent(name)),
                    target: this
                };
                var nanobar = new Nanobar( options );
                nanobar.go(get_percent(name));
            });
        }
    }
}
