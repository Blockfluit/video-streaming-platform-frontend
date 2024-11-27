<script setup>
import { useMainStore } from '~/stores/mainStore';
import { useRequestStore } from '~/stores/requestStore';
import { getSubject, isAdmin, getRole } from '#imports';

useHead({ title: "Request" })

const mainStore = useMainStore()
const requestStore = useRequestStore()

const toggleEdit = ref()
const inputName = ref("")
const inputYear = ref(new Date().getFullYear())
const inputComment = ref("")
const updateName = ref()
const updateYear = ref()
const updateComment = ref()
const showAddRequestModal = ref(false)

const allMedia = ref([])
const allRequests = ref([])
const admin = ref(isAdmin())
const role = ref(getRole())
const subject = ref(getSubject())

const totalElementsMedia = ref(0)
const totalElementsRequest = ref(0)
let fetchingMedia = false
let fetchingRequest = false
let totalPagesMedia = 0
let totalPagesRequest = 0
let nextPageMedia = 0
let nextPageRequest = 0

onBeforeMount(() => {
    if (process.client) {
        fetchNextRequestPage()
        fetchNextMediaPage()
    }
})

watch(inputName, (n, o) => {
    nextPageMedia = 0
    nextPageRequest = 0

    fetchNextRequestPage(true)
    fetchNextMediaPage(true)
})

const showRequestButtons = (request) => {
    return (request.createdBy === subject.value && request.status === "NEW") ||
        role.value == "ADMIN"
}

function fetchNextRequestPage(clearArray) {
    if (fetchingRequest === true) return
    fetchingRequest = true

    requestStore.getRequests(nextPageRequest, 40, { search: inputName.value }).then(data => {
        if (clearArray) allRequests.value.splice(0, allRequests.value.length)
        allRequests.value.push(...data.content)
        totalElementsRequest.value = data.totalElements
        totalPagesRequest = data.totalPages
        nextPageRequest++
        fetchingRequest = false
    })
}

function fetchNextMediaPage(clearArray) {
    if (fetchingMedia === true) return
    fetchingMedia = true

    mainStore.getMedia("", nextPageMedia, 40, { search: inputName.value }).then(data => {
        if (clearArray) allMedia.value.splice(0, allMedia.value.length)
        allMedia.value.push(...data.content)
        totalElementsMedia.value = data.totalElements
        totalPagesMedia = data.totalPages
        nextPageMedia++
        fetchingMedia = false
    })
}

async function addRequest(name, year, comment) {
    const p1 = mainStore.getMedia("", 0, 1, { search: name })
    const p2 = requestStore.getRequests(0, 1, { search: name })

    Promise.all([p1, p2])
        .then(data => {
            if (data[0].content.findIndex(media => media.name.toLowerCase() === name.toLowerCase()) !== -1) {
                if (!confirm("Movie/Series already available. Are you sure you want to request it again?")) return
            }

            if (data[1].content.findIndex(media => media.name.toLowerCase() === name.toLowerCase()) !== -1) {
                if (!confirm("Already requested. Are you sure you want to request it again?")) return
            }

            requestStore.addRequest(name, year, comment).then(() => {
                inputName.value = ""
                inputYear.value = new Date().getFullYear()
                inputComment.value = ""
                nextPageRequest = 0
                fetchNextRequestPage(true)
            })
        })
}

async function deleteRequest(id) {
    requestStore.deleteRequest(id)
        .then(() => {
            nextPageRequest = 0
            fetchNextRequestPage(true)
        })
}

function parseStatus(status) {
    switch (status) {
        case "NEW":
            return "New"
        case "ADDED":
            return "Added"
        case "PROCESSING":
            return "Processing"
        case "NOT_AVAILABLE":
            return "Not available"
    }
}

function getStatusColor(status) {
    switch (status) {
        case "NEW":
            return "yellow"
        case "ADDED":
            return "green"
        case "PROCESSING":
            return "orange"
        case "NOT_AVAILABLE":
            return "red"
    }
}
</script>

