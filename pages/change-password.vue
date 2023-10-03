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
    const errors = []
    if (email.value === "") {
        errors.push("Please provide an email.")
    }
    if (emailValidation(email)) {
        errors.push("Email invalid.")
    }
    if (errors.length) {
        alert(errors)
        return
    }

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
    const errors = []

    if (password === "") {
        errors.push("Password can't be empty")
    }
    if (password.value !== passwordConfirm.value) {
        errors.push("Password does not match.")
    }
    if (token.value === "") {
        errors.push("Token missing.")
    }

    if (errors.length) {
        alert(errors)
        return
    }

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
        <div v-if="!isReset" class="container-mail">
            <header>RESET PASSWORD</header>
            <section>A mail will be send to the email you provide with a reset token</section>
            <input v-model="email" type="email" placeholder="email">
            <button @click="sendMail()" type="button">Send</button>
        </div>
        <div v-if="isReset" class="container-mail">
            <header>RESET PASSWORD</header>
            <section>Please provide a new password</section>
            <input v-model="password" type="password" placeholder="new password">
            <input v-model="passwordConfirm" type="password" placeholder="confirm password">
            <input v-if="hideToken" v-model="token" type="text" placeholder="token">
            <button @click="reset()" type="button">Send</button>
        </div>
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