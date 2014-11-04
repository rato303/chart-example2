'use strict';

/**
 * @ngdoc function
 * @name chartExample2App.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the chartExample2App
 */
angular.module('chartExample2App')
  .controller('MainCtrl', ['$scope', 'chartModel', 'CellItemModel', function ($scope, chartModel, CellItemModel) {

    $scope.chartModel = chartModel.createHeaderItems(0, 24);

    // 卓の数
    var _tableItems = [];
    for (var i = 0; i < 30; i++) {
      var y = i * 30 + 20;
      _tableItems.push({
        'y': y,
        'labelY': y + 12,
        'takuNinzu': i + '人',
        'shubetsu': '種別' + i,
        'takumei': '卓名' + i,
        'kitsuen': i % 2 === 0 ? true : false
      });
    }
    $scope.tableItems = _tableItems;

    var _lineItems = [];
    for (var i = 0; i < 4; i++) {
      _lineItems.push({});
    }
    $scope.lineItems = _lineItems;

    $scope.reservationItems = [];

    $scope.mousemove = function(event) {
      console.log('offsetX[' + event.offsetX + ']offsetY[' + event.offsetY + ']');
    };

    $scope.mousedown = function(event) {
      console.log('mousedown');
    };

  }]);
