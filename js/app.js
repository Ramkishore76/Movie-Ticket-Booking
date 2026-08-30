/**
 * CineWave Entertainment - Movie Ticket Booking Management Application
 * National Internship Program (NIP) · Pega Platform™ Implementation
 * Author: Sanjay S (GitHub: @Sanjay8555)
 */

(function () {
  'use strict';

  // --- STATE MANAGEMENT ---
  const STORAGE_KEY_CASES = 'cinewave_pega_cases_v1';
  const STORAGE_KEY_NOTIFS = 'cinewave_pega_notifications_v1';

  let appState = {
    movies: window.CINEWAVE_DATA ? window.CINEWAVE_DATA.movies : [],
    shows: window.CINEWAVE_DATA ? window.CINEWAVE_DATA.shows : [],
    cases: JSON.parse(localStorage.getItem(STORAGE_KEY_CASES)) || (window.CINEWAVE_DATA ? window.CINEWAVE_DATA.cases : []),
    notifications: JSON.parse(localStorage.getItem(STORAGE_KEY_NOTIFS)) || [],
    currentStage: 1,
    selectedMovie: null,
    activeBooking: {
      caseId: null,
      movieId: 'MOV-101',
      movieTitle: '',
      showId: 'SHW-201',
      showDate: '2026-08-31',
      showTime: '02:15 PM',
      showType: 'Premium IMAX 3D',
      hallName: 'Audi 1 (IMAX Laser)',
      ticketCount: 2,
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      selectedSeats: [],
      basePrice: 350,
      convenienceFee: 40,
      totalCost: 740,
      queueName: 'PremiumShowQueue',
      ticketId: ''
    }
  };

  // Pre-seed notifications if empty
  if (appState.notifications.length === 0 && appState.cases.length > 0) {
    appState.cases.forEach(c => {
      appState.notifications.push(createNotificationPayload(c));
    });
    saveNotifications();
  }

  function saveCases() {
    localStorage.setItem(STORAGE_KEY_CASES, JSON.stringify(appState.cases));
  }

  function saveNotifications() {
    localStorage.setItem(STORAGE_KEY_NOTIFS, JSON.stringify(appState.notifications));
    updateNotificationBadge();
  }

  // --- AUDIO SYNTHESIS (Micro-interactions) ---
  function playBeep(type = 'click') {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'click') {
        osc.frequency.setValueAtTime(480, ctx.currentTime);
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
        osc.start();
        osc.stop(ctx.currentTime + 0.08);
      } else if (type === 'success') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1); // E5
        osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2); // G5
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      }
    } catch (e) {
      // Audio context might be restricted before interaction
    }
  }

  // --- INITIALIZATION ---
  document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    renderMoviesGrid(appState.movies);
    populateMovieSelectOptions();
    initFiltersAndSearch();
    initStageControls();
    renderStaffQueuesTable('all');
    initStaffTabs();
    initTrackerSearch();
    updateNotificationBadge();

    // Event listeners
    document.getElementById('modal-close-btn').addEventListener('click', closeBookingModal);
    document.getElementById('btn-open-notifications').addEventListener('click', () => toggleNotifModal(true));
    document.getElementById('btn-refresh-queues').addEventListener('click', () => {
      renderStaffQueuesTable('all');
      showToast('Staff Queues refreshed', 'info');
    });

    // Show type selection toggle (US-010)
    document.querySelectorAll('.show-type-card').forEach(card => {
      card.addEventListener('click', () => {
        document.querySelectorAll('.show-type-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        const selectedType = card.getAttribute('data-type');
        appState.activeBooking.showType = selectedType;
        // US-010 Automatic decision table routing logic
        appState.activeBooking.queueName = (selectedType.includes('Premium') || selectedType.includes('IMAX'))
          ? 'PremiumShowQueue'
          : 'StandardShowQueue';
        updatePricingCalculation();
        playBeep('click');
      });
    });

    // Form change listeners
    document.getElementById('form-movie-select').addEventListener('change', (e) => {
      onMovieSelectChange(e.target.value);
    });

    document.getElementById('form-ticket-count').addEventListener('change', (e) => {
      appState.activeBooking.ticketCount = parseInt(e.target.value, 10);
      document.getElementById('seats-needed-badge').textContent = appState.activeBooking.ticketCount;
      // Reset selected seats if count changed
      appState.activeBooking.selectedSeats = [];
      renderAuditoriumGrid();
      updatePricingCalculation();
    });
  });

  // --- NAVIGATION CONTROLLER ---
  function initNavigation() {
    const navButtons = document.querySelectorAll('#main-nav .nav-btn');
    navButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        navButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const targetId = btn.getAttribute('data-target');
        document.getElementById('catalog-view').style.display = (targetId === 'catalog-view') ? 'block' : 'none';
        document.getElementById('tracker-view').style.display = (targetId === 'tracker-view') ? 'block' : 'none';
        
        const staffView = document.getElementById('staff-view');
        if (targetId === 'staff-view') {
          staffView.classList.add('active');
          renderStaffQueuesTable('all');
        } else {
          staffView.classList.remove('active');
        }
        playBeep('click');
      });
    });
  }

  // --- MOVIE CATALOG & RENDERING ---
  function renderMoviesGrid(moviesList) {
    const container = document.getElementById('movies-grid-container');
    const countBadge = document.getElementById('movie-count-badge');
    if (!container) return;

    countBadge.textContent = `Showing ${moviesList.length} Movies`;
    if (moviesList.length === 0) {
      container.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: var(--text-muted);">No movies matched your search filter.</div>`;
      return;
    }

    container.innerHTML = moviesList.map(movie => {
      const isPremium = movie.showType.includes('Premium') || movie.showType.includes('IMAX');
      const badgeClass = isPremium ? 'badge-premium' : 'badge-standard';
      const badgeText = isPremium ? '💎 Premium IMAX' : '🎟️ Standard 2D';

      return `
        <div class="movie-card">
          <div class="card-poster-wrapper">
            <img src="${movie.poster}" alt="${movie.title}" class="card-poster" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80'">
            <div class="poster-badge-top ${badgeClass}">${badgeText}</div>
            <div class="poster-rating">★ ${movie.rating}</div>
          </div>
          <div class="card-content">
            <h3 class="card-title" title="${movie.title}">${movie.title}</h3>
            <div class="card-genre">${movie.genre} · ${movie.duration}</div>
            <div class="card-schedule-pills">
              <span class="time-chip">10:30 AM</span>
              <span class="time-chip">02:15 PM</span>
              <span class="time-chip">06:30 PM</span>
            </div>
            <div class="card-footer">
              <div class="price-tag">From <span>₹${movie.basePrice}</span></div>
              <button class="btn btn-primary btn-sm" onclick="window.openBookingModal('${movie.movieId}')">
                Book Ticket →
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  function populateMovieSelectOptions() {
    const select = document.getElementById('form-movie-select');
    if (!select) return;
    select.innerHTML = appState.movies.map(m => `
      <option value="${m.movieId}">${m.title} (${m.showType} - ₹${m.basePrice})</option>
    `).join('');
  }

  function initFiltersAndSearch() {
    const filterButtons = document.querySelectorAll('#genre-filters .pill-btn');
    const searchInput = document.getElementById('movie-search-input');

    filterButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        filterButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        applyMovieFilters();
        playBeep('click');
      });
    });

    searchInput.addEventListener('input', () => {
      applyMovieFilters();
    });
  }

  function applyMovieFilters() {
    const activeBtn = document.querySelector('#genre-filters .pill-btn.active');
    const filterVal = activeBtn ? activeBtn.getAttribute('data-filter') : 'all';
    const query = (document.getElementById('movie-search-input').value || '').toLowerCase().trim();

    let filtered = appState.movies.filter(movie => {
      const matchesFilter = (filterVal === 'all') 
        || movie.genre.includes(filterVal) 
        || movie.showType.includes(filterVal);

      const matchesSearch = !query 
        || movie.title.toLowerCase().includes(query)
        || movie.genre.toLowerCase().includes(query)
        || movie.language.toLowerCase().includes(query);

      return matchesFilter && matchesSearch;
    });

    renderMoviesGrid(filtered);
  }

  // --- BOOKING LIFECYCLE CONTROLLER (STAGES 1 to 5) ---
  window.openBookingModal = function (movieId = 'MOV-101') {
    playBeep('click');
    const movie = appState.movies.find(m => m.movieId === movieId) || appState.movies[0];
    appState.selectedMovie = movie;

    // Generate New Case ID (US-001)
    const newCaseNumber = 1000 + appState.cases.length + 1;
    appState.activeBooking.caseId = `CW-${newCaseNumber}`;
    appState.activeBooking.movieId = movie.movieId;
    appState.activeBooking.movieTitle = movie.title;
    appState.activeBooking.basePrice = movie.basePrice;
    appState.activeBooking.showType = movie.showType;
    appState.activeBooking.queueName = (movie.showType.includes('Premium') || movie.showType.includes('IMAX'))
      ? 'PremiumShowQueue'
      : 'StandardShowQueue';

    // Populate UI
    document.getElementById('form-movie-select').value = movie.movieId;
    document.getElementById('modal-case-id-display').textContent = `CASE: ${appState.activeBooking.caseId}`;
    document.getElementById('modal-movie-title').innerHTML = `🎟️ ${movie.title} <span class="modal-case-badge">CASE: ${appState.activeBooking.caseId}</span>`;

    // Highlight proper show type card
    if (movie.showType.includes('Premium') || movie.showType.includes('IMAX')) {
      document.getElementById('card-type-premium').classList.add('selected');
      document.getElementById('card-type-standard').classList.remove('selected');
    } else {
      document.getElementById('card-type-standard').classList.add('selected');
      document.getElementById('card-type-premium').classList.remove('selected');
    }

    setBookingStage(1);
    document.getElementById('booking-modal-backdrop').classList.add('active');
  };

  function closeBookingModal() {
    document.getElementById('booking-modal-backdrop').classList.remove('active');
  }

  function onMovieSelectChange(movieId) {
    const movie = appState.movies.find(m => m.movieId === movieId);
    if (!movie) return;
    appState.selectedMovie = movie;
    appState.activeBooking.movieId = movie.movieId;
    appState.activeBooking.movieTitle = movie.title;
    appState.activeBooking.basePrice = movie.basePrice;
    appState.activeBooking.showType = movie.showType;
    appState.activeBooking.queueName = (movie.showType.includes('Premium') || movie.showType.includes('IMAX'))
      ? 'PremiumShowQueue'
      : 'StandardShowQueue';

    if (movie.showType.includes('Premium') || movie.showType.includes('IMAX')) {
      document.getElementById('card-type-premium').classList.add('selected');
      document.getElementById('card-type-standard').classList.remove('selected');
    } else {
      document.getElementById('card-type-standard').classList.add('selected');
      document.getElementById('card-type-premium').classList.remove('selected');
    }
    updatePricingCalculation();
  }

  function setBookingStage(stageNum) {
    appState.currentStage = stageNum;

    // Update Stepper UI
    document.querySelectorAll('#lifecycle-stepper .step-node').forEach(node => {
      const step = parseInt(node.getAttribute('data-step'), 10);
      node.classList.remove('active', 'completed');
      if (step === stageNum) {
        node.classList.add('active');
      } else if (step < stageNum) {
        node.classList.add('completed');
      }
    });

    // Update Stage Views
    for (let i = 1; i <= 5; i++) {
      const view = document.getElementById(`stage-${i}-view`);
      if (view) {
        view.classList.toggle('active', i === stageNum);
      }
    }

    // Modal Footer Button Controls
    const prevBtn = document.getElementById('btn-modal-prev');
    const nextBtn = document.getElementById('btn-modal-next');
    const cancelBtn = document.getElementById('btn-cancel-request');

    if (stageNum === 1) {
      prevBtn.style.display = 'none';
      nextBtn.style.display = 'inline-flex';
      nextBtn.textContent = 'Proceed to Seating →';
      cancelBtn.style.display = 'inline-flex';
    } else if (stageNum === 2) {
      prevBtn.style.display = 'inline-flex';
      nextBtn.style.display = 'inline-flex';
      nextBtn.textContent = 'Review Booking Details →';
      cancelBtn.style.display = 'inline-flex';
      renderAuditoriumGrid();
      updatePricingCalculation();
    } else if (stageNum === 3) {
      prevBtn.style.display = 'inline-flex';
      nextBtn.style.display = 'inline-flex';
      nextBtn.textContent = '✓ Confirm Booking (Grant Approval)';
      cancelBtn.style.display = 'inline-flex';
      populateReviewStageData();
    } else if (stageNum === 4) {
      prevBtn.style.display = 'none';
      nextBtn.style.display = 'none';
      cancelBtn.style.display = 'none';
    } else if (stageNum === 5) {
      prevBtn.style.display = 'none';
      nextBtn.style.display = 'inline-flex';
      nextBtn.textContent = 'Done / Close Window';
      cancelBtn.style.display = 'none';
      populateStage5Resolution();
    }
  }

  function initStageControls() {
    const nextBtn = document.getElementById('btn-modal-next');
    const prevBtn = document.getElementById('btn-modal-prev');

    nextBtn.addEventListener('click', () => {
      if (appState.currentStage === 1) {
        // Validate inputs (US-001)
        const custName = document.getElementById('form-cust-name').value.trim();
        const custEmail = document.getElementById('form-cust-email').value.trim();
        const custPhone = document.getElementById('form-cust-phone').value.trim();

        if (!custName || !custEmail) {
          showToast('Please enter customer name and email to proceed', 'error');
          return;
        }

        appState.activeBooking.customerName = custName;
        appState.activeBooking.customerEmail = custEmail;
        appState.activeBooking.customerPhone = custPhone || '+91 98765 00000';
        appState.activeBooking.showDate = document.getElementById('form-show-date').value;
        appState.activeBooking.showTime = document.getElementById('form-show-time').value;

        playBeep('click');
        setBookingStage(2);
      } else if (appState.currentStage === 2) {
        // Validate seat selection count (US-002)
        if (appState.activeBooking.selectedSeats.length !== appState.activeBooking.ticketCount) {
          showToast(`Please select exactly ${appState.activeBooking.ticketCount} seats`, 'error');
          return;
        }
        playBeep('click');
        setBookingStage(3);
      } else if (appState.currentStage === 3) {
        // US-004 Confirmation approval granted -> Process Stage 4 & 5
        playBeep('success');
        setBookingStage(4);
        processBookingExecution();
      } else if (appState.currentStage === 5) {
        closeBookingModal();
      }
    });

    prevBtn.addEventListener('click', () => {
      if (appState.currentStage > 1 && appState.currentStage < 4) {
        playBeep('click');
        setBookingStage(appState.currentStage - 1);
      }
    });
  }

  // --- STAGE 2: SEATING MATRIX & CAPACITY ENGINE (US-002, US-003) ---
  const ROW_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];
  const SEATS_PER_ROW = 8;
  const PRE_BOOKED_SEATS = ['A1', 'A2', 'B4', 'C7', 'C8', 'E3'];

  function renderAuditoriumGrid() {
    const gridContainer = document.getElementById('auditorium-grid');
    if (!gridContainer) return;

    gridContainer.innerHTML = ROW_LETTERS.map(row => {
      let seatsHtml = '';
      for (let num = 1; num <= SEATS_PER_ROW; num++) {
        const seatCode = `${row}${num}`;
        const isBooked = PRE_BOOKED_SEATS.includes(seatCode);
        const isSelected = appState.activeBooking.selectedSeats.includes(seatCode);
        const isVip = (row === 'A');

        let classes = ['seat'];
        if (isBooked) classes.push('booked');
        if (isSelected) classes.push('selected');
        if (isVip) classes.push('seat-category-vip');

        seatsHtml += `
          <div class="${classes.join(' ')}" data-seat="${seatCode}" onclick="window.toggleSeatSelection('${seatCode}')">
            ${seatCode}
          </div>
        `;
      }

      return `
        <div class="seat-row">
          <div class="row-letter">${row}</div>
          ${seatsHtml}
          <div class="row-letter">${row}</div>
        </div>
      `;
    }).join('');

    const totalAvailable = (ROW_LETTERS.length * SEATS_PER_ROW) - PRE_BOOKED_SEATS.length;
    document.getElementById('seats-available-indicator').textContent = `${totalAvailable} Seats Available`;
  }

  window.toggleSeatSelection = function (seatCode) {
    if (PRE_BOOKED_SEATS.includes(seatCode)) return;

    const list = appState.activeBooking.selectedSeats;
    const index = list.indexOf(seatCode);

    if (index > -1) {
      list.splice(index, 1);
      playBeep('click');
    } else {
      if (list.length >= appState.activeBooking.ticketCount) {
        showToast(`You already selected ${appState.activeBooking.ticketCount} seats`, 'info');
        return;
      }
      list.push(seatCode);
      playBeep('click');
    }

    renderAuditoriumGrid();
    updatePricingCalculation();
  };

  // --- PRICING ENGINE (US-003) ---
  function updatePricingCalculation() {
    const movie = appState.selectedMovie || appState.movies[0];
    let baseTicketPrice = movie.basePrice;

    // Additional charge for VIP rows
    let vipSurcharge = 0;
    appState.activeBooking.selectedSeats.forEach(seat => {
      if (seat.startsWith('A')) {
        vipSurcharge += 80;
      }
    });

    const ticketCount = appState.activeBooking.ticketCount;
    const subtotal = (baseTicketPrice * ticketCount) + vipSurcharge;
    const convenienceFee = 20 * ticketCount;
    const totalCost = subtotal + convenienceFee;

    appState.activeBooking.basePrice = baseTicketPrice;
    appState.activeBooking.convenienceFee = convenienceFee;
    appState.activeBooking.totalCost = totalCost;

    // Update Live Pricing Bar
    const selectedListStr = appState.activeBooking.selectedSeats.length > 0
      ? appState.activeBooking.selectedSeats.join(', ')
      : 'None';

    const liveSeats = document.getElementById('live-seats-summary');
    const liveMath = document.getElementById('live-ticket-math');
    const liveTotal = document.getElementById('live-total-cost');

    if (liveSeats) liveSeats.textContent = `Selected Seats: ${selectedListStr}`;
    if (liveMath) liveMath.textContent = `${ticketCount} Tickets × ₹${baseTicketPrice} + Fee (₹${convenienceFee})`;
    if (liveTotal) liveTotal.textContent = `₹${totalCost}`;
  }

  // --- STAGE 3: REVIEW SUMMARY POPULATION (US-004, US-006) ---
  function populateReviewStageData() {
    const b = appState.activeBooking;
    document.getElementById('review-movie-title').textContent = b.movieTitle;
    document.getElementById('review-show-type-badge').textContent = b.showType;
    document.getElementById('review-routed-queue').textContent = b.queueName;
    document.getElementById('review-cust-name').textContent = b.customerName;
    document.getElementById('review-cust-email').textContent = b.customerEmail;
    document.getElementById('review-show-datetime').textContent = `${b.showDate} at ${b.showTime}`;
    document.getElementById('review-seats-list').textContent = b.selectedSeats.join(', ');

    document.getElementById('calc-line-tickets').textContent = `Tickets (${b.ticketCount} × ₹${b.basePrice})`;
    document.getElementById('calc-val-tickets').textContent = `₹${b.basePrice * b.ticketCount}`;
    document.getElementById('calc-val-fee').textContent = `₹${b.convenienceFee}`;
    document.getElementById('calc-val-total').textContent = `₹${b.totalCost}`;
  }

  window.handleCancelRequest = function () {
    playBeep('click');
    if (confirm('Are you sure you want to cancel this booking request?')) {
      showToast('Booking request cancelled and closed', 'info');
      closeBookingModal();
    }
  };

  // --- STAGE 4 & 5: EXECUTION, TICKET & CORRESPONDENCE (US-007, US-008, US-010) ---
  function processBookingExecution() {
    const b = appState.activeBooking;
    const msgLine = document.getElementById('routing-msg-line');
    if (msgLine) {
      msgLine.textContent = `[Pega-Routing] Routing case automatically to ${b.queueName}... DONE`;
    }

    setTimeout(() => {
      // Generate Unique Ticket ID
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      b.ticketId = `TCK-${randomSuffix}-${b.showType.includes('Premium') ? 'P' : 'S'}`;

      // Create new Case Object
      const newCase = {
        caseId: b.caseId,
        ticketId: b.ticketId,
        customerId: `CUST-${Math.floor(500 + Math.random() * 500)}`,
        customerName: b.customerName,
        customerEmail: b.customerEmail,
        customerPhone: b.customerPhone,
        movieId: b.movieId,
        movieTitle: b.movieTitle,
        showId: b.showId,
        showDate: b.showDate,
        showTime: b.showTime,
        showType: b.showType,
        hallName: b.hallName,
        seats: [...b.selectedSeats],
        ticketCount: b.ticketCount,
        ticketPrice: b.basePrice,
        convenienceFee: b.convenienceFee,
        totalCost: b.totalCost,
        bookingStatus: 'Confirmed',
        stage: 'Resolution',
        createdAt: new Date().toISOString(),
        slaGoalHours: 24,
        slaDeadlineHours: 48,
        urgencyScore: 10,
        queueName: b.queueName
      };

      appState.cases.unshift(newCase);
      saveCases();

      // Dispatch Correspondence Notification (US-008)
      const notif = createNotificationPayload(newCase);
      appState.notifications.unshift(notif);
      saveNotifications();

      setBookingStage(5);
      showToast(`Booking ${newCase.caseId} Confirmed & Dispatched!`, 'success');
      playBeep('success');
    }, 1200);
  }

  function populateStage5Resolution() {
    const b = appState.activeBooking;
    document.getElementById('tck-movie-name').textContent = b.movieTitle;
    document.getElementById('tck-case-id').textContent = b.caseId;
    document.getElementById('tck-datetime').textContent = `${b.showDate}, ${b.showTime}`;
    document.getElementById('tck-hall').textContent = b.showType;
    document.getElementById('tck-seats').textContent = b.selectedSeats.join(', ');
    document.getElementById('tck-total').textContent = `₹${b.totalCost}`;
    document.getElementById('tck-id-code').textContent = b.ticketId;
    document.getElementById('tck-holder-name').textContent = b.customerName;

    // Format correspondence according to exact NIP specification
    const emailBody = generateCorrespondenceEmail(b);
    document.getElementById('email-correspondence-text').textContent = emailBody;
  }

  // --- CORRESPONDENCE GENERATOR (US-008 Exact Template) ---
  function generateCorrespondenceEmail(c) {
    const seatsStr = Array.isArray(c.seats || c.selectedSeats) 
      ? (c.seats || c.selectedSeats).join(', ') 
      : (c.seats || c.selectedSeats);

    return `Subject: Movie Ticket Booking Confirmed – ${c.caseId}

Dear ${c.customerName || c.name},

Your movie ticket booking has been successfully confirmed.
Below are the details of your booking:
• Case ID: ${c.caseId}
• Movie Name: ${c.movieTitle || c.movieName}
• Show Date & Time: ${c.showDate} & ${c.showTime}
• Number of Tickets: ${c.ticketCount || c.seatsCount || 1}
• Seat Numbers: [${seatsStr}]
• Total Cost: ₹${c.totalCost}

Please arrive at the theatre before show time and present your booking details at entry.

Thank you for choosing our services. Enjoy your movie!

Regards,
CineWave Entertainment – Booking Support Team`;
  }

  function createNotificationPayload(c) {
    return {
      notificationId: `NOTIF-${Math.floor(1000 + Math.random() * 9000)}`,
      caseId: c.caseId,
      recipient: c.customerEmail,
      subject: `Movie Ticket Booking Confirmed – ${c.caseId}`,
      body: generateCorrespondenceEmail(c),
      timestamp: new Date().toLocaleString()
    };
  }

  window.copyEmailCorrespondence = function () {
    const text = document.getElementById('email-correspondence-text').textContent;
    navigator.clipboard.writeText(text).then(() => {
      showToast('Email text copied to clipboard!', 'info');
      playBeep('click');
    });
  };

  // --- SLA URGENCIES & WORK QUEUES (US-009, US-010) ---
  function calculateSlaStatus(caseItem) {
    const createdTime = new Date(caseItem.createdAt).getTime();
    const now = new Date().getTime();
    const hoursElapsed = (now - createdTime) / (1000 * 60 * 60);

    if (hoursElapsed < 24) {
      return {
        badgeClass: 'sla-normal',
        label: '🟢 Within Goal (1d SLA)',
        urgency: caseItem.urgencyScore || 10
      };
    } else if (hoursElapsed < 48) {
      return {
        badgeClass: 'sla-warning',
        label: '🟡 Approaching Deadline',
        urgency: 45
      };
    } else {
      return {
        badgeClass: 'sla-urgent',
        label: '🔴 Deadline Missed / Escalated',
        urgency: 85
      };
    }
  }

  function renderStaffQueuesTable(queueFilter = 'all') {
    const tbody = document.getElementById('queue-table-body');
    if (!tbody) return;

    let filteredCases = appState.cases;
    if (queueFilter === 'PremiumShowQueue' || queueFilter === 'StandardShowQueue') {
      filteredCases = appState.cases.filter(c => c.queueName === queueFilter);
    }

    // Update queue count badges
    const countAll = appState.cases.length;
    const countPrem = appState.cases.filter(c => c.queueName === 'PremiumShowQueue').length;
    const countStd = appState.cases.filter(c => c.queueName === 'StandardShowQueue').length;

    const bAll = document.getElementById('count-all-queue');
    const bPrem = document.getElementById('count-premium-queue');
    const bStd = document.getElementById('count-standard-queue');

    if (bAll) bAll.textContent = countAll;
    if (bPrem) bPrem.textContent = countPrem;
    if (bStd) bStd.textContent = countStd;

    if (filteredCases.length === 0) {
      tbody.innerHTML = `<tr><td colspan="10" style="text-align: center; color: var(--text-dim); padding: 2rem;">No cases found in this work queue.</td></tr>`;
      return;
    }

    tbody.innerHTML = filteredCases.map(c => {
      const sla = calculateSlaStatus(c);
      const seatsStr = Array.isArray(c.seats) ? c.seats.join(', ') : c.seats;
      const isPremQueue = c.queueName === 'PremiumShowQueue';

      return `
        <tr>
          <td><strong style="color: #a5b4fc;">${c.caseId}</strong></td>
          <td>
            <div style="font-weight: 600;">${c.customerName}</div>
            <div style="font-size: 0.75rem; color: var(--text-dim);">${c.customerEmail}</div>
          </td>
          <td>
            <div style="font-weight: 600;">${c.movieTitle}</div>
            <div style="font-size: 0.75rem; color: var(--text-muted);">${c.showDate} @ ${c.showTime}</div>
          </td>
          <td><span style="font-size: 0.75rem; color: ${isPremQueue ? 'var(--accent-secondary)' : 'var(--text-main)'};">${c.showType}</span></td>
          <td><span style="font-weight: 700;">${seatsStr}</span> (${c.ticketCount})</td>
          <td><strong style="color: var(--accent-secondary);">₹${c.totalCost}</strong></td>
          <td>
            <span style="font-size: 0.75rem; font-weight: 700; padding: 2px 7px; border-radius: var(--radius-pill); background: ${isPremQueue ? 'rgba(139, 92, 246, 0.2)' : 'rgba(16, 185, 129, 0.15)'}; color: ${isPremQueue ? '#c4b5fd' : '#6ee7b7'};">
              ${c.queueName}
            </span>
          </td>
          <td><span class="sla-badge ${sla.badgeClass}">${sla.label}</span></td>
          <td><span style="color: var(--accent-emerald); font-weight: 700;">${c.stage}</span></td>
          <td>
            <button class="btn btn-secondary btn-sm" onclick="window.viewCaseDetails('${c.caseId}')" title="View Case Ticket">
              Inspect
            </button>
          </td>
        </tr>
      `;
    }).join('');
  }

  function initStaffTabs() {
    const tabs = document.querySelectorAll('#queue-tabs .portal-tab-btn');
    const tableContainer = document.getElementById('queue-table-container');
    const schemaInspector = document.getElementById('data-objects-inspector');

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        const queueKey = tab.getAttribute('data-queue');
        if (queueKey === 'data-objects') {
          tableContainer.style.display = 'none';
          schemaInspector.style.display = 'block';
        } else {
          tableContainer.style.display = 'block';
          schemaInspector.style.display = 'none';
          renderStaffQueuesTable(queueKey);
        }
        playBeep('click');
      });
    });
  }

  window.viewCaseDetails = function (caseId) {
    const c = appState.cases.find(item => item.caseId === caseId);
    if (!c) return;

    appState.activeBooking = {
      ...c,
      selectedSeats: Array.isArray(c.seats) ? c.seats : [c.seats]
    };
    appState.selectedMovie = appState.movies.find(m => m.movieId === c.movieId) || appState.movies[0];

    document.getElementById('modal-case-id-display').textContent = `CASE: ${c.caseId}`;
    setBookingStage(5);
    document.getElementById('booking-modal-backdrop').classList.add('active');
    playBeep('click');
  };

  // --- CASE TRACKER (US-001, US-009) ---
  function initTrackerSearch() {
    const btn = document.getElementById('btn-search-case');
    const input = document.getElementById('tracker-input');

    const doSearch = () => {
      const q = (input.value || '').trim().toLowerCase();
      if (!q) {
        showToast('Please enter a Case ID or Email', 'info');
        return;
      }

      const match = appState.cases.find(c => 
        c.caseId.toLowerCase().includes(q) || 
        c.customerEmail.toLowerCase().includes(q) ||
        (c.ticketId && c.ticketId.toLowerCase().includes(q))
      );

      const resultsArea = document.getElementById('tracker-results-area');
      if (!match) {
        resultsArea.innerHTML = `
          <div style="background: rgba(244, 63, 94, 0.1); border: 1px solid rgba(244, 63, 94, 0.3); border-radius: var(--radius-md); padding: 1.5rem; text-align: center; color: #fda4af;">
            ❌ No booking case found matching "<strong>${q}</strong>". Please verify your Case ID (e.g. CW-1001).
          </div>
        `;
        return;
      }

      const sla = calculateSlaStatus(match);
      const seatsStr = Array.isArray(match.seats) ? match.seats.join(', ') : match.seats;

      resultsArea.innerHTML = `
        <div style="background: var(--bg-secondary); border: 1px solid var(--border-highlight); border-radius: var(--radius-lg); padding: 1.5rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-subtle); padding-bottom: 1rem; margin-bottom: 1.25rem;">
            <div>
              <span class="modal-case-badge">${match.caseId}</span>
              <h3 style="font-size: 1.25rem; font-weight: 800; margin-top: 0.35rem;">${match.movieTitle}</h3>
              <p style="font-size: 0.8rem; color: var(--text-muted);">${match.showDate} at ${match.showTime} · ${match.showType}</p>
            </div>
            <div style="text-align: right;">
              <span class="sla-badge ${sla.badgeClass}">${sla.label}</span>
              <div style="font-size: 0.75rem; color: var(--text-dim); margin-top: 4px;">Queue: <strong>${match.queueName}</strong></div>
            </div>
          </div>

          <!-- Lifecycle Stage Visualizer -->
          <div style="margin-bottom: 1.5rem;">
            <div style="font-size: 0.75rem; color: var(--text-dim); text-transform: uppercase; font-weight: 700; margin-bottom: 0.5rem;">Case Lifecycle Status</div>
            <div style="display: flex; gap: 0.5rem;">
              <div style="flex: 1; height: 6px; border-radius: 3px; background: var(--accent-emerald);"></div>
              <div style="flex: 1; height: 6px; border-radius: 3px; background: var(--accent-emerald);"></div>
              <div style="flex: 1; height: 6px; border-radius: 3px; background: var(--accent-emerald);"></div>
              <div style="flex: 1; height: 6px; border-radius: 3px; background: var(--accent-emerald);"></div>
              <div style="flex: 1; height: 6px; border-radius: 3px; background: var(--accent-emerald);"></div>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 0.7rem; color: var(--text-muted); margin-top: 4px;">
              <span>1. Request</span>
              <span>2. Availability</span>
              <span>3. Approval</span>
              <span>4. Routing</span>
              <span style="color: var(--accent-emerald); font-weight: 700;">5. Resolved ✓</span>
            </div>
          </div>

          <div class="review-grid">
            <div class="review-item">
              <span class="review-label">Customer</span>
              <span class="review-value">${match.customerName} (${match.customerEmail})</span>
            </div>
            <div class="review-item">
              <span class="review-label">Seats & Tickets</span>
              <span class="review-value">${seatsStr} (${match.ticketCount} Tickets)</span>
            </div>
            <div class="review-item">
              <span class="review-label">Total Amount Paid</span>
              <span class="review-value" style="color: var(--accent-secondary);">₹${match.totalCost}</span>
            </div>
            <div class="review-item">
              <span class="review-label">Assigned Ticket ID</span>
              <span class="review-value" style="color: #38bdf8;">${match.ticketId || 'TCK-CONFIRMED'}</span>
            </div>
          </div>

          <div style="margin-top: 1.5rem; text-align: right;">
            <button class="btn btn-primary btn-sm" onclick="window.viewCaseDetails('${match.caseId}')">
              View Digital Pass & Correspondence →
            </button>
          </div>
        </div>
      `;
      playBeep('success');
    };

    btn.addEventListener('click', doSearch);
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') doSearch();
    });
  }

  // --- NOTIFICATION DRAWER (US-008) ---
  window.toggleNotifModal = function (show = true) {
    const modal = document.getElementById('notif-modal-backdrop');
    if (!modal) return;
    if (show) {
      renderNotificationsList();
      modal.classList.add('active');
      playBeep('click');
    } else {
      modal.classList.remove('active');
    }
  };

  function updateNotificationBadge() {
    const badge = document.getElementById('unread-notif-count');
    if (badge) badge.textContent = appState.notifications.length;
  }

  function renderNotificationsList() {
    const list = document.getElementById('notif-list-container');
    if (!list) return;

    if (appState.notifications.length === 0) {
      list.innerHTML = `<div style="text-align: center; color: var(--text-dim); padding: 2rem;">No notifications recorded yet.</div>`;
      return;
    }

    list.innerHTML = appState.notifications.map(n => `
      <div style="background: var(--bg-primary); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 1rem; margin-bottom: 0.75rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.35rem;">
          <strong style="font-size: 0.85rem; color: #a5b4fc;">${n.subject}</strong>
          <span style="font-size: 0.7rem; color: var(--text-dim);">${n.timestamp}</span>
        </div>
        <div style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 0.5rem;">To: <strong>${n.recipient}</strong></div>
        <pre class="email-preview-box" style="margin: 0; max-height: 180px; overflow-y: auto;">${n.body}</pre>
      </div>
    `).join('');
  }

  // --- TOAST ALERTS ---
  function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast-item';
    
    let icon = 'ℹ️';
    if (type === 'success') icon = '✅';
    if (type === 'error') icon = '⚠️';

    toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }

})();
