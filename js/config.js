/* ==========================================================
   WEDDING CONFIG — edit everything here, nowhere else.
   ========================================================== */
window.WEDDING = {
  bride: { en: "Neha", mr: "नेहा" },
  groom: { en: "Jeegnesh", mr: "जिग्नेश" },

  haldiDate: "4 December 2026",
  weddingDate: "5 December 2026",

  venue: "Radhe Krishna Farm",
  city: "Surat, Gujarat, India",

  mapsUrl:
    "https://www.google.com/maps/place/Radhe+Krishna+Farm/@21.1370696,72.8796206,188m/data=!3m1!1e3!4m6!3m5!1s0x3be0513bf811ea5b:0x28e6eb6d9e4affbf!8m2!3d21.1368697!4d72.8791545!16s%2Fg%2F11yjxnln8c?authuser=0&entry=ttu&g_ep=EgoyMDI2MTAyNy4wIKXMDSoASAFQAw%3D%3D",
  lat: 21.1368697,
  lng: 72.8791545,

  /* Countdown target (Asia/Kolkata, +05:30).
     Ceremony time is NOT confirmed, so this defaults to the start of the
     wedding day. When the family confirms the time, change to e.g.
     "2026-12-05T11:30:00+05:30" */
  countdownTarget: "2026-12-05T00:00:00+05:30",

  /* Event times: leave empty until confirmed. Shown only if filled. */
  haldiTime: "",
  weddingTime: "",

  /* Gallery: first image is the featured one. Add more entries as files
     are copied into /images (e.g. { src: "images/photo2.jpg", alt: "..." }) */
  gallery: [
    { src: "images/couple.jpg", alt: "Neha and Jeegnesh" }
    // { src: "images/photo2.jpg", alt: "Neha and Jeegnesh" },
  ],

  /* Music: put a file in /images or /audio and set the path, e.g. "audio/shehnai.mp3".
     Leave empty to hide the music button. */
  musicSrc: ""
};
