/* Copyright (c) 2015 CDD
 * Licensed under the MIT license.
 */
(function ($) {
  $.fn.fixedHeaderRewrite = function (action, options) {
    // Override default options with passed-in options.
    options = $.extend({}, $.fn.fixedHeaderRewrite.options, options);
        
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
        var $self       = $(this),
            self        = this,
            $thead      = $self.find('thead'),
            $divBody,
            $fixedBody;

        settings.originalTable = $self.clone();
        settings.includePadding = helpers._isPaddingIncludedWithWidth();
        settings.scrollbarOffset = helpers._getScrollbarWidth();

        var widthMinusScrollbar = $self.parent().width() - settings.scrollbarOffset;
        $self.css({ width: widthMinusScrollbar });


        if (!$self.closest('.fht-table-wrapper').length) {
          $self.addClass('fht-table');
          $self.wrap('<div class="fht-table-wrapper"></div>');
        }

        var $wrapper = $self.closest('.fht-table-wrapper');
        
        if (settings.fixedColumns > 0 && $wrapper.find('.fht-fixed-column').length === 0) {
          $self.wrap('<div class="fht-fixed-body"></div>');
          $('<div class="fht-fixed-column"></div>').prependTo($wrapper);
          $fixedBody = $wrapper.find('.fht-fixed-body');
        }

        $wrapper.css({ width: '100%', height: '100%' });

        if (!$self.hasClass('fht-table-init')) {
          $self.wrap('<div class="fht-tbody"></div>');
        }

        $divBody = $self.closest('.fht-tbody');

        var tableProps = helpers._getTableProps($self);

        helpers._setupClone($divBody, tableProps.tbody);
        
        
        var $divHead;
        if (!$self.hasClass('fht-table-init')) {
          if (settings.fixedColumns > 0) {
            $divHead = $('<div class="fht-thead"><table class="fht-table"></table></div>').prependTo($fixedBody);
          } else {
            $divHead = $('<div class="fht-thead"><table class="fht-table"></table></div>').prependTo($wrapper);
          }

          $divHead.find('table.fht-table')
            .addClass(settings.originalTable.attr('class'))
            .attr('style', settings.originalTable.attr('style'));

          $thead.clone().appendTo($divHead.find('table'));
        } else {
          $divHead = $wrapper.find('div.fht-thead');
        }

        helpers._setupClone($divHead, tableProps.thead);

        $self.css({ 'margin-top': -$divHead.outerHeight(true) });

        var tbodyHeight = $wrapper.height() - $thead.outerHeight(true) - tableProps.border;
        $divBody.css({ 'height': tbodyHeight });

        $self.addClass('fht-table-init');

        if (settings.fixedColumns > 0) {
          helpers._setupFixedColumn($self, tableProps);
        }

        helpers._bindScroll($divBody, tableProps);

        return self;
      },

      /* Destory fixedHeaderTable and return table to original state */
      destroy: function() {
        var $wrapper = $(this).closest('.fht-table-wrapper');

        $(this).insertBefore($wrapper)
          .removeAttr('style')
          .removeClass('fht-table fht-table-init')
          .find('.fht-cell')
          .remove();

        $wrapper.remove();

        return this;
      }

    };
    
    var helpers = {
      _isTable: function($obj) {
        var $self = $obj,
            hasTable = $self.is('table'),
            hasThead = $self.find('thead').length > 0,
            hasTbody = $self.find('tbody').length > 0;
            
        return hasTable && hasThead && hasTbody;
      },

      _bindScroll: function($self) {
        var $wrapper = $self.closest('.fht-table-wrapper'),
            $thead = $self.siblings('.fht-thead');

        $self.bind('scroll', function() {
          if (settings.fixedColumns > 0) {
            $wrapper.find('.fht-fixed-column').find('.fht-tbody table')
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
        var $wrapper          = $self.closest('.fht-table-wrapper'),
            $fixedBody        = $wrapper.find('.fht-fixed-body'),
            $fixedColumn      = $wrapper.find('.fht-fixed-column'),
            $thead            = $('<div class="fht-thead"><table class="fht-table"><thead><tr></tr></thead></table></div>'),
            $tbody            = $('<div class="fht-tbody"><table class="fht-table"><tbody></tbody></table></div>'),
            fixedBodyWidth    = $wrapper.width(),
            fixedBodyHeight   = $fixedBody.find('.fht-tbody').height() - settings.scrollbarOffset;

        $thead.find('table.fht-table').addClass(settings.originalTable.attr('class'));
        $tbody.find('table.fht-table').addClass(settings.originalTable.attr('class'));

        var $firstThChildren = $fixedBody.find('.fht-thead thead tr > *:lt(' + settings.fixedColumns + ')');
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
        
        // bind vertical wheel events for fixed column
        var maxTop = $fixedColumn.find('.fht-tbody .fht-table').height() - $fixedColumn.find('.fht-tbody').height();
        $fixedColumn.find('.fht-tbody .fht-table').bind('wheel', function(event) {
          if (event.originalEvent.deltaY === 0) { return; }
          var deltaY = -1 * event.originalEvent.deltaY ;/// (20 * 120);// TODO browser stuff
          
          var top = parseInt($(this).css('marginTop'), 10) + (deltaY > 0 ? 120 : -120);
          top = (top > 0 ? 0 : ( top < -maxTop ? -maxTop : top) );
          
          $(this).css('marginTop', top);
          $fixedBody.find('.fht-tbody').scrollTop(-top).scroll();
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
        var selector = ($self.find('thead').length) ? 'thead tr:first-child > *' : 'tbody tr:first-child > *',
            $cell;

        $self.find(selector).each(function(index) {
          $cell = ($(this).find('div.fht-cell').length) ? $(this).find('div.fht-cell') : $('<div class="fht-cell"></div>').appendTo($(this));
          $cell.css({ 'width': parseInt(cellArray[index], 10) });

          /* Fixed Header should extend the full width to align with the scrollbar of the body */
          var a = !$(this).closest('.fht-tbody').length;
          var b = $(this).is(':last-child');
          var c = !$(this).closest('.fht-fixed-column').length;
          if ( a && b  && c) {
            var widthDifference = ($(this).innerWidth() - $(this).width()) / 2;
            var padding = Math.max(widthDifference, settings.scrollbarOffset);
            var computedPadding = parseInt($(this).css('padding-right')) + padding + 'px';
            $(this).css({ 'padding-right': computedPadding });
          }
        });
      },

      /* Determine how the browser calculates fixed widths with padding for tables */
      _isPaddingIncludedWithWidth: function() {
        var $obj = $('<table class="fht-table"><tr><td style="padding: 10px; font-size: 10px;">test</td></tr></table>'),
            defaultHeight,
            newHeight;

        $obj.addClass(settings.originalTable.attr('class'));
        $obj.appendTo('body');

        defaultHeight = $obj.find('td').height();
        $obj.find('td').css('height', $obj.find('tr').height());

        newHeight = $obj.find('td').height();
        $obj.remove();
        
        return defaultHeight !== newHeight;
      },

      /* return int */
      _getScrollbarWidth: function() {
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
        return scrollbarWidth;
      }

    };
    
    if(action === 'destroy'){
      return methods.destroy.apply(this);
    } else if (typeof action === 'boolean' || typeof action === 'undefined'){
      return methods.init.apply(this, arguments);      
    } else {
      $.error('Input "' +  action + '" is not valid for the fixedHeaderRewrite plugin!');      
    }  
    
  };
}(jQuery));
