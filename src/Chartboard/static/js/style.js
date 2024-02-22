/**
 * amazing and beatufil tool, thanks to @JamesPadolsey
 * https://j11y.io/javascript/regex-selector-for-jquery/
 */
jQuery.expr[":"].regex = function(elem, index, match) {
    let matchParams = match[3].split(","),
        validLabels = /^(data|css):/,
        attr = {
            method: matchParams[0].match(validLabels) ?
                        matchParams[0].split(":")[0] : "attr",
            property: matchParams.shift().replace(validLabels, "")
        },
        regexFlags = "ig",
        regex = new RegExp(matchParams.join("").replace(/^\s+|\s+$/g, ""), regexFlags);
    return regex.test(jQuery(elem)[attr.method](attr.property));
};

/**
 * Dynamicaly add Flipforward class to tile, regardind the dashboard.yml config
 * @param flippingContainer
 */
function addFlipClasses(flippingContainer) {
    $.each($(flippingContainer).find(".tile"), function (idx, elem) {
        if (idx === 0) {
            $(elem).addClass("flippedforward");
        }
        $(elem).addClass("flippable");
    });
}

/**
 * return the flip time for a nodeHtml (representing card)
 * @param node
 * @returns {number}
 */
function getFlipTime(node) {
    let classStr = $(node).attr("id");
    let flipTime = 10000;
    $.each(classStr.split(" "), function (idx, val) {
        let groups = /flip-time-(\d+)/.exec(val);
        if (Boolean(groups) && groups.length > 1) {
            flipTime = groups[1];
            flipTime = parseInt(flipTime, 10) * 1000;
            return false;
        }
    });
    return flipTime;
}

/**
 * Get the in the Id of every card(<div>) the flip-time-(seconds) and init it if there is one
 */
function initCardWithFlip() {
    let flipContainers = $("div[id*=\"flip-time-\"]");
    $.each(flipContainers, function (idx, flippingContainer) {
        addFlipClasses(flippingContainer);
        let flipInterval = getFlipTime(flippingContainer);
        setInterval(function () {
            let nextFlipIdx;
            let containerFlips = $(flippingContainer).find(".flippable");
            $(containerFlips).each(function (index, tile) {
                if ($(tile).hasClass("flippedforward")) {
                    nextFlipIdx = (index + 1) % containerFlips.length;
                    $(tile).removeClass("flippedforward");
                    return false; // break
                }
            });
            if (typeof (nextFlipIdx) !== "undefined") {
                let tileToFlip = containerFlips[parseInt(nextFlipIdx, 10)];
                $(tileToFlip).addClass("flippedforward");
            }
        }, flipInterval);
    });
}

/**
 * Get the in the Id of every card(<div>) the weight of the cards, if none default is apply (1)
 */
function initCardWeight() {
    //you have to unload maybe
    let listOfDivWithWeight = [];
    let cardWithWeight = $("div:regex(id, .*weight-*)");
    $.each(cardWithWeight, function (idx) {
        let tmp = cardWithWeight[idx];
        let id = tmp.id;
        listOfDivWithWeight.push(id);
        $.each(id.split(" "), function (idx, val) {
            let groups = /weight-(\d+)/.exec(val);
            if (Boolean(groups) && groups.length > 1) {
                tmp.style["flex-grow"] = groups[1];
            }
        });

    });
    let cardWithoutWeight = $("div:regex(id, .*col*)");
    $.each(cardWithoutWeight, function (idx) {
        let tmp = cardWithoutWeight[idx];
        if (!(listOfDivWithWeight.includes(tmp.id)) &&
            (tmp.class === "grid-group" || tmp.class === "grid-cell")) {
            tmp.style["flex-grow"] = 1;
        }
    });
}

/**
 * Change html value to easily change color regarding color_mode
 * @param elementName div element type
 * @param value value to change in elementName
 * @param type to be generic with tag / class / id
 */
function changeElements(elementName, value, type) {
    let Elements = null;
    let copyElements = null;
    let size = null;
    switch (type) {
        case "tag":
            Elements = document.getElementsByTagName(elementName);
            for (let i = 0; i < Elements.length; i++) {
                Elements[i].style.color = value;
            }
            break;
        case "class-backgroundColor":
            Elements = document.getElementsByClassName(elementName);
            for (let i = 0; i < Elements.length; i++) {
                Elements[i].style.backgroundColor = value;
            }
            break;
        case "class-class":
            Elements = document.getElementsByClassName(elementName);
            copyElements = Array.prototype.slice.call(Elements);
            size = copyElements.length;
            for (let i = 0; i < size; i++) {
                copyElements[i].setAttribute("class", value);
            }
            break;
    }
}

/**
 * Hide title of tile's when there is none
 */
function hideTitleWhenNeeded() {
    let tileHeaders = $(".tile-header");
    $.each(tileHeaders, function (idx, tile_header) {
        let textHeader = $(tile_header).find("h3").text();
        if (textHeader === "None" || textHeader === "undefined" || !textHeader.trim()) {
            $(tile_header).hide();
        } else {
            $(tile_header).show();
        }
    });
}

/**
 * Change color of all tile & body regarding the color mode
 * @param body_style
 */
function loadBlackMode(body_style) {
    body_style.backgroundImage = "url('/static/img/logo-tipboard_white.svg')";
    body_style.backgroundColor = "#212121";
    changeElements("tile", "#313131", "class-backgroundColor");
    changeElements("card", "#313131", "class-backgroundColor");
    changeElements("mx-auto text", "mx-auto text-white", "class-class");
    changeElements(".row text", ".row text-white", "class-class");
    changeElements(".row center text", ".row center text-white", "class-class");
    changeElements("display-3 text", "display-3 text-white", "class-class");
    changeElements("display-2 text", "display-2 text-white", "class-class");
    changeElements("display-1 text", "display-1 text-white", "class-class");
    changeElements("h1 display-1 text", "h1 display-1 text-white", "class-class");
    changeElements("text", "text-white", "class-class");
    changeElements("h1", "#ffffff", "tag");
    changeElements("h2", "#ffffff", "tag");
    changeElements("h3", "#ffffff", "tag");
    changeElements("h6", "#ffffff", "tag");
    Chart.defaults.global.defaultFontColor = "rgba(255, 255, 255, 0.83)";
    Chart.defaults.global.elements.line.backgroundColor = "#FFFFFF";
    Chart.defaults.scale.gridLines.display = true;
    Chart.defaults.scale.gridLines.color = "#929292";
}

/**
 * Change color of html element regarding color_mode
 */
function loadStyleColor() {
    // little hack to quickly check the color_mode type on dashboard
    let mode___titleDashboard = document.getElementsByClassName("grid")[0].id.split("___");
    let mode = mode___titleDashboard[0];
    document.title = mode___titleDashboard[1];
    let body_style = document.getElementsByTagName("body")[0].style;
    if (mode === "black") {
        loadBlackMode(body_style);
    } else {
        body_style.backgroundImage = "url('/static/img/logo-tipboard.svg')";
        body_style.backgroundColor = "#eceff1";
        changeElements("tile", "#f5f5f5", "class-backgroundColor");
        changeElements("card", "#f5f5f5", "class-backgroundColor");
        changeElements("h1", "#000", "tag");
        changeElements("h2", "#212529", "tag");
        changeElements("h3", "#000", "tag");
        changeElements("h6", "#000", "tag");
        Chart.defaults.global.defaultFontColor = "#111111";
        Chart.defaults.global.elements.line.backgroundColor = "#FFFFFF";
        Chart.defaults.scale.gridLines.display = true;
        Chart.defaults.scale.gridLines.color = "#212121";
    }
}
