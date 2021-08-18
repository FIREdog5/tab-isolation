function onLoad() {
  if (window.sessionStorage["tab_id"] == null) {
    window.sessionStorage.clear();
    window.sessionStorage["tab_id"] = String(Math.floor(Math.random() * 100000000 + 1000000000));
  }
  window.tabId= window.sessionStorage["tab_id"];
  window.sessionStorage.removeItem("tab_id");

  let cookieObj = Object.getOwnPropertyDescriptor(Document.prototype, 'cookie') ||
                 Object.getOwnPropertyDescriptor(HTMLDocument.prototype, 'cookie');

  Object.defineProperty(document, 'cookie', {
      get: modifiedGetCookie(cookieObj.get),
      set: modifiedSetCookie(cookieObj.set),
  });

  Object.defineProperty(window, "localStorage", new (function () {
    this.get = function() {
      return window.sessionStorage;
    }
  })());
}

function modifiedSetCookie(oldFunction) {
  function setCookie(cookieDec) {
    let tabId = window.tabId;
    return oldFunction.call(document, tabId + "-" + cookieDec);
  }
  return setCookie;
}

function modifiedGetCookie(oldFunction) {
  function getCookie() {
    let tabId = window.tabId;
    let cookies = oldFunction.call(document);
    let cookieArr = cookies.split("; ");
    let returnedCookieArr = [];
    cookieArr.forEach(cookie => {
      if (cookie.substring(0,11) == tabId + "-") {
        returnedCookieArr.push(cookie.substring(11, cookie.length));
      }
    });
    if (returnedCookieArr.length == 0) {
      return '';
    } else {
      let returnedCookie = returnedCookieArr[0];
      for (let i = 1; i < returnedCookieArr.length; i++) {
        returnedCookie += '; ' + returnedCookieArr[i];
      }
      return returnedCookie;
    }
  }
  return getCookie;
}

onLoad();
window.addEventListener("beforeunload", function (e) {
  window.sessionStorage["tab_id"] = window.tabId;
});
