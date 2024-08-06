/**
 * show the next dashboard loaded from .yaml files
 * @returns {boolean}
 */
function showNextDashboard(nextDashboardPath, nextDashboardName) {
    $.ajax({
        method: "get",
        url: "/dashboard" + nextDashboardPath,
        success(data) {
            Carboard.chartJsTile = {};
            $("#CarboardIframe").html(data);
            loadStyleColor();
            initCardWithFlip();
            initCardWeight();
            hideTitleWhenNeeded();
            Carboard.websocket.sendmessage(nextDashboardPath);
        },
        error(request, textStatus, error) {
            Carboard.log(request, textStatus, error);
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
            let flipInterval = $("#CarboardIframe").attr("data-fliptime-interval");
                Flipboard.init(data.paths, data.names);
                showNextDashboard(Flipboard.getNextDashboardPath(), Flipboard.getNextDashboardName());
                if (data.paths.length > 1 && parseInt(flipInterval, 10) > 0) {
                    setInterval(function () { // start the flipping
                        showNextDashboard(Flipboard.getNextDashboardPath(), Flipboard.getNextDashboardName());
                    }, flipInterval  * 1000);
                }
        },
        error(request, textStatus, error) {
            Carboard.log(request, textStatus, error);
            $(".error-message").html(["Error occured.", "For more details check javascript logs."].join("<br>"));
            $("#CarboardIframe").hide();
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
    Carboard.updateFunctions = {};
    Carboard.updateFunctions["line_chart"] = updateChartjsAndMiscTile;
    Carboard.updateFunctions["radar_chart"] = updateChartjsAndMiscTile;
    Carboard.updateFunctions["norm_chart"] = updateChartjsAndMiscTile;
    Carboard.updateFunctions["pie_chart"] = updateChartjsAndMiscTile;
    Carboard.updateFunctions["polararea_chart"] = updateChartjsAndMiscTile;
    Carboard.updateFunctions["gauge_chart"] = updateChartjsAndMiscTile;
    Carboard.updateFunctions["radial_gauge_chart"] = updateChartjsAndMiscTile;
    Carboard.updateFunctions["linear_gauge_chart"] = updateChartjsAndMiscTile;
    Carboard.updateFunctions["vlinear_gauge_chart"] = updateChartjsAndMiscTile;
    Carboard.updateFunctions["bar_chart"] = updateChartjsAndMiscTile;
    Carboard.updateFunctions["just_value"] = updateTileTextValue;
    Carboard.updateFunctions["simple_percentage"] = updateTileTextValue;
    Carboard.updateFunctions["big_value"] = updateTileTextValue;
    Carboard.updateFunctions["listing"] = updateTileTextValue;
    Carboard.updateFunctions["text"] = updateTileTextValue;
    Carboard.updateFunctions["iframe"] = updateTileTextValue;
    Carboard.updateFunctions["stream"] = updateTileTextValue;
    Carboard.updateFunctions["custom"] = updateTileTextValue;
}

/**
 * Init Carboard object & Carboard.Dashboard object
 */
function initCarboardObject() {
    window.Carboard = {
        chartJsTile: {},
        websocket: initWebSocketManager(),
        DEBUG_MODE: true,  // TODO: with value from Carboard
        log(msg) {
            if (this.DEBUG_MODE) {
                console.log(msg);
            }
        }
    };
    registerUpdateFuction();
    Carboard.log("[LOG] Build Carboard object start");
}

(function ($) {
    $(document).ready(function () {
        initCarboardObject();
        if (window.location.pathname === "/") {
            initFlipboard();
            getDashboardsByApi();
        } else { // No dashboard rotation
            showNextDashboard(window.location.pathname, window.location.pathname);
        }
    });
}($));
