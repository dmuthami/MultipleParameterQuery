
var app = {}; //Global variable object store
app.map = null, app.toolbar = null, app.tool = null; app.symbols = null, app.printer = null;

require([
  "esri/map",
  "esri/layers/ArcGISDynamicMapServiceLayer",
  "esri/layers/ImageParameters",
  "esri/tasks/query",
  "esri/tasks/QueryTask",
  "esri/tasks/FeatureSet",
  "esri/graphic",
  "esri/symbols/SimpleFillSymbol", "esri/symbols/SimpleLineSymbol", "esri/Color",
  "esri/InfoTemplate"
], function (
  Map, ArcGISDynamicMapServiceLayer, ImageParameters
  , Query, QueryTask,
  FeatureSet, Graphic,
  SimpleFillSymbol, SimpleLineSymbol, Color,
  InfoTemplate
  ) {

    //-------------------Variables initialization----------------------------------------------

    //Array for erven
    var erven = ["700", "701", "702", "703", "704", "705", "706", "707"];

    //Lacal authority prefix
    var local_Authority_Prefix = "oj"

    //url
    var url = "http://localhost:6080/arcgis/rest/services/Otjiwarongo/MapServer";

    var searchURL = url + "/18"

    //-------------------End of Variables initialization----------------------------------------------

    //Initialize map object
    app.map = new Map("mapDiv", {
        basemap: "streets", //streets basemap from Esri
        center: [16.65, -20.475], //Center
        zoom: 17, //Zoom
        sliderOrientation: "horizontal" //Orientation of zoom slider
    });

    //create  parcel fabric object
    var layer = new ArcGISDynamicMapServiceLayer(url, {
        id: "Otjiwarongo",
        opacity: 0.5
    });

    //Add dynamic layer
    app.map.addLayer(layer);

    /*
     *On map load function
     * ---Used map load function for prof of concept---
     */
    app.map.on("load", function () {

        /*
         * Function that displays on the map Erven passed as an argument
         *  Argument is an array object named erven
         */
        searchMultipleErf(erven, local_Authority_Prefix, searchURL);
    });

    function searchMultipleErf(erven, local_Authority_Prefix, searchURL) {
        //build query task
        var queryTask = new QueryTask(searchURL);

        //build query filter
        var query = new Query();
        query.returnGeometry = true;
        query.outFields = [
                            local_Authority_Prefix + "_local_authority_id",
                            local_Authority_Prefix + "_stand_no",
                            local_Authority_Prefix + "_township_id",
                            local_Authority_Prefix + "_erf_no",
                            local_Authority_Prefix + "_status",
                            local_Authority_Prefix + "_survey_size",
                            local_Authority_Prefix + "_zoning_id",
                            local_Authority_Prefix + "_portion ",
                            local_Authority_Prefix + "_density ",
                            local_Authority_Prefix + "_ownership",
                            local_Authority_Prefix + "_computed_size",
                            local_Authority_Prefix + "_restriction"
        ];
        //Build the where clause
        var myWhere = "";
        //loop through the array of provided erven
        for (index = 0; index < erven.length; index++) {
            //for the last array ellement
            /*
             *

            if (index == erven.length - 1) {

                myWhere += local_Authority_Prefix + "_erf_no = '" + erven[index] + "'"; //minus or

            } else { //Other array elements

                myWhere += local_Authority_Prefix + "_erf_no = '" + erven[index] + "' or "; // with or
            }
             */

        }

        if (erven.length > 0) {
            var myWhere = local_Authority_Prefix + "_erf_no in ('" + erven.join("','") + "')";
            console.log(myWhere);
        }

        //console.log(myWhere);

        //Where clause
        query.where = myWhere;

        //Spatial Reference
        query.outSpatialReference = { "wkid": 102100 };//web mercator auxiliary sphere

        //Pop-up template
        var infoTemplate = new InfoTemplate();
        infoTemplate.setTitle("${oj_stand_no}");
        infoTemplate.setContent("<b>Township: </b>${oj_township_id}<br/>"
                             + "<b>Erf No </b>${oj_erf_no}<br/>"
                             + "<b>Zoning: </b>${oj_zoning_id}");

        app.map.infoWindow.resize(245, 105);

        //Can listen for onComplete event to process results or can use the callback option in the queryTask.execute method.
        dojo.connect(queryTask, "onComplete", function (featureSet) {
            app.map.graphics.clear();

            var symbol = new esri.symbol.SimpleFillSymbol(
                esri.symbol.SimpleFillSymbol.STYLE_SOLID,
                new esri.symbol.SimpleLineSymbol(
                    esri.symbol.SimpleLineSymbol.STYLE_SOLID,
                    new Color([115, 0, 0, 1.5]), 1)
                , new Color([255, 255, 190, 1.0])
                );

            //console.log(featureSet.features.length);

            //QueryTask returns a featureSet.  Loop through features in the featureSet and add them to the map.
            dojo.forEach(featureSet.features, function (feature) {
                var graphic = feature;
                graphic.setSymbol(symbol);

                //Set infotemplate for graphic layer only
                graphic.setInfoTemplate(infoTemplate);

                app.map.graphics.add(graphic);
            });
        });
        queryTask.execute(query);
    }

});