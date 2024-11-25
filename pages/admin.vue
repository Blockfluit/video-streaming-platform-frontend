<script setup>
import { storeToRefs } from 'pinia';
import { useAdminStore } from '~/stores/adminStore';

useHead({ title: "Admin" })

const adminStore = useAdminStore()

const { users, tokens } = storeToRefs(adminStore)

const username = ref()
const email = ref()
const password = ref("")
const role = ref("USER")
const expiration = ref()
const roleToken = ref("USER")
const masterToken = ref(false)
const dateInput = ref()
const updateRoleElement = ref()
const intervalCounter = ref(0)
const showAddUserModal = ref(false)
const showAddTokenModal = ref(false)


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

function logoutUser(userId) {
    adminStore.revokeRefreshToken(userId)
        .then(() => adminStore.getAllUsers())
}
</script>

<template>
    <div class="container">
        <div v-if="showAddUserModal" class="add-user-modal">
            <div class="modal-card">
                <form style="width: 100%;" @submit.prevent="adminStore.addUser(username, email, password, role)">
                    <Icon @click="showAddUserModal = false" class="exit-modal-btn" name="radix-icons:cross-2"
                        size="16px" />
                    <div class="container-add-user">
                        <span style="font-size: 2rem; font-weight: 600; line-height: 1; margin-bottom: 12px">Add
                            User</span>
                        <input v-model="username" placeholder="Username*" type="text" required>
                        <input v-model="password" placeholder="Password*" type="text" required>
                        <select style="margin-bottom: 10px;" v-model="role">
                            <option value="USER">User</option>
                            <option value="CRITIC">Critic</option>
                            <option value="ADMIN">Admin</option>
                        </select>
                        <button type="submit">Add User</button>
                    </div>
                </form>
            </div>
        </div>
        <div v-if="showAddTokenModal" class="add-user-modal">
            <div class="modal-card">
                <form style="width: 100%;" @submit.prevent="adminStore.addToken(expiration, roleToken, masterToken)">
                    <div class="container-add-token">
                        <span style="font-size: 2rem; font-weight: 600; line-height: 1; margin-bottom: 12px">Add
                            Token</span>
                        <Icon @click="showAddTokenModal = false" class="exit-modal-btn" name="radix-icons:cross-2"
                            size="16px" />

                        <div style="display: flex; align-items: center;">
                            <input style="color-scheme: dark; width: 100%; margin-right: 24px;" v-model="expiration"
                                @click="dateInput.showPicker()" ref="dateInput" type="date" required>
                            <label for="isMasterToken" style="font-size: 32px; margin-right: 8px;">Master </label>
                            <input
                                style="margin-top: 10px; width: 30px; height: 30px; accent-color: var(--primary-color-100);"
                                id="isMasterToken" v-model="masterToken" type="checkbox">

                        </div>
                        <select style="margin-bottom: 10px;" v-model="roleToken" required>
                            <option value="USER">User</option>
                            <option value="CRITIC">Critic</option>
                            <option value="ADMIN">Admin</option>
                        </select>

                        <button type="submit">Add Token</button>
                    </div>
                </form>
                <div
                    style="margin-top: 16px; border: 1px solid var(--background-color-300); border-radius: 8px; overflow: hidden;">
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
                            <tr v-for="token in tokens">
                                <td>{{ token.token }}</td>
                                <td>{{ token.used }}</td>
                                <td>{{ token.role }}</td>
                                <td>{{ token.master }}</td>
                                <td>{{ new Date(token.expiration).toLocaleString() }}</td>
                                <td>{{ token.createdBy }}</td>
                                <td @click="adminStore.deleteToken(token.token)">
                                    <Icon class="icon" style="margin-right: 8px;" name="material-symbols:delete"></Icon>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
        <div class="container-horizontal">

            <div class="container-vertical" style="width: 100%;">
                <div class="toolbar">
                    <h1
                        style="display: flex; align-items: end; gap: 8px; margin: 0; margin-right: 16px; line-height: 1; position: sticky; top: 0; background-color: var(--background-color-100); z-index:9;">
                        Admin panel <h1 style="font-size: 12px; font-weight: 200; margin: 0; margin-bottom: 4px;">
                            {{
                                intervalCounter }}
                        </h1>
                    </h1>
                    <div style="display: flex; gap: 8px">
                        <button @click="showAddUserModal = true" class="add-user-btn">
                            <div class="tooltip-popup">Add user</div>
                            <Icon
                                name="streamline:interface-user-add-actions-add-close-geometric-human-person-plus-single-up-user" />
                        </button>
                        <button @click="showAddTokenModal = true" class="add-token-btn">
                            <div class="tooltip-popup">Add token</div>
                            <Icon name="clarity:key-outline-badged" />
                        </button>
                    </div>
                </div>
                <div class="table-wrapper">
                    <table class="container-users">
                        <thead>
                            <tr>
                                <td>Username</td>
                                <td>Role</td>
                                <td>Last Watched</td>
                                <td>Last Active</td>
                                <td class="email">Last Login</td>
                                <td></td>
                                <td></td>
                            </tr>
                        </thead>
                        <tbody>
                            <tr class="row"
                                v-for="(user, index) in [...users].sort((a, b) => new Date(b.lastActiveAt) - new Date(a.lastActiveAt))">
                                <td class="username">{{ user.username }}</td>
                                <td ref="updateRoleElement" class="role">
                                    <select style="margin-right: 12px;"
                                        @change="e => adminStore.updateUser(user.username, null, e.target.value)">
                                        <option :selected="user.role === 'USER'" value="USER">User</option>
                                        <option :selected="user.role === 'CRITIC'" value="CRITIC">Critic</option>
                                        <option :selected="user.role === 'ADMIN'" value="ADMIN">Admin</option>
                                    </select>
                                </td>
                                <td>
                                    <div v-if="user.lastWatched.length > 0" style="display: flex; align-items: center;">
                                        {{ user.lastWatched[0].name }}
                                        <div v-if="new Date(user.lastWatched[0].updatedAt) > new Date(Date.now() - 15000)"
                                            class="watch-indicator"></div>
                                    </div>
                                </td>
                                <td class="last-active">{{ new Date(user.lastActiveAt).toLocaleString() }}</td>
                                <td class="email">{{ new Date(user.lastLoginAt).toLocaleString() }}</td>
                                <td>
                                    <button class="logout-user-btn" style="margin-right: 12px;"
                                        v-if="user.refreshTokens.length > 0 && new Date(user.refreshTokens[0].expiration).getTime() > Date.now()"
                                        @click="logoutUser(user.id)">
                                        <div class="tooltip-popup">Logout user</div>
                                        <Icon name="material-symbols:logout-rounded" />
                                    </button>
                                </td>
                                <td class="delete" @click="adminStore.deleteUser(user.username)">
                                    <button class="delete-user-btn" style="margin-right: 12px;">
                                        <div class="tooltip-popup">Delete user</div>
                                        <Icon class="icon" name="material-symbols:delete"></Icon>
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.container {
    margin: 50px;
    padding: 20px;
    background-color: var(--background-color-100);
    border-radius: 8px;
    position: relative;
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
    border: none;
    border-bottom: 1px solid white;
    margin-bottom: 10px;
    padding-left: 2px;
}

