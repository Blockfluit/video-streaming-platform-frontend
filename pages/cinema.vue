<script setup>
import Hyperbeam from '@hyperbeam/web';
import { useJwtStore } from "~/stores/jwtStore";
import { io } from "socket.io-client";


const jwtStore = useJwtStore()
const volumeInput = ref(50)
const HbCloudComputer = ref()
const chatMessages = ref([])
const cursorDisabled = ref(true);
const cursorDisabledAdmin = ref(true);
const activeUsers = ref()
const chatInput = ref("")
const chatBox = ref()
const config = useRuntimeConfig()

let hb;
let socket

async function setSession() {
    // config.public.cinemaURL
    const session = await fetch(config.public.cinemaURL + "session")
        .then(res => res.json()).catch(err => alert(err))
    hb = await Hyperbeam(HbCloudComputer.value, session.embed_url, {
        adminToken: session.admin_token
    })
}
// i wanna play fortnite
function setPermissionsAdmin(id) {
    hb.setPermissions(id, { priority: 5, idle_timeout: 3000, control_disabled: cursorDisabledAdmin.value })
}

function setPermissions(id) {
    hb.setPermissions(id, { priority: 2, idle_timeout: 3000, control_disabled: cursorDisabled.value })
}

function openFullscreen() {
    console.log(HbCloudComputer.value.requestFullscreen)
    if (HbCloudComputer.value.requestFullscreen) {
        HbCloudComputer.value.requestFullscreen();
    } else if (HbCloudComputer.value.webkitRequestFullscreen) { /* Safari */
        HbCloudComputer.value.webkitRequestFullscreen();
    } else if (HbCloudComputer.value.msRequestFullscreen) { /* IE11 */
        HbCloudComputer.value.msRequestFullscreen();
    }
}

function clearChat() {
    const emptyArray = []
    socket.emit("clear-chat", emptyArray)
}

function sendChat() {
    if (chatInput.value === "") {
        return
    }
    socket.emit("chat-message", { name: jwtStore.getSubject, message: chatInput.value, timestamp: new Date().toLocaleTimeString(undefined, { timeStyle: "short" }) })
    chatInput.value = ""
}

onBeforeMount(() => {
    // config.public.cinemaURL
    socket = io(config.public.cinemaURL, {
        query: {
            name: `${jwtStore.getSubject}`
        }
    });
    socket.on('connection', (users) => activeUsers.value = users)
    socket.on("chat-message", (messages) => chatMessages.value = messages)
    socket.on("clear-chat", (messages) => chatMessages.value = messages)
})

onMounted(async () => {
    await setSession()
    console.log(activeUsers.value)
})

onUnmounted(() => {
    hb.destroy()
})
</script>
<template>
    <div class="container">
        <!-- Hyperbeam Cloud Computer -->
        <div class="hb-container">
            <div ref="HbCloudComputer"
                 class="hyperbeam"></div>
            <div class="controls">
                <div class="users">
                    <template v-for="user in new Set(activeUsers)">
                        <div class="avatars">
                            {{ user }}
                        </div>
                    </template>
                </div>
                <div class="control-buttons">
                    <button v-if="jwtStore.isAdmin"
                            class="take-cursor"
                            :class="cursorDisabledAdmin ? '' : 'active'"
                            @click="cursorDisabledAdmin = !cursorDisabledAdmin; setPermissionsAdmin(hb.userId)">
                        <Icon name="mdi:cursor-default"
                              size="20px" /> Take Cursor
                    </button>
                    <button class="take-cursor"
                            :class="cursorDisabled ? '' : 'active'"
                            @click="cursorDisabled = !cursorDisabled; setPermissions(hb.userId)">
                        <Icon name="mdi:cursor-default"
                              size="20px" />
                    </button>
                    <button class="take-cursor"
                            @click="openFullscreen">
                        <Icon name="material-symbols:fullscreen"
                              size="20px" />
                    </button>
                    <div style="display:flex; align-items: center; margin-left: 15px;">
                        <div style="display: flex; align-items: center;">
                            <div v-show="volumeInput > 50">
                                <Icon name="material-symbols:volume-up"
                                      class="volume-icon"
                                      size="30px" />
                            </div>
                            <div v-show="(volumeInput > 0 && volumeInput <= 50)">
                                <Icon name="material-symbols:volume-down"
                                      class="volume-icon"
                                      size="30px" />
                            </div>
                            <div v-show="volumeInput < 1">
                                <Icon name="material-symbols:volume-mute"
                                      class="volume-icon"
                                      size="30px" />
                            </div>
                        </div>
                        <input @input="hb.volume = volumeInput / 100;"
                               v-model="volumeInput"
                               type="range">
                    </div>
                </div>
            </div>
        </div>

        <!-- Dellekes Chat -->
        <div class="chat-container">
            <span v-if="jwtStore.isAdmin"
                  @click="clearChat()"
                  class="clear-btn">Clear
                chat</span>
            <ul class="message-list"
                ref="chatBox">
                <template v-for="chat in chatMessages.slice().reverse()">
                    <li><span class="msg-time">{{ chat.timestamp
                    }}</span><span class="username">{{
    chat.name
}}:</span><span class="chat-message">{{ chat.message }}</span>
                    </li>
                </template>
            </ul>
            <div class="input-container">
                <input @keyup.enter="sendChat()"
                       v-model="chatInput"
                       type="text"
                       placeholder="Type a message...">
                <button @click="sendChat()"
                        class="send-btn">
                    <Icon name="material-symbols-light:send-rounded"
                          size="24px"
                          class="send-icon" />
                </button>
            </div>
        </div>
    </div>
</template>

<style scoped>
.volume-icon {
    margin-right: 10px;
}

