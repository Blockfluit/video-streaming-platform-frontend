<script setup>
import { storeToRefs } from 'pinia';
import { useAdminStore } from '~/stores/adminStore';

const adminStore = useAdminStore()

const { users, tokens } = storeToRefs(adminStore)

const username = ref()
const email = ref()
const password = ref("")
const role = ref("USER")
const expiration = ref()
const roleToken = ref("USER")
const masterToken = ref(false)
const updateRoleElement = ref()
const intervalCounter = ref(0)

let updateInterval

onBeforeMount(() => {
    if (process.client) {
        adminStore.getAllUsers()
        adminStore.getAllTokens()
    }
})

onMounted(() => {
    if (process.client) {
        clearInterval(updateInterval)
        updateInterval = setInterval(() => {
            intervalCounter.value--

            if (intervalCounter.value < 0) {
                adminStore.getAllUsers()
                intervalCounter.value = 10
            }
        }, 1000);
    }
})

onBeforeUnmount(() => {
    clearInterval(updateInterval)
})
</script>

<template>
    <div class="container">
        <div class="container-horizontal">
            <div class="container-vertical">
                <h3>Updates in: {{ intervalCounter }}</h3>
                <form @submit.prevent="adminStore.addUser(username, email, password, role)">
                    <div class="container-add-user">
                        <span style="font-size: 2rem; font-weight: 600;">Add User</span>
                        <input v-model="username"
                               placeholder="Username*"
                               type="text"
                               required>
                        <!-- <input v-model="email" placeholder="Email" type="email"> -->
                        <input v-model="password"
                               placeholder="Password*"
                               type="text"
                               required>
                        <select style="margin-bottom: 10px;"
                                v-model="role">
                            <option value="USER">User</option>
                            <option value="CRITIC">Critic</option>
                            <option value="ADMIN">Admin</option>
                        </select>
                        <button type="submit">Add User</button>
                    </div>
                </form>
            </div>
            <div class="container-vertical"
                 style="width: 100%;">
                <h1>test</h1>
                <table class="container-users">
                    <thead>
                        <tr>
                            <td>Username</td>
                            <!-- <td class="email">Email</td> -->
                            <td>Role</td>
                            <td>Last Watched</td>
                            <td>Last Active</td>
                            <td class="email">Last Login</td>
                            <td></td>
                        </tr>
                    </thead>
                    <tbody>
                        <tr class="row"
                            v-for="(user, index) in [...users].sort((a, b) => new Date(b.lastActiveAt) - new Date(a.lastActiveAt))">
                            <td class="username">{{ user.username }}</td>
                            <!-- <td class="email">{{ user.email }}</td> -->
                            <td ref="updateRoleElement"
                                class="role">
                                <select @change="e => adminStore.updateUser(user.username, null, e.target.value)">
                                    <option :selected="user.role === 'USER'"
                                            value="USER">User</option>
                                    <option :selected="user.role === 'CRITIC'"
                                            value="CRITIC">Critic</option>
                                    <option :selected="user.role === 'ADMIN'"
                                            value="ADMIN">Admin</option>
                                </select>
                            </td>
                            <td>
                                <div v-if="user.lastWatched.length > 0"
                                     style="display: flex; align-items: center;">
                                    {{ user.lastWatched[0].name }}
                                    <div v-if="new Date(user.lastWatched[0].updatedAt) > new Date(Date.now() - 15000)"
                                         class="watch-indicator"></div>
                                </div>
                            </td>
                            <td class="last-active">{{ new Date(user.lastActiveAt).toLocaleString() }}</td>
                            <td class="email">{{ new Date(user.lastLoginAt).toLocaleString() }}</td>
                            <td class="delete"
                                @click="adminStore.deleteUser(user.username)">
                                <Icon class="icon"
                                      name="material-symbols:delete"></Icon>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
        <div style="margin-top: 50px;"
             class="container-horizontal">
            <form @submit.prevent="adminStore.addToken(expiration, roleToken, masterToken)">
                <div class="container-add-token">
                    <span style="font-size: 2rem; font-weight: 600;">Add Token</span>
                    <input v-model="expiration"
                           type="date"
                           required>
                    <select style="margin-bottom: 10px;"
                            v-model="roleToken"
                            required>
                        <option value="USER">User</option>
                        <option value="CRITIC">Critic</option>
                        <option value="ADMIN">Admin</option>
                    </select>
                    <div style="display: flex; align-items: center;">
                        <label for="isMasterToken">Master</label>
                        <input style="margin: 10px;"
                               id="isMasterToken"
                               v-model="masterToken"
                               type="checkbox">
                    </div>
                    <button type="submit">Add Token</button>
                </div>
            </form>
            <table class="container-users">
                <thead>
                    <tr>
                        <td>Token</td>
                        <td>Used</td>
                        <td>Role</td>
                        <td>Master</td>
                        <td>Expiration</td>
                        <td>Created By</td>
                        <td></td>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for=" token  in  tokens ">
                        <td>{{ token.token }}</td>
                        <td>{{ token.used }}</td>
                        <td>{{ token.role }}</td>
                        <td>{{ token.master }}</td>
                        <td>{{ new Date(token.expiration).toLocaleString() }}</td>
                        <td>{{ token.createdBy }}</td>
                        <td @click="adminStore.deleteToken(token.token)">
                            <Icon class="icon"
                                  name="material-symbols:delete"></Icon>
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
    padding-top: 20px;
}

.watch-indicator {
    min-width: 10px;
    min-height: 10px;
    background-color: var(--primary-color-100);
    border-radius: 999px;
    margin-left: 10px;
    animation: fade 1.5s ease-in-out infinite;
}

select {
    background-color: transparent;
    color: var(--primary-color-100);
    border: 1px solid var(--primary-color-100);
    border-radius: 5px;
    padding: 3px;
    font-family: var(--font-family-1);
}

select:hover {
    cursor: pointer;
}

select option {
    background-color: var(--background-color-200);
    color: var(--primary-color-100);

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
    background-color: #282828c7;
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

@keyframes fade {
    0% {
        opacity: 0%;
    }

    50% {
        opacity: 100%;
    }

    100% {
        opacity: 0%;
    }
}

@media screen and (max-width: 993px) {
    .container-horizontal {
        flex-direction: column;
    }

    form {
        margin: 0px 0px 50px 0px;
    }

    table {
        font-size: 12px;
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