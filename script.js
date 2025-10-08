// ShowTime – Interactive features
// - Smooth scroll
// - Dynamic shows rendering
// - Search filtering (location/date/genre)
// - Category filters
// - Booking seat selection

(function () {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const state = {
    shows: [],
    filters: { location: '', date: '', genre: 'all', category: 'all' },
    seatConfig: { rows: 8, cols: 12 },
    occupiedMap: new Map(), // key: showId|date|time => Set of seat indexes
    selectedSeats: new Set(),
    selectedShowId: null,
    selectedPrice: 0,
  };

  // Sample shows data
  const showsData = [
    {
      id: 'mv-neo-noir',
      title: 'Neon City – A Noir Saga',
      category: 'movie',
      genre: 'movie',
      date: '2025-10-15',
      location: 'New York, AMC Empire 25',
      venue: 'AMC Empire 25',
      image: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963f?q=80&w=1200&auto=format&fit=crop',
      price: 15,
    },
    {
      id: 'ct-rock-legends',
      title: 'Rock Legends Live',
      category: 'concert',
      genre: 'concert',
      date: '2025-10-20',
      location: 'Los Angeles, The Forum',
      venue: 'The Forum',
      image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=1200&auto=format&fit=crop',
      price: 65,
    },
    {
      id: 'th-hamlet',
      title: 'Hamlet – Royal Theatre',
      category: 'theatre',
      genre: 'theatre',
      date: '2025-10-18',
      location: 'London, West End',
      venue: 'Globe Theatre',
      image: 'https://images.unsplash.com/photo-1533236897111-3e94666b2edf?q=80&w=1200&auto=format&fit=crop',
      price: 40,
    },
    {
      id: 'cm-standup-night',
      title: 'Laugh Out Loud – Standup Night',
      category: 'comedy',
      genre: 'comedy',
      date: '2025-10-25',
      location: 'Chicago, The Laugh Factory',
      venue: 'The Laugh Factory',
      image: 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?q=80&w=1200&auto=format&fit=crop',
      price: 30,
    },
    {
      id: 'sp-championship',
      title: 'Championship Finals',
      category: 'sports',
      genre: 'sports',
      date: '2025-11-01',
      location: 'Tokyo, National Stadium',
      venue: 'National Stadium',
      image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=1200&auto=format&fit=crop',
      price: 80,
    },
    {
      id: 'mv-cosmic-odyssey',
      title: 'Cosmic Odyssey',
      category: 'movie',
      genre: 'movie',
      date: '2025-10-22',
      location: 'San Francisco, Alamo Drafthouse',
      venue: 'Alamo Drafthouse',
      image: 'https://images.unsplash.com/photo-1512428559087-560fa5ceab42?q=80&w=1200&auto=format&fit=crop',
      price: 18,
    },
    {
      id: 'ct-symphony-night',
      title: 'Symphony Under The Stars',
      category: 'concert',
      genre: 'concert',
      date: '2025-10-28',
      location: 'Vienna, City Park',
      venue: 'Vienna City Park',
      image: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?q=80&w=1200&auto=format&fit=crop',
      price: 50,
    },
    {
      id: 'th-musical-dreams',
      title: 'Musical of Dreams',
      category: 'theatre',
      genre: 'theatre',
      date: '2025-10-26',
      location: 'Paris, Théâtre Mogador',
      venue: 'Théâtre Mogador',
      image: 'https://images.unsplash.com/photo-1503095396549-807759245b35?q=80&w=1200&auto=format&fit=crop',
      price: 55,
    },
  ];

  // Helpers
  function smoothScrollTo(hash) {
    const target = $(hash);
    if (!target) return;
    const top = target.getBoundingClientRect().top + window.scrollY - 70;
    window.scrollTo({ top, behavior: 'smooth' });
  }

  function formatDate(dstr) {
    if (!dstr) return '';
    const d = new Date(dstr + 'T00:00:00');
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  }

  function seatIndex(r, c, cols) { return r * cols + c; }

  // Navbar interactivity
  function setupNav() {
    const toggle = $('.nav-toggle');
    const links = $('.nav-links');
    toggle.addEventListener('click', () => {
      const open = links.classList.toggle('show');
      toggle.setAttribute('aria-expanded', String(open));
    });

    // Smooth scroll for nav links
    $$('.nav-links a').forEach(a => {
      a.addEventListener('click', (e) => {
        e.preventDefault();
        links.classList.remove('show');
        const href = a.getAttribute('href');
        smoothScrollTo(href);
      });
    });
  }

  // Render shows
  function renderShows(list) {
    const grid = $('#showsGrid');
    grid.innerHTML = '';
    if (!list.length) {
      grid.innerHTML = '<p style="grid-column: 1/-1; color: var(--muted);">No shows match your filters.</p>';
      return;
    }
    const frag = document.createDocumentFragment();
    list.forEach(show => {
      const card = document.createElement('article');
      card.className = 'card';
      card.setAttribute('role', 'listitem');
      card.innerHTML = `
        <img class="poster" src="${show.image}" alt="${show.title} poster" />
        <div class="content">
          <h3>${show.title}</h3>
          <div class="meta">
            <span>📍 ${show.location}</span>
            <span>🗓️ ${formatDate(show.date)}</span>
            <span>🏷️ ${show.category}</span>
          </div>
          <div class="actions">
            <span class="price">$${show.price}</span>
            <button class="btn btn-primary" data-book="${show.id}">Book Ticket</button>
          </div>
        </div>`;
      frag.appendChild(card);
    });
    grid.appendChild(frag);
  }

  function applyFilters() {
    const { location, date, genre, category } = state.filters;
    const list = state.shows.filter(s => {
      const matchLocation = location ? (s.location.toLowerCase().includes(location.toLowerCase()) || s.venue.toLowerCase().includes(location.toLowerCase())) : true;
      const matchDate = date ? s.date === date : true;
      const matchGenre = genre === 'all' ? true : s.genre === genre;
      const matchCategory = category === 'all' ? true : s.category === category;
      return matchLocation && matchDate && matchGenre && matchCategory;
    });
    renderShows(list);
  }

  function setupSearch() {
    const form = $('#searchForm');
    const loc = $('#location');
    const date = $('#date');
    const genre = $('#genre');

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      state.filters.location = loc.value.trim();
      state.filters.date = date.value;
      state.filters.genre = genre.value;
      applyFilters();
      smoothScrollTo('#shows');
    });
  }

  function setupCategories() {
    const chips = $$('#categoryCarousel .chip');
    const prev = $('#catPrev');
    const next = $('#catNext');
    const car = $('#categoryCarousel');

    chips.forEach(ch => ch.addEventListener('click', () => {
      chips.forEach(c => c.classList.remove('active'));
      ch.classList.add('active');
      state.filters.category = ch.dataset.category;
      applyFilters();
    }));

    prev.addEventListener('click', () => car.scrollBy({ left: -200, behavior: 'smooth' }));
    next.addEventListener('click', () => car.scrollBy({ left:  200, behavior: 'smooth' }));
  }

  // Booking UI
  function setupBooking() {
    const select = $('#showSelect');
    const showDate = $('#showDate');
    const showTime = $('#showTime');
    const seatGrid = $('#seatGrid');
    const countEl = $('#count');
    const totalEl = $('#total');
    const form = $('#bookingForm');

    // Populate shows into select
    select.innerHTML = state.shows
      .map(s => `<option value="${s.id}" data-price="${s.price}" data-date="${s.date}">${s.title} – ${s.venue} (${formatDate(s.date)})</option>`)
      .join('');

    // Initialize selection
    const first = state.shows[0];
    state.selectedShowId = first?.id || null;
    state.selectedPrice = first?.price || 0;
    showDate.value = first?.date || '';

    select.addEventListener('change', () => {
      const opt = select.selectedOptions[0];
      state.selectedShowId = opt.value;
      state.selectedPrice = Number(opt.dataset.price);
      showDate.value = opt.dataset.date;
      state.selectedSeats.clear();
      buildSeatGrid();
      updateBookingSummary();
    });

    showDate.addEventListener('change', () => {
      state.selectedSeats.clear();
      buildSeatGrid();
      updateBookingSummary();
    });

    showTime.addEventListener('change', () => {
      state.selectedSeats.clear();
      buildSeatGrid();
      updateBookingSummary();
    });

    function keyForCurrent() {
      return `${state.selectedShowId}|${showDate.value}|${showTime.value}`;
    }

    function ensureOccupiedGenerated() {
      const key = keyForCurrent();
      if (!state.occupiedMap.has(key)) {
        // Random occupied seats for demo
        const total = state.seatConfig.rows * state.seatConfig.cols;
        const occupied = new Set();
        const occCount = Math.floor(total * 0.15); // 15% occupied
        while (occupied.size < occCount) {
          occupied.add(Math.floor(Math.random() * total));
        }
        state.occupiedMap.set(key, occupied);
      }
      return state.occupiedMap.get(key);
    }

    function buildSeatGrid() {
      const { rows, cols } = state.seatConfig;
      const occupied = ensureOccupiedGenerated();
      seatGrid.innerHTML = '';
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const idx = seatIndex(r, c, cols);
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'seat';
          btn.setAttribute('role', 'gridcell');
          btn.setAttribute('aria-label', `Row ${r+1}, Seat ${c+1}`);
          if (occupied.has(idx)) {
            btn.classList.add('occupied');
            btn.disabled = true;
          }
          if (state.selectedSeats.has(idx)) {
            btn.classList.add('selected');
            btn.setAttribute('aria-selected', 'true');
          }
          btn.addEventListener('click', () => {
            if (btn.classList.contains('occupied')) return;
            if (btn.classList.contains('selected')) {
              btn.classList.remove('selected');
              btn.removeAttribute('aria-selected');
              state.selectedSeats.delete(idx);
            } else {
              btn.classList.add('selected');
              btn.setAttribute('aria-selected', 'true');
              state.selectedSeats.add(idx);
            }
            updateBookingSummary();
          });
          seatGrid.appendChild(btn);
        }
      }
    }

    function updateBookingSummary() {
      const count = state.selectedSeats.size;
      countEl.textContent = String(count);
      totalEl.textContent = `$${count * state.selectedPrice}`;
    }

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!state.selectedSeats.size) {
        alert('Please select at least one seat.');
        return;
      }
      const opt = select.selectedOptions[0];
      const details = {
        show: opt.textContent,
        date: $('#showDate').value,
        time: $('#showTime').value,
        seats: Array.from(state.selectedSeats).sort((a,b) => a-b).map(idx => `R${Math.floor(idx/12)+1}S${(idx%12)+1}`),
        total: `$${state.selectedSeats.size * state.selectedPrice}`
      };
      alert(`Booking confirmed!\n\n${details.show}\n${details.date} at ${details.time}\nSeats: ${details.seats.join(', ')}\nTotal: ${details.total}`);
      // After confirm, reset selected seats for demo
      state.selectedSeats.clear();
      buildSeatGrid();
      updateBookingSummary();
    });

    // Handle clicks from "Book Ticket" buttons in featured list
    $('#showsGrid').addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-book]');
      if (!btn) return;
      const id = btn.getAttribute('data-book');
      const idx = state.shows.findIndex(s => s.id === id);
      if (idx >= 0) {
        select.selectedIndex = idx;
        const opt = select.selectedOptions[0];
        state.selectedShowId = opt.value;
        state.selectedPrice = Number(opt.dataset.price);
        $('#showDate').value = opt.dataset.date;
        state.selectedSeats.clear();
        buildSeatGrid();
        updateBookingSummary();
        smoothScrollTo('#tickets');
      }
    });

    // Build initial grid
    buildSeatGrid();
    updateBookingSummary();
  }

  function setupAuthDialog() {
    const dialog = $('#authDialog');
    const loginBtn = $('#loginBtn');
    const signupBtn = $('#signupBtn');
    const title = $('#dialogTitle');
    const close = $('#authDialog .close');

    function show(mode) {
      title.textContent = mode === 'login' ? 'Log in' : 'Sign up';
      if (typeof dialog.showModal === 'function') dialog.showModal();
      else dialog.setAttribute('open', '');
    }

    loginBtn.addEventListener('click', () => show('login'));
    signupBtn.addEventListener('click', () => show('signup'));
    close.addEventListener('click', () => dialog.close());
  }

  function setupFooter() {
    $('#newsletterForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const email = $('#newsletterEmail').value.trim();
      if (!email) return;
      alert('Subscribed! Thanks for joining our newsletter.');
      $('#newsletterEmail').value = '';
    });
    $('#year').textContent = String(new Date().getFullYear());
  }

  function init() {
    state.shows = showsData;
    renderShows(state.shows);
    setupNav();
    setupSearch();
    setupCategories();
    setupBooking();
    setupAuthDialog();
    setupFooter();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
