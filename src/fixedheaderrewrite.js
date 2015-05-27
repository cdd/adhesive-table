/*
 * 
 * 
 *
 * Copyright (c) 2015 Andrew McNutt
 * Licensed under the MIT license.
 */
(function ($) {
  $.fixedHeaderRewrite = function (options) {
    // Override default options with passed-in options.
    options = $.extend({}, $.fixedHeaderRewrite.options, options);
    // Return the name of your plugin plus a punctuation character.
    return 'fixedHeaderRewrite' + options.punctuation;
  };

  // Default options.
  $.fixedHeaderRewrite.options = {
    punctuation: '.'
  };
}(jQuery));
