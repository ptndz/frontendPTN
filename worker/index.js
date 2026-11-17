import { defaultCache } from "@serwist/next/worker";
import { NetworkOnly, Serwist } from "serwist";

const authNetworkOnlyRule = {
  matcher: /^\/api\/auth\/.*/i,
  handler: new NetworkOnly(),
};

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [authNetworkOnlyRule, ...defaultCache],
});

serwist.addEventListeners();

self.addEventListener("push", function (event) {
  if (!event.data) return;

  const data = JSON.parse(event.data.text());
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.message,
      icon: "/favicon/android-chrome-192x192.png",
    })
  );
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();
  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then(function (clientList) {
        if (clientList.length > 0) {
          let client = clientList[0];
          for (let i = 0; i < clientList.length; i++) {
            if (clientList[i].focused) {
              client = clientList[i];
            }
          }
          return client.focus();
        }

        return self.clients.openWindow("/");
      })
  );
});
