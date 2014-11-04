'use strict';

/**
 * @ngdoc service
 * @name chartExample2App.CellItemModel
 * @description
 * # CellItemModel
 * Factory in the chartExample2App.
 */
angular.module('chartExample2App')
  .factory('CellItemModel', function () {

    function CellItemModel() {
    };

    /** X座標位置 */
    var x = 0;
    /** Y座標位置 */
    var y = 0;
    /** 高さ */
    var height = 0;
    /** 幅 */
    var width = 0;
    /** 色 */
    var fill = '';
    /** 透明度 */
    var opacity = 0.0;
    /** 開始時刻 */
    var startTime = '';
    /** 終了時刻 */
    var endTime = '';
    /** svgのstyle */
    var styles = {};
    /** 卓人数 */
    var takuNinzu = '';
    /** 種別 */
    var shubetsu = '';
    /** 卓名 */
    var takumei = '';
    /** 喫煙 */
    var kitsuen = '';
    /** セルと同時に表示するラベル */
    var label = '';

    /**
     * セルのテーマを仮予約にします。
     */
    function setThemeTemporaryReservation() {
      this.fill = 'green';
      this.opacity = '1.0';
    };

    /**
     * セルのテーマをDrag & Drop待機中にします。
     */
    function setThemeDragAndDropWaiting() {
      this.fill = 'gray';
      this.opacity = '0.3';
    };

    /**
     * セルのテーマをDrag中にします。
     */
    function setThemeDraging() {
      this.fill = 'aqua';
      this.opacity = '0.4';
    };

    /**
     * セル幅の終端のX座標を取得します。
     * @returns {number}
     */
    function getEndX() {
      return this.x + this.width;
    };

    /**
     * セルが重なっているか判定します。
     *
     * @param cellItemModel 重なっているか判定する対象のセル情報
     *
     * @param 同じ高さにあるものを判定対象としない
     */
    function isOverlap(cellItemModel, excludeEqualsY) {
      var thisEndX = this.getEndX();
      var thatEndX = cellItemModel.getEndX();

      if (cellItemModel.$$hashKey == this.$$hashKey) {
        return false;
      }

      if (excludeEqualsY) {
        if (cellItemModel.y != this.y) {
          return false;
        }
      }

      if (thisEndX <= cellItemModel.x || thatEndX <= this.x) {
        return false;
      }

      return true;
    };

    /**
     * セルが領域外でDropされているか判定します。
     *
     * @param tableCaptionWidth 卓情報の幅
     *
     * @param chartWidth チャート全体の幅
     *
     * @param headerHeight ヘッダの高さ
     *
     * @param chartHeight チャート全体の高さ
     */
    function iIllegaDropArea(tableCaptionWidth, chartWidth, headerHeight, chartHeight) {
      var realChartWidth = chartWidth + tableCaptionWidth;  // TODO chart.jsかchart-model.jsでカバーするようにする
      if (this.x < tableCaptionWidth || realChartWidth < this.x + this.width) {
        return true;
      }

      if (this.y < headerHeight || chartHeight < this.y + this.height) {
        return true;
      }

      return false;
    };

    CellItemModel.prototype = {
      x: x,
      y: y,
      height: height,
      width: width,
      fill: fill,
      opacity: opacity,
      startTime: startTime,
      endTime: endTime,
      styles: styles,
      takuNinzu: takuNinzu,
      shubetsu: shubetsu,
      takumei: takumei,
      kitsuen: kitsuen,
      label: label,
      getEndX: getEndX,
      isOverlap: isOverlap,
      setThemeTemporaryReservation: setThemeTemporaryReservation,
      setThemeDragAndDropWaiting: setThemeDragAndDropWaiting,
      setThemeDraging: setThemeDraging,
      iIllegaDropArea: iIllegaDropArea
    };
    return CellItemModel;
  });
