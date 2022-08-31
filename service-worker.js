let cacheName = "0.0.1";

const sendMessage = (message) => {
  return self.clients.matchAll().then(function (clients) {
    clients.forEach(function (client) {
      client.postMessage(JSON.stringify(message));
    });
  });
};

self.addEventListener('install', function(evt) {

  self.skipWaiting();

  evt.waitUntil(
    caches.open(cacheName)
  );
});

self.addEventListener('message', function(event){

  if (event.data === "new-version") {
    caches.keys().then((keyList) => {
      keyList.forEach((value, index) => {
        if (value !== cacheName) {
          caches.delete(value);
        }
      });
    });
  }

  if (event.data === "reload") {
    sendMessage({
      type: "reload"
    })
  }

});


self.addEventListener('fetch', function(evt) {
  evt.respondWith(fromCache(evt.request));

  if (navigator.onLine) {
    evt.waitUntil(
      update(evt.request)
      .then(refresh)
    );
  }
});


function fromCache(request) {
  return caches.open(cacheName).then(function (cache) {
    return caches.match(request).then(function(response) {
      return response || fetch(request);
    })
  });
}

function update(request) {
  return caches.open(cacheName).then(function (cache) {
    return fetch(request).then(function (response) {
      return cache.put(request, response.clone()).then(function () {
        return response;
      });
    });
  });
}

function refresh(response) {

  return self.clients.matchAll().then(function (clients) {
    clients.forEach(function (client) {

      let message = {
        type: 'refresh',
        url: response.url,
        eTag: response.headers.get('ETag')
      };

      client.postMessage(JSON.stringify(message));
    });
  });
}