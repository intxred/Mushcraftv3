// Load or initialize the start time
let startTime = localStorage.getItem("systemStartTime");

if (!startTime) {
    startTime = Date.now();
    localStorage.setItem("systemStartTime", startTime);
} else {
    startTime = parseInt(startTime);
}

function resetUptime() {
    startTime = Date.now();
    localStorage.setItem("systemStartTime", startTime);
}





let lastUpdateTime = Date.now();
let lastData = null;


let tempData = [];
let humidityData = [];
let distanceData = [];
let labels = [];
const MAX_POINTS = 20;

// --- Chart.js Setup ---
const tempChart = new Chart(document.getElementById('tempMiniChart').getContext('2d'), {
  type: 'line',
  data: {
    labels,
    datasets: [{
      label: 'Temperature (°C)',
      data: tempData,
      borderColor: 'rgba(255, 99, 132, 1)',
      backgroundColor: 'rgba(255, 99, 132, 0.2)',
      borderWidth: 2,
      tension: 0.3,
      fill: true,
      pointRadius: 0
    }]
  },
  options: { plugins: { legend: { display: false } }, scales: { x: { display: false }, y: { display: false } } }
});

const humidityChart = new Chart(document.getElementById('humidityMiniChart').getContext('2d'), {
  type: 'line',
  data: {
    labels,
    datasets: [{
      label: 'Humidity (%)',
      data: humidityData,
      borderColor: 'rgba(54, 162, 235, 1)',
      backgroundColor: 'rgba(54, 162, 235, 0.2)',
      borderWidth: 2,
      tension: 0.3,
      fill: true,
      pointRadius: 0
    }]
  },
  options: { plugins: { legend: { display: false } }, scales: { x: { display: false }, y: { display: false } } }
});

const distanceChart = new Chart(document.getElementById('co2MiniChart').getContext('2d'), {
  type: 'line',
  data: {
    labels,
    datasets: [{
      label: 'Distance (cm)',
      data: distanceData,
      borderColor: 'rgba(153, 102, 255, 1)',
      backgroundColor: 'rgba(153, 102, 255, 0.2)',
      borderWidth: 2,
      tension: 0.3,
      fill: true,
      pointRadius: 0
    }]
  },
  options: { plugins: { legend: { display: false } }, scales: { x: { display: false }, y: { display: false } } }
});

// --- Update Function ---
async function updateSensorData() {
  try {
    const res = await fetch('read_serial.php');
    const data = await res.json();

    if (data.error) {
      console.error(data.error);
      setSystemStatus(false);
      return;
    }

    if (!lastData || JSON.stringify(data) !== JSON.stringify(lastData)) {
      lastUpdateTime = Date.now();
      lastData = data;
      setSystemStatus(true);
    }

    const timeLabel = new Date().toLocaleTimeString();

    // Keep chart data limited
    if (labels.length >= MAX_POINTS) {
      labels.shift();
      tempData.shift();
      humidityData.shift();
      distanceData.shift();
    }

    labels.push(timeLabel);
    tempData.push(data.temperature);
    humidityData.push(data.humidity);
    distanceData.push(data.distance);

    tempChart.update();
    humidityChart.update();
    distanceChart.update();

    // --- Compute averages ---
    const avgTemp = tempData.reduce((a, b) => a + b, 0) / tempData.length;
    const avgHumidity = humidityData.reduce((a, b) => a + b, 0) / humidityData.length;
    const avgCO2 = distanceData.reduce((a, b) => a + b, 0) / distanceData.length;

    // --- Update text values ---
    document.getElementById('tempValue').textContent = data.temperature.toFixed(1);
    document.getElementById('humidityValue').textContent = data.humidity.toFixed(1);
    document.getElementById('co2Value').textContent = data.distance.toFixed(1);

    document.getElementById('tempTime').textContent = timeLabel;
    document.getElementById('humidityTime').textContent = timeLabel;
    document.getElementById('co2Time').textContent = timeLabel;

    // --- Display real averages ---
    document.getElementById('avgTemp').textContent = `${avgTemp.toFixed(1)} °C`;
    document.getElementById('avgHumidity').textContent = `${avgHumidity.toFixed(1)} %`;
    document.getElementById('avgCO2').textContent = `${avgCO2.toFixed(1)} cm`;

    // --- Uptime ---
    const uptimeSeconds = Math.floor((Date.now() - startTime) / 1000);
    const minutes = Math.floor(uptimeSeconds / 60);
    const seconds = uptimeSeconds % 60;
    document.getElementById('uptime').textContent = `${minutes}m ${seconds}s`;

  } catch (err) {
    console.error("Fetch error:", err);
    setSystemStatus(false);
  }

  if (Date.now() - lastUpdateTime > 10000) {
    setSystemStatus(false);
  }
}

// --- System Status ---
function setSystemStatus(isOperational) {
  const statusIndicator = document.querySelector('.status-indicator');
  const statusText = document.getElementById('systemStatusText');
  const lastUpdate = document.getElementById('lastSystemUpdate');

  if (isOperational) {
    statusIndicator.style.backgroundColor = '#4caf50';
    statusText.textContent = "All Systems Operational";
    lastUpdate.textContent = "Updated just now";
  } else {
    statusIndicator.style.backgroundColor = '#f44336';
    statusText.textContent = "System Not Operational";
    lastUpdate.textContent = "No updates detected";
  }
}

// --- Start Updating ---
setInterval(updateSensorData, 2000);
updateSensorData();

