import {io,Socket} from 'socket.io-client';
import {getEl,createEl} from './utils'


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

interface Player{
    username:string,
    id?:string,
    ready?:string
};

interface PlayerInput{
    left:boolean,
    right:boolean,
    up:boolean,
    down:boolean,
    shoot:boolean
};

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

readyBtn.addEventListener("keydown", (event) => {
  if (event.code === "Space") {
    event.preventDefault();
    event.stopPropagation();
  }
});


const input:PlayerInput={
    left:false,
    right:false,
    up:false,
    down:false,
    shoot:false
};

interface InputPacket{
    seq:number,
    input:PlayerInput
}

window.addEventListener('keydown',(event)=>{
    if(event.key==='a'||event.key==='ArrowLeft'){input.left=true}
    if(event.key==='d'||event.key==='ArrowRight'){input.right=true}
    if(event.key==='w'||event.key==='ArrowUp'){input.up=true}
    if(event.key==='s'||event.key==='ArrowDown'){input.down=true}
    if(event.key===' '){input.shoot=true}
});

window.addEventListener('keyup',(event)=>{
    if(event.key==='a'||event.key==='ArrowLeft'){input.left=false}
    if(event.key==='d'||event.key==='ArrowRight'){input.right=false}
    if(event.key==='w'||event.key==='ArrowUp'){input.up=false}
    if(event.key==='s'||event.key==='ArrowDown'){input.down=false}
    if(event.key===' '){input.shoot=false}
});


let PlayerInterval:ReturnType<typeof setInterval>  | null = null;
let seqn:number=0;

function startInterval(){
    if(PlayerInterval)return;

    
    PlayerInterval=setInterval(()=>{
        if(!socket.connected)return
        const packet:InputPacket={
            seq:seqn++,
            input:input
        }
        socket.emit('player-input',packet);}
        ,1000/30) 
}

function stopInterval(){

    if(!PlayerInterval)return;

    clearInterval(PlayerInterval);

    PlayerInterval=null;

}


// --- Socket Listeners ---

// Handle view transition when room is created or joined successfully
socket.on('room-created', (resp) => {
    startInterval();
    showRoom(resp.data.room_code);
});

socket.on('room-joined', (resp) => {
    startInterval();
    showRoom(resp.data.room_code);
});

// Listen for synchronized active users list from backend
socket.on('room-users', (resp) => {
    const users:Player[]=resp.data.users
    userList.innerHTML = '';
    users.forEach(user=> {

        const li = createEl<HTMLLIElement>('li');
        const name=createEl<HTMLElement>('span');
        const stat=createEl<HTMLElement>('span');

        name.textContent = user.username;
        name.className = 'player-name';

        stat.dataset.username=user.username;
        stat.textContent = user.ready?'READY':'NOT READY';
        stat.className = 'player-status';


        li.appendChild(name);
        li.appendChild(stat);

        if(socket.id==resp.data.host_id){
        if(resp.data.host_uname!=user.username){

            const to_kick_out=createEl<HTMLButtonElement>('button');

            to_kick_out.textContent='KICK OUT';
            to_kick_out.className='kick-out-btn'

            to_kick_out.addEventListener('click',()=>{
                socket.emit('kick-out-player',
                    user.username)
            });

            li.appendChild(to_kick_out);
        }}
        
        userList.appendChild(li);
    });
});

socket.on('left-room', (resp) => {
     
  stopInterval();

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

socket.on('kicked-out-player',(resp)=>{

    const kick_out_player:Player={
        username:resp.data.kicked_out_uname,
        id:resp.data.kicked_out_id};

});


// --- UI Helper Functions ---

function showRoom(code:string):void{
    lobbyScreen.classList.add('hidden');
    roomScreen.classList.remove('hidden');
    roomCodeDisplay.textContent = code;
}

