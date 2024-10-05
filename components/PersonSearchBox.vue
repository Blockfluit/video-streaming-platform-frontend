<script setup>
import { useUploadStore } from '~/stores/uploadStore';
import { useMainStore } from '~/stores/mainStore';
import { storeToRefs } from 'pinia';

const props = defineProps({
    store: {
        default: {},
        type: Object
    }
})

const mainStore = useMainStore()
const uploadStore = useUploadStore()

const { directors, writers, creators, stars, cast } = storeToRefs(props.store)

const totalPersons = ref(0)
const totalPages = ref(0)
let pageNumber = 0
const persons = ref([])

const table = ref({})
const search = ref("")

onBeforeMount(() => {
    searchPersons("")
})

function searchPersons() {
    pageNumber = 0
    persons.value.splice(0, persons.value.length)
    fetchPage()
}

function fetchPage() {
    if (pageNumber > totalPages.value) return

    mainStore.getPerson(pageNumber, 100, { search: search.value })
        .then(res => {
            persons.value.push(...res.content)
            totalPersons.value = res.page.totalElements
            totalPages.value = res.page.totalPages
        })

    pageNumber++
}

function scrollHandler(e) {
    const d = e.target.getBoundingClientRect().bottom * 2 - table.value.getBoundingClientRect().bottom

    if (d > 0) {
        fetchPage()
    }
}
</script>

<template>
    <div class="title">
        <div style="display: flex; align-items: center; justify-content: space-between;">
            <div style="display: flex; align-items: center;">
                <label style="margin-right: 10px;">Persons:</label>
                <AddPerson />
            </div>
            <div style="display: flex; justify-content: end;">
                <span style="margin-right: 24px">Selected: {{ directors.length + writers.length + creators.length +
                    stars.length + cast.length
                    }}</span>
                <span>Total: {{ totalPersons }}</span>
            </div>
        </div>
    </div>
    <input class="input-field" v-model="search" placeholder="Search person" type="search" @keyup="searchPersons()">
    <div class="person-list" @scroll="scrollHandler">
        <table ref="table">
            <tr class="head-table">
                <th><span style="margin-left: 12px">ID</span></th>
                <th><span>Name</span></th>
                <th><span style="writing-mode:vertical-rl;">Director</span></th>
                <th><span style="writing-mode:vertical-rl;">Writer</span></th>
                <th><span style="writing-mode:vertical-rl;">Creator</span></th>
                <th><span style="writing-mode:vertical-rl;">Star</span></th>
                <th><span style="writing-mode:vertical-rl;">Cast</span></th>
                <th>
                    <Icon name="material-symbols:delete" size="25px" />
                </th>
            </tr>
            <template v-for="person in persons">
                <tr>
                    <td><span style="margin-left: 6px">{{ person.id }}</span></td>
                    <td><label class="person-checkbox">{{
                        `${person.firstname} ${person.lastname}` }}</label></td>
                    <td><input class="person-checkbox" type="checkbox" v-model="directors" :value="person.id"></td>
                    <td><input class="person-checkbox" type="checkbox" v-model="writers" :value="person.id"></td>
                    <td><input class="person-checkbox" type="checkbox" v-model="creators" :value="person.id"></td>
                    <td><input class="person-checkbox" type="checkbox" v-model="stars" :value="person.id"></td>
                    <td><input class="person-checkbox" type="checkbox" v-model="cast" :value="person.id"></td>
                    <td>
                        <Icon class="icon" @click="uploadStore.deletePerson(person.id)" name="material-symbols:delete">
                        </Icon>
                    </td>
                </tr>
            </template>
        </table>
    </div>
</template>

<style scoped>
.person-list {
    height: 200px;
    overflow-y: scroll;
    border: 1px solid white;
    border-radius: 4px;
    margin-bottom: 15px;
}

.input-field {
    border: 1px solid white;
    border-radius: 5px;
    padding-left: 6px;
    display: flex;
    justify-content: flex-start;
    margin-bottom: 15px;
    width: 100%;
}

table {
    position: relative;
    border-collapse: collapse;
    width: 100%;
}

th {
    position: sticky;
    top: 0;
    background-color: var(--background-color-100);
    padding: 10px 0px;
    text-align: left;
}

tr:nth-child(even) {
    background-color: var(--background-color-200);
}

.head-table {
    border-bottom: 1px solid white;
}

.person {
    display: flex;
    align-items: center;
    padding: 5px;
    align-items: center;
    justify-content: space-between;
}

.person-checkbox {
    -webkit-user-select: none;
    /* Safari */
    -ms-user-select: none;
    /* IE 10 and IE 11 */
    user-select: none;
    /* Standard syntax */
}
</style>