/* eslint-disable no-undef */
importScripts("https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyDq7Em_OzAMvF0Jm1W9cPw40Eb0jREHQco",
  authDomain: "ev-battery-swap-system.firebaseapp.com",
  projectId: "ev-battery-swap-system",
  storageBucket: "ev-battery-swap-system.appspot.com",
  messagingSenderId: "450888971417",
  appId: "1:450888971417:web:4637cb9114cd6882833408",
  measurementId: "G-6H8GFYNXHH"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function (payload) {
  console.log("📩 [firebase-messaging-sw.js] Background message:", payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: "/logo192.png",
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
