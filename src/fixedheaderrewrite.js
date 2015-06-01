/* Copyright (c) 2015 CDD
 * Licensed under the MIT license.
 */
(function ($) {
  $.fn.fixedHeaderRewrite = function (method, options) {
    // forcibly append the formatting css to the document
    if($('head > link[href="../src/fixedHeaderRewrite.css"]').length === 0){
      $('head').prepend('<link rel="stylesheet" href="../src/fixedHeaderRewrite.css" type="text/css" />');
    }
    // Override default options with passed-in options.
    options = $.extend({}, $.fn.fixedHeaderRewrite.options, options);
        
    // plugin's default options
    var defaults = {
      themeClass:     'fht-default',
      fixedColumns:    0, // fixed first columns
      fixedColumn:     false, // For backward-compatibility
    };
    var settings = {};
    
    // public methods
    var methods = {
      init: function (options) {
        settings = $.extend({}, defaults, options);

        // iterate through all the DOM elements we are attaching the plugin to
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
            $wrapper,
            $divHead,
            $divBody,
            $fixedBody,
            widthMinusScrollbar;

        settings.originalTable = $(this).clone();
        settings.includePadding = helpers._isPaddingIncludedWithWidth();
        settings.scrollbarOffset = helpers._getScrollbarWidth();
        settings.themeClassName = settings.themeClass;

        widthMinusScrollbar = $self.parent().width() - settings.scrollbarOffset;

        $self.css({ width: widthMinusScrollbar });


        if (!$self.closest('.fht-table-wrapper').length) {
          $self.addClass('fht-table');
          $self.wrap('<div class="fht-table-wrapper"></div>');
        }

        $wrapper = $self.closest('.fht-table-wrapper');

        if(settings.fixedColumn === true && settings.fixedColumns <= 0) {
          settings.fixedColumns = 1;
        }

        if (settings.fixedColumns > 0 && $wrapper.find('.fht-fixed-column').length === 0) {
          $self.wrap('<div class="fht-fixed-body"></div>');

          $('<div class="fht-fixed-column"></div>').prependTo($wrapper);

          $fixedBody    = $wrapper.find('.fht-fixed-body');
        }

        $wrapper.css({ width: '100%', height: '100%' })
                .addClass(settings.themeClassName);

        if (!$self.hasClass('fht-table-init')) {
          $self.wrap('<div class="fht-tbody"></div>');
        }

        $divBody = $self.closest('.fht-tbody');

        var tableProps = helpers._getTableProps($self);

        helpers._setupClone($divBody, tableProps.tbody);

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
          helpers._setupFixedColumn($self, self, tableProps);
        }

        helpers._bindScroll($divBody, tableProps);

        return self;
      },

      /* Destory fixedHeaderTable and return table to original state */
      destroy: function() {
        var $self    = $(this),
            self     = this,
            $wrapper = $self.closest('.fht-table-wrapper');

        $self.insertBefore($wrapper)
          .removeAttr('style')
          .removeClass('fht-table fht-table-init')
          .find('.fht-cell')
          .remove();

        $wrapper.remove();

        return self;
      }

    };
    
    // private methods
    var helpers = {

      /* return boolean */
      _isTable: function($obj) {
        var $self = $obj,
            hasTable = $self.is('table'),
            hasThead = $self.find('thead').length > 0,
            hasTbody = $self.find('tbody').length > 0;
            
        return hasTable && hasThead && hasTbody;
      },

      /* return void */
      _bindScroll: function($obj) {
        var $self = $obj,
            $wrapper = $self.closest('.fht-table-wrapper'),
            $thead = $self.siblings('.fht-thead');

        $self.bind('scroll', function() {
          if (settings.fixedColumns > 0) {
            var $fixedColumns = $wrapper.find('.fht-fixed-column');

            $fixedColumns.find('.fht-tbody table')
              .css({
                  'margin-top': -$self.scrollTop()
              });
          }

          $thead.find('table')
            .css({
              'margin-left': -this.scrollLeft
            });
        });
      },

      /* return void */
      _fixHeightWithCss: function ($obj, tableProps) {
        var height = settings.includePadding ? $obj.height() : $obj.parent().height();
        $obj.css({ 'height': height + tableProps.border });
      },

      /* return void */
      _fixWidthWithCss: function($obj, tableProps, width) {
        $obj.each(function() {
          var includedPadding = settings.includePadding ? $(this).width() : $(this).parent().width();
          var computedWidth = (width || width === 0 ? width : includedPadding);
          $(this).css({ 'width': computedWidth + tableProps.border});
        });
      },

      /* return void */
      _setupFixedColumn: function ($obj, obj, tableProps) {
        var $self             = $obj,
            $wrapper          = $self.closest('.fht-table-wrapper'),
            $fixedBody        = $wrapper.find('.fht-fixed-body'),
            $fixedColumn      = $wrapper.find('.fht-fixed-column'),
            $thead            = $('<div class="fht-thead"><table class="fht-table"><thead><tr></tr></thead></table></div>'),
            $tbody            = $('<div class="fht-tbody"><table class="fht-table"><tbody></tbody></table></div>'),
            fixedBodyWidth    = $wrapper.width(),
            fixedBodyHeight   = $fixedBody.find('.fht-tbody').height() - settings.scrollbarOffset,
            $firstThChildren,
            $firstTdChildren,
            fixedColumnWidth,
            $newRow,
            firstTdChildrenSelector;

        $thead.find('table.fht-table').addClass(settings.originalTable.attr('class'));
        $tbody.find('table.fht-table').addClass(settings.originalTable.attr('class'));

        $firstThChildren = $fixedBody.find('.fht-thead thead tr > *:lt(' + settings.fixedColumns + ')');
        fixedColumnWidth = settings.fixedColumns * tableProps.border;
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

        firstTdChildrenSelector = 'tbody tr > *:not(:nth-child(n+' + (settings.fixedColumns + 1) + '))';
        $firstTdChildren = $fixedBody.find(firstTdChildrenSelector)
          .each(function(index) {
            helpers._fixHeightWithCss($(this), tableProps);
            helpers._fixWidthWithCss($(this), tableProps, tdWidths[index % settings.fixedColumns] );
          });

        // clone header
        $thead.appendTo($fixedColumn)
          .find('tr')
          .append($firstThChildren.clone());

        $tbody.appendTo($fixedColumn)
          .css({
            'margin-top': -1,
            'height': fixedBodyHeight + tableProps.border
          });

        $firstTdChildren.each(function(index) {
          if (index % settings.fixedColumns === 0) {
            $newRow = $('<tr></tr>').appendTo($tbody.find('tbody'));

            if (settings.altClass && $(this).parent().hasClass(settings.altClass)) {
              $newRow.addClass(settings.altClass);
            }
          }

          $(this).clone().appendTo($newRow);
        });

        // set width of fixed column wrapper
        $fixedColumn.css({ 'height': 0, 'width': fixedColumnWidth });

        // bind wheel events
        var maxTop = $fixedColumn.find('.fht-tbody .fht-table').height() - $fixedColumn.find('.fht-tbody').height();
        $fixedColumn.find('.fht-tbody .fht-table').bind('wheel', function(event) {
          var deltaY = -1 * event.originalEvent.deltaY ;/// (20 * 120);// TODO browser stuff
          if (deltaY === 0) { return; }
          
          var top = parseInt($(this).css('marginTop'), 10) + (deltaY > 0 ? 120 : -120);
          top = (top > 0 ? 0 : ( top < -maxTop ? -maxTop : top) );
          
          $(this).css('marginTop', top);
          $fixedBody.find('.fht-tbody').scrollTop(-top).scroll();
          return false;
        });


        // set width of body table wrapper
        $fixedBody.css({ 'width': fixedBodyWidth });
      },


      /* return object
       * Widths of each thead cell and tbody cell for the first rows.
       * Used in fixing widths for the fixed header.
       */
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
      _setupClone: function($obj, cellArray) {
        var $self    = $obj,
            selector = ($self.find('thead').length) ? 'thead tr:first-child > *' : 'tbody tr:first-child > *',
            $cell;

        $self.find(selector).each(function(index) {
          $cell = ($(this).find('div.fht-cell').length) ? $(this).find('div.fht-cell') : $('<div class="fht-cell"></div>').appendTo($(this));

          $cell.css({
            'width': parseInt(cellArray[index], 10)
          });

          /* Fixed Header should extend the full width
           * to align with the scrollbar of the body
           */
          if (!$(this).closest('.fht-tbody').length && $(this).is(':last-child') && !$(this).closest('.fht-fixed-column').length) {
            var padding = Math.max((($(this).innerWidth() - $(this).width()) / 2), settings.scrollbarOffset);
            $(this).css({
              'padding-right': parseInt($(this).css('padding-right')) + padding + 'px'
            });
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

          scrollbarWidth = $textarea1.width() - $textarea2.width() + 2; // + 2 for border offset
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
      
    if (methods[method]) {
      return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
    } else if (typeof method === 'object' || !method) {
      return methods.init.apply(this, arguments);
    } else {
      $.error('Method "' +  method + '" does not exist in fixedHeaderTable plugin!');
    }
    
  };
}(jQuery));
