document.addEventListener('DOMContentLoaded', () => {
  // Create and insert footer
  const commonFooter = `
    <footer class="footer"
      style="text-align: center; padding: 15px; background-color: #f1f1f1; margin-top: 20px; font-size: 14px;">
      <p><span id="date"></span></p>
    </footer>
  `;
  document.getElementById("common-footer").innerHTML = commonFooter;

  // Time updater
  const dateElement = document.getElementById('date');
  if (!dateElement) return;

  function updateTime() {
    const now = new Date();
    const options = { 
      year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      hour12: false,
      timeZone: 'Asia/Riyadh'
    };
    dateElement.textContent = 'Time zone (GMT+3) Asia/Riyadh: ' + now.toLocaleString('en-US', options);
  }

  updateTime(); // Initial call
  setInterval(updateTime, 1000); // Update every second
});
