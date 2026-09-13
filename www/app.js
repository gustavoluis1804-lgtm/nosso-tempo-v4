(() => {
  "use strict";

  const DEFAULT_START_ISO = "2026-09-12T16:43:00-03:00";
  const STORAGE_KEY = "nosso-tempo-start-iso";
  const $ = (id) => document.getElementById(id);
  const pad = (n) => String(n).padStart(2, "0");

  const dateLabel = $("dateLabel");
  const clock = $("clock");
  const daysEl = $("days");
  const hoursEl = $("hours");
  const minutesEl = $("minutes");
  const secondsEl = $("seconds");
  const sinceLabel = $("sinceLabel");
  const dialog = $("settingsDialog");
  const form = $("settingsForm");
  const dateInput = $("startDateInput");
  const timeInput = $("startTimeInput");
  const resetButton = $("resetButton");
  const heading = document.querySelector(".card-heading");

  function getStartISO() {
    return localStorage.getItem(STORAGE_KEY) || DEFAULT_START_ISO;
  }

  function getStartDate() {
    const d = new Date(getStartISO());
    return Number.isNaN(d.getTime()) ? new Date(DEFAULT_START_ISO) : d;
  }

  function updateSinceLabel() {
    const start = getStartDate();

    const dateText = new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric"
    }).format(start);

    const timeText = new Intl.DateTimeFormat("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false
    }).format(start);

    sinceLabel.textContent = `Desde ${dateText} • ${timeText}`;
  }

  function update() {
    const now = new Date();
    const start = getStartDate();

    dateLabel.textContent = new Intl.DateTimeFormat("pt-BR", {
      weekday: "long",
      day: "2-digit",
      month: "long"
    }).format(now);

    clock.textContent = new Intl.DateTimeFormat("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false
    }).format(now);

    const diffMs = Math.max(0, now.getTime() - start.getTime());
    const total = Math.floor(diffMs / 1000);

    daysEl.textContent = pad(Math.floor(total / 86400));
    hoursEl.textContent = pad(Math.floor((total % 86400) / 3600));
    minutesEl.textContent = pad(Math.floor((total % 3600) / 60));
    secondsEl.textContent = pad(total % 60);
  }

  function fillSettings() {
    const start = getStartDate();
    dateInput.value =
      `${start.getFullYear()}-${pad(start.getMonth()+1)}-${pad(start.getDate())}`;
    timeInput.value =
      `${pad(start.getHours())}:${pad(start.getMinutes())}`;
  }

  function openSettings() {
    fillSettings();
    if (typeof dialog.showModal === "function") dialog.showModal();
  }

  let tapCount = 0;
  let tapTimer = null;

  heading.addEventListener("click", () => {
    tapCount++;
    clearTimeout(tapTimer);

    if (tapCount >= 2) {
      tapCount = 0;
      openSettings();
      return;
    }

    tapTimer = setTimeout(() => tapCount = 0, 380);
  });

  form.addEventListener("submit", (event) => {
    if (!dateInput.value || !timeInput.value) {
      event.preventDefault();
      return;
    }

    const localStart = new Date(`${dateInput.value}T${timeInput.value}:00`);
    localStorage.setItem(STORAGE_KEY, localStart.toISOString());
    updateSinceLabel();
    update();
  });

  resetButton.addEventListener("click", () => {
    localStorage.removeItem(STORAGE_KEY);
    fillSettings();
    updateSinceLabel();
    update();
  });

  updateSinceLabel();
  update();
  setInterval(update, 250);

  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) {
      updateSinceLabel();
      update();
    }
  });
})();
