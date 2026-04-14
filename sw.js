// Service Worker for Japan & Korea 2026 Trip App
// Handles: offline caching + scheduled local notifications

const CACHE_NAME = 'japan2026-v2';

const TRIP_EVENTS = [
  // REMINDERS
  { id: 'reminder-obus-htokyo',  type: 'reminder', title: '⏰ Book Overnight Bus Hiroshima→Tokyo', body: 'Book NOW — July peak fills fast · willer-travel.com/en/ or kosokubus.com/en/ · ~¥6,500pp · Book premium/semi-premium seat (2+1 config).', date: '2026-04-15', hour: 9, min: 0 },
  { id: 'reminder-kyoto-shin',   type: 'reminder', title: '⏰ Shinkansen Kyoto→Hiroshima', body: 'Booking requested via shinkansen-ticket.com · Awaiting confirmation to tuninroy@gmail.com · Requested 19 July 15:00–15:30.', date: '2026-04-15', hour: 9, min: 0 },
  { id: 'reminder-nakashima',    type: 'reminder', title: '⏰ Book Nakashima Restaurant Hiroshima', body: 'Reservations now open for 20 July dinner · 3 Michelin stars · ¥20,790pp · Book direct.', date: '2026-05-20', hour: 9, min: 0 },
  { id: 'reminder-teamlab',      type: 'reminder', title: '⏰ Book teamLab Borderless — tickets on sale TODAY', body: 'Tickets now available for July · teamlab.art · Azabudai Hills · Book morning slot · Sells out fast.', date: '2026-05-01', hour: 9, min: 0 },
  { id: 'reminder-yoroniku',     type: 'reminder', title: '⏰ Book Ebisu Yoroniku — opens TODAY 11am JST (10am SA)', body: 'Go to Tabelog NOW · tabelog.com/en/tokyo/A1303/A130302/13211927/ · Book for Tokyo I dinner 5–7 July · Dinner only from 17:00.', date: '2026-06-01', hour: 10, min: 0 },

  // FLIGHTS — OUTBOUND
  { id: 'flight-et844',   type: 'checkin', title: '✈️ ET844 departs tonight 23:50', body: 'Cape Town → Addis Ababa · Head to airport now.', date: '2026-07-01', hour: 20, min: 50 },
  { id: 'flight-et672a',  type: 'checkin', title: '✈️ ET672 departs tonight 22:35', body: 'Addis Ababa → Seoul · Arrives 16:00 tomorrow.', date: '2026-07-01', hour: 19, min: 35 },

  // HOTEL CHECK-INS
  { id: 'checkin-ninetree',    type: 'checkin', title: '🏨 Check-in: Nine Tree Seoul today', body: 'Nine Tree by Parnas Myeongdong 2 · Check-in from 15:00 · Huayun Trip transfer booked from Incheon.', date: '2026-07-02', hour: 14, min: 0 },
  { id: 'checkin-niwa',        type: 'checkin', title: '🏨 Check-in: Hotel Niwa Tokyo today', body: 'Hotel Niwa Tokyo · Chiyoda City · Check-in from 15:00.', date: '2026-07-04', hour: 14, min: 0 },
  { id: 'flight-et672b',       type: 'checkin', title: '✈️ ET672 Seoul→Narita today 17:15', body: 'Seoul Incheon → Tokyo Narita · Arrives 19:40.', date: '2026-07-04', hour: 14, min: 0 },
  { id: 'flight-sky719',       type: 'checkin', title: '✈️ SKY719 Haneda→New Chitose 14:35', body: 'Collect hire car at New Chitose · Drive to Lake Toyako then Shakotan · Fireworks at 20:30!', date: '2026-07-08', hour: 11, min: 0 },
  { id: 'checkin-miharashiso', type: 'checkin', title: '🏠 Check-in: Miharashiso tonight', body: 'Seafood & Food Miharashiso · Shakotan · Check-in from 15:00 · Lake Toyako fireworks at 20:30 en route!', date: '2026-07-08', hour: 14, min: 0 },
  { id: 'checkin-jrinn',       type: 'checkin', title: '🏨 Check-in: JR Inn Chitose tonight', body: 'JR Inn Chitose · Drive from Shakotan via Otaru · 10 min train to airport tomorrow.', date: '2026-07-10', hour: 14, min: 0 },
  { id: 'flight-sky706',       type: 'checkin', title: '✈️ SKY706 New Chitose→Haneda 08:15', body: '70 min connection at Haneda — go directly to Yamato counter to forward bags to OMO3 Asakusa.', date: '2026-07-11', hour: 5, min: 15 },
  { id: 'flight-sky613',       type: 'checkin', title: '✈️ SKY613 Haneda→Shimojishima 11:05', body: 'Arrives Miyakojima 14:05 · Collect car hire via Klook · IDP required.', date: '2026-07-11', hour: 8, min: 5 },
  { id: 'checkin-miyako',      type: 'checkin', title: '🏠 Check-in: Miyakojima today', body: 'Hotel Yah · Shimojishima · Collect car hire on arrival via Klook · IDP required.', date: '2026-07-11', hour: 14, min: 0 },
  { id: 'flight-jta128',       type: 'checkin', title: '✈️ JTA128 Miyakojima→Osaka KIX 19:35', body: 'Arrives 21:55 · Take Haruka to Wakayama (~50 min).', date: '2026-07-14', hour: 16, min: 0 },
  { id: 'checkin-wakayama',    type: 'checkin', title: '🏨 Check-in: S3 Wakayama tonight', body: 'S3 Capsule Hotel · Separate male/female sections · Late arrival only.', date: '2026-07-14', hour: 22, min: 0 },
  { id: 'checkin-koyasan',     type: 'checkin', title: '🏯 ⚠️ Koyasan check-in 15:00–17:00 ONLY', body: 'Fudo-in Temple · MUST arrive 15:00–17:00. Do not be late. Dinner 17:30. Public bath 16:30–20:30.', date: '2026-07-15', hour: 13, min: 0 },
  { id: 'event-koyasan',       type: 'event',   title: '🔔 Morning ceremony in 30 mins — 07:00', body: 'Fudo-in Temple · DO NOT MISS · Incense, chanting, candlelight.', date: '2026-07-16', hour: 6, min: 30 },
  { id: 'checkin-kyoto',       type: 'checkin', title: '🏨 Check-in: Miru Kyoto Gion today', body: 'Miru Kyoto Gion · Check-in from 15:00 · Yoiyama festival tonight from 18:00!', date: '2026-07-17', hour: 14, min: 0 },
  { id: 'event-kikunoi',       type: 'event',   title: '🍽️ Kikunoi Honten tonight 19:00', body: '3★ Michelin · Smart casual · Take taxi from Gion ~15 min · ¥33,000pp.', date: '2026-07-17', hour: 18, min: 0 },
  { id: 'event-gion',          type: 'event',   title: '🎪 Gion Matsuri main procession TODAY 09:00', body: 'Yamahoko Junko · 23 floats · Shijo-Karasuma · Arrive early to get a good spot!', date: '2026-07-18', hour: 7, min: 30 },
  { id: 'shinkansen-kyoto',    type: 'checkin', title: '🚅 Shinkansen Kyoto→Hiroshima today ~15:00', body: 'Nozomi · ~1h40 · Left side seats A/B for Seto Inland Sea views · Car 7, rows 3–10 · Buy ekiben at Kyoto Station!', date: '2026-07-19', hour: 13, min: 30 },
  { id: 'checkin-hiroshima',   type: 'checkin', title: '🏨 Check-in: The Knot Hiroshima today', body: 'The Knot Hiroshima · Rooftop bar overlooks Peace Memorial Park · Complimentary drinks tokens.', date: '2026-07-19', hour: 14, min: 0 },
  { id: 'event-nakashima',     type: 'event',   title: '🍽️ Nakashima Restaurant tonight', body: '3★ Michelin · Hiroshima · ¥20,790pp · Set menu · Chef comes out for photos.', date: '2026-07-20', hour: 18, min: 0 },
  { id: 'obus-hiroshima',      type: 'checkin', title: '🚌 Overnight Bus Hiroshima→Tokyo tonight', body: 'Book premium/semi-premium seat · Departs late evening · Arrives Tokyo ~08:00 · willer-travel.com/en/  or kosokubus.com/en/', date: '2026-07-20', hour: 19, min: 0 },
  { id: 'checkin-omo3',        type: 'checkin', title: '🏨 Check-in: OMO3 Asakusa today', body: 'OMO3 Asakusa by Hoshino Resorts · Your forwarded bags should be waiting!', date: '2026-07-21', hour: 14, min: 0 },
  { id: 'depart-narita',       type: 'checkin', title: '⚠️ Leave OMO3 by 17:00 TODAY', body: 'ET673 departs Narita 20:40 · Airport transfer pre-booked via Booking.com · Allow 3 hours at airport.', date: '2026-07-23', hour: 15, min: 0 },

  // RETURN FLIGHTS
  { id: 'flight-et673',  type: 'checkin', title: '✈️ ET673 Narita→Addis 20:40', body: 'Departs Narita 20:40 · Arrives Addis 06:55 · Connection to ET847 at 08:40.', date: '2026-07-23', hour: 17, min: 40 },
  { id: 'flight-et847',  type: 'checkin', title: '✈️ ET847 Addis→Cape Town 08:40', body: 'Departs Addis 08:40 · Arrives Cape Town 14:35 · Almost home!', date: '2026-07-24', hour: 7, min: 0 },

  // FIREWORKS
  { id: 'event-toyako',  type: 'event', title: '🎆 Lake Toyako fireworks tonight 20:30', body: '20-minute hanabi show · Spectacular lakeside setting with Mt Yotei backdrop · Get to the lakeside now!', date: '2026-07-08', hour: 19, min: 30 },
];

self.addEventListener('install', event => { self.skipWaiting(); });
self.addEventListener('activate', event => { event.waitUntil(clients.claim()); });

self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SCHEDULE_NOTIFICATIONS') {
    scheduleAll();
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
          requireInteraction: true,
          vibrate: [200, 100, 200],
        });
      }, delay);
    }
  });
}
