<script setup>
import { useJwtStore } from '~/stores/jwtStore';
import { useMainStore } from '~/stores/mainStore';

definePageMeta({
    layout: "main",
});

const config = useRuntimeConfig()
const jwtStore = useJwtStore()
const mainStore = useMainStore()

const toggleEdit = ref()
const inputName = ref("")
const inputYear = ref(new Date().getFullYear())
const inputComment = ref("")
const updateName = ref()
const updateYear = ref()
const updateComment = ref()

const filterAllMediaCountBarElement = ref()
const filterRequestsCountBarElement = ref()

const allRequests = ref([])
const filteredRequests = ref([])
const filteredAllMedia = ref([])

onBeforeMount(() => {
    getRequests()
})

const requestFilter = () => allRequests.value.filter(request => request.name.toLowerCase().includes(inputName.value.toLowerCase()))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .sort((a, b) => {
        if(a.status === "ADDED") return 1
        if(a.status === b.status) return 0
        if(a.status !== "ADDED") return -1
    })

const allMediaFilter = () => mainStore.allMedia.filter(media => media.name.toLowerCase().includes(inputName.value.toLowerCase()))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

watch(allRequests, (o, n) => {
    filteredRequests.value = requestFilter()
    filteredAllMedia.value = allMediaFilter()
})

watch(inputName, (o, n) => {
    filteredRequests.value = requestFilter()
    filteredAllMedia.value = allMediaFilter()

    filterAllMediaCountBarElement.value.style.width = filteredAllMedia.value.length / mainStore.allMedia.length * 100 + "%"
    filterRequestsCountBarElement.value.style.width = filteredRequests.value.length / allRequests.value.length * 100 + "%"
})

const showRequestButtons = (request) => {
    return (request.createdBy === jwtStore.getSubject && request.status === "NEW") ||
        jwtStore.getRole == "ADMIN"
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

const updateRequest = (id, options) => {
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
            name: options.name,
            year: options.year,
            comment: options.comment,
            status: options.status,
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
        <div v-show="!(filteredRequests.length === 0 &&
            filteredAllMedia.length === 0)">
            <h2>Requests <span style="font-weight: 200; margin-left: 5px;">{{ filteredRequests.length }}</span></h2>
            <div ref="filterRequestsCountBarElement" class="filter-count-bar"></div>
            <table>
                <thead>
                    <tr>
                        <td>Name</td>
                        <td>Year</td>
                        <td>Comment</td>
                        <td>Requested on</td>
                        <td>Requester</td>
                        <td>Status</td>
                        <td></td>
                    </tr>
                </thead>
                <tbody>
                    <tr style="height:30px;" v-for="(request, index) in filteredRequests">
                        <template v-if="toggleEdit !== index">
                            <td>{{ request.name }}</td>
                            <td>{{ request.year }}</td>
                            <td>{{ request.comment }}</td>
                        </template>
                        <template v-else>
                            <td><input style="max-width: 100px;" type="text" v-model="updateName"></td>
                            <td><input style="max-width: 100px;" type="number" v-model="updateYear"></td>
                            <td><input style="max-width: 100px;" type="text" v-model="updateComment"></td>
                        </template>
                        <td>{{ new Date(request.createdAt).toLocaleDateString() }}</td>
                        <td style="text-transform: capitalize;">{{ request.createdBy }}</td>
                        <td v-if="!jwtStore.isAdmin">{{ request.status }}</td>
                        <td v-else>
                            <select @change="e => updateRequest(request.id, { status: e.target.value })">
                                <option :selected="request.status === 'NEW'" value="NEW">New</option>
                                <option :selected="request.status === 'PROCESSING'" value="PROCESSING">Processing
                                </option>
                                <option :selected="request.status === 'NOT_AVAILABLE'" value="NOT_AVAILABLE">Not available
                                </option>
                                <option :selected="request.status === 'ADDED'" value="ADDED">Added</option>
                            </select>
                        </td>
                        <td v-if="showRequestButtons(request)">
                            <button v-if="toggleEdit !== index" @click="toggleEdit = index;
                            updateName = request.name;
                            updateYear = request.year;
                            updateComment = request.comment" class="admin-btn">
                                <Icon name="mdi:pencil" />
                            </button>
                            <button v-else class="admin-btn"
                                @click="toggleEdit = -1; updateRequest(request.id, { name: updateName, year: updateYear, comment: updateComment })">
                                <Icon name="ic:outline-check" />
                            </button>
                            <button class="admin-btn" @click="deleteRequest(request.id)">
                                <Icon name="material-symbols:delete" />
                            </button>
                        </td>
                        <td v-else></td>
                    </tr>
                </tbody>
            </table>
            <div v-show="inputName !== ''">
                <h2>Already available <span style="font-weight: 200; margin-left: 5px;">{{ filteredAllMedia.length }}</span></h2>
                <div ref="filterAllMediaCountBarElement" class="filter-count-bar"></div>
                <table>
                    <thead>
                        <tr>
                            <td>Name</td>
                            <td>Year</td>
                            <td>Added on</td>
                            <td>Type</td>
                        </tr>
                    </thead>
                    <tbody style="height: 100px; overflow-y: scroll;">
                        <tr style="height:30px;" v-for="media in filteredAllMedia">
                            <td>{{ media.name }}</td>
                            <td>{{ media.year }}</td>
                            <td>{{ new Date(media.createdAt).toLocaleDateString() }}</td>
                            <td>{{ media.type }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
        <div v-show="filteredRequests.length === 0 &&
            filteredAllMedia.length === 0">
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


.filter-count-bar {
    width: 100%;
    height: 5px;
    background-color: var(--primary-color-100);
    z-index: 10;
    position: relative;
}
.admin-btn {
    background-color: transparent;
    color: white;
    padding: 10px;
}
.admin-btn:hover {
    color: var(--primary-color-100);
    cursor: pointer;
    background-color: transparent;
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
</style>