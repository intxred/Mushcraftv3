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

const mainChartCtx = document.getElementById('mainChart').getContext('2d');

// Shared chart data
const mainChartData = {
  labels: [],
  datasets: [
    {
      label: 'Temperature (°C)',
      data: [],
      borderColor: 'rgba(255, 99, 132, 1)',
      backgroundColor: 'rgba(255, 99, 132, 0.1)',
      borderWidth: 2,
      tension: 0.3,
      fill: true,
      pointRadius: 0
    },
    {
      label: 'Humidity (%)',
      data: [],
      borderColor: 'rgba(54, 162, 235, 1)',
      backgroundColor: 'rgba(54, 162, 235, 0.1)',
      borderWidth: 2,
      tension: 0.3,
      fill: true,
      pointRadius: 0
    },
    {
      label: 'Distance (cm)',
      data: [],
      borderColor: 'rgba(153, 102, 255, 1)',
      backgroundColor: 'rgba(153, 102, 255, 0.1)',
      borderWidth: 2,
      tension: 0.3,
      fill: true,
      pointRadius: 0
    }
  ]
};

const mainChart = new Chart(mainChartCtx, {
  type: 'line',
  data: mainChartData,
  options: {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: { title: { display: true, text: 'Time' } },
      y: { title: { display: true, text: 'Sensor Values' } }
    },
    plugins: {
      legend: { labels: { color: '#333' } }
    },
    elements: { point: { radius: 0 } }
  }
});

// --- Load chart data from localStorage if available ---
const savedChart = localStorage.getItem('mainChartData');
if (savedChart) {
  const parsed = JSON.parse(savedChart);
  mainChartData.labels = parsed.labels || [];
  mainChartData.datasets.forEach((ds, i) => {
    ds.data = parsed.datasets[i].data || [];
  });
  mainChart.update();
}

// --- MAIN CHART UPDATE FUNCTION ---
function updateMainChart() {
  if (!lastData) return; // nothing to add yet

  const timeLabel = new Date().toLocaleTimeString();

  mainChartData.labels.push(timeLabel);
  mainChartData.datasets[0].data.push(lastData.temperature);
  mainChartData.datasets[1].data.push(lastData.humidity);
  mainChartData.datasets[2].data.push(lastData.distance);

  // Keep chart short
  if (mainChartData.labels.length > 50) {
    mainChartData.labels.shift();
    mainChartData.datasets.forEach(ds => ds.data.shift());
  }

  mainChart.update();

  // Save to localStorage
  localStorage.setItem('mainChartData', JSON.stringify(mainChartData));
}

// Patch your existing updateSensorData to also update main chart immediately on first sensor data
const oldUpdate = updateSensorData;
let mainChartInitialized = false;

updateSensorData = async function() {
  await oldUpdate(); // mini charts update every 2s

  // Update main chart immediately the first time
  if (!mainChartInitialized && lastData) {
    updateMainChart();
    mainChartInitialized = true;
  }
};

// --- Then repeat main chart update every 1 minute ---
setInterval(updateMainChart, 60000); // 1 minute


// Optional: make time-range buttons visually toggle
function changeTimeRange(range) {
  document.querySelectorAll('.time-btn').forEach(btn => btn.classList.remove('active'));
  event.target.classList.add('active');
  console.log("Time range changed:", range);
}



//test

// === ACTUATOR SYSTEM WITH PERSISTENT LOGS ===
let actuators = {
    humidifier: { on: false, runtime: 0, timer: null },
    fan: { on: false, runtime: 0, timer: null }
};

// Thresholds
const TEMP_THRESHOLD = 35;
const HUMIDITY_THRESHOLD = 82;
const DISTANCE_THRESHOLD = 10;

// === LOAD SAVED STATES ===
window.addEventListener('load', () => {
    // Restore actuator states
    const saved = localStorage.getItem('actuatorStates');
    if (saved) {
        const parsed = JSON.parse(saved);
        for (const key in parsed) {
            actuators[key].on = parsed[key].on;
            actuators[key].runtime = parsed[key].runtime;
            if (actuators[key].on) startRuntimeTimer(key);
        }
    }
    updateActuatorUI('humidifier');
    updateActuatorUI('fan');

    // Restore activity log
    const savedLog = localStorage.getItem('activityLog');
    if (savedLog) {
        const logs = JSON.parse(savedLog);
        logs.forEach(log => renderLogItem(log));
    }
});

