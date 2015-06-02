(function () {  
  describe('Fixed Header Table Rewrite', function(){
    
    before(function(){
      //build the test fixture
      var rows = 40;
      var columns = 10;
      for(var i = 1; i <= columns; i++){
        var headerCell = _$('<th>Column ' + i + '</th>');
        headerCell.css('background-color', 'hsl(' + 360 / columns * i + ', 100%, 80%)');
        _$('#testTable > thead > tr').append(headerCell);
      }
      for(i = 1; i <= rows; i++){
        _$('#testTable > tbody').append('<tr></tr>');
      }
      _$('#testTable > tbody > tr').each(function(i, el){
        for(var j = 1; j <= columns; j++){
          var randContent = [];
          for(var k = 0; k < j; k++){
            randContent.push('bats');
          }
          randContent = randContent.join();
          var cell = _$('<td>BATMANG ROW ' + i + ' COLUMN ' + j + ' ' + randContent + '</td>');
          cell.css('background-color', 'hsl(' + 360 / columns * i + ', 100%, 80%)');
          _$(el).append(cell);
        }
      });
    });
    
    after(function(){
      _$('#mocha-fixture').hide();
    });
    //http://stackoverflow.com/questions/123999/how-to-tell-if-a-dom-element-is-visible-in-the-current-viewport
    function selectorInViewport (selector) {
      var element = document.querySelector(selector);
      if(element){    
        var rect = element.getBoundingClientRect();
        
        var topInside = rect.top >= 0;
        var leftInside = rect.left >= 0;
        var bottomInside = rect.bottom <= (window.innerHeight || document.documentElement.clientHeight);
        var rightInside = rect.right <= (window.innerWidth || document.documentElement.clientWidth);
        var widerThanWindow = element.scrollWidth > window.innerWidth;
        var tallerThanWindow = element.scrollHeight > window.innerHeight;
        
        return topInside && leftInside && (bottomInside || tallerThanWindow) && (rightInside || widerThanWindow);
      } else {
        return false;
      }
    }
    
    function scrollSelectorIntoView(selector, arg){
      document.querySelector(selector).scrollIntoView(arg);
    }
    describe('Basic functionality', function(){
      it('is a function', function () {
        //returns a thing that duck types to a function
        assert.isTrue(!!(_$.fn.adhesiveTable && _$.fn.adhesiveTable.constructor && _$.fn.adhesiveTable.call && _$.fn.adhesiveTable.apply));
      });
      
      it('when pointed at a non-table, an error is thrown', function(){
        assert.throws(
          function(){
            _$('#subspan').adhesiveTable();
        }, Error, 'Invalid table mark-up');
      });
      
      it('throws if given invalid arguments', function(){
        assert.throws(function(){
          _$('#testTable').adhesiveTable('wonk');
        }, Error, 'Input "wonk" is not valid for the adhesiveTable plugin');
        
        assert.throws(function(){
          _$('#testTable').adhesiveTable(NaN);
        }, Error, 'Input "NaN" is not valid for the adhesiveTable plugin');
        
        assert.throws(function(){
          _$('#testTable').adhesiveTable({});
        }, Error, 'Input "[object Object]" is not valid for the adhesiveTable plugin');
        
        assert.throws(function(){
          _$('#testTable').adhesiveTable([]);
        }, Error, 'Input "" is not valid for the adhesiveTable plugin');
        
        assert.doesNotThrow(function(){
          _$('#testTable').adhesiveTable(false);
        }, Error, 'function does not throw');
        
        assert.doesNotThrow(function(){
          _$('#testTable').adhesiveTable(true);
        }, Error, 'function does not throw');
        
        assert.doesNotThrow(function(){
          _$('#testTable').adhesiveTable('destroy');
        }, Error, 'function does not throw');
      });
    });
    
    describe('Formatting', function(){
      it('when pointed at a table, many things are wrapped', function(){
        _$('#testTable').adhesiveTable();
        var tableWrapper = document.getElementById('mocha-fixture').children[0];
        assert.equal(tableWrapper.getAttribute('class'), 'adhesive-table-wrapper', 'table wrapper should have appropriate classes appended');
      
        var headWrapper = tableWrapper.children[0];
        assert.equal(headWrapper.getAttribute('class'), 'adhesive-thead', 'table header wrapper should have appropriate classes');
        assert.equal(headWrapper.children.length, 1, 'only contains a single element');
        assert.equal(headWrapper.children[0].tagName, 'TABLE', 'contains a table');
        
        
        var bodyWrapper = tableWrapper.children[1];
        assert.equal(bodyWrapper.getAttribute('class'), 'adhesive-tbody', 'table body wrapper should have appropriate classes');
        assert.equal(bodyWrapper.children.length, 1, 'only contains a single element');
        assert.equal(bodyWrapper.children[0].tagName, 'TABLE', 'contains a table');
        
      });
      
      it('when pointed at a table, all elements in a column are the same width', function(){
        _$('#testTable').adhesiveTable();
        var numberOfRows = _$('tr').length;
        var numberOfColumns = _$('#mocha-fixture > div > div.adhesive-fixed-body > div.adhesive-thead > table > thead > tr > th').length;
        var uniformWidth = true;
        for(var j = 1; j <= numberOfColumns; j++){        
          var width = _$('#mocha-fixture > div > div.adhesive-fixed-body > div.adhesive-thead > table > thead > tr > th:nth-child(' + j +')').width();
          for(var i = 1; i <= numberOfRows; i++){
            var rowWidth = _$('#testTable > tbody > tr:nth-child(' + i + ') > td:nth-child(' + j + ')').width();
            if(rowWidth !== width){
              uniformWidth = false;
            }
          }
        }
        assert.isTrue(uniformWidth);
      });
      
      it('when pointed at a table with a fixed column, all elements in a column are the same width', function(){
        _$('#testTable').adhesiveTable(true);
        var numberOfRows = _$('#testTable > tbody > tr').length;
        var numberOfColumns = _$('#mocha-fixture > div > div.adhesive-fixed-body > div.adhesive-thead > table > thead > tr > th').length;
        var uniformWidth = true;
        for(var j = 1; j <= numberOfColumns; j++){        
          var width = _$('#mocha-fixture > div > div.adhesive-fixed-body > div.adhesive-thead > table > thead > tr > th:nth-child(' + j +')').width();
          for(var i = 1; i <= numberOfRows; i++){
            var rowWidth = _$('#testTable > tbody > tr:nth-child(' + i + ') > td:nth-child(' + j + ')').width();
            if(rowWidth !== width){
              uniformWidth = false;
            }
          }
        }
        assert.isTrue(uniformWidth);
      });
      
      it('when pointed at a table with a fixed column, all elements in a row have the same height', function(){
        _$('#testTable').adhesiveTable('destroy');
        var numberOfRows = _$('tr').length;
        var numberOfColumns = _$('#mocha-fixture > div > div.adhesive-fixed-body > div.adhesive-thead > table > thead > tr > th').length;
        var uniformHeight = true;
        
        for(var j = 1; j <= numberOfRows; j++){
          var height = _$('#mocha-fixture > div > div.adhesive-fixed-column > div:nth-child(2) > table > tbody > tr:nth-child(' + j + ') > td').height();
          for(var i = 1; i <= numberOfColumns; i++){
            var rowHeight = _$('#testTable > tbody > tr:nth-child(' + i + ') > td:nth-child(' + j + ')').height();
            if(rowHeight !== height){
              uniformHeight = false;
            }
          }
        }
        assert.isTrue(uniformHeight);
      });
    });
    describe('Makes tables sticky', function(){
      describe('Setup: table is not sticky before using the plugin', function(){
        before(function(){
          _$('#testTable').adhesiveTable('destroy');//reset the cache
        });
        
        it('header is initially visible', function(done){
          scrollSelectorIntoView('thead', true);
          setTimeout(function(){
              assert.isTrue(!!selectorInViewport( 'thead'), 'header is initially visible');
              done();
            }, 100);
        });
        
        it( 'header is no longer visible, because we have scrolled away', function(done){        
          scrollSelectorIntoView('#testTable > tbody > tr:nth-child(40)', true);
          setTimeout(function(){
            assert.isTrue(!selectorInViewport('thead'));
            done();
          }, 10);
        });
        
        it('header is still not visible by simply scrolling to element one below it', function(done){
          scrollSelectorIntoView('#testTable > tbody > tr:nth-child(1)', true);
          setTimeout(function(){
            assert.isTrue(!selectorInViewport('thead'), 'header is still not visible by simply scrolling to element one below it');
            done();
          }, 10);
        });            
      });
      
      describe('Test: using options to access the sticky header, only provide sticky header functionality', function(){
        beforeEach(function(){
          _$('#testTable').adhesiveTable();
        });
        it('header is initially visible', function(){
          scrollSelectorIntoView('#mocha-fixture > div > div.adhesive-thead', true);
          assert.isTrue(selectorInViewport('#mocha-fixture > div > div.adhesive-thead'), 'header is initially visible');
        });
        
        it('header is still visible after scroll', function(done){
          scrollSelectorIntoView('#testTable > tbody > tr:nth-child(40)', true); 
          setTimeout(function(){
            assert.isTrue(selectorInViewport('#mocha-fixture > div > div.adhesive-thead'), 'header still visible');
            done();
          }, 10); 
        });
        
        it('header should be still visible', function(done){
          scrollSelectorIntoView('#testTable > tbody > tr:nth-child(1)', true);
          setTimeout(function(){
            assert.isTrue(selectorInViewport('#mocha-fixture > div > div.adhesive-thead'), 'header should be still visible');
            done();
          }, 10); 
        });
        
        it('does not see the sticky column', function(){
          selectorInViewport('#mocha-fixture > div > div.adhesive-fixed-column');
        });
      });
      
      
      describe('Test: in sticky column mode a sticky column has that functionality', function(){
        before(function(){
          _$('#testTable').adhesiveTable('destroy');//reset the cache
        });
        
        beforeEach(function(){
          _$('#testTable').adhesiveTable(true);
        });
        
        it('should see the cloned column', function(){
          selectorInViewport('#mocha-fixture > div > div.adhesive-fixed-column');
        });
        
        // it('which should have the same height as the regular table', function(){
        //   selectorInViewport('#mocha-fixture > div > div.adhesive-fixed-column').children[1];
        // });
        
        it('should still see the sticky column and header after scrolling right', function(done){
          scrollSelectorIntoView('#testTable > tbody > tr:nth-child(1) > td:nth-child(10)', false); 
          setTimeout(function(){
            assert.isTrue(selectorInViewport('#mocha-fixture > div > div.adhesive-fixed-column > div:nth-child(2) > table > tbody > tr:nth-child(2) > td'), 'sticky column still visible');
            assert.isTrue(selectorInViewport('#mocha-fixture > div > div.adhesive-fixed-body > div.adhesive-thead > table > thead > tr > th:nth-child(10)'), 'header still visible');
            done();
          }, 10); 
        });
        
        it('should still see the sticky column and header after scrolling back left', function(done){
          scrollSelectorIntoView('#testTable > tbody > tr:nth-child(1) > td:nth-child(1)', false); 
          setTimeout(function(){
            assert.isTrue(selectorInViewport('#mocha-fixture > div > div.adhesive-fixed-column > div:nth-child(2) > table > tbody > tr:nth-child(2) > td'), 'sticky column still visible');
            assert.isTrue(selectorInViewport('#mocha-fixture > div > div.adhesive-fixed-body > div.adhesive-thead > table > thead > tr > th:nth-child(1)'), 'header still visible');
            done();
          }, 10); 
        });
        
        it('should still see the sticky column and header to the far right corner', function(done){
          scrollSelectorIntoView('#testTable > tbody > tr:nth-child(40) > td:nth-child(10)', false); 
          setTimeout(function(){
            assert.isTrue(selectorInViewport('#mocha-fixture > div > div.adhesive-fixed-column > div:nth-child(2) > table > tbody > tr:nth-child(40) > td'), 'sticky column still visible');
            assert.isTrue(selectorInViewport('#mocha-fixture > div > div.adhesive-fixed-body > div.adhesive-thead > table > thead > tr > th:nth-child(10)'), 'header still visible');
            done();
          }, 10); 
        });

        it('should still see the sticky column and header after scrolling back left', function(done){
          scrollSelectorIntoView('#testTable > tbody > tr:nth-child(1) > td:nth-child(1)', false); 
          setTimeout(function(){
            assert.isTrue(selectorInViewport('#mocha-fixture > div > div.adhesive-fixed-column > div:nth-child(2) > table > tbody > tr:nth-child(2) > td'), 'sticky column still visible');
            assert.isTrue(selectorInViewport('#mocha-fixture > div > div.adhesive-fixed-body > div.adhesive-thead > table > thead > tr > th:nth-child(1)'), 'header still visible');
            done();
          }, 10); 
        });
        
      });
    });
    
    describe('Caching System', function(){
      beforeEach(function(){
        _$('#testTable').adhesiveTable('destroy');
      });
      
      it('Caches values that would be waste to compute again in a global variable', function(){
        _$('#testTable').adhesiveTable();
        var cache = window.fixedHeaderRewriteCache;
        assert.isTrue(!!cache);
        assert.isTrue(!!cache.getScrollbarWidth);
        assert.isTrue(!!cache.paddingInfo);
      });
      
      it('Calling destroy resets the cache', function(){
        _$('#testTable').adhesiveTable();
        _$('#testTable').adhesiveTable('destroy');
        var cache = window.fixedHeaderRewriteCache;
        assert.isTrue(!!cache);
        assert.isTrue(!cache.getScrollbarWidth);
        assert.isTrue(!cache.paddingInfo);
      });
    });
  });    
  
}());
