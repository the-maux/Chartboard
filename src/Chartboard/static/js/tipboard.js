/**
 * show the next dashboard loaded from .yaml files
 * @returns {boolean}
 */
function showNextDashboard(nextDashboardPath, nextDashboardName) {
    $.ajax({
        method: "get",
        url: "/dashboard" + nextDashboardPath,
        success(data) {
            Tipboard.chartJsTile = {};
            $("#tipboardIframe").html(data);
            loadStyleColor();
            initCardWithFlip();
            initCardWeight();
            hideTitleWhenNeeded();
            Tipboard.websocket.sendmessage(nextDashboardPath);
        },
        error(request, textStatus, error) {
            Tipboard.log(request, textStatus, error);
            document.title = "Error loading: " + nextDashboardName;
        }
    });
    return true;
}

/**
 * Start the flip beetween dashboard
 */
function getDashboardsByApi() {
    $.ajax({
        method: "post",
        url: "/flipboard/getDashboardsPaths",
        success(data) {
            let flipInterval = $("#tipboardIframe").attr("data-fliptime-interval");
                Flipboard.init(data.paths, data.names);
                showNextDashboard(Flipboard.getNextDashboardPath(), Flipboard.getNextDashboardName());
                if (data.paths.length > 1 && parseInt(flipInterval, 10) > 0) {
                    setInterval(function () { // start the flipping
                        showNextDashboard(Flipboard.getNextDashboardPath(), Flipboard.getNextDashboardName());
                    }, flipInterval  * 1000);
                }
        },
        error(request, textStatus, error) {
            Tipboard.log(request, textStatus, error);
            $(".error-message").html(["Error occured.", "For more details check javascript logs."].join("<br>"));
            $("#tipboardIframe").hide();
            $(".error-wrapper").show();
        }
    });
}

/**
 * Init Flipboard object
 */
function initFlipboard() {
    window.Flipboard = {
        currentPathIdx: -1,
        dashboardsPaths: [],
        dashboardsNames: [],

        init(paths, names) {
            this.dashboardsPaths = paths;
            this.dashboardsNames = names;
        },

        getNextDashboardPath() {
            this.currentPathIdx += 1;
            let lastIdx = this.dashboardsPaths.length - 1;
            if (this.currentPathIdx > lastIdx) {
                this.currentPathIdx = 0;
            }
            return this.dashboardsPaths[this.currentPathIdx];
        },

        getNextDashboardName() {
            return this.dashboardsNames[this.currentPathIdx];
        }
    };
}

/**
 * Init Global ChartJS value + build updateFunctions array
 */
function registerUpdateFuction() {
    Tipboard.updateFunctions = {};
    Tipboard.updateFunctions["line_chart"] = updateChartjsAndMiscTile;
    Tipboard.updateFunctions["radar_chart"] = updateChartjsAndMiscTile;
    Tipboard.updateFunctions["norm_chart"] = updateChartjsAndMiscTile;
    Tipboard.updateFunctions["pie_chart"] = updateChartjsAndMiscTile;
    Tipboard.updateFunctions["polararea_chart"] = updateChartjsAndMiscTile;
    Tipboard.updateFunctions["gauge_chart"] = updateChartjsAndMiscTile;
    Tipboard.updateFunctions["radial_gauge_chart"] = updateChartjsAndMiscTile;
    Tipboard.updateFunctions["linear_gauge_chart"] = updateChartjsAndMiscTile;
    Tipboard.updateFunctions["vlinear_gauge_chart"] = updateChartjsAndMiscTile;
    Tipboard.updateFunctions["bar_chart"] = updateChartjsAndMiscTile;
    Tipboard.updateFunctions["just_value"] = updateTileTextValue;
    Tipboard.updateFunctions["simple_percentage"] = updateTileTextValue;
    Tipboard.updateFunctions["big_value"] = updateTileTextValue;
    Tipboard.updateFunctions["listing"] = updateTileTextValue;
    Tipboard.updateFunctions["text"] = updateTileTextValue;
    Tipboard.updateFunctions["iframe"] = updateTileTextValue;
    Tipboard.updateFunctions["stream"] = updateTileTextValue;
    Tipboard.updateFunctions["custom"] = updateTileTextValue;
}

/**
 * Init Tipboard object & Tipboard.Dashboard object
 */
function initTipboardObject() {
    window.Tipboard = {
        chartJsTile: {},
        websocket: initWebSocketManager(),
        DEBUG_MODE: true,  // TODO: with value from tipboard
        log(msg) {
            if (this.DEBUG_MODE) {
                console.log(msg);
            }
        }
    };
    registerUpdateFuction();
    Tipboard.log("[LOG] Build Tipboard object start");
}

(function ($) {
    $(document).ready(function () {
        initTipboardObject();
        if (window.location.pathname === "/") {
            initFlipboard();
            getDashboardsByApi();
        } else { // No dashboard rotation
            showNextDashboard(window.location.pathname, window.location.pathname);
        }
    });
}($));
