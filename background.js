let config = {
  url: 'https://bugzilla.mozilla.org/rest/',
  email: 'jgriffiths@mozilla.com'
};

browser.browserAction.onClicked.addListener((tab) => {
  let _url = 'https://bugzilla.mozilla.org/request.cgi?action=queue&requestee='+ config.email +'&group=type'
  browser.tabs.create({url: _url});
});

function urlEncode(params) {
  var url = [];
  for(var param in params) {
    var values = params[param];
    if(!values.forEach)
      values = [values];
    // expand any arrays
    values.forEach(function(value) {
       url.push(encodeURIComponent(param) + "=" +
         encodeURIComponent(value));
    });
  }
  return url.join("&");
}

function fetchRequests(config, callback) {
  let url = config.url + '/bug';

  let params = {
    'f1': 'requestees.login_name',
    'o1': 'equals',
    'v1': config.email,
    'query_format': 'advanced',
    'include_fields': 'id,summary,status,resolution,last_change_time,flags'
  };

  if (params && Object.keys(params).length > 0) {
    url += "?" + urlEncode(params);
  }

  console.log(url);

  var req = new XMLHttpRequest();
  req.open('GET', url, true);
  req.setRequestHeader("Accept", "application/json");
  req.onreadystatechange = function (event) {
    if (req.readyState == 4 && req.status != 0) {
      let data = JSON.parse(req.responseText);
      callback(null, data.bugs);
    }
  };
  // req.timeout = this.timeout;
  req.ontimeout = callback;
  req.onerror = callback;
  req.send();
}

function handleResponse(err, data/* an array of bugs */) {
  if (err) throw err;

  if (data.length === 0) {
    browser.browserAction.setBadgeText({text: '0'});
    browser.browserAction.setBadgeBackgroundColor({color: 'green'});
  }
  else {
    browser.browserAction.setBadgeText({text: data.length.toString()});
    browser.browserAction.setBadgeBackgroundColor({color: 'red'});
  }
}

// do this on launch
let loop = setInterval(() => {
  fetchRequests(config, handleResponse);
}, 5000);

fetchRequests(config, handleResponse);