.table-wrapper {
    outline: 2px solid var(--background-color-200);
    border-radius: 6px;
}

.toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
}

.add-token-btn,
.add-user-btn {
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    border-radius: 999px;
    height: 40px;
    width: 40px;
}

.delete-user-btn,
.logout-user-btn {
    position: relative;
}

.add-token-btn .icon {
    min-width: 14px;
}

.add-user-btn .icon {
    min-width: 14px;
    margin-left: 2px
}

.tooltip-popup {
    position: absolute;
    top: -100%;
    left: 50%;
    transform: translateX(-50%);
    text-wrap: nowrap;
    background-color: var(--background-color-100);
    border: 1px solid var(--background-color-300);
    border-radius: 4px;
    padding: 5px 10px;
    opacity: 0;
    transition: opacity .5s ease;
    pointer-events: none;
}

.add-token-btn:hover .tooltip-popup,
.add-user-btn:hover .tooltip-popup,
.delete-user-btn:hover .tooltip-popup,
.logout-user-btn:hover .tooltip-popup {
    opacity: 1;
}

.add-user-modal {
    display: flex;
    justify-content: center;
    align-items: center;
    position: fixed;
    top: 80px;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(5px);
    z-index: 99;
}

.modal-card {
    padding: 15px;
    border: 1px solid var(--background-color-300);
    border-radius: 8px;
    background-color: var(--background-color-100);
    margin-bottom: 20vh;
    position: absolute;
    z-index: 100;
}

.modal-card .exit-modal-btn {
    position: absolute;
    top: 10px;
    right: 10px;
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
    padding: 0;
}

table {
    width: 100%;
    height: fit-content;
    background-color: var(--background-color-200);
    border-collapse: collapse;
    border-width: 0px;
    border-color: #FFFFFF;
    border-style: solid;
    color: #FFFFFF;
    border: none;
}

table td,
table th {
    padding-left: 15px;
}

table th:first-child {
    border-radius: 10px 0 0 10px;
}

table th:last-child {
    border-radius: 0 10px 10px 0;
}

table thead {
    background-color: #121212;
    border-radius: 16px !important;
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
    background-color: transparent;
    border: 1px solid var(--background-color-300);
    border-radius: 6px;
    font-family: var(--font-family-1);
    color: white;
    transition: all .3s ease;
    font-size: 16px;
    line-height: 1;
}

button .icon {
    color: white !important;
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