<script setup>
import { useJwtStore } from "~/stores/jwtStore"
const config = useRuntimeConfig()
const jwtStore = useJwtStore()

const username = ref("")
const password = ref("")

const login = () => {
    const errors = []

    if (username.value === "") {
        errors.push("Username missing")
    }
    if (password.value === "") {
        errors.push("Password missing")
    }
    if (errors.length) {
        alert(errors)
        return
    }

    fetch(config.public.baseURL + "/auth/authenticate", {
        method: "POST",
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            username: username.value,
            password: password.value,
        }),
    }).then((response) => {
        if (response.status >= 200 && response.status < 300) {
            return response.json()
        }
        throw new Error("Username or password is wrong")
    }).then((data) => {
        if (data !== undefined) {
            jwtStore.jwt = data["token"]
            navigateTo("/")
        }
    }).catch(e => {
        alert(e)
    })
}


</script>

<template>
    <div class="container">
        <div @keyup.enter="login()" class="container-login">
            <header>LOGIN</header>
            <section>Please enter your username and password</section>
            <input v-model="username" type="text" placeholder="username">
            <input v-model="password" type="password" placeholder="password">
            <span class="forgot-password">Forgot password? <NuxtLink to="/change-password">Click here</NuxtLink>
            </span>
            <button @click="login()" type="button">Sign in</button>
            <span class="got-token">Got a token? <NuxtLink to="/register">Signup</NuxtLink>
            </span>
        </div>
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

button {
    font-family: var(--font-family-1);
    font-size: var(--font-size-4);
    font-weight: bolder;
    background-color: var(--text-color-1);
    color: var(--background-color-1);
    border-radius: 100px;
    border-width: 0;
    width: 160px;
    height: 40px;
    margin: 20px;
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
    border-radius: 30px;
    -webkit-box-shadow: var(--box-shadow-1);
    -moz-box-shadow: var(--box-shadow-1);
    box-shadow: var(--box-shadow-1);
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
</style>