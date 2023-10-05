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
    const errors = []

    if (username.value === "") {
        errors.push("Username missing.")
    }
    if (password.value === "") {
        errors.push("Password missing.")
    }
    if (token.value === "") {
        errors.push("Token missing.")
    }
    if (email.value !== "" &&
        emailValidation(email)) {
        errors.push("Email invalid.")
    }
    if (errors.length) {
        alert(errors)
        return
    }

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
        <div class="container-register">
            <header>REGISTER</header>
            <section>Please enter an username and password</section>
            <input v-model="username" type="text" placeholder="username">
            <input v-model="password" type="password" placeholder="password">
            <input v-model="email" type="email" placeholder="email *">
            <input v-if="hideToken" v-model="token" type="text" placeholder="token">
            <button @click="register()" type="button">Register</button>
            <span>* Email is optional. But can be used to reset password when forgotten.</span>
        </div>
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
    color: var(--background-color-100);
    border-radius: 100px;
    border-width: 0;
    width: 160px;
    height: 40px;
    margin: 20px;
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
    -webkit-box-shadow: var(--box-shadow-1);
    -moz-box-shadow: var(--box-shadow-1);
    box-shadow: var(--box-shadow-1);
}
</style>