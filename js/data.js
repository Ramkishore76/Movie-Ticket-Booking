/**
 * CineWave Entertainment - Initial Data Objects & Seed Database
 * Pega Platform Blueprint BP-2415612 / NIP 2026
 */

const INITIAL_DATA = {
  // Reusable Movie Data Object (US-005)
  movies: [
    {
      movieId: "MOV-101",
      title: "Cosmic Odyssey: Journey Beyond",
      genre: "Sci-Fi / Adventure",
      duration: "2h 48m",
      rating: 9.2,
      language: "English (Dolby Atmos)",
      poster: "assets/images/cosmic_odyssey.jpg",
      synopsis: "An interstellar expedition ventures through a newly discovered wormhole in deep space to locate humanity's next sanctuary before Earth's magnetic collapse.",
      director: "Christopher Nolan",
      cast: "Matthew McConaughey, Anne Hathaway, Jessica Chastain",
      basePrice: 320,
      showType: "Premium IMAX 3D"
    },
    {
      movieId: "MOV-102",
      title: "Neon Shadow: 2099",
      genre: "Cyberpunk / Action",
      duration: "2h 15m",
      rating: 8.8,
      language: "English / Japanese (5.1)",
      poster: "assets/images/neon_shadow.jpg",
      synopsis: "In a rain-drenched Neo-Tokyo, an augmented mercenary uncovers a high-level corporate conspiracy involving synthetic memory warfare.",
      director: "Kairo Tanaka",
      cast: "Rina Tanaka, Kenji Satou, Joharro Sematoi",
      basePrice: 280,
      showType: "Premium IMAX 3D"
    },
    {
      movieId: "MOV-103",
      title: "Chronicles of Elyria",
      genre: "Animation / Fantasy",
      duration: "1h 50m",
      rating: 8.9,
      language: "English / Hindi",
      poster: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80",
      synopsis: "A young cartographer bonds with an ancient celestial phoenix to restore the fading light of the floating crystal realm of Elyria.",
      director: "Hayao Miyazaki",
      cast: "Voice cast: Tom Holland, Zendaya, Mark Hamill",
      basePrice: 220,
      showType: "Standard 2D"
    },
    {
      movieId: "MOV-104",
      title: "The Velocity Horizon",
      genre: "Action / Thriller",
      duration: "2h 10m",
      rating: 8.4,
      language: "English / Tamil",
      poster: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=600&q=80",
      synopsis: "Elite underground racers must execute an impossible cross-continental heist to recover a prototype kinetic power core.",
      director: "Justin Lin",
      cast: "Vin Diesel, Michelle Rodriguez, John Cena",
      basePrice: 200,
      showType: "Standard 2D"
    }
  ],

  // Reusable Show Data Object (US-005)
  shows: [
    {
      showId: "SHW-201",
      movieId: "MOV-101",
      date: "2026-08-31",
      time: "10:30 AM",
      showType: "Premium IMAX 3D",
      hallName: "Audi 1 (IMAX Laser)",
      seatCapacity: 48,
      basePrice: 350
    },
    {
      showId: "SHW-202",
      movieId: "MOV-101",
      date: "2026-08-31",
      time: "02:15 PM",
      showType: "Premium IMAX 3D",
      hallName: "Audi 1 (IMAX Laser)",
      seatCapacity: 48,
      basePrice: 350
    },
    {
      showId: "SHW-203",
      movieId: "MOV-101",
      date: "2026-08-31",
      time: "07:00 PM",
      showType: "Premium IMAX 3D",
      hallName: "Audi 1 (IMAX Laser)",
      seatCapacity: 48,
      basePrice: 400
    },
    {
      showId: "SHW-204",
      movieId: "MOV-102",
      date: "2026-08-31",
      time: "01:00 PM",
      showType: "Premium IMAX 3D",
      hallName: "Audi 2 (VIP Recliner)",
      seatCapacity: 48,
      basePrice: 320
    },
    {
      showId: "SHW-205",
      movieId: "MOV-102",
      date: "2026-08-31",
      time: "06:30 PM",
      showType: "Premium IMAX 3D",
      hallName: "Audi 2 (VIP Recliner)",
      seatCapacity: 48,
      basePrice: 350
    },
    {
      showId: "SHW-206",
      movieId: "MOV-103",
      date: "2026-08-31",
      time: "11:00 AM",
      showType: "Standard 2D",
      hallName: "Audi 3 (Dolby Atmos)",
      seatCapacity: 48,
      basePrice: 220
    },
    {
      showId: "SHW-207",
      movieId: "MOV-103",
      date: "2026-08-31",
      time: "04:30 PM",
      showType: "Standard 2D",
      hallName: "Audi 3 (Dolby Atmos)",
      seatCapacity: 48,
      basePrice: 220
    },
    {
      showId: "SHW-208",
      movieId: "MOV-104",
      date: "2026-08-31",
      time: "03:00 PM",
      showType: "Standard 2D",
      hallName: "Audi 4 (Standard)",
      seatCapacity: 48,
      basePrice: 200
    },
    {
      showId: "SHW-209",
      movieId: "MOV-104",
      date: "2026-08-31",
      time: "08:45 PM",
      showType: "Standard 2D",
      hallName: "Audi 4 (Standard)",
      seatCapacity: 48,
      basePrice: 200
    }
  ],

  // Pre-seeded Cases / Bookings (US-009, US-010)
  cases: [
    {
      caseId: "CW-1001",
      ticketId: "TCK-8921-A",
      customerId: "CUST-501",
      customerName: "Rahul Sharma",
      customerEmail: "rahul.sharma@example.com",
      customerPhone: "+91 98765 43210",
      movieId: "MOV-101",
      movieTitle: "Cosmic Odyssey: Journey Beyond",
      showId: "SHW-201",
      showDate: "2026-08-31",
      showTime: "10:30 AM",
      showType: "Premium IMAX 3D",
      hallName: "Audi 1 (IMAX Laser)",
      seats: ["A3", "A4"],
      ticketCount: 2,
      ticketPrice: 350,
      convenienceFee: 40,
      totalCost: 740,
      bookingStatus: "Confirmed",
      stage: "Resolution",
      createdAt: "2026-08-30T10:15:00Z",
      slaGoalHours: 24,
      slaDeadlineHours: 48,
      urgencyScore: 20,
      queueName: "PremiumShowQueue" // Routed by US-010
    },
    {
      caseId: "CW-1002",
      ticketId: "TCK-4412-B",
      customerId: "CUST-502",
      customerName: "Priya Varma",
      customerEmail: "priya.v@example.com",
      customerPhone: "+91 98451 23456",
      movieId: "MOV-103",
      movieTitle: "Chronicles of Elyria",
      showId: "SHW-206",
      showDate: "2026-08-31",
      showTime: "11:00 AM",
      showType: "Standard 2D",
      hallName: "Audi 3 (Dolby Atmos)",
      seats: ["D5", "D6", "D7"],
      ticketCount: 3,
      ticketPrice: 220,
      convenienceFee: 60,
      totalCost: 720,
      bookingStatus: "Confirmed",
      stage: "Resolution",
      createdAt: "2026-08-29T14:30:00Z",
      slaGoalHours: 24,
      slaDeadlineHours: 48,
      urgencyScore: 45,
      queueName: "StandardShowQueue" // Routed by US-010
    }
  ]
};

// Expose on window for modular script access
window.CINEWAVE_DATA = INITIAL_DATA;
