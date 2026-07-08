const socket = io();

// DOM Element Selectors
const authScreen = document.getElementById('auth-screen');
const lobbyScreen = document.getElementById('lobby-screen');
const roomScreen = document.getElementById('room-screen');

const usernameInput = document.getElementById('username-input');
const displayName = document.getElementById('display-name');
const roomInput = document.getElementById('room-input');
const roomCodeDisplay = document.getElementById('room-code-display');
const userList = document.getElementById('user-list');

// --- Event Listeners ---

// Submit Username
document.getElementById('login-btn').addEventListener('click', () => {
    const username = usernameInput.value.trim();
    if (!username) return alert("Please enter a username");

    socket.emit('join-setup', { username });
    displayName.textContent = username;
    
    authScreen.classList.add('hidden');
    lobbyScreen.classList.remove('hidden');
});

// Create Room Request
document.getElementById('create-btn').addEventListener('click', () => {
    socket.emit('create-room');
});

// Join Room Request
document.getElementById('join-btn').addEventListener('click', () => {
    const code = roomInput.value.trim();
    if (!code) return alert("Please enter a room code");
    socket.emit('join-room', code);
});


// --- Socket Listeners ---

// Handle view transition when room is created or joined successfully
socket.on('room-created', (resp) => {
    showRoom(resp.data.room_code);
});

socket.on('room-joined', (resp) => {
    showRoom(resp.data.room_code);
});

// Listen for synchronized active users list from backend
socket.on('room-users', (users) => {
    userList.innerHTML = '';
    users.forEach(user => {
        const li = document.createElement('li');
        li.textContent = user;
        userList.appendChild(li);
    });
});

// Catch errors sent from backend (e.g., room code invalid)
socket.on('error-message', (resp) => {
    alert(resp.msg);
});


// --- UI Helper Functions ---

function showRoom(code) {
    lobbyScreen.classList.add('hidden');
    roomScreen.classList.remove('hidden');
    roomCodeDisplay.textContent = code;
}

