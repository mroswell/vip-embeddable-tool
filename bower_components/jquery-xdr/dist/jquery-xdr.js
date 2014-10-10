
/*!
 * jquery-xdr - jQuery XDR shim, mainly for IE.
 * v0.1.0
 * 
 * copyright Jon Sharratt 2013
 * MIT License
*/
(function() {
  var _this = this;

  (function(jQuery) {
    if (_this.XDomainRequest) {
      return jQuery.ajaxTransport(function(s) {
        var xdr;
        if (s.crossDomain && s.async) {
          xdr = new XDomainRequest();
          return {
            send: function(headers, complete) {
              var headerThroughUriParameters, response;
              response = function(status, statusText, responses, responseHeaders) {
                xdr.onload = xdr.onerror = xdr.ontimeout = jQuery.noop;
                return complete(status, statusText, responses, responseHeaders);
              };
              xdr.onload = function() {
                return response(200, 'OK', {
                  text: xdr.responseText
                }, "Content-Type: " + xdr.contentType);
              };
              if (s.timeout) {
                xdr.ontimeout = function() {
                  return response(0, 'Timeout');
                };
                xdr.timeout = s.timeout;
              }
              if (s.dataType) {
                headerThroughUriParameters = "header_Accept=" + (encodeURIComponent(s.dataType));
                s.url = s.url + (s.url.indexOf('?') === -1 ? '?' : '&') + headerThroughUriParameters;
              }
              s.contentType = 'text/plain';
              xdr.open(s.type, s.url);
              xdr.onprogress = function() {};
              xdr.send((s.hasContent && s.data) || null);
              xdr.onerror = function(e) {
                return response(404, 'Not Found');
              };
            },
            abort: function() {
              if (xdr) {
                xdr.onerror = jQuery.noop();
                xdr.abort();
              }
            }
          };
        }
      });
    }
  })(jQuery);

}).call(this);
