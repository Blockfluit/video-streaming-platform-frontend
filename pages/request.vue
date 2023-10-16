<script setup>
import { useJwtStore } from '~/stores/jwtStore';

definePageMeta({
    layout: "main",
});

const config = useRuntimeConfig()
const jwtStore = useJwtStore()

const name = ref("")
const year = ref(new Date(Date.now()).getFullYear())
const comment = ref()

const allRequests = ref([])

onBeforeMount(() => {
    getRequests()
})

const addRequest = () => {
    fetch(config.public.baseURL + "/request", {
        method: "POST",
        headers: {
            Accept: 'application/json',
            "Content-Type": 'application/json',
            Authorization: `Bearer ${jwtStore.getJwt}`
        },
        body: JSON.stringify({
            name: name.value,
            year: year.value,
            comment: comment.value
        })
    }).then((response) => {
        if (response.status >= 200 && response.status < 300) {
            getRequests()
            alert("Request Successful")
        }
    }).catch(e => {
        console.log(e)
        alert(e)
    })
}

const getRequests = () => {
    fetch(config.public.baseURL + "/request", {
        method: "GET",
        headers: {
            Accept: 'application/json',
            "Content-Type": 'application/json',
            Authorization: `Bearer ${jwtStore.getJwt}`
        }
    }).then((response) => {
        if (response.status >= 200 && response.status < 300) {
            return response.json()
        }
    }).then((data) => {
        allRequests.value = data
    }).catch(e => {
        console.log(e)
        alert(e)
    })
}

const deleteRequest = (id) => {
    if (!confirm("Are you sure you want to delete this request?")) return

    fetch(config.public.baseURL + "/request/" + id, {
        method: "DELETE",
        headers: {
            Accept: 'application/json',
            "Content-Type": 'application/json',
            Authorization: `Bearer ${jwtStore.getJwt}`
        }
    }).then((response) => {
        if (response.status >= 200 && response.status < 300) {
            getRequests()
        }
    }).catch(e => {
        console.log(e)
        alert(e)
    })
}
</script>

<template>
    <div class="container">
        <form @submit.prevent="addRequest">
            <div class="container-add-request">
                <span style="font-size: 2rem; font-weight: 600;">Request movie/series</span>
                <input v-model="name" placeholder="Name" type="text" required>
                <input v-model="year" placeholder="Release year" type="number" required>
                <input v-model="comment" placeholder="Comment" type="text">
                <button type="submit">Add Request</button>
            </div>
        </form>
        <table>
            <thead>
                <tr>
                    <td>Name</td>
                    <td>Year</td>
                    <td>Comment</td>
                    <td>Requested on</td>
                    <td>Requester</td>
                    <td>Status</td>
                    <td v-if="jwtStore.isAdmin"></td>
                </tr>
            </thead>
            <tbody>
                <tr style="height:30px;" v-for="request  in  allRequests">
                    <td>{{ request.name }}</td>
                    <td>{{ request.year }}</td>
                    <td>{{ request.comment }}</td>
                    <td>{{ new Date(request.createdAt).toLocaleDateString() }}</td>
                    <td>{{ request.createdBy }}</td>
                    <td>{{ request.status }}</td>
                    <td v-if="jwtStore.isAdmin" @click="deleteRequest(request.id)">
                        <Icon class="icon" name="material-symbols:delete"></Icon>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<style scoped>
.container {
    margin: 50px;
    display: flex;
    flex-direction: row;
}
.icon {
    display: flex;
    align-items: center;
}
.icon:hover {
    color: var(--primary-color-100);
    cursor: pointer;
}
.container-add-request {
    display: flex;
    flex-direction: column;
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
table {
  width: 100%;
  height: fit-content;
  border-radius: 5px;
  background-color: #282828;
  border-collapse: collapse;
  border-width: 0px;
  border-color: #FFFFFF;
  border-style: solid;
  color: #FFFFFF;
  overflow-y: scroll;
}

table td, table th {
  border-width: 0px;
  border-color: #FFFFFF;
  border-style: solid;
  padding-left: 15px;
}
tbody tr:nth-child(even ){
  background: var(--background-color-100);
}

table thead {
  background-color: #121212;
}
</style>