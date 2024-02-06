<script setup>
import { initTokens } from "#imports";

useHead({ title: "Login" })
definePageMeta({
    layout: false,
});

const username = ref()
const password = ref()

function login(username, password) {
    initTokens(username, password)
        .then(() => {
            navigateTo("/")
        })
}
</script>

<template>
    <div class="container">
        <a href="https://dellekes.nl">
            <img src="/icons/dellekes_logo.png"
                 alt="logo"
                 class="logo">
        </a>
        <form @submit.prevent="login(username, password)">
            <div class="container-login">
                <!-- <header>Login</header> -->
                <span style="text-align: center; margin-bottom: 10px;">Please enter your username and password</span>
                <input v-model="username"
                       type="text"
                       placeholder="Username"
                       required>
                <input v-model="password"
                       type="password"
                       placeholder="Password"
                       required>
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
    font-weight: 700;
}

.logo {
    width: 150px;
}

section {
    font-size: var(--font-size-3);
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
    cursor: pointer;
    background-color: var(--primary-color-100);
}

span {
    color: var(--text-color-2);
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


.container-login {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 500px;
    padding: 10px 20px;
}

.forgot-password {
    align-self: flex-end;
    font-size: var(--font-size-5);
    margin-right: 20px;
}

.forgot-password a {
    font-size: var(--font-size-5);
}

.got-token,
.got-token a {
    font-size: var(--font-size-4);
    text-decoration: none;
}

a {
    color: var(--primary-color-100)
}

a:hover {
    color: var(--primary-color-300);
    text-decoration: underline;
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