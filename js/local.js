/**
 * Created by jhouser on 8/19/2014.
 */

// create the esriMap module
var esriMap = angular.module('map', []);

// create an object to wrap the ESRI Map OPbject
var mapObjectWrapper = function(){
    this.map = undefined
}

// create an AngularJS Factory that can provide the map object to AngularJS controllers
esriMap.factory('esriMapService',function(){
    return mapObjectWrapper;
})

// the DOJO-ish code which loads the map object; saves it to the mapObjectWrapper
require(['esri/map'], function (Map) {
    mapObjectWrapper.map = Map;
    // kludgy attempt using a callback to force the map creation once we have the DOJO Map Object loaded
    // I couldn't get AngularJS watches to work
    mapObjectWrapper.scope.recreateMap();
});


// create the map directive
esriMap.directive('esriMap', function () {
    return {
        restrict: 'EA',
        // the directive's actual code code is in the MapController set up below this
        controller: 'MapController',
        // the link just calls the init method in the controller
        link: function (scope, element, attrs, ctrl) {
            ctrl.init(element);
        }
    };
});

esriMap.controller('MapController', ['$rootScope', '$scope', '$attrs','esriMapService', function ($rootScope, $scope, $attrs, esriMapService) {

    var mapDiv, layers = [];
    $scope.$element;

    // copy the esriMapService to a local variable
    $scope.mapService = esriMapService;
    // put the scope variable in the MapService so that when the DOJO AMD finally loads the map; it can trigger the code in the controller
    $scope.mapService.scope = $scope;

    // the init method
    this.init = function (element) {

        if (!$attrs.id) { throw new Error('\'id\' is required for a map.'); }
        $scope.$element = element;

        // if the map isn't loaded yet; return to stop processing
        // the recreateMap function will be triggered when the map does load
        if(!$scope.mapService.map){
            return;
        }

        $scope.recreateMap();
    };

    // a helper function to create the map
    $scope.recreateMap = function(){
        createDiv();
        createMap();
    }

    // In theory we only want to create the div once..
    // so we should add code in here to make sure the div is not created if it is already created
    // either that or delete the existeing div and -recreate it
    var createDiv = function () {
        if(mapDiv){
            return;
        }
        mapDiv = document.createElement('div');
        mapDiv.setAttribute('id', $attrs.id);
        $scope.$element.removeAttr('id');
        $scope.$element.append(mapDiv);
    };

    // method for creating the map
    // this method won't do anything if the mapService is not loaded
    // nor if the mapDiv is not created
    var createMap = function () {

        if(!$scope.mapService.map){
            return;
        }
        if(!mapDiv){
            return;
        }

        // really should do something to load different options instead of introspecting tag attributes
        var options = {
            center: $attrs.center ? JSON.parse($attrs.center) : [-56.049, 38.485],
            zoom: $attrs.zoom ? parseInt($attrs.zoom) : 10,
            basemap: $attrs.basemap ? $attrs.basemap : 'streets'
        };

        // create the map
        $scope.map = new $scope.mapService.map($attrs.id, options);

        // add some event listeners on the map
        // these will probably become important later
        // in theory should probably be documented as part of the directive
        // instead of dispatching on the route
        $scope.map.on('load', function () { $rootScope.$broadcast('map-load'); });
        $scope.map.on('click', function (e) { $rootScope.$broadcast('map-click', e); });

        // This layer thing comes fromt he blog I sourced this from; but not anything
        // I've investigated personally yet
        // commenting out for now
/*        if (layers.length > 0) {
            $scope.map.addLayers(layers);
            layers = [];
        }*/
    };

/* comment out the addLayer method temporarily
   $scope.addLayer = function (layer) {
        if ($scope.map) {
            $scope.map.addLayer(layer);
        } else {
            layers.push(layer);
        }
    };*/

}]);
