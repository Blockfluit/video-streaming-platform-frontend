<script setup>
import { useJwtStore } from '~/stores/jwtStore';

const config = useRuntimeConfig()
const jwtStore = useJwtStore()

const users = ref([])

const username = ref("")
const email = ref("")
const password = ref("")
const role = ref("USER")

onBeforeMount(() => {
    getAllUsers()
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
    console.log(role.value)
    const errors = []

    if (username.value === "") {
        errors.push("Username missing")
    }
    if (email.value === "") {
        errors.push("Email missing")
    }
    if (password.value === "") {
        errors.push("Password missing")
    }
    if (errors.length) {
        alert(errors)
        return
    }

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

    username.value = ""
    password.value = ""
    email.value = ""
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
</script>

<template>
    <NuxtLayout name="main">
        <div class="container">
            <div class="container-add-user">
                <h1>Add User</h1>
                <input v-model="username" placeholder="username" type="text">
                <input v-model="email" placeholder="email" type="text">
                <input v-model="password" placeholder="password" type="text">
                <select v-model="role">
                    <option value="USER">User</option>
                    <option value="CRITIC">Critic</option>
                    <option value="ADMIN">Admin</option>
                </select>
                <button @click="addUser">Add User</button>
            </div>
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
                        <td>{{ user.lastActiveAt }}</td>
                        <td @click="deleteUser(user.username)">
                            <Icon name="fa-solid:poo"></Icon>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </NuxtLayout>
</template>

<style scoped>
.container {
    display: flex;
    flex-direction: row;
}

.container-add-user {
    display: flex;
    flex-direction: column;
}

.container-users {
    border: 1px solid white;
}
</style>