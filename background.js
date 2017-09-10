var targetPage = 'https://*.youtube.com/*';

var cookies = [
  'PREF=f1=50000000&f6=400&f5=30000',
  'wide=1'
];

var requestCookies = cookies.join(';');

var responseCookiesDirectives = [
  '',
  'path=/',
  'domain=.youtube.com'
].join(';');

var responseCookies = cookies.map((cookieVal) => {
  return cookieVal + responseCookiesDirectives;
});

var responseSetCookieValue = responseCookies.join('\n');

function rewriteRequestHeader(e) {
  var headersChanged = {};
  var shouldSetCacheHeader = e.url.includes('/watch?');

  for (var header of e.requestHeaders) {
    if (header.name.toLowerCase() === 'cookie') {
      header.value = requestCookies;
      headersChanged.cookie = true;
    }
    if (header.name.toLowerCase() === 'cache-control') {
      header.value = 'max-age=0';
      headersChanged.cacheControl = true;
    }
  }

  if (!headersChanged.cookie) {
    e.requestHeaders.push({
      name: 'Cookie',
      value: requestCookies
    });
  }

  if (shouldSetCacheHeader && !headersChanged.cacheControl) {
    e.requestHeaders.push({
      name: 'Cache-Control',
      value: 'max-age=0'
    });
  }

  return { requestHeaders: e.requestHeaders };
}

function rewriteResponseHeader(e) {
  for (var header of e.responseHeaders) {
    if (header.name.toLowerCase() === 'set-cookie') {
      header.value = responseSetCookieValue
    }
  }

  return { responseHeaders: e.responseHeaders };
}

browser.webRequest.onBeforeSendHeaders.addListener(
  rewriteRequestHeader,
  { urls: [targetPage] },
  ['blocking', 'requestHeaders']
);

browser.webRequest.onHeadersReceived.addListener(
  rewriteResponseHeader,
  { urls: [targetPage] },
  ['blocking', 'responseHeaders']
);
