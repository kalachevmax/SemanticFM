

/**
 * @param {string} text
 * @return {fm.Action}
 */
fm.log.message = function(text) {
  /**
   * @param {function(fm.Input)} complete
   * @param {function(string, number=)} cancel
   * @param {fm.Input} input
   */
  function log(complete, cancel, input) {
    console.log('[fm.log] ', text, JSON.stringify(input));
    complete(input);
  }

  return log;
};


/**
 * @param {string} message
 * @return {fm.Action}
 */
fm.log.expand = function(message) {
  /**
   * @param {function(fm.Input)} complete
   * @param {function(string, number=)} cancel
   * @param {fm.Input} input
   */
  function log(complete, cancel, input) {
    console.log('[fm.log] ', message, input);
    complete(input);
  }

  return log;
};
