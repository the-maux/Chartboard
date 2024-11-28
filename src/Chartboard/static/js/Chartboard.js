/**
 * show the next dashboard loaded from .yaml files
 * @returns {boolean}
 */
function showNextDashboard(nextDashboardPath, nextDashboardName) {
    $.ajax({
        method: "get",
        url: "/dashboard" + nextDashboardPath,
        success(data) {
            CHARTBOARD.chartJsTile = {};
            $("#CHARTBOARDIframe").html(data);
            loadStyleColor();
            initCardWithFlip();
            initCardWeight();
            hideTitleWhenNeeded();
            CHARTBOARD.websocket.sendmessage(nextDashboardPath);
        },
        error(request, textStatus, error) {
            CHARTBOARD.log(request, textStatus, error);
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
            let flipInterval = $("#CHARTBOARDIframe").attr("data-fliptime-interval");
                Flipboard.init(data.paths, data.names);
                showNextDashboard(Flipboard.getNextDashboardPath(), Flipboard.getNextDashboardName());
                if (data.paths.length > 1 && parseInt(flipInterval, 10) > 0) {
                    setInterval(function () { // start the flipping
                        showNextDashboard(Flipboard.getNextDashboardPath(), Flipboard.getNextDashboardName());
                    }, flipInterval  * 1000);
                }
        },
        error(request, textStatus, error) {
            CHARTBOARD.log(request, textStatus, error);
            $(".error-message").html(["Error occured.", "For more details check javascript logs."].join("<br>"));
            $("#CHARTBOARDIframe").hide();
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
    CHARTBOARD.updateFunctions = {};
    CHARTBOARD.updateFunctions["line_chart"] = updateChartjsAndMiscTile;
    CHARTBOARD.updateFunctions["radar_chart"] = updateChartjsAndMiscTile;
    CHARTBOARD.updateFunctions["norm_chart"] = updateChartjsAndMiscTile;
    CHARTBOARD.updateFunctions["pie_chart"] = updateChartjsAndMiscTile;
    CHARTBOARD.updateFunctions["polararea_chart"] = updateChartjsAndMiscTile;
    CHARTBOARD.updateFunctions["gauge_chart"] = updateChartjsAndMiscTile;
    CHARTBOARD.updateFunctions["radial_gauge_chart"] = updateChartjsAndMiscTile;
    CHARTBOARD.updateFunctions["linear_gauge_chart"] = updateChartjsAndMiscTile;
    CHARTBOARD.updateFunctions["vlinear_gauge_chart"] = updateChartjsAndMiscTile;
    CHARTBOARD.updateFunctions["bar_chart"] = updateChartjsAndMiscTile;
    CHARTBOARD.updateFunctions["just_value"] = updateTileTextValue;
    CHARTBOARD.updateFunctions["simple_percentage"] = updateTileTextValue;
    CHARTBOARD.updateFunctions["big_value"] = updateTileTextValue;
    CHARTBOARD.updateFunctions["listing"] = updateTileTextValue;
    CHARTBOARD.updateFunctions["text"] = updateTileTextValue;
    CHARTBOARD.updateFunctions["iframe"] = updateTileTextValue;
    CHARTBOARD.updateFunctions["stream"] = updateTileTextValue;
    CHARTBOARD.updateFunctions["custom"] = updateTileTextValue;
}

/**
 * Init CHARTBOARD object & CHARTBOARD.Dashboard object
 */
function initCHARTBOARDObject() {
    window.CHARTBOARD = {
        chartJsTile: {},
        websocket: initWebSocketManager(),
        DEBUG_MODE: true,  // TODO: with value from CHARTBOARD
        log(msg) {
            if (this.DEBUG_MODE) {
                console.log(msg);
            }
        }
    };
    registerUpdateFuction();
    CHARTBOARD.log("[LOG] Build CHARTBOARD object start");
}

(function ($) {
    $(document).ready(function () {
        initCHARTBOARDObject();
        if (window.location.pathname === "/") {
            initFlipboard();
            getDashboardsByApi();
        } else { // No dashboard rotation
            showNextDashboard(window.location.pathname, window.location.pathname);
        }
    });
}($));
