<script setup>
import { useJwtStore } from '~/stores/jwtStore';

const config = useRuntimeConfig()
const jwtStore = useJwtStore()

const users = ref([])
const tokens = ref([])

const username = ref()
const email = ref()
const password = ref("")
const role = ref("USER")
const expiration = ref()
const tokenRole = ref("USER")

onBeforeMount(() => {
    getAllUsers()
    getAllTokens()
})

const getAllUsers = () => {
    fetch(config.public.baseURL + "/users", {
        method: "GET",
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            "Authorization": `Bearer ${jwtStore.getJwt}`
        }
    }).then((response) => {
        if (response.status >= 200 && response.status < 300) {
            return response.json()
        }
    }).then((data) => {
        users.value = data
    }).catch(e => {
        console.log(e)
    })
}

const addUser = () => {
    fetch(config.public.baseURL + "/auth/register", {
        method: "POST",
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            "Authorization": `Bearer ${jwtStore.getJwt}`
        },
        body: JSON.stringify({
            username: username.value,
            email: email.value === "" ? null : email.value,
            password: password.value,
            role: role.value,
        })
    }).then((response) => {
        if (response.status >= 200 && response.status < 300) {
            getAllUsers()
        }
    }).catch(e => {
        console.log(e)
    })
}

const deleteUser = (username) => {
    if (!confirm("Are you sure you want to delete this account?")) return

    fetch(config.public.baseURL + "/users", {
        method: "DELETE",
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            "Authorization": `Bearer ${jwtStore.getJwt}`
        },
        body: JSON.stringify({
            username: username,
        })
    }).then((response) => {
        if (response.status >= 200 && response.status < 300) {
            getAllUsers()
        }
    }).catch(e => {
        console.log(e)
    })
}

const getAllTokens = () => {
    fetch(config.public.baseURL + "/invite-tokens", {
        method: "GET",
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            "Authorization": `Bearer ${jwtStore.getJwt}`
        }
    }).then((response) => {
        if (response.status >= 200 && response.status < 300) {
            return response.json()
        }
    }).then((data) => {
        tokens.value = data
    }).catch(e => {
        console.log(e)
    })
}

const addToken = () => {
    fetch(config.public.baseURL + "/invite-tokens", {
        method: "POST",
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            "Authorization": `Bearer ${jwtStore.getJwt}`
        },
        body: JSON.stringify({
            expiration: new Date(expiration.value),
            role: tokenRole.value,
        })
    }).then((response) => {
        if (response.status >= 200 && response.status < 300) {
            getAllTokens()
        }
    }).catch(e => {
        console.log(e)
    })
}

const deleteToken = (token) => {
    if (!confirm("Are you sure you want to delete this token?")) return

    fetch(config.public.baseURL + "/invite-tokens/" + token, {
        method: "DELETE",
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            "Authorization": `Bearer ${jwtStore.getJwt}`
        }
    }).then((response) => {
        if (response.status >= 200 && response.status < 300) {
            getAllTokens()
        }
    }).catch(e => {
        console.log(e)
    })
}
</script>

<template>
    <NuxtLayout name="main">
        <div class="container">
            <div class="container-horizontal">
                <form @submit.prevent="addUser">
                    <div class="container-add-user">
                        <h1>Add User</h1>
                        <input v-model="username" placeholder="username" type="text" required>
                        <input v-model="email" placeholder="email" type="email">
                        <input v-model="password" placeholder="password" type="text" required>
                        <select v-model="role">
                            <option value="USER">User</option>
                            <option value="CRITIC">Critic</option>
                            <option value="ADMIN">Admin</option>
                        </select>
                        <input type="submit" />
                    </div>
                </form>
                <table class="container-users">
                    <thead>
                        <tr>
                            <td>Username</td>
                            <td>Email</td>
                            <td>Role</td>
                            <td>Last Active</td>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for=" user  in  users ">
                            <td>{{ user.username }}</td>
                            <td>{{ user.email }}</td>
                            <td>{{ user.role }}</td>
                            <td>{{ new Date(user.lastActiveAt).toLocaleString() }}</td>
                            <td @click="deleteUser(user.username)">
                                <Icon name="fa-solid:poo"></Icon>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div class="container-horizontal">
                <form @submit.prevent="addToken">
                    <div class="container-add-token">
                        <h1>Add Token</h1>
                        <input v-model="expiration" type="date" required>
                        <select v-model="tokenRole" required>
                            <option value="USER">User</option>
                            <option value="CRITIC">Critic</option>
                            <option value="ADMIN">Admin</option>
                        </select>
                        <input type="submit" />
                    </div>
                </form>
                <table class="container-users">
                    <thead>
                        <tr>
                            <td>Token</td>
                            <td>Role</td>
                            <td>Expiration</td>
                            <td>Created By</td>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for=" token  in  tokens ">
                            <td>{{ token.token }}</td>
                            <td>{{ token.role }}</td>
                            <td>{{ new Date(token.expiration).toLocaleString() }}</td>
                            <td>{{ token.createdBy }}</td>
                            <td @click="deleteToken(token.token)">
                                <Icon name="fa-solid:poo"></Icon>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </NuxtLayout>
</template>

<style scoped>
.container {
    margin: 50px;
}

.container-horizontal {
    display: flex;
    flex-direction: row;
}

.container-add-user {
    display: flex;
    flex-direction: column;
}

.container-add-token {
    display: flex;
    flex-direction: column;
}

.container-users {
    border: 1px solid white;
}
</style>