# Browser Tab Isolation

## The Problem

To begin with, I considered what options there were for initiating isolation. I considered if it was better to allow a user to scrub auth data off of a tab once they were already logged in, or if it was better to isolate the tab from the beginning. I quickly realized that scrubbing data off of an already logged in tab would require the new tab to be isolated anyways, and so it made more sense to simply isolate tabs from the beginning.

I then considered what data my approach would need to isolate. I decided to focus on commonly used website data storage:
 - cookies
 - session data
 - local data

## My Approach

To begin with, I needed a way to keep track of each tab, so that I could differentiate their data. To do this, I created a sufficiently large unique identifier on page load, and stored this identifier in the session storage for that page. This protects the id on page reload, but ensures that two separate tabs are distinguishable. Because session storage is copied on page duplication on most modern browsers, this meant that it was still possible to get two pages with the same id. I will address this below.

Now that I could tell my tabs apart, it was time to start working on the cookies. By adding the tab's identifier as a prefix to each cookie's key, we can keep cookies from twin tabs separate. I don't want the web page to worry about this, so our JavaScript will override the `document.cookie` getter and setter. We will automatically add the tab id followed by a dash to the key of any cookie that is set, and our getter will only return cookies with the appropriate prefix, which it will strip off. This ensures that the JavaScript running on our web page is none the wiser to the cookie manipulations.

```javascript
let cookieDesc = Object.getOwnPropertyDescriptor(Document.prototype, 'cookie') ||
                 Object.getOwnPropertyDescriptor(HTMLDocument.prototype, 'cookie');

Object.defineProperty(document, 'cookie', {
    get: modifiedGetCookie(cookieDesc.get),
    set: modifiedSetCookie(cookieDesc.set)
});
```

I foresee two drawbacks with this cookie renaming method, although they are both minor. First of all, cookies set via html requests will not be correctly decorated, although since we are probably not connected to a sever, this has little impact. Secondly, since each tab creates it's own set of cookies, more memory is consumed by the web pages. Any permanent cookies that are not cleaned up by the browser will therefore exist forever, but I again don't think this is very consequential.

---

Next up is session storage. While session storage is designed to mostly operate independently, many modern browsers duplicate the session when a tab is duplicated. If we can detect tab duplication, we can simply clear out session storage in the new tab, fully separating the two authentication states. In order to detect a duplicate tab, we will leverage the tab id that we have stored in our session storage. When the script is loaded, we will remove the tab id from the session storage and store it in the convenient `window.tabID` field. In order to ensure that our page still works on reload and even pressing back and then forwards, we will then listen to the beforeunload event, and put our tab id back in session storage just before the page is unloaded. This way, when the session is duplicated our new tab will not have a tab id, and we know to clear the session storage.

```javascript
function onLoad() {
  if (window.sessionStorage["tab_id"] == null) {
    window.sessionStorage.clear();
    window.sessionStorage["tab_id"] = random_id();
  }
  window.tabId = window.sessionStorage["tab_id"];
  window.sessionStorage.removeItem("tab_id");
}

window.addEventListener("beforeunload", function (e) {
  window.sessionStorage["tab_id"] = window.tabId;
});

onLoad();
```

So long as our JavaScript is run before any other JavaScript on the page, this will separate duplicate sessions.

---

Lastly we will tackle local storage. I originally wanted to solve this in a very similar manner to the cookies, where each key would receive the tab id as a prefix, however this solution was not foolproof. While overriding the `getItem`, `setItem`, `removeItem`, and `clear` methods of the `window.localStorage` prototype (`Storage.prototype`) was effective, these methods were not called when local storage was accessed via shorthand notation (such as `window.localStorage["auth_token"]`). This made the solution inconsistent and impractical. We can also eliminate the possibility of changing the url/path where the local storage is stored. While it is possible to circumvent the same origin policy protections on local storage and create a custom sub domain for each tab, without a backend implementation the same methods as before would need to be overwritten and the shorthand notation poses the same issue.

Ultimately I decided to go with an imperfect solution. By using session storage to hold all of local storage's values, we can leverage the previous solution to keep local storage separate.

```javascript
Object.defineProperty(window, "localStorage", new (function () {
  this.get = function() {
    return window.sessionStorage;
  }
})());
```

This of course has a significant downside, where a key written to local storage would collide with a key with the same name in session storage and could cause data to be overwritten. A second less impactful downside to this solution is the reduced overall storage capacity. While local storage typically enjoys a larger size than session storage, now both are forced to share the memory allotted to session storage.

---

As one final note, I will mention an idea I had to solve cookie issue using just a little bit of a backend. By allowing the server to ignore a specific entry in a path, we can separate cookie paths. This would look something like `www.test.com/ignoreme1048205726/test.html`. Then, using the same solution for session storage as above, we also randomize the numbers in the ignored portion of the url when a duplicate tab or a new page is opened. I suspect that this new url is still allowed under the same origin policy, and so unfortunately local storage is not affected. In order to change local storage, the domain itself would need to be changed, for instance `www.6301746139.test.com/test.html`.

I made a working implementation of my 3 solutions, which may be found [here](https://github.com/FIREdog5/tab-isolation/blob/main/static/isolation.js), along with a test server and page that uses all 3 data storage methods discussed above. Because I whipped this together very quickly, I have not included documentation or requirements, but I can provide them if you are interested.
