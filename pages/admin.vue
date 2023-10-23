<script setup>
import { useJwtStore } from '~/stores/jwtStore';

definePageMeta({
    layout: "main",
});

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
const updateRoleElement = ref()

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
        console.log(data)
        users.value = data
    }).catch(e => {
        console.log(e)
    })
}

const addUser = (username, email, password, role) => {
    fetch(config.public.baseURL + "/auth/register", {
        method: "POST",
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            "Authorization": `Bearer ${jwtStore.getJwt}`
        },
        body: JSON.stringify({
            username: username,
            email: email === "" ? null : email,
            password: password,
            role: role,
        })
    }).then((response) => {
        if (response.status >= 200 && response.status < 300) {
            getAllUsers()
        }
    }).catch(e => {
        console.log(e)
    })
}

const updateUser = (username, email, role) => {
    if (jwtStore.getSubject === username &&
        role !== null &&
        !confirm("You are about to change your own role. This might not be reverseable. Are you sure?")) {
        getAllUsers()
        return
    }

    fetch(config.public.baseURL + "/users", {
        method: "PATCH",
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            "Authorization": `Bearer ${jwtStore.getJwt}`
        },
        body: JSON.stringify({
            username: username,
            email: email,
            role: role,
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
    <div class="container">
        <div class="container-horizontal">
            <form @submit.prevent="addUser(username, email, password, role)">
                <div class="container-add-user">
                    <span style="font-size: 2rem; font-weight: 600;">Add User</span>
                    <input v-model="username" placeholder="Username*" type="text" required>
                    <input v-model="email" placeholder="Email" type="email">
                    <input v-model="password" placeholder="Password*" type="text" required>
                    <select style="margin-bottom: 10px;" v-model="role">
                        <option value="USER">User</option>
                        <option value="CRITIC">Critic</option>
                        <option value="ADMIN">Admin</option>
                    </select>
                    <button type="submit">Add User</button>
                </div>
            </form>
            <table class="container-users">
                <thead>
                    <tr>
                        <td>Username</td>
                        <td class="email">Email</td>
                        <td>Role</td>
                        <td>Last Active</td>
                        <td></td>
                    </tr>
                </thead>
                <tbody>
                    <tr class="row"
                        v-for="(user, index) in [...users].sort((a, b) => new Date(b.lastActiveAt) - new Date(a.lastActiveAt))">
                        <td class="username">{{ user.username }}</td>
                        <td class="email">{{ user.email }}</td>
                        <td ref="updateRoleElement" class="role">
                            <select @change="updateUser(user.username, null, updateRoleElement[index].children[0].value)">
                                <option :selected="user.role === 'USER'" value="USER">User</option>
                                <option :selected="user.role === 'CRITIC'" value="CRITIC">Critic</option>
                                <option :selected="user.role === 'ADMIN'" value="ADMIN">Admin</option>
                            </select>
                        </td>
                        <td class="last-active">{{ new Date(user.lastActiveAt).toLocaleString() }}</td>
                        <td class="delete" @click="deleteUser(user.username)">
                            <Icon class="icon" name="material-symbols:delete"></Icon>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
        <div style="margin-top: 50px;" class="container-horizontal">
            <form @submit.prevent="addToken">
                <div class="container-add-token">
                    <span style="font-size: 2rem; font-weight: 600;">Add Token</span>
                    <input v-model="expiration" type="date" required>
                    <select style="margin-bottom: 10px;" v-model="tokenRole" required>
                        <option value="USER">User</option>
                        <option value="CRITIC">Critic</option>
                        <option value="ADMIN">Admin</option>
                    </select>
                    <button type="submit">Add Token</button>
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
                            <Icon class="icon" name="material-symbols:delete"></Icon>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<style scoped>
.container {
    margin: 50px;
}

input {
    border: 1px solid white;
    border-radius: 5px;
    margin-bottom: 10px;
    padding-left: 6px;
}

form {
    min-width: 250px;
    margin-right: 50px;
}

.container-horizontal {
    display: flex;
    flex-direction: row;
}

.delete {
    margin-left: -50px;
}

table {
    width: 100%;
    height: fit-content;
    background-color: #282828;
    border-collapse: collapse;
    border-width: 0px;
    border-color: #FFFFFF;
    border-style: solid;
    color: #FFFFFF;
}

table td,
table th {
    border-width: 0px;
    border-color: #FFFFFF;
    border-style: solid;
    overflow: hidden;
    padding-left: 15px;
    height: 40px;
}

table thead {
    background-color: #121212;
}

tbody tr:nth-child(even) {
    background: var(--background-color-100);
}


.email {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
}


.icon {
    display: flex;
    align-items: center;
}

.icon:hover {
    color: var(--primary-color-100);
    cursor: pointer;
}

.container-add-user {
    display: flex;
    flex-direction: column;
}

.container-add-token {
    display: flex;
    flex-direction: column;
}

.container-users thead {
    height: 40px;
}

.container-users tr {
    height: 30px;
}

button {
    padding: 10px 15px;
    background-color: white;
    border: none;
    border-radius: 10px;
    font-family: var(--font-family-1);
}

button:hover {
    background-color: var(--primary-color-100);
    cursor: pointer;
}

@media screen and (max-width: 993px) {
    .container-horizontal {
        flex-direction: column;
    }

    form {
        margin: 0px 0px 50px 0px;
    }

    table .last-active,
    table .username {
        max-width: 4vw;
    }

    .email {
        display: none;
    }

    .role {
        max-width: 60px;
    }
}
</style>