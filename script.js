// ================================
// DOM Ready
// ================================
document.addEventListener("DOMContentLoaded", () => {
  
  // ================================
  // 1. DOM ELEMENTS
  // ================================
  
  // Menu elements
  const menuToggle = document.querySelector(".header__menu-toggle");
  const mobileMenu = document.getElementById("mobile-menu-panel");
  const mobileUserIcon = document.querySelector(".header__action--profile");
  
  // Language selector elements
  const languageWrapper = document.getElementById("language-select-wrapper");
  const languageButton = document.getElementById("language-select-button");
  const languagePanel = document.getElementById("language-select-panel");
  const languageOptionsList = document.getElementById("language-options-list");
  const languageValue = document.getElementById("language-select-value");
  const languageSearchInput = document.getElementById("language-search-input");
  
  // Date picker elements
  const releaseDateFrom = document.getElementById("date-from");
  const releaseDateTo = document.getElementById("date-to");
  
  // Set today's date as default for "To"
  const today = new Date();
  const todayFormatted = today.toISOString().split('T')[0]; // Format: YYYY-MM-DD
  
  // Initialize flatpickr
  const fromPicker = flatpickr(releaseDateFrom, { 
    allowInput: true, 
    clickOpens: false 
  });
  
  const toPicker = flatpickr(releaseDateTo, { 
    allowInput: true, 
    clickOpens: false 
  });
  
  // Set default value for "To" date input
  releaseDateTo.value = todayFormatted;
  toPicker.setDate(today, false); // Set date in flatpickr without triggering change
  
  // Keyword elements
  const keywordInput = document.getElementById("keyword-input");
  const keywordSuggestionsPanel = document.getElementById("keyword-suggestions-panel");
  const keywordSuggestionsList = document.getElementById("keyword-suggestions-list");
  const clearKeywordsBtn = document.getElementById("clear-all-keywords-btn");
  
  // Search and filter elements
  const searchButtonNormal = document.getElementById('search-button-normal'); // Normal button
  const searchButtonSticky = document.getElementById('search-button-sticky'); // Sticky button
  const moviesGrid = document.getElementById("movies-grid");
  const loadMoreBtn = document.getElementById("load-more-btn");
  const loadingIndicator = document.getElementById("loading-indicator");
  const errorMessage = document.getElementById("error-message");
  const sortSelect = document.getElementById("sort-options");
  const genreContainer = document.getElementById("genre-checkboxes");
  sortSelect.value = "popularity.desc";
  
  // Slider elements
  const scoreMinSlider = document.getElementById("user-score-min");
  const scoreMaxSlider = document.getElementById("user-score-max");
  const scoreMinLabel = document.getElementById("score-min-label");
  const scoreMaxLabel = document.getElementById("score-max-label");
  const runtimeMinSlider = document.getElementById("runtime-min");
  const runtimeMaxSlider = document.getElementById("runtime-max");
  const runtimeMinLabel = document.getElementById("runtime-min-label");
  const runtimeMaxLabel = document.getElementById("runtime-max-label");
  const minVotesSlider = document.getElementById("min-votes-slider");
  const minVotesLabel = document.getElementById("votes-min-label");
  
  // Advanced filter elements
  const filtersPanel = document.querySelector('[data-section="filters"]');
  let searchAllCountriesCheckbox;
  let advancedFilters;
  let releaseTypeCheckboxes;
  let countrySelect;
  
  if (filtersPanel) {
    searchAllCountriesCheckbox = filtersPanel.querySelector("#search-all-countries");
    advancedFilters = filtersPanel.querySelector(".sidebar__filter-advanced");
    releaseTypeCheckboxes = filtersPanel.querySelectorAll(".release-type-checkbox");
    countrySelect = document.querySelector("#country-select");
  }
  
  // ================================
  // 2. STATE VARIABLES
  // ================================
  const apiKey = "da95200de0fb7939dfd0752e4160a3b4";
  let totalPages = 1;
  let currentPage = 1;
  let currentFilters = {};
  let scrollTimeout;
  
  // ================================
  // 3. HELPER FUNCTIONS
  // ================================
  
  // Check if any filters are ACTUALLY active (different from default)
  function checkForActiveFilters() {
    // Default values
    const defaultSort = "popularity.desc";
    const defaultLanguage = "none";
    const defaultCountry = "";
    const defaultKeyword = "";
    const defaultDateFrom = "";
    
    // Today's date for default "To" date
    const today = new Date();
    const todayFormatted = today.toISOString().split('T')[0];
    const defaultDateTo = todayFormatted;
    
    // Check keyword
    if (keywordInput.value.trim() !== defaultKeyword) {
      return true;
    }
    
    // Check sliders (if not at default values)
    const scoreMinDefault = parseInt(scoreMinSlider.min);
    const scoreMaxDefault = parseInt(scoreMaxSlider.max);
    const runtimeMinDefault = parseInt(runtimeMinSlider.min);
    const runtimeMaxDefault = parseInt(runtimeMaxSlider.max);
    const minVotesDefault = parseInt(minVotesSlider.min);
    
    if (parseInt(scoreMinSlider.value) !== scoreMinDefault ||
        parseInt(scoreMaxSlider.value) !== scoreMaxDefault) {
      return true;
    }
    
    if (parseInt(runtimeMinSlider.value) !== runtimeMinDefault ||
        parseInt(runtimeMaxSlider.value) !== runtimeMaxDefault) {
      return true;
    }
    
    if (parseInt(minVotesSlider.value) !== minVotesDefault) {
      return true;
    }
    
    // Check dates - "From" should be empty, "To" should be today
    if (releaseDateFrom.value.trim() !== defaultDateFrom) {
      return true;
    }
    
    // Check if "To" date is different from today
    if (releaseDateTo.value.trim() !== defaultDateTo) {
      // Parse and compare dates
      const toDate = new Date(releaseDateTo.value);
      const todayDate = new Date(todayFormatted);
      
      // Compare year, month, and day
      if (toDate.getFullYear() !== todayDate.getFullYear() ||
          toDate.getMonth() !== todayDate.getMonth() ||
          toDate.getDate() !== todayDate.getDate()) {
        return true;
      }
    }
    
    // Check sort
    if (sortSelect.value !== defaultSort) {
      return true;
    }
    
    // Check genres
    if (genreContainer.querySelectorAll(".is-selected").length > 0) {
      return true;
    }
    
    // Check language
    const selectedLanguage = languageOptionsList.querySelector(".sidebar__custom-option--selected");
    if (selectedLanguage && selectedLanguage.dataset.value !== defaultLanguage) {
      return true;
    }
    
    // Check country select
    if (countrySelect && countrySelect.value !== defaultCountry) {
      return true;
    }
    
    return false;
  }
  
  // Check if normal button is visible in viewport
  function isNormalButtonVisible() {
    if (!searchButtonNormal) return true;
    
    const rect = searchButtonNormal.getBoundingClientRect();
    
    // Button is visible if any part of it is in the viewport
    return (
      rect.top < window.innerHeight && 
      rect.bottom > 0
    );
  }
  
  // Update button states - ONLY called when filters change
  function updateButtonStates() {
    const hasActiveFilters = checkForActiveFilters();
    
    // Update button active state based on filters
    if (hasActiveFilters) {
      searchButtonNormal.disabled = false;
      searchButtonNormal.classList.add("active");
      searchButtonSticky.disabled = false;
      searchButtonSticky.classList.add("active");
    } else {
      searchButtonNormal.disabled = true;
      searchButtonNormal.classList.remove("active");
      searchButtonSticky.disabled = true;
      searchButtonSticky.classList.remove("active");
      searchButtonSticky.classList.remove("visible");
      searchButtonSticky.classList.remove("hiding");
    }
  }
  
  // Update sticky button visibility - ONLY called on scroll/resize
  function updateStickyVisibility() {
    // Only update if buttons are active
    const isActive = searchButtonNormal.classList.contains("active");
    if (!isActive) {
      searchButtonSticky.classList.remove("visible");
      searchButtonSticky.classList.remove("hiding");
      return;
    }
    
    const normalButtonVisible = isNormalButtonVisible();
    const isStickyVisible = searchButtonSticky.classList.contains("visible");
    
    if (!normalButtonVisible) {
      // Show sticky button
      if (!isStickyVisible) {
        searchButtonSticky.classList.remove("hiding");
        searchButtonSticky.offsetHeight; // Force reflow
        searchButtonSticky.classList.add("visible");
      }
    } else {
      // Hide sticky button
      if (isStickyVisible) {
        searchButtonSticky.classList.add("hiding");
        searchButtonSticky.classList.remove("visible");
        
        setTimeout(() => {
          if (!searchButtonSticky.classList.contains("visible")) {
            searchButtonSticky.classList.remove("hiding");
          }
        }, 300);
      }
    }
  }
  
  // Slider functions
  function handleSingleSlider(e) {
    const slider = e.target;
    const wrapper = slider.closest(".sidebar__slider-wrapper");
    const track = wrapper.querySelector(".sidebar__slider-track");
    
    const percent = ((slider.value - slider.min) / (slider.max - slider.min)) * 100;
    minVotesLabel.textContent = slider.value;
    
    if (track) {
      track.style.left = "0%";
      track.style.right = 100 - percent + "%";
    }
    
    updateButtonStates();
  }
  
  function handleDualSlider(e) {
    const slider = e.target;
    const wrapper = slider.closest(".sidebar__slider-wrapper");
    const [minSlider, maxSlider] = wrapper.querySelectorAll(".sidebar__slider-input");
    const track = wrapper.querySelector(".sidebar__slider-track");
    
    let minLabel, maxLabel;
    if (wrapper.contains(scoreMinSlider)) {
      minLabel = scoreMinLabel;
      maxLabel = scoreMaxLabel;
    } else {
      minLabel = runtimeMinLabel;
      maxLabel = runtimeMaxLabel;
    }
    
    let minVal = +minSlider.value;
    let maxVal = +maxSlider.value;
    
    if (maxVal < minVal) {
      slider === maxSlider ? minSlider.value = maxVal : maxSlider.value = minVal;
      minVal = +minSlider.value;
      maxVal = +maxSlider.value;
    }
    
    minLabel.textContent = minVal;
    maxLabel.textContent = maxVal;
    
    const minPercent = ((minVal - minSlider.min) / (minSlider.max - minSlider.min)) * 100;
    const maxPercent = ((maxVal - minSlider.min) / (minSlider.max - minSlider.min)) * 100;
    
    if (track) {
      track.style.left = minPercent + "%";
      track.style.right = 100 - maxPercent + "%";
    }
    
    updateButtonStates();
  }
  
  function initializeSliders() {
    // Set labels
    scoreMinLabel.textContent = scoreMinSlider.value;
    scoreMaxLabel.textContent = scoreMaxSlider.value;
    runtimeMinLabel.textContent = runtimeMinSlider.value;
    runtimeMaxLabel.textContent = runtimeMaxSlider.value;
    minVotesLabel.textContent = minVotesSlider.value;
    
    // Set tracks
    handleDualSlider({ target: scoreMinSlider });
    handleDualSlider({ target: runtimeMinSlider });
    handleSingleSlider({ target: minVotesSlider });
  }
  
  // Movie rendering
  function renderMovies(movies = []) {
    movies.forEach(movie => {
      const card = document.createElement("div");
      card.className = "movie-card";
      
      const releaseDate = movie.release_date
        ? new Date(movie.release_date).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })
        : "TBA";
      
      const percent = Math.round(movie.vote_average * 10);
      let color;
      if (percent >= 70) color = "#21d07a";
      else if (percent >= 40) color = "#d2d531";
      else color = "#db2360";
      
      card.innerHTML = `
        <div class="poster-wrapper">
          <button class="movie-card__options-btn" aria-label="More options">
    <img src="./assets/more.svg" alt="" />
  </button>
          <img
            class="poster"
            src="${
              movie.poster_path
                ? `https://image.tmdb.org/t/p/w300${movie.poster_path}`
                : "./assets/no-image.svg"
            }"
            alt="${movie.title}"
          />
        </div>
        
        <div class="movie-info">
          <div class="rating-circle" data-percent="${percent}" style="--percent: ${percent}%; background: conic-gradient(${color} ${percent}%, #204529 0)">
            <span class="rating-text">${percent}<sup>%</sup></span>
          </div>
          <h3>${movie.title}</h3>
          <p class="release-date">${releaseDate}</p>
          <p class="movie-description">
            ${movie.overview || "No description available."}
          </p>
        </div>
      `;
      
      moviesGrid.appendChild(card);
    });
  }
  
  // Reset all filters
  function resetAllFilters() {
    // Keyword
    keywordInput.value = "";
    clearKeywordsBtn.hidden = true;
    keywordSuggestionsPanel.hidden = true;
    
    // Sliders
    scoreMinSlider.value = scoreMinSlider.min;
    scoreMaxSlider.value = scoreMaxSlider.max;
    runtimeMinSlider.value = runtimeMinSlider.min;
    runtimeMaxSlider.value = runtimeMaxSlider.max;
    minVotesSlider.value = minVotesSlider.min;
    initializeSliders();
    
    // Dates - Set "To" date to today, "From" date empty
    const today = new Date();
    const todayFormatted = today.toISOString().split('T')[0];
    
    releaseDateFrom.value = "";
    releaseDateTo.value = todayFormatted;
    
    fromPicker.clear();
    toPicker.setDate(today, false);
    
    // Sort
    sortSelect.value = "popularity.desc";
    
    // Genres
    genreContainer.querySelectorAll(".sidebar__genre-tag").forEach(btn => {
      btn.classList.remove("is-selected");
    });
    
    // Language
    languageOptionsList.querySelectorAll(".sidebar__custom-option").forEach(opt => {
      opt.classList.remove("sidebar__custom-option--selected");
    });
    languageOptionsList.querySelector(".sidebar__custom-option[data-value='none']").classList.add("sidebar__custom-option--selected");
    languageValue.textContent = "None Selected";
    
    // Advanced filters
    if (advancedFilters) advancedFilters.classList.remove("is-open");
    if (searchAllCountriesCheckbox) searchAllCountriesCheckbox.checked = true;
    if (releaseTypeCheckboxes) releaseTypeCheckboxes.forEach(cb => (cb.checked = true));
    
    // Country select
    if (countrySelect) countrySelect.value = "";
    
    // Buttons
    searchButtonNormal.disabled = true;
    searchButtonNormal.classList.remove("active");
    searchButtonSticky.disabled = true;
    searchButtonSticky.classList.remove("active");
    searchButtonSticky.classList.remove("visible");
    searchButtonSticky.classList.remove("hiding");
  }
  
  // ================================
  // 4. API FUNCTIONS
  // ================================
  
  async function fetchGenres() {
    const res = await fetch(`https://api.themoviedb.org/3/genre/movie/list?api_key=${apiKey}&language=en-US`);
    const data = await res.json();
    
    genreContainer.innerHTML = "";
    
    data.genres.forEach(genre => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "sidebar__genre-tag";
      btn.textContent = genre.name;
      btn.dataset.genreId = genre.id;
      
      btn.addEventListener("click", () => {
        btn.classList.toggle("is-selected");
        updateButtonStates();
      });
      
      genreContainer.appendChild(btn);
    });
  }
  
  async function fetchMovies(page = 1, filters = {}) {
    let url;
    
    if (filters.keyword && filters.keyword !== "") {
      url = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(filters.keyword)}&page=${page}`;
    } else {
      url = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&page=${page}`;
      
      if (filters.sortBy) url += `&sort_by=${filters.sortBy}`;
      if (filters.genres) url += `&with_genres=${filters.genres}`;
      if (filters.language) url += `&with_original_language=${filters.language}`;
      if (filters.releaseFrom) url += `&release_date.gte=${filters.releaseFrom}`;
      if (filters.releaseTo) url += `&release_date.lte=${filters.releaseTo}`;
      if (filters.country) url += `&region=${filters.country}`;
      if (filters.scoreMin) url += `&vote_average.gte=${filters.scoreMin}`;
      if (filters.scoreMax) url += `&vote_average.lte=${filters.scoreMax}`;
      if (filters.minVotes) url += `&vote_count.gte=${filters.minVotes}`;
      if (filters.runtimeMin) url += `&with_runtime.gte=${filters.runtimeMin}`;
      if (filters.runtimeMax) url += `&with_runtime.lte=${filters.runtimeMax}`;
    }
    
    try {
      const res = await fetch(url);
      const data = await res.json();
      
      totalPages = data.total_pages || 1;
      
      if (page === 1 && !data.results.length) {
        moviesGrid.innerHTML = "<p class='no-results'>No movies found.</p>";
        loadMoreBtn.style.display = "none";
        return;
      }
      
      renderMovies(data.results);
      loadMoreBtn.style.display = page < totalPages ? "block" : "none";
    } catch {
      moviesGrid.innerHTML = "<p class='no-results'>Something went wrong.</p>";
      loadMoreBtn.style.display = "none";
    } finally {
      loadingIndicator.hidden = true;
    }
  }
  
  // ================================
  // 5. EVENT HANDLERS
  // ================================
  
  function handleSearch(e) {
    e.stopPropagation();
    
    // Only search if button is active
    const clickedButton = e.target;
    if (!clickedButton.classList.contains('active') || clickedButton.disabled) {
      return;
    }
    
    moviesGrid.innerHTML = "";
    loadingIndicator.hidden = false;
    
    const genres = Array.from(genreContainer.querySelectorAll(".is-selected")).map(btn => btn.dataset.genreId);
    const selectedLanguage = languageOptionsList.querySelector(".sidebar__custom-option--selected")?.dataset.value || "";
    
    currentFilters = {
      sortBy: sortSelect.value,
      genres: genres.join(","),
      language: selectedLanguage !== "none" ? selectedLanguage : "",
      scoreMin: scoreMinSlider.value,
      scoreMax: scoreMaxSlider.value,
      minVotes: minVotesSlider.value,
      runtimeMin: runtimeMinSlider.value,
      runtimeMax: runtimeMaxSlider.value,
      releaseFrom: releaseDateFrom.value,
      releaseTo: releaseDateTo.value,
      country: countrySelect ? countrySelect.value : "",
      keyword: keywordInput.value.trim(),
    };
    
    if (searchAllCountriesCheckbox) searchAllCountriesCheckbox.checked = false;
    if (advancedFilters) advancedFilters.classList.add("is-open");
    if (releaseTypeCheckboxes) releaseTypeCheckboxes.forEach(cb => (cb.checked = true));
    
    currentPage = 1;
    fetchMovies(currentPage, currentFilters);
  }
  
  async function handleKeywordInput() {
    const query = keywordInput.value.trim();
    
    if (!query) {
      keywordSuggestionsPanel.hidden = true;
      return;
    }
    
    try {
      const res = await fetch(`https://api.themoviedb.org/3/search/keyword?api_key=${apiKey}&query=${encodeURIComponent(query)}`);
      const data = await res.json();
      
      if (!data.results || data.results.length === 0) {
        keywordSuggestionsPanel.hidden = true;
        return;
      }
      
      keywordSuggestionsList.innerHTML = "";
      data.results.forEach(keyword => {
        const li = document.createElement("li");
        li.textContent = keyword.name;
        li.dataset.keywordId = keyword.id;
        li.className = "sidebar__keyword-suggestion-item";
        keywordSuggestionsList.appendChild(li);
      });
      
      keywordSuggestionsPanel.hidden = false;
    } catch {
      keywordSuggestionsPanel.hidden = true;
    }
  }
  
  function handleKeywordSuggestionClick(e) {
    const li = e.target.closest(".sidebar__keyword-suggestion-item");
    if (!li) return;
    
    keywordInput.value = li.textContent;
    keywordSuggestionsPanel.hidden = true;
    updateButtonStates();
  }
  
  function handleClearKeywords() {
    keywordInput.value = "";
    clearKeywordsBtn.hidden = true;
    keywordSuggestionsPanel.hidden = true;
    updateButtonStates();
  }
  
  function handleLoadMore() {
    if (currentPage < totalPages) {
      currentPage++;
      fetchMovies(currentPage, currentFilters);
    }
  }
  
  // Scroll handler for sticky visibility
  function handleScroll() {
    if (scrollTimeout) {
      clearTimeout(scrollTimeout);
    }
    
    scrollTimeout = setTimeout(() => {
      updateStickyVisibility();
    }, 100);
  }
  
  // ================================
  // 6. INITIALIZATION
  // ================================
  
  // Mobile menu
  menuToggle.addEventListener("click", () => {
    mobileMenu.classList.toggle("open");
  });
  
  document.querySelectorAll(".mobile-menu__link").forEach(link => {
    link.addEventListener("click", () => {
      mobileMenu.classList.remove("open");
    });
  });
  
  document.addEventListener("click", (e) => {
    if (!mobileMenu.contains(e.target) && !menuToggle.contains(e.target)) {
      mobileMenu.classList.remove("open");
    }
  });
  
  // Mobile user icon
  function toggleMobileUserIcon() {
    mobileUserIcon.style.display = window.innerWidth <= 960 ? "flex" : "none";
  }
  window.addEventListener("resize", toggleMobileUserIcon);
  toggleMobileUserIcon();
  
  // Collapsible panels
  document.querySelectorAll(".sidebar__panel--collapsible").forEach(panel => {
    const header = panel.querySelector(".sidebar__panel-header");
    const content = panel.querySelector(".sidebar__panel-content");
    const icon = header.querySelector(".sidebar__panel-icon");
    
    const isOpen = panel.classList.contains("sidebar__panel--open");
    
    header.setAttribute("aria-expanded", isOpen);
    content.style.display = isOpen ? "block" : "none";
    icon.style.transform = isOpen ? "rotate(0deg)" : "rotate(-90deg)";
    
    header.addEventListener("click", () => {
      const open = panel.classList.toggle("sidebar__panel--open");
      header.setAttribute("aria-expanded", open);
      content.style.display = open ? "block" : "none";
      icon.style.transform = open ? "rotate(0deg)" : "rotate(-90deg)";
    });
  });
  
  // Advanced filters
  if (filtersPanel) {
    const searchAllReleasesCheckbox = filtersPanel.querySelector("#search-all-releases");
    const countrySelectWrapper = filtersPanel.querySelector("#country-select-wrapper");
    
    searchAllReleasesCheckbox.checked = true;
    searchAllCountriesCheckbox.checked = true;
    advancedFilters.classList.remove("is-open");
    countrySelectWrapper.classList.remove("is-open");
    releaseTypeCheckboxes.forEach(cb => (cb.checked = true));
    
    searchAllReleasesCheckbox.addEventListener("change", () => {
      const showAdvanced = !searchAllReleasesCheckbox.checked;
      advancedFilters.classList.toggle("is-open", showAdvanced);
      
      searchAllCountriesCheckbox.checked = true;
      countrySelectWrapper.classList.remove("is-open");
    });
    
    searchAllCountriesCheckbox.addEventListener("change", () => {
      countrySelectWrapper.classList.toggle("is-open", !searchAllCountriesCheckbox.checked);
    });
  }
  
  // Date pickers
  releaseDateFrom.addEventListener("change", updateButtonStates);
  releaseDateTo.addEventListener("change", updateButtonStates);
  
  document.querySelectorAll(".date-picker-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const targetId = btn.dataset.target;
      if (targetId === "date-from") fromPicker.open();
      if (targetId === "date-to") toPicker.open();
    });
  });
  
  // Sliders
  scoreMinSlider.addEventListener("input", (e) => {
    handleDualSlider(e);
    updateButtonStates();
  });
  scoreMaxSlider.addEventListener("input", (e) => {
    handleDualSlider(e);
    updateButtonStates();
  });
  runtimeMinSlider.addEventListener("input", (e) => {
    handleDualSlider(e);
    updateButtonStates();
  });
  runtimeMaxSlider.addEventListener("input", (e) => {
    handleDualSlider(e);
    updateButtonStates();
  });
  minVotesSlider.addEventListener("input", (e) => {
    handleSingleSlider(e);
    updateButtonStates();
  });
  
  initializeSliders();
  
  // Sort select
  sortSelect.addEventListener("change", updateButtonStates);
  
  // Search buttons
  searchButtonNormal.addEventListener('click', handleSearch);
  searchButtonSticky.addEventListener('click', handleSearch);
  
  // Keywords
  keywordInput.addEventListener("input", handleKeywordInput);
  keywordSuggestionsList.addEventListener("click", handleKeywordSuggestionClick);
  clearKeywordsBtn.addEventListener("click", handleClearKeywords);
  
  keywordInput.addEventListener("input", () => {
    if (keywordInput.value.trim() !== "") {
      clearKeywordsBtn.hidden = false;
      updateButtonStates();
    } else {
      clearKeywordsBtn.hidden = true;
      updateButtonStates();
    }
  });
  
  // Load more button
  loadMoreBtn.addEventListener("click", handleLoadMore);
  
  // Countries
  if (countrySelect) {
    fetch(`https://api.themoviedb.org/3/configuration/countries?language=en-US&api_key=${apiKey}`)
      .then(res => res.json())
      .then(data => {
        countrySelect.innerHTML = "<option value=''>Select Country</option>";
        
        data.forEach(country => {
          const option = document.createElement("option");
          option.value = country.iso_3166_1;
          option.textContent = country.english_name;
          countrySelect.appendChild(option);
        });
        
        countrySelect.addEventListener("change", updateButtonStates);
      })
      .catch(() => {
        countrySelect.innerHTML = "<option value=''>Failed to load countries</option>";
      });
  }
  
  // Language dropdown
  fetch(`https://api.themoviedb.org/3/configuration/languages?api_key=${apiKey}`)
    .then(res => res.json())
    .then(data => {
      languageOptionsList.innerHTML = `
        <li class="sidebar__custom-option sidebar__custom-option--selected" data-value="none">
          None Selected
        </li>
      `;
      
      data.forEach(lang => {
        const li = document.createElement("li");
        li.className = "sidebar__custom-option";
        li.dataset.value = lang.iso_639_1;
        li.textContent = lang.english_name;
        languageOptionsList.appendChild(li);
      });
    });
  
  languageButton.addEventListener("click", e => {
    e.stopPropagation();
    languagePanel.classList.toggle("is-open");
  });
  
  languagePanel.addEventListener("click", e => e.stopPropagation());
  
  document.addEventListener("click", () => {
    languagePanel.classList.remove("is-open");
  });
  
  languageOptionsList.addEventListener("click", e => {
    const option = e.target.closest(".sidebar__custom-option");
    if (!option) return;
    
    languageOptionsList.querySelectorAll(".sidebar__custom-option").forEach(opt => {
      opt.classList.remove("sidebar__custom-option--selected");
    });
    
    option.classList.add("sidebar__custom-option--selected");
    languageValue.textContent = option.textContent;
    languagePanel.classList.remove("is-open");
    
    updateButtonStates();
  });
  
  languageSearchInput.addEventListener("input", () => {
    const query = languageSearchInput.value.toLowerCase();
    
    languageOptionsList.querySelectorAll(".sidebar__custom-option").forEach(li => {
      li.style.display = li.textContent.toLowerCase().includes(query) ? "" : "none";
    });
  });
  
  // Scroll and resize events for sticky visibility
  window.addEventListener('scroll', handleScroll);
  window.addEventListener('resize', handleScroll);
  
  // Initial check
  handleScroll();
  
  // Genres
  fetchGenres();
  
  // Reset all filters
  resetAllFilters();
  
  // Initial movie load
  fetchMovies(currentPage);
});