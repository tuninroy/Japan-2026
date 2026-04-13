// Service Worker for Japan & Korea 2026 Trip App
// Handles: offline caching + scheduled local notifications

const CACHE_NAME = 'japan2026-v1';

// ── TRIP EVENTS ─────────────────────────────────────────────────────────────
// All times in local time at destination (handled by notification scheduling)
const TRIP_EVENTS = [
  // REMINDERS - things still to book
  { id: 'reminder-nakashima',  type: 'reminder', title: '⏰ Book Nakashima Restaurant', body: 'Reservations now open for 20 July dinner. 3 Michelin stars · ¥20,790pp · Book direct.', date: '2026-05-20', hour: 9, min: 0 },
  { id: 'reminder-shinkansen', type: 'reminder', title: '⏰ Book Shinkansen Hiroshima→Tokyo', body: 'Tickets release at 10:00am JST today. Book at shinkansen-ticket.com · ~¥20,000pp.', date: '2026-06-21', hour: 9, min: 0 },
  { id: 'reminder-teamlab',    type: 'reminder', title: '⏰ Book teamLab Planets', body: 'Peak July season — book now at teamlab.art. Choose a morning slot. Planets over Borderless.', date: '2026-05-01', hour: 9, min: 0 },

  // FLIGHTS
  { id: 'flight-et844',   type: 'checkin', title: '✈️ ET844 departs in 3 hours', body: 'Cape Town → Addis Ababa · Departs 23:50. Check in now if not done.', date: '2026-07-01', hour: 20, min: 50 },
  { id: 'flight-et672a',  type: 'checkin', title: '✈️ ET672 departs in 3 hours', body: 'Addis Ababa → Seoul · Departs 22:35.', date: '2026-07-01', hour: 19, min: 35 },
  { id: 'flight-et672b',  type: 'checkin', title: '✈️ ET672 departs in 3 hours', body: 'Seoul → Tokyo Narita · Departs 17:15.', date: '2026-07-04', hour: 14, min: 15 },
  { id: 'flight-sky719',  type: 'checkin', title: '✈️ SKY719 departs in 3 hours', body: 'Haneda → New Chitose · Departs 14:35. Allow time for check-in.', date: '2026-07-08', hour: 11, min: 35 },
  { id: 'flight-sky706',  type: 'checkin', title: '✈️ SKY706 departs in 3 hours', body: 'New Chitose → Haneda · Departs 08:15. Go to Yamato counter for bag forwarding on arrival.', date: '2026-07-11', hour: 5, min: 15 },
  { id: 'flight-sky613',  type: 'checkin', title: '✈️ SKY613 departs in 3 hours', body: 'Haneda → Shimojishima (Miyakojima) · Departs 11:05.', date: '2026-07-11', hour: 8, min: 5 },
  { id: 'flight-jta128',  type: 'checkin', title: '✈️ JTA128 departs in 3 hours', body: 'Miyakojima → Osaka Kansai · Departs 19:35.', date: '2026-07-14', hour: 16, min: 35 },
  { id: 'flight-et673',   type: 'checkin', title: '✈️ ET673 departs in 3 hours', body: 'Narita → Addis Ababa · Departs 20:40. Leave OMO3 Asakusa by 17:00!', date: '2026-07-23', hour: 17, min: 40 },

  // HOTEL CHECK-INS (1 hour before standard check-in)
  { id: 'checkin-ninetree',    type: 'checkin', title: '🏨 Check-in: Nine Tree Seoul', body: 'Nine Tree by Parnas Myeongdong 2 · Check-in from 15:00. Huayun Trip transfer booked.', date: '2026-07-02', hour: 14, min: 0 },
  { id: 'checkin-niwa',        type: 'checkin', title: '🏨 Check-in: Hotel Niwa Tokyo', body: 'Hotel Niwa Tokyo · Chiyoda City · Check-in from 15:00.', date: '2026-07-04', hour: 14, min: 0 },
  { id: 'checkin-miharashiso', type: 'checkin', title: '🏠 Check-in: Miharashiso', body: 'Seafood & Food Miharashiso · Shakotan Peninsula · Check-in from 15:00. Dinner included.', date: '2026-07-08', hour: 14, min: 0 },
  { id: 'checkin-jrinn',       type: 'checkin', title: '🏨 Check-in: JR Inn Chitose', body: 'JR Inn Chitose · 30 sec walk from Chitose Station · Check-in from 15:00.', date: '2026-07-10', hour: 14, min: 0 },
  { id: 'checkin-miyako',      type: 'checkin', title: '🏠 Check-in: Miyakojima', body: 'Hotel Yah · Shimojishima · Collect car hire on arrival (Klook). IDP required.', date: '2026-07-11', hour: 14, min: 0 },
  { id: 'checkin-wakayama',    type: 'checkin', title: '🏨 Check-in: S3 Wakayama Capsule', body: 'S3 Wakayama Capsule Hotel · Note: separate male/female sections.', date: '2026-07-14', hour: 22, min: 0 },
  { id: 'checkin-koyasan',     type: 'checkin', title: '🏯 Check-in: Fudo-in Temple', body: '⚠️ CHECK-IN STRICTLY 15:00–17:00. Do not arrive late. Dinner at 17:30.', date: '2026-07-15', hour: 14, min: 0 },
  { id: 'checkin-kyoto',       type: 'checkin', title: '🏨 Check-in: Miru Kyoto Gion', body: 'Miru Kyoto Gion · Shirakawa canal · Check-in from 15:00. Yoiyama festival tonight!', date: '2026-07-17', hour: 14, min: 0 },
  { id: 'checkin-hiroshima',   type: 'checkin', title: '🏨 Check-in: The Knot Hiroshima', body: 'The Knot Hiroshima · Rooftop bar overlooks Peace Memorial Park.', date: '2026-07-20', hour: 14, min: 0 },
  { id: 'checkin-omo3',        type: 'checkin', title: '🏨 Check-in: OMO3 Asakusa', body: 'OMO3 Asakusa by Hoshino Resorts · Forwarded bags should be waiting for you!', date: '2026-07-21', hour: 14, min: 0 },

  // KEY EVENTS
  { id: 'event-koyasan-ceremony', type: 'event', title: '🔔 Morning ceremony in 30 mins', body: 'Fudo-in Temple morning prayer · 07:00 · DO NOT MISS · Incense, chanting, candlelight.', date: '2026-07-16', hour: 6, min: 30 },
  { id: 'event-gionmatsuri',      type: 'event', title: '🎏 Gion Matsuri procession today', body: 'Main procession from 09:00 · Shijo-Karasuma. 23 decorated floats. Arrive early!', date: '2026-07-18', hour: 8, min: 0 },
  { id: 'event-kikunoi',          type: 'event', title: '🍽️ Kikunoi Honten tonight · 19:00', body: '3 Michelin Stars · Smart casual dress · Take taxi from Gion (~15 min). ¥33,000pp.', date: '2026-07-17', hour: 18, min: 0 },
  { id: 'event-nakashima',        type: 'event', title: '🍽️ Nakashima Restaurant tonight', body: '3 Michelin Stars · Hiroshima · ¥20,790pp. Allow 2 hours.', date: '2026-07-20', hour: 18, min: 0 },
  { id: 'event-laketoyako',       type: 'event', title: '🎆 Lake Toyako fireworks in 1 hour', body: 'Nightly fireworks start ~20:30 · 20 min show · Get to the lakeside now!', date: '2026-07-08', hour: 19, min: 30 },
  { id: 'event-fushimiinari',     type: 'event', title: '⛩️ Fushimi Inari — go now!', body: 'Best before 08:00 to have the torii gates to yourself. 10,000 gates up the mountain.', date: '2026-07-18', hour: 6, min: 45 },
  { id: 'event-overnightbus',     type: 'event', title: '🚌 Overnight bus tonight', body: 'Kyoto → Hiroshima · Departs late evening. Head to bus terminal after dinner.', date: '2026-07-19', hour: 20, min: 0 },
  { id: 'event-miyajima',         type: 'event', title: '⛩️ Miyajima day trip today', body: 'Ferry from Hiroshima pier ~10 min. Check tide times for the floating torii. Grilled oysters for lunch!', date: '2026-07-20', hour: 8, min: 30 },
];

// ── INSTALL: cache the app shell ────────────────────────────────────────────
self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(clients.claim());
});

// ── MESSAGE: schedule notifications from the main thread ───────────────────
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SCHEDULE_NOTIFICATIONS') {
    scheduleAll();
  }
  if (event.data && event.data.type === 'GET_EVENTS') {
    event.ports[0].postMessage({ events: TRIP_EVENTS });
  }
});

function scheduleAll() {
  const now = Date.now();
  TRIP_EVENTS.forEach(ev => {
    const d = new Date(`${ev.date}T${String(ev.hour).padStart(2,'0')}:${String(ev.min).padStart(2,'0')}:00`);
    const delay = d.getTime() - now;
    if (delay > 0) {
      setTimeout(() => {
        self.registration.showNotification(ev.title, {
          body: ev.body,
          icon: '/icon-192.png',
          badge: '/icon-192.png',
          tag: ev.id,
          requireInteraction: ev.type === 'checkin' || ev.type === 'reminder',
          vibrate: [200, 100, 200],
        });
      }, delay);
    }
  });
}
