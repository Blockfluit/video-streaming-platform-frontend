<script setup>
import { initTokens } from "#imports";
import { Vue3Lottie } from "vue3-lottie";
import gsap from "gsap"

useHead({ title: "Login" })
definePageMeta({
    layout: false,
});

const username = ref()
const password = ref()
const logoLottie = ref()
const animationWrapper = ref()

async function login(username, password) {
    await initTokens(username, password)
    if (useCookie("refresh-token").value) {
        const tl = gsap.timeline()
        await tl.to(animationWrapper.value, { x: '0', ease: "power4.inOut", duration: 1 })
        navigateTo("/")
    }
}

function intervalLogo() {
    logoLottie.value.stop()
    setTimeout(() => {
        logoLottie.value.play()
    }, 10000)
}
</script>

<template>
    <div class="container">
        <div ref="animationWrapper" class="animation">
            <img src="/icons/dellekes_logo.png" style="width: 50px; position: absolute;" alt="logo">
            <img src="/animations/loader.svg" style="width: 85px;" alt="loader">
        </div>
        <Vue3Lottie style="padding-bottom: 12px;" animationLink="/animations/dellekes_logo.json" ref="logoLottie"
            :height="150" :width="150" :delay="5000" @on-loop-complete="intervalLogo" />
        <form @submit.prevent="login(username, password)">
            <div class="container-login">
                <!-- <header>Login</header> -->
                <span style="text-align: center; margin-bottom: 10px;">Please enter your username and password</span>
                <input v-model="username" type="text" placeholder="Username" required>
                <input v-model="password" type="password" placeholder="Password" required>
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
.animation {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    width: 100vw;
    z-index: 999999999;
    background-color: #090909;
    transform: translateX(100%);
}

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