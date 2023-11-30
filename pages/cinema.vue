<script setup>
import Hyperbeam from '@hyperbeam/web';
import { useJwtStore } from "~/stores/jwtStore";
import { io } from "socket.io-client";


const jwtStore = useJwtStore()
const volumeInput = ref(50)
const HbCloudComputer = ref()
const cursorDisabled = ref(true);
const cursorDisabledAdmin = ref(true);
const activeUsers = ref()

definePageMeta({
    layout: "main",
});

let hb;
let user;
let intervalId;

async function setSession() {
    const session = await fetch("http://localhost:3010/session")
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

onMounted(async () => {
    await setSession()

    var socket = io("http://localhost:3010/", {
        query: {
            name: `${jwtStore.getSubject}`
        }
    });

    socket.on('connection', (users) => activeUsers.value = users)


    // socket.on("heartbeat", (users) => {
    //     console.log(users)
    //     activeUsers.value = users
    //     console.log(activeUsers.value)
    // })

    user = { name: jwtStore.getSubject, id: hb.userId }
    // intervalId = setInterval(() => {
    //     fetch("http://localhost:3010/heartbeat", {
    //         method: "POST",
    //         headers: {
    //             "Content-Type": "application/json"
    //         },
    //         body: JSON.stringify(user)
    //     })
    //         .then((data) => data.json())
    //         .then((json) => activeUsers.value = json)
    // }, 2000)
})

onUnmounted(() => {
    hb.destroy()
    clearInterval(intervalId)
})
</script>
<template>
    <div class="container">
        <!-- Hyperbeam Cloud Computer -->
        <div ref="HbCloudComputer" class="hyperbeam"></div>
        <div class="controls">
            <div class="users">
                <div class="avatars" v-for="user in activeUsers">
                    {{ user }}
                </div>
            </div>
            <div class="control-buttons">
                <button v-if="jwtStore.isAdmin" class="take-cursor" :class="cursorDisabledAdmin ? '' : 'active'"
                    @click="cursorDisabledAdmin = !cursorDisabledAdmin; setPermissionsAdmin(hb.userId)">
                    <Icon name="mdi:cursor-default" size="20px" /> Take Cursor
                </button>
                <button class="take-cursor" :class="cursorDisabled ? '' : 'active'"
                    @click="cursorDisabled = !cursorDisabled; setPermissions(hb.userId)">
                    <Icon name="mdi:cursor-default" size="20px" />
                </button>
                <button class="take-cursor" @click="openFullscreen">
                    <Icon name="material-symbols:fullscreen" size="20px" />
                </button>
                <div style="display:flex; align-items: center; margin-left: 15px;">
                    <div style="display: flex; align-items: center;">
                        <div v-show="volumeInput > 50">
                            <Icon name="material-symbols:volume-up" class="volume-icon" size="30px" />
                        </div>
                        <div v-show="(volumeInput > 0 && volumeInput <= 50)">
                            <Icon name="material-symbols:volume-down" class="volume-icon" size="30px" />
                        </div>
                        <div v-show="volumeInput < 1">
                            <Icon name="material-symbols:volume-mute" class="volume-icon" size="30px" />
                        </div>
                    </div>
                    <input @input="hb.volume = volumeInput / 100;" v-model="volumeInput" type="range">
                </div>
            </div>
        </div>
        <!-- Dellekes Chat -->
    </div>
</template>

<style scoped>
.volume-icon {
    margin-right: 10px;
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
    margin-top: 25px;
    overflow: hidden;
    width: 1280px;
    max-width: 95vw;
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
    max-width: 95vw;
}

.control-buttons {
    display: flex;
    align-items: center;
    min-width: fit-content;
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
    align-items: center;
    flex-direction: column;
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
</style>