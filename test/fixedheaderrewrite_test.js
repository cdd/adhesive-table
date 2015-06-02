(function () {  
  describe('Fixed Header Table Rewrite', function(){
    
    after(function(){
      _$('#mocha-fixture').hide();
    });
    //http://stackoverflow.com/questions/123999/how-to-tell-if-a-dom-element-is-visible-in-the-current-viewport
    function selectorInViewport (selector) {
      var el = document.querySelector(selector);
      if(el){    
        var rect = el.getBoundingClientRect();
        var a = rect.top >= 0;
        var b = rect.left >= 0;
        var c = rect.bottom <= (window.innerHeight || document.documentElement.clientHeight);
        var d = rect.right <= (window.innerWidth || document.documentElement.clientWidth);
        return a && b && c && d;
      } else {
        return false;
      }
    }
    
    function scrollSelectorIntoView(selector, arg){
      document.querySelector(selector).scrollIntoView(arg);
    }
      
    it('is a function', function () {
      //returns a thing that duck types to a function
      assert.isTrue(!!(_$.fn.fixedHeaderRewrite && _$.fn.fixedHeaderRewrite.constructor && _$.fn.fixedHeaderRewrite.call && _$.fn.fixedHeaderRewrite.apply));
    });
    
    it('when pointed at a non-table, an error is thrown', function(){
      assert.throws(
        function(){
          _$('#subspan').fixedHeaderRewrite();
      }, Error, 'Invalid table mark-up');
    });
    
    it('throws if given invalid arguments', function(){
      assert.throws(function(){
        _$('#testTable').fixedHeaderRewrite('wonk');
      }, Error, 'Input "wonk" is not valid for the fixedHeaderRewrite plugin!');
      
      assert.throws(function(){
        _$('#testTable').fixedHeaderRewrite(NaN);
      }, Error, 'Input "NaN" is not valid for the fixedHeaderRewrite plugin!');
      
      assert.throws(function(){
        _$('#testTable').fixedHeaderRewrite({});
      }, Error, 'Input "[object Object]" is not valid for the fixedHeaderRewrite plugin!');
      
      assert.throws(function(){
        _$('#testTable').fixedHeaderRewrite([]);
      }, Error, 'Input "" is not valid for the fixedHeaderRewrite plugin!');
      
      assert.doesNotThrow(function(){
        _$('#testTable').fixedHeaderRewrite(false);
      }, Error, 'function does not throw');
      
      assert.doesNotThrow(function(){
        _$('#testTable').fixedHeaderRewrite(true);
      }, Error, 'function does not throw');
      
      assert.doesNotThrow(function(){
        _$('#testTable').fixedHeaderRewrite('destroy');
      }, Error, 'function does not throw');
    });
      
    
    it('loads style sheet automatically', function(){
      
      _$('#testTable').fixedHeaderRewrite();
      _$('#testTable').fixedHeaderRewrite();
      _$('#testTable').fixedHeaderRewrite();
      
      var foundStyleSheets = _$('head > link[href="../src/fixedHeaderRewrite.css"]');
      assert.equal(foundStyleSheets.length, 1, 'a single copy of the style sheet should be found');
    });
    
    it('when pointed at a table, many things are wrapped', function(){
      _$('#testTable').fixedHeaderRewrite();
      var tableWrapper = document.getElementById('mocha-fixture').children[0];
      assert.equal(tableWrapper.getAttribute('class'), 'fht-table-wrapper', 'table wrapper should have appropriate classes appended');
    
      var headWrapper = tableWrapper.children[0];
      assert.equal(headWrapper.getAttribute('class'), 'fht-thead', 'table header wrapper should have appropriate classes');
      assert.equal(headWrapper.children.length, 1, 'only contains a single element');
      assert.equal(headWrapper.children[0].tagName, 'TABLE', 'contains a table');
      
      
      var bodyWrapper = tableWrapper.children[1];
      assert.equal(bodyWrapper.getAttribute('class'), 'fht-tbody', 'table body wrapper should have appropriate classes');
      assert.equal(bodyWrapper.children.length, 1, 'only contains a single element');
      assert.equal(bodyWrapper.children[0].tagName, 'TABLE', 'contains a table');
      
    });
    
    describe('table is not sticky if not run', function(){
      before(function(){
        _$('#testTable').fixedHeaderRewrite('destroy');
      });
      
      it('header is initially visible', function(done){
        scrollSelectorIntoView('thead', true);
        setTimeout(function(){
            assert.isTrue(!!selectorInViewport( 'thead'), 'header is initially visible');
            done();
          }, 300);
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
    
    describe('given no arguments, running the plugin gives a sticky header', function(){
      beforeEach(function(){
        _$('#testTable').fixedHeaderRewrite();
      });
      it('header is initially visible', function(){
        scrollSelectorIntoView('#mocha-fixture > div > div.fht-thead', true);
        assert.isTrue(selectorInViewport('#mocha-fixture > div > div.fht-thead'), 'header is initially visible');
      });
      
      it('header is still visible after scroll', function(done){
        scrollSelectorIntoView('#testTable > tbody > tr:nth-child(40)', true); 
        setTimeout(function(){
          assert.isTrue(selectorInViewport('#mocha-fixture > div > div.fht-thead'), 'header still visible');
          done();
        }, 10); 
      });
      
      it('header should be still visible', function(done){
        scrollSelectorIntoView('#testTable > tbody > tr:nth-child(1)', true);
        setTimeout(function(){
          assert.isTrue(selectorInViewport('#mocha-fixture > div > div.fht-thead'), 'header should be still visible');
          done();
        }, 10); 
      });
    });
    
    
    describe('can be commanded to make the first column sticky', function(){
      before(function(){
        _$('#testTable').fixedHeaderRewrite('destroy');
      });
      
      beforeEach(function(){
        _$('#testTable').fixedHeaderRewrite(true);
      });
      
      it('should see the cloned column', function(){
        selectorInViewport('#mocha-fixture > div > div.fht-fixed-column');
      });
      
      // it('which should have the same height as the regular table', function(){
      //   selectorInViewport('#mocha-fixture > div > div.fht-fixed-column').children[1];
      // });
      
      it('should still see the sticky column and header after scrolling right', function(done){
        scrollSelectorIntoView('#testTable > tbody > tr:nth-child(1) > td:nth-child(10)', false); 
        setTimeout(function(){
          assert.isTrue(selectorInViewport('#mocha-fixture > div > div.fht-fixed-column > div:nth-child(2) > table > tbody > tr:nth-child(2) > td'), 'sticky column still visible');
          assert.isTrue(selectorInViewport('#mocha-fixture > div > div.fht-fixed-body > div.fht-thead > table > thead > tr > th:nth-child(10)'), 'header still visible');
          done();
        }, 10); 
      });
      
      it('should still see the sticky column and header after scrolling back left', function(done){
        scrollSelectorIntoView('#testTable > tbody > tr:nth-child(1) > td:nth-child(1)', false); 
        setTimeout(function(){
          assert.isTrue(selectorInViewport('#mocha-fixture > div > div.fht-fixed-column > div:nth-child(2) > table > tbody > tr:nth-child(2) > td'), 'sticky column still visible');
          assert.isTrue(selectorInViewport('#mocha-fixture > div > div.fht-fixed-body > div.fht-thead > table > thead > tr > th:nth-child(1)'), 'header still visible');
          done();
        }, 10); 
      });
      
      it('should still see the sticky column and header to the far right corner', function(done){
        scrollSelectorIntoView('#testTable > tbody > tr:nth-child(40) > td:nth-child(10)', false); 
        setTimeout(function(){
          assert.isTrue(selectorInViewport('#mocha-fixture > div > div.fht-fixed-column > div:nth-child(2) > table > tbody > tr:nth-child(40) > td'), 'sticky column still visible');
          assert.isTrue(selectorInViewport('#mocha-fixture > div > div.fht-fixed-body > div.fht-thead > table > thead > tr > th:nth-child(10)'), 'header still visible');
          done();
        }, 10); 
      });

      it('should still see the sticky column and header after scrolling back left', function(done){
        scrollSelectorIntoView('#testTable > tbody > tr:nth-child(1) > td:nth-child(1)', false); 
        setTimeout(function(){
          assert.isTrue(selectorInViewport('#mocha-fixture > div > div.fht-fixed-column > div:nth-child(2) > table > tbody > tr:nth-child(2) > td'), 'sticky column still visible');
          assert.isTrue(selectorInViewport('#mocha-fixture > div > div.fht-fixed-body > div.fht-thead > table > thead > tr > th:nth-child(1)'), 'header still visible');
          done();
        }, 10); 
      });
      
    });
  });    
  
}());
