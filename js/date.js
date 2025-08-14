document.addEventListener('DOMContentLoaded', () => {
  const dateElement = document.getElementById('date');
  if (!dateElement) return;

  function updateTime() {
    const now = new Date();

    const options = { 
      year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      hour12: false,
      timeZone: 'Asia/Riyadh' // Always show Saudi Arabia time
    };

    dateElement.textContent = 'Time zone (GMT+3) Asia/Riyadh: ' + now.toLocaleString('en-US', options);
  }

  updateTime(); // initial call
  setInterval(updateTime, 1000); // update every second
});