.chat-container {
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    min-width: 150px;
    width: 100%;
    aspect-ratio: 16/9;
    max-width: 400px;
    height: 720px;
    box-shadow: 0px 0px 15px 5px rgba(0, 0, 0, 0.6);
    margin: 0px 25px;
    border-radius: 25px;
    overflow: hidden;
    background-color: var(--background-color-100);
    margin-bottom: 50px;
}

.clear-btn {
    padding: 5px 10px;
    width: 100%;
    position: absolute;
    display: flex;
    justify-content: center;
    user-select: none;
}

.clear-btn:hover {
    color: var(--primary-color-100);
    cursor: pointer;
}

.message-list {
    width: 100%;
    height: 100%;
    margin: 0;
    display: flex;
    flex-direction: column-reverse;
    padding: 10px;
    overflow-x: hidden;
    overflow-y: scroll;
}

.message-list::-webkit-scrollbar {
    display: none;
}

.message-list {
    scrollbar-width: none;
}

li {
    list-style: none;
}

.username {
    margin-right: 6px;
    color: var(--primary-color-100)
}

.msg-time {
    font-weight: 200;
    color: var(--text-color-2);
    margin-right: 4px;
}

.input-container {
    display: flex;
    align-items: center;
    padding: 10px;
    width: 100%;
    height: fit-content;
    background-color: var(--background-color-100);
}

.input-container input {
    border: none;
    width: 100%;
    border-radius: 999px;
    padding: 5px 40px 5px 20px;
    background-color: var(--background-color-200);
}

.input-container input:focus {
    border: none;
    outline: none;
}

.send-btn {
    position: absolute;
    right: 12px;
    background-color: transparent;
    border: none;
    display: flex;
    justify-content: center;
    align-items: center;
}

.send-icon {
    color: white;
    min-width: 24px;
}

.send-icon:hover {
    cursor: pointer;
    color: var(--primary-color-100);
}

.users {
    display: flex;
    width: 100%;
    overflow-y: hidden;
    overflow-x: scroll
}

.users::-webkit-scrollbar {
    display: none;
}

.avatars {
    display: flex;
    justify-content: center;
    align-items: center;
    width: fit-content;
    height: fit-content;
    padding: 5px 10px;
    border-radius: 25px;
    margin: 0px 5px;
    background-color: var(--primary-color-100);
}

.admin:hover::before {
    content: "";
    background-color: rgba(0, 0, 0, 0.5);
}


.hyperbeam {
    position: relative;
    overflow: hidden;
    width: 1280px;
    max-width: 100%;
    aspect-ratio: 16/9;
    background-color: var(--background-color-100);
    box-shadow: 0px 0px 15px 5px rgba(0, 0, 0, 0.6);
    border-radius: 25px;
}

.controls {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 20px;
    margin-bottom: 100px;
    width: 1280px;
    max-width: 100%;
}

.control-buttons {
    display: flex;
    align-items: center;
    min-width: fit-content;
    flex-wrap: wrap;
}

.fullScreen {
    width: 100%;
    height: 100%;
    position: fixed;
    top: 0;
    left: 0;
    z-index: 99999999999999999999999999999999999999999999999;
}

.take-cursor {
    background-color: transparent;
    border: 1px solid white;
    color: white;
    padding: 5px 10px;
    font-family: var(--font-family-1);
    border-radius: 10px;
    margin: 0px 5px;
    white-space: nowrap;
}

.active {
    border: 1px solid var(--primary-color-100) !important;
    color: var(--primary-color-100) !important;
}

.take-cursor:hover {
    border: 1px solid var(--primary-color-100);
    color: var(--primary-color-100);
    cursor: pointer;
}

.container {
    width: 100%;
    padding: 0px 30px;
    display: flex;
    justify-content: center;
    height: 85vh;
    margin-top: 50px;
    margin-bottom: 50px;
}



/*********** Baseline, reset styles ***********/
input[type="range"] {
    -webkit-appearance: none;
    appearance: none;
    background: transparent;
    cursor: pointer;
    width: 10rem;
}

/* Removes default focus */
input[type="range"]:focus {
    outline: none;
}

/******** Chrome, Safari, Opera and Edge Chromium styles ********/
/* slider track */
input[type="range"]::-webkit-slider-runnable-track {
    background-color: #f44336;
    border-radius: 0.5rem;
    height: 0.5rem;
}

/* slider thumb */
input[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none;
    /* Override default look */
    appearance: none;
    margin-top: -8px;
    /* Centers thumb on the track */
    background-color: #ffffff;
    border-radius: 5rem;
    height: 1.5rem;
    width: 1.5rem;
}

input[type="range"]:focus::-webkit-slider-thumb {
    outline: 3px solid #ffffff;
    outline-offset: 0.125rem;
}

/*********** Firefox styles ***********/
/* slider track */
input[type="range"]::-moz-range-track {
    background-color: #f44336;
    border-radius: 0.5rem;
    height: 0.5rem;
}

/* slider thumb */
input[type="range"]::-moz-range-thumb {
    background-color: #ffffff;
    border: none;
    /*Removes extra border that FF applies*/
    border-radius: 0.5rem;
    height: 1rem;
    width: 1rem;
}

input[type="range"]:focus::-moz-range-thumb {
    outline: 3px solid #ffffff;
    outline-offset: 0.125rem;
}

@media screen and (max-width: 992px) {
    .container {
        flex-direction: column;
    }

    .hb-container {
        width: 100%;
    }

    .controls {
        margin-bottom: 25px;
    }

    .chat-container {
        width: 100%;
        max-width: 100%;
        margin: 0;
        margin-bottom: 25px;
    }
}
</style>