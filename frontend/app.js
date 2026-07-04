const socket= io("http://localhost:4000"); 
const statusEl = document.getElementById('status');
const idEl = document.getElementById('socket-id');
const logEl = document.getElementById('log');

function appendLog(message) {
  logEl.innerHTML += `[${new Date().toLocaleTimeString()}] ${message}<br>`;
  logEl.scrollTop = logEl.scrollHeight;
}

socket.on('connect', () => {
  statusEl.textContent = 'Connected';
  statusEl.className = 'connected';
  idEl.textContent = socket.id;
  appendLog(`Connected to backend with ID: ${socket.id}`);
});

socket.on('disconnect', () => {
  statusEl.textContent = 'Disconnected';
  statusEl.className = 'disconnected';
  idEl.textContent = 'None';
  appendLog('Disconnected from backend.');
});

    

