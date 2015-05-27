(function ($) {
  module('jQuery.fixedHeaderRewrite');

  test('is fixedHeaderRewrite', function () {
    expect(2);
    strictEqual($.fixedHeaderRewrite(), 'fixedHeaderRewrite.', 'should be fixedHeaderRewrite');
    strictEqual($.fixedHeaderRewrite({punctuation: '!'}), 'fixedHeaderRewrite!', 'should be thoroughly fixedHeaderRewrite');
  });
  
}(jQuery));
