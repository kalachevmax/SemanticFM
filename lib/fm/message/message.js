

/**
 * @param {string} text
 * @return {fm.Action}
 */
fm.message.show = function(text) {
  /**
   * @param {function(fm.Input)} complete
   * @param {function(string, number=)} cancel
   * @param {fm.Input} input
   */
  function show(complete, cancel, input) {
    console.log(text);
    complete(input);
  }

  return show;
};
