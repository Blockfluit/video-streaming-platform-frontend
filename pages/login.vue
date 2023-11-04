<script setup>
import { storeToRefs } from "pinia";
import { useJwtStore } from "~/stores/jwtStore"
const config = useRuntimeConfig()
const jwtStore = useJwtStore()

const { jwt } = storeToRefs(jwtStore)

const username = ref()
const password = ref()

const login = (username, password) => {
    fetch(config.public.baseURL + "/auth/authenticate", {
        method: "POST",
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            username: username,
            password: password,
        }),
    }).then((response) => {
        if (response.status >= 200 && response.status < 300) {
            return response.json()
        }
        throw new Error("Username or password is wrong")
    }).then((data) => {
        if (data !== undefined) {
            jwt.value = data["token"]
            navigateTo("/")
        }
    }).catch(e => {
        alert(e)
    })
}


</script>

<template>
    <div class="container">
        <form @submit.prevent="login(username, password)">
            <div class="container-login">
                <header>Login</header>
                <span style="text-align: center;">Please enter your username and password</span>
                <input v-model="username" type="text" placeholder="username" required>
                <input v-model="password" type="password" placeholder="password" required>
                <!-- <div style="display: flex; justify-content: center;">
                    <span class="forgot-password">Forgot password? <NuxtLink to="/change-password">Click here</NuxtLink>
                    </span>
                </div> -->
                <button type="submit">Login</button>
                <span class="got-token">Got a token? <NuxtLink to="/register">Signup</NuxtLink>
                </span>
            </div>
        </form>
    </div>
</template>

<style scoped>
header {
    font-size: var(--font-size-1);
}

section {
    font-size: var(--font-size-3);
}

input {
    text-align: center;
    border-color: rgb(255, 255, 255);
    border-radius: 100px;
    border-width: 1px;
    border-style: solid;
    padding: 10px;
    margin: 4px;
    width: 80%;
}

/* Firefox */
input::placeholder {
    font-family: var(--font-family-1);
    font-size: var(--font-size-4);
    color: var(--text-color-2);
    opacity: 1;
    text-align: center;
}

/* Edge 12 -18 */
input::-ms-input-placeholder {
    font-family: var(--font-family-1);
    font-size: var(--font-size-4);
    color: var(--text-color-2);
    text-align: center;
}

button {
    font-family: var(--font-family-1);
    font-size: var(--font-size-4);
    font-weight: bolder;
    background-color: var(--text-color-1);
    color: var(--background-color-100);
    border-radius: 100px;
    border-width: 0;
    width: 160px;
    height: 40px;
    margin: 20px;
}

button:hover {
    cursor: pointer;
    background-color: var(--primary-color-100);
}

span {
    color: var(--text-color-2);
}

.container {
    height: 80vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    align-content: center;
    justify-content: center;
}


.container-login {
    display: flex;
    flex-direction: column;
    justify-content: space-evenly;
    align-items: center;
    width: 500px;
    height: 500px;
    padding: 10px 20px;
    border-radius: 15px;
    background-color: var(--background-color-100);
}

.forgot-password {
    align-self: flex-end;
    font-size: var(--font-size-5);
    margin-right: 20px;
}

.forgot-password a {
    font-size: var(--font-size-5);
}

.got-token {
    font-size: var(--font-size-4);
}

a {
    color: var(--primary-color-100)
}

a:hover {
    color: var(--primary-color-300)
}

@media screen and (max-width: 700px) {
    .container-login {
        display: flex;
        flex-direction: column;
        justify-content: space-evenly;
        align-items: center;
        width: 300px;
        height: 500px;
        padding: 10px 20px;
        border-radius: 15px;
        background-color: var(--background-color-100);
    }
}
</style>