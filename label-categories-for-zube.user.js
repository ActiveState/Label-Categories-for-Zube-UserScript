// ==UserScript==
// @name         Label Categories for Zube
// @namespace    http://activestate.com/
// @version      0.1
// @description  shows separate dropdowns for label categories (labels with name structure "category: label")
// @author       Nathan Rijksen
// @require      https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/6.18.2/babel.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/babel-polyfill/6.16.0/polyfill.js
// @match        https://zube.io/*
// ==/UserScript==

/* jshint ignore:start */
var inline_src = (<><![CDATA[
/* jshint ignore:end */
    /* jshint esnext: true */
    /* jshint esversion: 6 */
    
    var loadedFilters = {};
    var lastAddedFilterCategory;
    
    var loadFilterList = () =>
    {
        for (let c in loadedFilters)
            loadedFilters[c].remove();
        loadedFilters = {};
        
        var tagIcon = $(".filters-list .zubeicon-tag");
        if ( ! tagIcon.length)
            return whenElemExists(".filters-list .zubeicon-tag", loadFilterList);
        
        var parent = tagIcon.parents(".z-dropdown-container.filter");
        lastAddedFilterCategory = parent;
        
        parent.find(".select.data .options li").each(function()
        {
            var el = $(this).clone(true);
            var label = el.find("a").text().trim();
            var match = label.match(/([\w\s]+)\:\s(.*)/);
            if (match)
            {
                var category = match[1];
                var subLabel = match[2];
                
                if ( ! (category in loadedFilters))
                {
                    let cel = loadCategory(category, parent, lastAddedFilterCategory);
                    lastAddedFilterCategory = cel;
                }
                
                el.on("click", () =>
                {
                    setTimeout(() =>
                    {
                        loadFilterList();
                    }, 0);
                });
                
                let cel = loadedFilters[category];
                cel.find(".select.data .options").append(el);
                
                if (el.hasClass("selected"))
                    cel.find("button").addClass("active");
            }
        });
    };
    
    var loadCategory = (category, parent, after) =>
    {
        let cel = parent.clone(false);
        cel.addClass("__custom");
        cel.find("button .text").text(category);
        loadedFilters[category] = cel;
        cel.find(".select.data .options").empty();
        
        cel.on("click", function (e)
        {
            var menu = cel.find(".z-dropdown-menu");
            $(".__custom .z-dropdown-menu").not(menu).hide();
            menu.toggle();
        });
        
        cel.find("button.active").removeClass("active");
        cel.find(".select.top").remove(); // todo: implement filter and clear
        
        after.after(cel);
        return cel;
    };
    
    var whenElemExists = (selector, callback) =>
    {
        if ($(selector).length)
            return callback();
        setTimeout(whenElemExists.bind(this, selector, callback), 100);
    };
    
    var onLoad = () =>
    {
        whenElemExists(".nav-container", () =>
        {
            if ($(".kanban-link.active").length ||
                $(".sprintboard-link.active").length ||
                $(".issue-manager-link.active").length)
            {
                whenElemExists(".cards-container", loadFilterList);
            }
        });
    };
    
    onLoad();
    
    var currentHref = window.location.href;
    setInterval(() =>
    {
        if (currentHref != window.location.href)
        {
            currentHref = window.location.href;
            onLoad();
        }
    }, 500);
    
/* jshint ignore:start */
]]></>).toString();
var c = Babel.transform(inline_src, { presets: [ "es2015", "es2016" ] });
eval(c.code);
/* jshint ignore:end */