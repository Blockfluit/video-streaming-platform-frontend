<script setup>
import { useJwtStore } from "~/stores/jwtStore"

const config = useRuntimeConfig()
const jwtStore = useJwtStore()

const username = ref("")
const password = ref("")
const email = ref("")
const token = ref("")
const hideToken = ref(false)

onMounted(() => {
    if (process.client) {
        const queryString = window.location.search
        const urlParams = new URLSearchParams(queryString)
        token.value = urlParams.get("token")
        hideToken.value = urlParams.get("token") === null
    }
})

const register = () => {
    fetch(config.public.baseURL + "/auth/register?token=" + token.value, {
        method: "POST",
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            username: username.value,
            password: password.value,
            email: email.value === "" ? null : email.value
        }),
    }).then((response) => {
        if (response.status >= 200 && response.status < 300) {
            return response.json()
        }
        throw new Error("Username or password is wrong.")
    }).then((data) => {
        jwtStore.jwt = data["token"]
        navigateTo("/")
    }).catch((e) => {
        alert(e)
    })
}
</script>

<template>
    <div class="container">
        <form @submit.prevent="register">
            <div class="container-register">
                <header>Register</header>
                <section>Please enter an username and password</section>
                <input v-model="username" type="text" placeholder="Username*" required>
                <input v-model="password" type="password" placeholder="Password*" required>
                <!-- <input v-model="email" type="email" placeholder="Email"> -->
                <input v-if="hideToken" v-model="token" type="text" placeholder="Token*" required>
                <button type="submit">Register</button>
                <span>Field with * are required.</span>
            </div>
        </form>
    </div>
</template>

<style scoped>
header {
    font-size: var(--font-size-1);
}

section {
    font-size: var(--font-size-4);
}

input {
    text-align: left;
    border-color: rgb(255, 255, 255);
    border-radius: 100px;
    border-width: 1px;
    border-style: solid;
    padding: 10px 10px 10px 20px;
    margin: 4px;
    width: 80%;
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
    background-color: var(--primary-color-100);
    cursor: pointer;
}

span {
    margin: 0 20px 20px 20px;
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


.container-register {
    display: flex;
    flex-direction: column;
    justify-content: space-evenly;
    align-items: center;
    width: 500px;
    height: 600px;
    border-radius: 30px;
    background-color: var(--background-color-100);
}
</style>