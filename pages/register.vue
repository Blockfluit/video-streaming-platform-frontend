<script setup>
import { useJwtStore } from "~/stores/jwtStore"

definePageMeta({
    layout: false,
});

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
        <a href="https://beta.dellekes.nl">
            <img src="/icons/dellekes_logo.png"
                 alt="logo"
                 class="logo">
        </a>
        <form @submit.prevent="register"
              autocomplete="off">
            <div class="container-register">
                <!-- <header>Register</header> -->
                <span>Please enter an username and password</span>
                <span style="margin-bottom: 10px;">Field with * are required.</span>
                <input v-model="username"
                       type="text"
                       placeholder="Username*"
                       required>
                <input v-model="password"
                       type="password"
                       placeholder="Password*"
                       required>
                <!-- <input v-model="email" type="email" placeholder="Email"> -->
                <input v-if="hideToken"
                       v-model="token"
                       type="text"
                       placeholder="Token*"
                       required>
                <button type="submit">Register</button>
                <span>Back to <NuxtLink to="/login">Login</NuxtLink></span>
            </div>
        </form>
    </div>
</template>

<style scoped>
header {
    font-size: var(--font-size-1);
}

.logo {
    width: 150px;
}

span {
    font-size: var(--font-size-4);
}

input {
    text-align: center;
    border: none;
    border-bottom: 1px solid white;
    padding: 10px;
    margin: 4px;
    width: 80%;
}

input:focus {
    outline: none;
    border-bottom: 1px solid var(--primary-color-100)
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

input:-webkit-autofill,
input:-webkit-autofill:hover,
input:-webkit-autofill:focus,
input:-webkit-autofill::first-line,
textarea:-webkit-autofill,
textarea:-webkit-autofill:hover,
textarea:-webkit-autofill:focus,
select:-webkit-autofill,
select:-webkit-autofill:hover,
select:-webkit-autofill:focus {
    border-bottom: 1px solid white;
    -webkit-text-fill-color: white;
    -webkit-box-shadow: 0 0 0px 1000px var(--background-color-100) inset;
    font-family: "Poppins";
    font-size: inherit;
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
    color: var(--text-color-2);
}

span a {
    color: var(--primary-color-100);
    font-size: inherit;
    text-decoration: none;
}

span a:hover {
    color: var(--primary-color-300);
    text-decoration: underline;
}

.container {
    height: 100vh;
    width: 100vw;
    display: flex;
    flex-direction: column;
    align-items: center;
    align-content: center;
    justify-content: center;
    background-color: var(--background-color-100);
}


.container-register {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 500px;
}
</style>