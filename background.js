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

function rewriteRequestCookieHeader(e) {
  var hasSetCookie = false;

  for (var header of e.requestHeaders) {
    if (header.name.toLowerCase() == 'cookie') {
      header.value = requestCookies;
      hasSetCookie = true;
    }
  }

  if (!hasSetCookie) {
    e.requestHeaders.push({
      name: 'Cookie',
      value: requestCookies
    });
  }

  return { requestHeaders: e.requestHeaders };
}

function rewriteResponseCookieHeader(e) {
  for (var header of e.responseHeaders) {
    if (header.name.toLowerCase() === 'set-cookie') {
      console.log('override', header.value.toString());
      header.value = responseSetCookieValue
    }
  }

  return { responseHeaders: e.responseHeaders };
}

browser.webRequest.onBeforeSendHeaders.addListener(
  rewriteRequestCookieHeader,
  { urls: [targetPage] },
  ['blocking', 'requestHeaders']
);

browser.webRequest.onHeadersReceived.addListener(
  rewriteResponseCookieHeader,
  { urls: [targetPage] },
  ['blocking', 'responseHeaders']
);