// === SAVE ACTUATOR STATE ===
function saveActuatorStates() {
    const dataToSave = {
        humidifier: { on: actuators.humidifier.on, runtime: actuators.humidifier.runtime },
        fan: { on: actuators.fan.on, runtime: actuators.fan.runtime }
    };
    localStorage.setItem('actuatorStates', JSON.stringify(dataToSave));
}

// === ACTIVITY LOG ===
function logActivity(message) {
    const time = new Date().toLocaleTimeString();
    const logEntry = `[${time}] ${message}`;
    
    // Save in localStorage
    let logs = JSON.parse(localStorage.getItem('activityLog')) || [];
    logs.unshift(logEntry);
    if (logs.length > 100) logs.pop(); // keep 100 latest entries
    localStorage.setItem('activityLog', JSON.stringify(logs));

    // Display on UI
    renderLogItem(logEntry);

    // Save also to backend file (data.txt)
    fetch('save_log.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'log=' + encodeURIComponent(logEntry)
    }).catch(err => console.error("Log save error:", err));
}

// === Render Log on Page ===
function renderLogItem(text) {
    const logList = document.getElementById('activityLog');
    const item = document.createElement('div');
    item.className = 'log-item';
    item.textContent = text;
    logList.prepend(item);
}

// === UI UPDATE ===
function updateActuatorUI(name) {
    const item = document.getElementById(name + 'Item');
    const toggle = document.getElementById(name + 'Toggle');
    const status = document.getElementById(name + 'Status');
    const runtime = document.getElementById(name + 'Runtime');
    const isOn = actuators[name].on;

    if (isOn) {
        toggle.classList.add('active');
        item.style.borderLeft = '4px solid #4caf50';
        status.textContent = 'ON';
    } else {
        toggle.classList.remove('active');
        item.style.borderLeft = '4px solid #f44336';
        status.textContent = 'OFF';
    }
    runtime.textContent = actuators[name].runtime + 's';
}

// === MANUAL TOGGLE ===
function toggleActuator(name) {
    actuators[name].on = !actuators[name].on;
    updateActuatorUI(name);
    logActivity(`${name.charAt(0).toUpperCase() + name.slice(1)} turned ${actuators[name].on ? 'ON' : 'OFF'} manually.`);

    if (actuators[name].on) startRuntimeTimer(name);
    else stopRuntimeTimer(name);
    saveActuatorStates();
}

// === RUNTIME TRACKING ===
function startRuntimeTimer(name) {
    stopRuntimeTimer(name);
    actuators[name].timer = setInterval(() => {
        actuators[name].runtime++;
        updateActuatorUI(name);
        saveActuatorStates();
    }, 1000);
}

function stopRuntimeTimer(name) {
    if (actuators[name].timer) clearInterval(actuators[name].timer);
    actuators[name].timer = null;
}

// === AUTO CONTROL ===
const prevUpdateSensor = updateSensorData;
updateSensorData = async function() {
    await prevUpdateSensor();
    if (!lastData) return;

    const { temperature, humidity, distance } = lastData;

    // --- HUMIDIFIER ---
    if (temperature > TEMP_THRESHOLD && humidity < HUMIDITY_THRESHOLD && !actuators.humidifier.on) {
        actuators.humidifier.on = true;
        startRuntimeTimer('humidifier');
        updateActuatorUI('humidifier');
        logActivity('Humidifier AUTO-ON (Temp > 35°C, Humidity < 82%)');
        saveActuatorStates();
    } else if ((temperature <= TEMP_THRESHOLD || humidity >= HUMIDITY_THRESHOLD) && actuators.humidifier.on) {
        actuators.humidifier.on = false;
        stopRuntimeTimer('humidifier');
        updateActuatorUI('humidifier');
        logActivity('Humidifier AUTO-OFF (conditions normalized)');
        saveActuatorStates();
    }

    // --- FAN ---
    if (distance < DISTANCE_THRESHOLD && !actuators.fan.on) {
        actuators.fan.on = true;
        startRuntimeTimer('fan');
        updateActuatorUI('fan');
        logActivity('Fan AUTO-ON (Distance < 10cm)');
        saveActuatorStates();
    } else if (distance >= DISTANCE_THRESHOLD && actuators.fan.on) {
        actuators.fan.on = false;
        stopRuntimeTimer('fan');
        updateActuatorUI('fan');
        logActivity('Fan AUTO-OFF (Distance normalized)');
        saveActuatorStates();
    }
};








// --- Start Updating ---
setInterval(updateSensorData, 2000);
updateSensorData();

