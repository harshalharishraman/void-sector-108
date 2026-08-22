import {io,Socket} from 'socket.io-client';
import {getEl,createEl} from './utils'
//import fs from 'fs';
//import path from 'path';

const socket:Socket = io();

// DOM Element Selectors
const authScreen = getEl<HTMLElement>('auth-screen');
const lobbyScreen = getEl<HTMLElement>('lobby-screen');
const roomScreen = getEl<HTMLElement>('room-screen');

const usernameInput = getEl<HTMLInputElement>('username-input');
const displayName = getEl<HTMLElement>('display-name');
const roomInput = getEl<HTMLInputElement>('room-input');
const roomCodeDisplay = getEl<HTMLElement>('room-code-display');
const userList = getEl<HTMLUListElement>('user-list');

const loginBtn = getEl<HTMLButtonElement>('login-btn');
const createBtn = getEl<HTMLButtonElement>('create-btn');
const joinBtn = getEl<HTMLButtonElement>('join-btn');
const leaveBtn = getEl<HTMLButtonElement>('leave-btn');
const readyBtn=getEl<HTMLButtonElement>('ready-btn');
// --- Event Listeners ---

// Submit Username
loginBtn.addEventListener('click', () => {
    const username:string= usernameInput.value.trim();
    if (!username) return alert("Please enter a username");

    socket.emit('join-setup', { username });
    
});

// Create Room Request
createBtn.addEventListener('click', () => {
    socket.emit('create-room');
});

// Join Room Request
joinBtn.addEventListener('click', () => {
    const code = roomInput.value.trim();
    if (!code) return alert("Please enter a room code");
    socket.emit('join-room', code);
});

leaveBtn.addEventListener('click', () => {
    socket.emit('leave-room');
});

readyBtn.addEventListener('click', ()=>{

    socket.emit('change-ready-status');

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
socket.on('room-users', (resp) => {
    const users:{username:string,ready:boolean}[]=resp.data.users
    userList.innerHTML = '';
    users.forEach(user=> {
        const li = createEl<HTMLLIElement>('li');

        const name=createEl<HTMLElement>('span');

        let stat=createEl<HTMLElement>('span');
        stat.dataset.username=user.username;

        name.textContent = user.username;
        stat.textContent = user.ready?'READY':'NOT READY';
        
        li.appendChild(name);
        li.appendChild(stat);
        userList.appendChild(li);
    });
});

socket.on('left-room', (resp) => {
    
  roomScreen.classList.add('hidden');
  lobbyScreen.classList.remove('hidden');

  roomCodeDisplay.textContent = '';
  userList.innerHTML = '';
  roomInput.value = '';
  
});

// Catch errors sent from backend (e.g., room code invalid)
socket.on('error-message', (resp) => {
    alert(resp.msg);
});

socket.on('joined-setup',(resp)=>{
displayName.textContent = resp.username;
    
    authScreen.classList.add('hidden');
    lobbyScreen.classList.remove('hidden');
});

socket.on('changed-ready-status',(resp)=>{
const username: string = resp.data.username;
const ready: boolean = resp.data.ready;

readyBtn.classList.toggle('ready-true', ready);
readyBtn.classList.toggle('ready-false', !ready);

readyBtn.textContent = ready? 'READY' : 'NOT READY';

let stat = document.querySelector<HTMLSpanElement>(
  `[data-username="${username}"]`
);

if(stat){
    stat.textContent=ready?'READY' : 'NOT READY';
    stat.classList.toggle('status-true',ready);
    stat.classList.toggle('status-flase',!ready);
}

});


// --- UI Helper Functions ---

function showRoom(code:string):void{
    lobbyScreen.classList.add('hidden');
    roomScreen.classList.remove('hidden');
    roomCodeDisplay.textContent = code;
}

