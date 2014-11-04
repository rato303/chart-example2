'use strict';

/**
 * @ngdoc service
 * @name chartExample2App.chartModel
 * @description
 * # chartModel
 * Factory in the chartExample2App.
 */
angular.module('chartExample2App')
  .factory('chartModel', ['CellItemModel', function (CellItemModel) {

    /** 時間テキストのy軸*/
    var headerLabelY = 14;
    /** 時間ヘッダの高さ */
    var headerHeight = 20;
    /** ヘッダの縦位置 */
    var headerY = 0;
    /** ヘッダの横位置 */
    var headerX = 0;
    // TODO 60をhourSplitCountで割った数をminuteWidthに設定するようにする
    /** 分の最小単位 */
    var minuteWidth = 15;
    /** 1時間の分割量 */
    var hourSplitCount = 4;
    /** 1予約分の高さ */
    var reservationHeight = 30;
    /** 時間ヘッダの配列 */
    var headerItems = [];
    /** 描画モード */
    var drawMode = false;
    /** Drag状態 */
    var isDragState = false;
    /** Resizeモード */
    var resizeMode = false;
    /** Drag & Drop中のセル情報 */
    var ddMovingCellItem = new CellItemModel();
    /** Drag & Drop待機中のセル情報 */
    var ddWaitingCellItem = new CellItemModel();
    /** 描画中のセル情報 */
    var drawingCellItem = new CellItemModel();
    /** Drag & Drop 開始セル情報 */
    var ddStartItem = {
      "x": 0,
      "y": 0
    };
    /** Drag開始座標 */
    var dragCoordinate = {
      "x": 0,
      "y": 0
    };
    /** マウス押下時の卓情報のインデックス */
    var mouseDownTableIndex = -1;
    /** マウス開放時の卓情報のインデックス */
    var mouseUpTableIndex = -1;
    /** 卓ヘッダ情報 */
    var tableCaptionItems = [
      {"label": "卓人数", "x": 0, "width": 60},
      {"label": "種別", "x": 60, "width": 60},
      {"label": "卓名", "x": 120, "width": 60},
      {"label": "喫煙", "x": 180, "width": 60}
    ];

    /** 卓情報全体の幅 */
    var tableCaptionWidth= 240;

    /**
     * 時間ヘッダの配列を生成します。
     *
     * @param startTime チャート開始時刻
     *
     * @param endTime チャート終了時刻
     *
     * @returns {chartExampleApp.chartModel.createHeaderItems} 時間ヘッダ生成後のインスタンス
     */
    function createHeaderItems(startTime, endTime) {
      for (var i = startTime; i <= endTime; i++) {
        var label = ('00' + i).slice(-2) + ':00'; // TODO 0埋め関数を作成
        var x = (i * this.minuteWidth * this.hourSplitCount);
        var width = this.minuteWidth * this.hourSplitCount;
        this.headerItems.push({
          'x': x,
          'width': width,
          'labelX': x + this.minuteWidth,
          'label': label
        });
      }
      return this;
    }

    // TODO jsDoc
    function createDialogModel(event, tableItems) {
      var startTime = this.drawingCellItem.startTime;
      var endTime = this.getEndTime(event.offsetX);
      return {
        'startTime': startTime,
        'endTime': endTime,
        'newReservationItems': this.createReservationItems(startTime, endTime, tableItems)
      };
    }

    /**
     * 仮予約情報を生成します。
     *
     * @param startTime 予約開始時刻
     *
     * @param endTime 予約終了時刻
     *
     * @param tableItems 卓情報の配列
     *
     * @returns {Array} 仮予約情報の配列
     */
    function createReservationItems(startTime, endTime, tableItems) {

      var newReservationItems = [];
      for (var i = this.mouseDownTableIndex; i < this.mouseUpTableIndex; i++) {
        var tableItem = tableItems[i];
        var newReservationItem = new CellItemModel();
        newReservationItem.setThemeTemporaryReservation();
        newReservationItem.startTime = startTime;
        newReservationItem.endTime = endTime;
        newReservationItem.x = this.timeToX(startTime);
        newReservationItem.y = tableItem.y;
        newReservationItem.height = this.reservationHeight;
        newReservationItem.width = this.timeToX(endTime) - newReservationItem.x;
        newReservationItem.takuNinzu = tableItem.takuNinzu;
        newReservationItem.shubetsu = tableItem.shubetsu;
        newReservationItem.takumei = tableItem.takumei;
        newReservationItem.kitsuen = tableItem.kitsuen;
        newReservationItem.label = '予約者名 ' + '100人';
        newReservationItems.push(newReservationItem);
      }

      return newReservationItems;
    }

    /**
     * 描画中のセル情報をクリアします。
     */
    function clearDrawingCellItem() {
      this.drawingCellItem = new CellItemModel();
    }

    /**
     * 新しいセル情報を生成します。
     *
     * @param offsetX イベント発生時のX座標
     *
     * @param offsetY イベント発生時のY座標
     *
     * @returns {Object} 新しいセル情報
     */
    function createCellItem(offsetX, offsetY) {

      var newCellItem = new CellItemModel();
      newCellItem.x = this.getDrawRectX(offsetX);
      newCellItem.y = this.getDrawRectY(offsetY);
      newCellItem.width = this.minuteWidth;
      newCellItem.height = this.reservationHeight;
      newCellItem.fill = 'pink';
      newCellItem.opacity = '0.9';
      newCellItem.startTime = this.getStartTime(offsetX);

      return newCellItem;
    }

    /**
     * セル情報をリサイズします。
     *
     * @param offsetX イベント発生時のX座標
     *
     * @param offsetY イベント発生時のY座標
     *
     */
    function resizeCellItem(offsetX, offsetY) {
      // TODO 左にひっぱった場合の対応が未実装
      var targetCellItem = null;

      if (this.drawMode) {
        targetCellItem = this.drawingCellItem;
        targetCellItem.height = (this.getDrawRectY(offsetY) + this.reservationHeight) - targetCellItem.y;
      }
      if (this.resizeMode) {
        targetCellItem = this.ddMovingCellItem;
      }

      if (targetCellItem == null) {
        return;
      }

      targetCellItem.width = (this.getDrawRectX(offsetX) + this.minuteWidth) - targetCellItem.x;

    }

    /**
     * セル情報を移動します。
     *
     * @param offsetX イベント発生時のX座標
     *
     * @param offsetY イベント発生時のY座標
     */
    function moveCellItem(offsetX, offsetY) {

      if ( ! this.isDragState) { return; }

      var afterX = this.getDrawRectX(offsetX);
      var afterY = this.getDrawRectY(offsetY);
      var newX = this.ddMovingCellItem.x - (this.ddStartItem.x - afterX);
      var newY = this.ddMovingCellItem.y - (this.ddStartItem.y - afterY);

      this.ddMovingCellItem.x = newX;
      this.ddMovingCellItem.y = newY;
      this.ddStartItem.x = afterX;
      this.ddStartItem.y = afterY;
    }

    /**
     * 描画を開始するX座標を取得します。
     *
     * @param offsetX イベント発生時のX座標
     *
     * @returns {number}
     */
    function getDrawRectX(offsetX) {
      return offsetX === 0 ? 0 : this.tableCaptionWidth + Math.floor((offsetX - this.tableCaptionWidth) / this.minuteWidth) * this.minuteWidth;
    }

    /**
     * 描画を開始するY座標を取得します。
     *
     * @param offsetY イベント発生時のY座標
     *
     * @returns {number}
     */
    function getDrawRectY(offsetY) {
      var absoluteY = offsetY - this.headerHeight;
      return absoluteY === 0 ? 0 : Math.floor(absoluteY / this.reservationHeight) * this.reservationHeight + this.headerHeight;
    }

    /**
     * 選択開始時刻を取得します。
     *
     * @param offsetX イベント発生時のX座標
     *
     * @returns {String}
     */
    function getStartTime(offsetX) {
      var startX = this.getDrawRectX(offsetX);
      return this.xToTime(startX);
    }

    /**
     * 選択終了時刻を取得します。
     *
     * @param offsetX イベント発生時のX座標
     *
     * @returns {String}
     */
    function getEndTime(offsetX) {
      var endX = this.minuteWidth + this.getDrawRectX(offsetX);
      return this.xToTime(endX);
    }

    /**
     * X座標に位置する時刻を取得します。
     *
     * @param targetX イベント発生時のX座標
     *
     * @returns {string}
     */
    function xToTime(targetX) {
      var minuteCount = (targetX - this.tableCaptionWidth) / this.minuteWidth;
      var hour = Math.floor(minuteCount / this.hourSplitCount);
      var minute = minuteCount % this.hourSplitCount * this.minuteWidth;
      return ('00' + String(hour)).slice(-2) + ':' + ('00' + String(minute)).slice(-2);
    }

    /**
     * 時刻に位置するX座標を取得します。
     *
     * @param time X座標を取得する時刻
     *
     */
    function timeToX(time) {
      var timeArr = time.split(":");

      var hour = Number(timeArr[0]);
      var minute = Number(timeArr[1]);

      minute += this.tableCaptionWidth + this.minuteWidth * this.hourSplitCount * hour;

      return minute;
    }

    /**
     * マウス押下時の卓情報のインデックスを設定します。
     *
     * @param index マウス押下時の卓情報のインデックス
     *
     */
    function setMouseDownTableIndex(index) {
      this.mouseDownTableIndex = index;
    }

    /**
     * マウス開放時の卓情報のインデックスを設定します。
     *
     * @param offsetY イベント発生時のY座標
     *
     */
    function setMouseUpTableIndex(offsetY) {
      this.mouseUpTableIndex = this.getYtoTableIndex(offsetY, Math.ceil);
      console.log('(offsetY - this.headerHeight)[' + (offsetY - this.headerHeight) +']');
      console.log('mouseUpTableIndex[' + this.mouseUpTableIndex +']');
    }

    /**
     * Y座標に値する卓情報のインデックスを取得します。
     *
     * @param offsetY 取得する卓情報のY座標
     *
     * @param mathFunc 丸め用関数
     *
     * @returns {number} 卓情報のインデックス
     */
    function getYtoTableIndex(offsetY, mathFunc) {
      return mathFunc((offsetY - this.headerHeight) / this.reservationHeight);
    }

    /**
     * Drag状態を解放します。
     *
     * @param reservationItems 予約情報
     *
     * @param chartWidth チャートの幅
     *
     * @param chartHeight チャートのたkさ
     *
     */
    function releasesDragMode(reservationItems, chartWidth, chartHeight) {

      if (this.isDragState) {

        if (this.isIllegalDrop(this.ddMovingCellItem, reservationItems, chartWidth, chartHeight)) {
          this.ddMovingCellItem.x = this.ddWaitingCellItem.x;
          this.ddMovingCellItem.y = this.ddWaitingCellItem.y;
        }

        this.ddMovingCellItem.setThemeTemporaryReservation();
        this.ddWaitingCellItem = new CellItemModel();
        this.isDragState = false;

      }

    }

    // TODO jsDoc
    function isIllegalDrop(targetItem, reservationItems, chartWidth, chartHeight) {

      if (this.ddMovingCellItem.iIllegaDropArea(this.tableCaptionWidth, chartWidth, this.headerHeight, chartHeight)) {
        return true;
      }

      return this.isReservationItemOverlap(targetItem, reservationItems);
    }

    // TODO jsDoc
    function isReservationItemOverlap(targetItem, reservationItems) {
      var isOverlap = false;
      angular.forEach(reservationItems, function (reservationCellItem) {
        if (targetItem.isOverlap(reservationCellItem, true)) {
          isOverlap = true;
          return true;
        }
      });

      return isOverlap;
    }

    function isNewReservationItemsOverlapExistingReservationItems(newReservationItems, existingReservationItems) {
      var isOverlap = false;
      var _this = this;
      angular.forEach(newReservationItems, function(newReservationItem) {
        if (_this.isReservationItemOverlap(newReservationItem, existingReservationItems)) {
          isOverlap = true;
          return true;
        }
      });
      return isOverlap;
    }

    return {
      "headerLabelY": headerLabelY,
      "headerHeight": headerHeight,
      "headerY": headerY,
      "headerX": headerX,
      "minuteWidth": minuteWidth,
      "hourSplitCount": hourSplitCount,
      "reservationHeight": reservationHeight,
      "headerItems": headerItems,
      "drawMode": drawMode,
      "isDragState": isDragState,
      "resizeMode": resizeMode,
      "ddMovingCellItem": ddMovingCellItem,
      "ddWaitingCellItem": ddWaitingCellItem,
      "drawingCellItem": drawingCellItem,
      "ddStartItem": ddStartItem,
      "dragCoordinate": dragCoordinate,
      "mouseDownTableIndex": mouseDownTableIndex,
      "mouseUpTableIndex": mouseUpTableIndex,
      "tableCaptionItems": tableCaptionItems,
      "tableCaptionWidth": tableCaptionWidth,
      "createHeaderItems": createHeaderItems,
      "createDialogModel": createDialogModel,
      "createReservationItems": createReservationItems,
      "clearDrawingCellItem": clearDrawingCellItem,
      "createCellItem": createCellItem,
      "resizeCellItem": resizeCellItem,
      "moveCellItem": moveCellItem,
      "getDrawRectX": getDrawRectX,
      "getDrawRectY": getDrawRectY,
      "getStartTime": getStartTime,
      "getEndTime": getEndTime,
      "xToTime": xToTime,
      "timeToX": timeToX,
      "setMouseDownTableIndex": setMouseDownTableIndex,
      "setMouseUpTableIndex": setMouseUpTableIndex,
      "getYtoTableIndex": getYtoTableIndex,
      "releasesDragMode": releasesDragMode,
      "isIllegalDrop": isIllegalDrop,
      "isReservationItemOverlap": isReservationItemOverlap,
      "isNewReservationItemsOverlapExistingReservationItems": isNewReservationItemsOverlapExistingReservationItems
    };

  }]);
