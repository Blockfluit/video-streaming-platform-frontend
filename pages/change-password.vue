<script setup>
const config = useRuntimeConfig()

const isReset = ref(false)
const password = ref("")
const passwordConfirm = ref("")
const email = ref("")
const token = ref("")
const hideToken = ref(false)

onMounted(() => {
    if (process.client) {
        const queryString = window.location.search
        const urlParams = new URLSearchParams(queryString)
        token.value = urlParams.get("token")
        hideToken.value = urlParams.get("token") === null
        isReset.value = urlParams.get("token") !== null
    }
})

const sendMail = () => {
    fetch(config.public.baseURL + "/change-password", {
        method: "POST",
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            email: email.value,
        }),
    }).then((response) => {
        if (response.status >= 200 && response.status < 300) {
            isReset.value = true;
            return
        }
        throw new Error("Something went wrong")
    }).catch(e => {
        console.log(e)
    })
}

const reset = () => {
    fetch(config.public.baseURL + "/change-password?token=" + token.value, {
        method: "PATCH",
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            password: password.value,
        }),
    })
        .then((response) => {
            if (response.status >= 200 && response.status < 300) {
                navigateTo("/login")
                return
            }
            throw new Error("Something went wrong.")
        })
        .catch((e) => alert(e))
}
</script>

<template>
    <div class="container">
        <form v-if="!isReset" @submit.prevent="sendMail">
            <div class="container-mail">
                <header>RESET PASSWORD</header>
                <section>A mail will be send to the email you provide with a reset token</section>
                <input v-model="email" type="email" placeholder="email">
                <input type="submit" />
            </div>
        </form>
        <form v-if="isReset" @submit.prevent="reset">
            <div class="container-mail">
                <header>RESET PASSWORD</header>
                <section>Please provide a new password</section>
                <input v-model="password" type="password" placeholder="new password" required>
                <input v-model="passwordConfirm" type="password" placeholder="confirm password" required>
                <input v-if="hideToken" v-model="token" type="text" placeholder="token" required>
                <input type="submit" />
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
    margin: 0 20px;
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

.container {
    height: 80vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    align-content: center;
    justify-content: center;
}


.container-mail {
    display: flex;
    flex-direction: column;
    justify-content: space-evenly;
    align-items: center;
    width: 500px;
    height: 400px;
    border-radius: 30px;
    -webkit-box-shadow: var(--box-shadow-1);
    -moz-box-shadow: var(--box-shadow-1);
    box-shadow: var(--box-shadow-1);
}
</style>