/* Copyright (c) 2015 CDD
 * Licensed under the MIT license.
 */
(function ($) {
  $.fn.adhesiveTable = function (action, options) {
    // Override default options with passed-in options.
    options = $.extend({}, $.fn.adhesiveTable.options, options);
    window.fixedHeaderRewriteCache = {};    
    var settings = {};
    
    // public methods
    var methods = {
      init: function (fixedColumnsSelected) {
        settings = {fixedColumns: fixedColumnsSelected ? 1 : 0 };
        return this.each(function () {
          if (helpers._isTable( $(this) )) {
            methods.setup.apply(this, Array.prototype.slice.call(arguments, 1));
          } else {
            $.error('Invalid table mark-up');
          }
        });
      },

      /* Setup table structure for fixed headers */
      setup: function () {
        var $self       = $(this);
        settings.originalTable = $self.clone();
        settings.includePadding = helpers._isPaddingIncludedWithWidth();
        settings.scrollbarOffset = helpers._getScrollbarWidth();

        var widthMinusScrollbar = $self.parent().width() - settings.scrollbarOffset;
        $self.css({ width: widthMinusScrollbar });


        if (!$self.closest('.adhesive-table-wrapper').length) {
          $self.addClass('adhesive-table');
          $self.wrap('<div class="adhesive-table-wrapper"></div>');
        }

        var $wrapper = $self.closest('.adhesive-table-wrapper');
        var $fixedBody;
        if (settings.fixedColumns > 0 && !$wrapper.find('.adhesive-fixed-column').length) {
          $self.wrap('<div class="adhesive-fixed-body"></div>');
          $('<div class="adhesive-fixed-column"></div>').prependTo($wrapper);
          $fixedBody = $wrapper.find('.adhesive-fixed-body');
        }

        $wrapper.css({ width: '100%', height: '100%' });

        if (!$self.hasClass('adhesive-table-init')) {
          $self.wrap('<div class="adhesive-tbody"></div>');
        }

        var $divBody = $self.closest('.adhesive-tbody');
        var tableProps = helpers._getTableProps($self);
        helpers._setupClone($divBody, tableProps.tbody);
        
        
        var $divHead = helpers._buildClone($self, $wrapper, $fixedBody);
        helpers._setupClone($divHead, tableProps.thead);
        $self.css({ 'margin-top': -$divHead.outerHeight(true) });

        var tbodyHeight = $wrapper.height() - $self.find('thead').outerHeight(true) - tableProps.border;
        $divBody.css({ 'height': tbodyHeight });

        $self.addClass('adhesive-table-init');

        if (settings.fixedColumns > 0) {
          helpers._setupFixedColumn($self, tableProps);
        }

        helpers._bindScroll($divBody, tableProps);

        return this;
      },

      /* Destory fixedHeaderTable and return table to original state */
      destroy: function() {
        var $wrapper = $(this).closest('.adhesive-table-wrapper');

        $(this).insertBefore($wrapper)
          .removeAttr('style')
          .removeClass('adhesive-table adhesive-table-init')
          .find('.adhesive-cell')
          .remove();
          
        $wrapper.remove();        
        return this;
      }

    };
    
    var helpers = {
      //build and copy the sticky header if necessary
      _buildClone: function($self, $wrapper, $fixedBody){
        var $thead = $self.find('thead');
        var $divHead;
        if (!$self.hasClass('adhesive-table-init')) {
          $divHead = $('<div class="adhesive-thead"><table class="adhesive-table"></table></div>');
          $divHead.prependTo(settings.fixedColumns > 0 ? $fixedBody : $wrapper);
          $divHead.find('table.adhesive-table')
            .addClass(settings.originalTable.attr('class'))
            .attr('style', settings.originalTable.attr('style'));

          $thead.clone().appendTo($divHead.find('table'));
        } else {
          $divHead = $wrapper.find('div.adhesive-thead');
        }
        return $divHead;
      },
      
      _isTable: function($obj) {
        var $self = $obj,
            hasTable = $self.is('table'),
            hasThead = $self.find('thead').length > 0,
            hasTbody = $self.find('tbody').length > 0;
            
        return hasTable && hasThead && hasTbody;
      },

      _bindScroll: function($self) {
        var $wrapper = $self.closest('.adhesive-table-wrapper'),
            $thead = $self.siblings('.adhesive-thead');

        $self.bind('scroll', function() {
          if (settings.fixedColumns > 0) {
            $wrapper.find('.adhesive-fixed-column').find('.adhesive-tbody table')
              .css({ 'margin-top': -$self.scrollTop() });
          }
          $thead.find('table').css({ 'margin-left': -this.scrollLeft });
        });
      },

      _fixHeightWithCss: function ($obj, tableProps) {
        var height = settings.includePadding ? $obj.height() : $obj.parent().height();
        $obj.css({ 'height': height + tableProps.border });
      },

      _fixWidthWithCss: function($obj, tableProps, width) {
        $obj.each(function() {
          var includedPadding = settings.includePadding ? $(this).width() : $(this).parent().width();
          var computedWidth = (width || width === 0 ? width : includedPadding);
          $(this).css({ 'width': computedWidth + tableProps.border});
        });
      },

      _setupFixedColumn: function ($self, tableProps) {
        var $wrapper        = $self.closest('.adhesive-table-wrapper'),
            $fixedBody      = $wrapper.find('.adhesive-fixed-body'),
            $fixedColumn    = $wrapper.find('.adhesive-fixed-column'),
            $thead          = $('<div class="adhesive-thead"><table class="adhesive-table"><thead><tr></tr></thead></table></div>'),
            $tbody          = $('<div class="adhesive-tbody"><table class="adhesive-table"><tbody></tbody></table></div>'),
            fixedBodyWidth  = $wrapper.width(),
            fixedBodyHeight = $fixedBody.find('.adhesive-tbody').height() - settings.scrollbarOffset;

        $thead.find('table.adhesive-table').addClass(settings.originalTable.attr('class'));
        $tbody.find('table.adhesive-table').addClass(settings.originalTable.attr('class'));

        var $firstThChildren = $fixedBody.find('.adhesive-thead thead tr > *:lt(' + settings.fixedColumns + ')');
        var fixedColumnWidth = settings.fixedColumns * tableProps.border;
        $firstThChildren.each(function() {
          fixedColumnWidth += $(this).outerWidth(true);
        });

        // Fix cell heights
        helpers._fixHeightWithCss($firstThChildren, tableProps);
        helpers._fixWidthWithCss($firstThChildren, tableProps);

        var tdWidths = [];
        $firstThChildren.each(function() {
          tdWidths.push($(this).width());
        });

        var firstTdChildrenSelector = 'tbody tr > *:not(:nth-child(n+' + (settings.fixedColumns + 1) + '))';
        var $firstTdChildren = $fixedBody.find(firstTdChildrenSelector)
          .each(function(index) {
            helpers._fixHeightWithCss($(this), tableProps);
            helpers._fixWidthWithCss($(this), tableProps, tdWidths[index % settings.fixedColumns] );
          });

        // clone header
        $thead.appendTo($fixedColumn).find('tr').append($firstThChildren.clone());

        $tbody.appendTo($fixedColumn)
          .css({ 'margin-top': -1, 'height': fixedBodyHeight + tableProps.border });

        var $newRow;
        $firstTdChildren.each(function(index) {
          if (index % settings.fixedColumns === 0) {
            $newRow = $('<tr></tr>').appendTo($tbody.find('tbody'));
          }

          $(this).clone().appendTo($newRow);
        });

        // set widths of fixed column & body table wrappers
        $fixedColumn.css({ 'height': 0, 'width': fixedColumnWidth });
        $fixedBody.css({ 'width': fixedBodyWidth });

        helpers._bindColumnScroll($fixedColumn, $fixedBody);
      },
      
      // bind vertical wheel events for fixed column
      _bindColumnScroll: function($fixedColumn, $fixedBody){
        var maxTop = $fixedColumn.find('.adhesive-tbody .adhesive-table').height() - $fixedColumn.find('.adhesive-tbody').height();
        $fixedColumn.find('.adhesive-tbody .adhesive-table').bind('wheel', function(event) {
          if (event.originalEvent.deltaY === 0) { return; }
          var deltaY = -1 * event.originalEvent.deltaY ;/// (20 * 120);// TODO browser stuff
          
          var top = parseInt($(this).css('marginTop'), 10) + (deltaY > 0 ? 120 : -120);
          top = (top > 0 ? 0 : ( top < -maxTop ? -maxTop : top) );
          
          $(this).css('marginTop', top);
          $fixedBody.find('.adhesive-tbody').scrollTop(-top).scroll();
          return false;
        });
      },

      /* Widths of each thead cell and tbody cell for the first rows.
       * Used in fixing widths for the fixed header. */
      _getTableProps: function($obj) {
        var firstTh = $obj.find('th:first-child');
        var tableProp = { thead: {}, 
                          tbody: {}, 
                          border: firstTh.outerWidth() - firstTh.innerWidth() };

        $obj.find('thead tr:first-child > *').each(function(index) {
          tableProp.thead[index] = $(this).width() + tableProp.border;
        });

        $obj.find('tbody tr:first-child > *').each(function(index) {
          tableProp.tbody[index] = $(this).width() + tableProp.border;
        });

        return tableProp;
      },

      /* Fix widths of each cell in the first row of obj. */
      _setupClone: function($self, cellArray) {
        var selector = ($self.find('thead').length) ? 'thead tr:first-child > *' : 'tbody tr:first-child > *';

        $self.find(selector).each(function(index) {
          var $obj = $(this),
              $cell;
              
          if( $obj.find('div.adhesive-cell').length ){
            $cell = $(this).find('div.adhesive-cell');            
          } else {
            $cell = $('<div class="adhesive-cell"></div>').appendTo($obj);            
          }
          $cell.css({ 'width': parseInt(cellArray[index], 10) });

          /* Fixed Header should extend the full width to align with the scrollbar of the body */
          var a = !$obj.closest('.adhesive-tbody').length;
          var b = $obj.is(':last-child');
          var c = !$obj.closest('.adhesive-fixed-column').length;
          if ( a && b  && c) {
            var widthDifference = ($obj.innerWidth() - $obj.width()) / 2;
            var padding = Math.max(widthDifference, settings.scrollbarOffset);
            var computedPadding = parseInt($obj.css('padding-right')) + padding + 'px';
            $(this).css({ 'padding-right': computedPadding });
          }
        });
      },

      /* Determine how the browser calculates fixed widths with padding for tables */
      _isPaddingIncludedWithWidth: function() {
        var cachedPaddingInfo = window.fixedHeaderRewriteCache.paddingInfo;
        if( typeof cachedPaddingInfo  === 'object'){
          return cachedPaddingInfo.defaultHeight !== cachedPaddingInfo.newHeight;
        }
        
        var $obj = $('<table class="adhesive-table"><tr><td style="padding: 10px; font-size: 10px;">test</td></tr></table>');

        $obj.addClass(settings.originalTable.attr('class'));
        $obj.appendTo('body');

        var defaultHeight = $obj.find('td').height();
        $obj.find('td').css('height', $obj.find('tr').height());

        var newHeight = $obj.find('td').height();
        $obj.remove();
        
        window.fixedHeaderRewriteCache.paddingInfo = {defaultHeight: defaultHeight, newHeight: newHeight};
        
        return defaultHeight !== newHeight;
      },

      _getScrollbarWidth: function() {
        var cachedScrollWidth = window.fixedHeaderRewriteCache.getScrollbarWidth;
        if(cachedScrollWidth || cachedScrollWidth === 0){
          return cachedScrollWidth;
        }
        
        var scrollbarWidth = 0;
        if (/msie/.test(navigator.userAgent.toLowerCase())) {
          var $textarea1 = $('<textarea cols="10" rows="2"></textarea>')
                .css({ position: 'absolute', top: -1000, left: -1000 }).appendTo('body'),
              $textarea2 = $('<textarea cols="10" rows="2" style="overflow: hidden;"></textarea>')
                .css({ position: 'absolute', top: -1000, left: -1000 }).appendTo('body');
          var borderOffset = 2;
          scrollbarWidth = $textarea1.width() - $textarea2.width() + borderOffset;
          $textarea1.add($textarea2).remove();
        } else {
          var $div = $('<div />')
                .css({ width: 100, height: 100, overflow: 'auto', position: 'absolute', top: -1000, left: -1000 })
                .prependTo('body').append('<div />').find('div')
                .css({ width: '100%', height: 200 });

          scrollbarWidth = 100 - $div.width();
          $div.parent().remove();
        }
        window.fixedHeaderRewriteCache.getScrollbarWidth = scrollbarWidth;
        return scrollbarWidth;
      }

    };
    
    if(action === 'destroy'){
      window.fixedHeaderRewriteCache = {};
      return methods.destroy.apply(this);
    } else if (typeof action === 'boolean' || typeof action === 'undefined'){
      methods.destroy.apply(this);
      return methods.init.apply(this, arguments);      
    } else {
      $.error('Input "' +  action + '" is not valid for the adhesiveTable plugin');      
    }  
    
  };
}(jQuery));
