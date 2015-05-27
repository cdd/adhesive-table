(function ($) {
  module('jQuery.fixedHeaderRewrite');

  test('is fixedHeaderRewrite', function () {
    // expect(2);
    ok(!!(_$.fn.fixedHeaderRewrite && _$.fn.fixedHeaderRewrite.constructor && _$.fn.fixedHeaderRewrite.call && _$.fn.fixedHeaderRewrite.apply));
    // strictEqual(_$.fn.fixedHeaderRewrite, 'fixedHeaderRewrite.', 'should be fixedHeaderRewrite');
    // strictEqual(_$.fn.fixedHeaderRewrite({punctuation: '!'}), 'fixedHeaderRewrite!', 'should be thoroughly fixedHeaderRewrite');
  });
  
  test('given no arguments, header is sticky', function(){
    _$('#testTable').fixedHeaderRewrite({
      // fixedColumn: true
    });
    
  });
  
}(jQuery));
