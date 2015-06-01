(function () {  
  describe('Fixed Header Table Rewrite', function(){
    
    after(function(){
      _$('#mocha-fixture').hide();
    });
    //http://stackoverflow.com/questions/123999/how-to-tell-if-a-dom-element-is-visible-in-the-current-viewport
    function selectorInViewport (selector) {
      var el = document.querySelector(selector);
      var rect = el.getBoundingClientRect();
      var a = rect.top >= 0;
      var b = rect.left >= 0;
      var c = rect.bottom <= (window.innerHeight || document.documentElement.clientHeight);
      var d = rect.right <= (window.innerWidth || document.documentElement.clientWidth);
      return a && b && c && d;
    }
    
    function scrollSelectorIntoView(selector){
      document.querySelector(selector).scrollIntoView(true);
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
      assert.equal(tableWrapper.getAttribute('class'), 'fht-table-wrapper fht-default', 'table wrapper should have appropriate classes appended');
    
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
        scrollSelectorIntoView('thead');
        setTimeout(function(){
            assert.isTrue(!!selectorInViewport( 'thead'), 'header is initially visible');
            done();
          }, 300);
      });
      
      it( 'header is no longer visible, because we have scrolled away', function(done){        
        scrollSelectorIntoView('#testTable > tbody > tr:nth-child(40)');
        setTimeout(function(){
          assert.isTrue(!selectorInViewport('thead'));
          done();
        }, 10);
      });
      
      it('header is still not visible by simply scrolling to element one below it', function(done){
        scrollSelectorIntoView('#testTable > tbody > tr:nth-child(1)');
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
        scrollSelectorIntoView('#mocha-fixture > div > div.fht-thead');
        assert.isTrue(selectorInViewport('#mocha-fixture > div > div.fht-thead'), 'header is initially visible');
      });
      
      it('header is still visible after scroll', function(done){
        scrollSelectorIntoView('#testTable > tbody > tr:nth-child(40)'); 
        setTimeout(function(){
          assert.isTrue(selectorInViewport('#mocha-fixture > div > div.fht-thead'), 'header still visible');
          done();
        }, 10); 
      });
      
      it('header should be still visible', function(done){
        scrollSelectorIntoView('#testTable > tbody > tr:nth-child(1)');
        setTimeout(function(){
          assert.isTrue(selectorInViewport('#mocha-fixture > div > div.fht-thead'), 'header should be still visible');
          done();
        }, 10); 
      });
    });
  });    
  // it('throws if given invalid arguments', function(){});
  // 
  // it('can be commanded to make the first column sticky', function(){
  //   _$('#testTable').fixedHeaderRewrite({stickyColumn: true});
  // });
  
}());