<template>
    <div class="container">
        <div v-if="showAddRequestModal" class="add-request-modal">
            <div class="modal-card">
                <form style="width: 100%; margin-bottom: 32px;"
                    @submit.prevent="addRequest(inputName, inputYear, inputComment)">
                    <Icon @click="showAddRequestModal = false" class="exit-modal-btn" name="radix-icons:cross-2"
                        size="16px" />
                    <div class="container-add-request">
                        <span style="font-size: 2rem; font-weight: 600; line-height: 1; margin-bottom: 16px;">Request
                            movie or series</span>
                        <input v-model="inputName" placeholder="Name" type="text" required>
                        <input v-model="inputYear" placeholder="Release year" type="number" required>
                        <input v-model="inputComment" placeholder="Comment" type="text">
                        <button type="submit">Add Request</button>
                    </div>
                </form>
                <div v-show="inputName !== '' && allRequests.length !== 0">
                    <h2 style="margin: 16px 0 4px 0;">Already available</h2>
                    <div class="table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    <td>Name</td>
                                    <td>Year</td>
                                    <td>Added on</td>
                                </tr>
                            </thead>
                            <tbody style="height: 100px; overflow-y: scroll;">
                                <tr style="height:30px;" v-for="media in allMedia">
                                    <td>{{ media.name }}</td>
                                    <td>{{ media.year }}</td>
                                    <td>{{ new Date(media.createdAt).toLocaleDateString() }}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                <div v-show="allRequests.length === 0">
                    <h2>Your the first to request this!</h2>
                </div>
            </div>
        </div>
        <div class="toolbar">
            <h1
                style="display: flex; align-items: end; gap: 8px; margin: 0; margin-right: 16px; line-height: 1; position: sticky; top: 0; background-color: var(--background-color-100); z-index:9;">
                Requests</h1>
            <div style="display: flex; gap: 8px">
                <button @click="showAddRequestModal = true" class="add-request-btn">
                    <div class="tooltip-popup">Add request</div>
                    <Icon name="material-symbols:add-2-rounded" />
                </button>
            </div>
        </div>
        <div v-show="!(totalElementsRequest === 0 &&
            allMedia.length === 0)">
            <div v-show="inputName == ''" class="table-wrapper">
                <table>
                    <thead>
                        <tr>
                            <td>Name</td>
                            <td class="year">Year</td>
                            <td class="comment">Comment</td>
                            <td>Requested on</td>
                            <td class="requester">Requester</td>
                            <td>Status</td>
                            <td></td>
                        </tr>
                    </thead>
                    <tbody>
                        <tr style="height:30px;" v-for="(request, index) in allRequests">
                            <template v-if="toggleEdit !== index">
                                <td>{{ request.name }}</td>
                                <td class="year">{{ request.year }}</td>
                                <td class="comment">{{ request.comment }}</td>
                            </template>
                            <template v-else>
                                <td><input style="max-width: 100px;" type="text" v-model="updateName"></td>
                                <td><input style="max-width: 100px;" type="number" v-model="updateYear"></td>
                                <td><input style="max-width: 100px;" type="text" v-model="updateComment"></td>
                            </template>
                            <td>{{ new Date(request.createdAt).toLocaleDateString() }}</td>
                            <td class="requester" style="text-transform: capitalize;">{{ request.createdBy }}</td>
                            <td v-if="!admin" :style="`color: ${getStatusColor(request.status)}`">{{
                                parseStatus(request.status) }}</td>
                            <td v-else>
                                <select
                                    @change="e => requestStore.updateRequest(request.id, { status: e.target.value })"
                                    :style="`color: ${getStatusColor(request.status)}`">
                                    <option :selected="request.status === 'NEW'" value="NEW">New</option>
                                    <option :selected="request.status === 'PROCESSING'" value="PROCESSING">Processing
                                    </option>
                                    <option :selected="request.status === 'NOT_AVAILABLE'" value="NOT_AVAILABLE">Not
                                        available
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
                                    @click="toggleEdit = -1; requestStore.updateRequest(request.id, { name: updateName, year: updateYear, comment: updateComment })">
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
    display: flex;
    flex-direction: column;
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
    background-color: transparent;
    border: 1px solid var(--background-color-300);
    border-radius: 10px;
    font-family: var(--font-family-1);
    color: white;
    transition: all .5s ease;
}

button:hover {
    background-color: var(--primary-color-100);
    cursor: pointer;
}

input {
    border: none;
    border-bottom: 1px solid white;
    margin-bottom: 10px;
    padding-left: 6px;
}

form {
    min-width: 250px;
    margin-right: 50px;
}

.table-wrapper {
    outline: 2px solid var(--background-color-200);
    border-radius: 6px;
}

.modal-card .table-wrapper {
    outline: 2px solid var(--background-color-200);
    border-radius: 6px;
    max-height: 30vh;
    overflow: hidden scroll;
}

.toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
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

.add-request-btn {
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    border-radius: 999px;
    height: 40px;
    width: 40px;
}

.add-request-btn .icon {
    min-width: max-content;
}

.add-request-btn:hover .tooltip-popup {
    opacity: 1;
}

.add-request-modal {
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
    margin-right: 10px;
    margin-left: 10px;
}

.exit-modal-btn {
    position: absolute;
    top: 10px;
    right: 10px;
    cursor: pointer;
    min-width: 16px;
}

.exit-modal-btn:hover {
    color: var(--primary-color-100)
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

select {
    background-color: transparent;
    /* color: var(--primary-color-100); */
    /* border: 1px solid var(--primary-color-100); */
    border: 1px solid;
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

@media screen and (max-width: 993px) {
    .container {
        flex-direction: column;
        margin: 50px 10px;
    }

    form {
        margin: 0;
        margin-bottom: 50px;
    }

    table {
        font-size: 12px;
    }

    select {
        width: 75px;
    }

    .year,
    .comment,
    .requester {
        display: none;
    }
}
</style>