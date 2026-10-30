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

  countdownTarget: "2026-12-05T00:00:00+05:30",

  /* Event times: leave empty until confirmed. Shown only if filled. */
  haldiTime: "",
  weddingTime: "",

  /* ----------------------------------------------------------
     COUPLE PHOTO
     Put your couple photo in the  photos/  folder and set the
     filename below. Used in the hero banner and story section.
     ---------------------------------------------------------- */
  couplePhoto: "photos/couple.jpeg",

  /* ----------------------------------------------------------
     GALLERY
     Put all photos in the  photos/  folder.
     The first entry is shown as the large featured photo.
     Add or remove lines as needed.
     ---------------------------------------------------------- */
  gallery: [
    { src: "photos/couple.jpeg",  alt: "Neha and Jeegnesh" },
    // { src: "photos/haldi.jpg",   alt: "Haldi ceremony" },
    // { src: "photos/family.jpg",  alt: "With family" },
    // { src: "photos/fun.jpg",     alt: "Fun moments" },
  ],

  /* ----------------------------------------------------------
     MUSIC
     Put your song in the  music/  folder and set the filename
     below, e.g. "music/love-song.mp3".
     Leave empty ("") to use the built-in Web Audio melody.
     ---------------------------------------------------------- */
  musicSrc: ""   // e.g. "music/love-song.mp3"
};
