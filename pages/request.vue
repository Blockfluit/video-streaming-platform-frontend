<script setup>
import { useJwtStore } from '~/stores/jwtStore';
import { useMainStore } from '~/stores/mainStore';

definePageMeta({
    layout: "main",
});

const config = useRuntimeConfig()
const jwtStore = useJwtStore()
const mainStore = useMainStore()

const inputName = ref("")
const inputYear = ref(new Date().getFullYear())
const inputComment = ref("")

const allRequests = ref([])

onBeforeMount(() => {
    getRequests()
})

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

const addRequest = (name, year, comment) => {
    if (mainStore.allMedia.findIndex(media => media.name.toLowerCase() === inputName.value.toLowerCase()) !== -1) {
        if (!confirm("Movie/Series already available. Are you sure you want to request it again?")) return
    }

    if (allRequests.value.findIndex(request => request.name.toLowerCase() === inputName.value.toLowerCase()) !== -1) {
        if (!confirm("Already requested. Are you sure you want to request it again?")) return
    }

    fetch(config.public.baseURL + "/request", {
        method: "POST",
        headers: {
            Accept: 'application/json',
            "Content-Type": 'application/json',
            Authorization: `Bearer ${jwtStore.getJwt}`
        },
        body: JSON.stringify({
            name: name,
            year: year,
            comment: comment
        })
    }).then((response) => {
        if (response.status >= 200 && response.status < 300) {
            getRequests()
            inputName.value = ""
            inputYear.value = new Date().getFullYear()
            inputComment.value = ""
            alert("Request Successful")
        }
    }).catch(e => {
        console.log(e)
        alert(e)
    })
}

const updateRequest = (id, name, year, comment, status) => {
    if (status === "ADDED" &&
        !confirm(`Changing status to '${status}' will hide the request. Are you sure you want to do this?`)) return

    fetch(config.public.baseURL + "/request/" + id, {
        method: "PATCH",
        headers: {
            Accept: 'application/json',
            "Content-Type": 'application/json',
            Authorization: `Bearer ${jwtStore.getJwt}`
        },
        body: JSON.stringify({
            name: name,
            year: year,
            comment: comment,
            status: status,
        })
    }).then((response) => {
        if (response.status >= 200 && response.status < 300) {
            getRequests()
        }
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
        <form @submit.prevent="addRequest(inputName, inputYear, inputComment)">
            <div class="container-add-request">
                <span style="font-size: 2rem; font-weight: 600;">Request movie/series</span>
                <input v-model="inputName" placeholder="Name" type="text" required>
                <input v-model="inputYear" placeholder="Release year" type="number" required>
                <input v-model="inputComment" placeholder="Comment" type="text">
                <button type="submit">Add Request</button>
            </div>
        </form>
        <div
            v-if="!(allRequests.filter(request => request.name.toLowerCase().includes(inputName.toLowerCase())).length === 0 &&
                mainStore.allMedia.filter(media => media.name.toLowerCase().includes(inputName.toLowerCase())).length === 0)">
            <h2>Requests</h2>
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
                    <tr style="height:30px;" v-for="request in allRequests.filter(request => request.name.toLowerCase().includes(inputName.toLowerCase()) && request.status !== 'ADDED')
                        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))">
                        <td>{{ request.name }}</td>
                        <td>{{ request.year }}</td>
                        <td>{{ request.comment }}</td>
                        <td>{{ new Date(request.createdAt).toLocaleDateString() }}</td>
                        <td style="text-transform: capitalize;">{{ request.createdBy }}</td>
                        <td v-if="!jwtStore.isAdmin">{{ request.status }}</td>
                        <td v-if="jwtStore.isAdmin">
                            <select
                                @change="e => updateRequest(request.id, undefined, undefined, undefined, e.target.value)">
                                <option :selected="request.status === 'NEW'" value="NEW">New</option>
                                <option :selected="request.status === 'PROCESSING'" value="PROCESSING">Processing
                                </option>
                                <option :selected="request.status === 'NOT_AVAILABLE'" value="NOT_AVAILABLE">Not available
                                </option>
                                <option :selected="request.status === 'ADDED'" value="ADDED">Added</option>
                            </select>
                        </td>
                        <td v-if="jwtStore.isAdmin" @click="deleteRequest(request.id)">
                            <Icon class="icon" name="material-symbols:delete"></Icon>
                        </td>
                    </tr>
                </tbody>
            </table>
            <h2>Already available</h2>
            <table>
                <thead>
                    <tr>
                        <td>Name</td>
                        <td>Year</td>
                        <td>Added on</td>
                        <td>Type</td>
                    </tr>
                </thead>
                <tbody>
                    <tr style="height:30px;" v-for=" media  in  mainStore.allMedia.filter(media => media.name.toLowerCase().includes(inputName.toLowerCase()))
                        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))">
                        <td>{{ media.name }}</td>
                        <td>{{ media.year }}</td>
                        <td>{{ new Date(media.createdAt).toLocaleDateString() }}</td>
                        <td>{{ media.type }}</td>
                    </tr>
                </tbody>
            </table>
        </div>
        <div v-else>
            <h2>Your the first to request this!</h2>
        </div>
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

table td,
table th {
    border-width: 0px;
    border-color: #FFFFFF;
    border-style: solid;
    padding-left: 15px;
}

tbody tr:nth-child(even) {
    background: var(--background-color-100);
}

table thead {
    background-color: #121212;
}
</style>