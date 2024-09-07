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

const { allPersons } = storeToRefs(mainStore)
const { directors, writers, creators, stars, cast } = props.store

const filteredPersons = ref([...allPersons.value])
const search = ref()

onBeforeMount(() => {
    filterPerson("")
})

async function filterPerson(search) {
    filteredPersons.value = allPersons.value.filter(person => `${person.firstname} ${person.lastname}`.toLowerCase().includes(search.toLowerCase()))
        .sort((a, b) => `${a.firstname}${a.lastname}`.localeCompare(`${b.firstname}${b.lastname}`))
        .sort((a, b) => {
            const cond1 = allPersons.value.findIndex(c => c.firstname === a.firstname && c.lastname === a.lastname) !== -1
            const cond2 = allPersons.value.findIndex(c => c.firstname === b.firstname && c.lastname === b.lastname) !== -1
            if (cond1 && !cond2) return -1
            if (!cond1 && cond2) return 1
            if (!cond1 === cond2) return 0
        })
}
</script>


<template>
    <label>Search persons:</label>
    <input class="input-field" v-model="search" placeholder="Search person" type="search"
        @keyup="filterPerson(search)">
    <div class="title">
        <div style="display: flex; align-items: center;">
            <label style="margin-right: 10px;">Actors:</label>
            <AddPerson />
        </div>
        <span>Selected: {{ directors.length + writers.length + creators.length + stars.length + cast.length }}</span>
    </div>
    <div class="person-list">
        <table>
            <tr>
                <th>id</th>
                <th>name</th>
                <th style="writing-mode:vertical-rl">director</th>
                <th style="writing-mode:vertical-rl">writer</th>
                <th style="writing-mode:vertical-rl">creator</th>
                <th style="writing-mode:vertical-rl">star</th>
                <th style="writing-mode:vertical-rl">cast</th>
                <th></th>
            </tr>
            <template v-for="person in filteredPersons">
                <tr>
                    <td><span>{{ person.id }}</span></td>
                    <td><label class=" person-checkbox" style="margin-left: 10px;">{{
                            `${person.firstname} ${person.lastname}` }}</label></td>
                    <td><input class="person-checkbox" type="checkbox" v-model="directors" :value="person.id"></td>
                    <td><input class="person-checkbox" type="checkbox" v-model="writers" :value="person.id"></td>
                    <td><input class="person-checkbox" type="checkbox" v-model="creators" :value="person.id"></td>
                    <td><input class="person-checkbox" type="checkbox" v-model="stars" :value="person.id"></td>
                    <td><input class="person-checkbox" type="checkbox" v-model="cast" :value="person.id"></td>
                    <td><Icon class="icon" @click="uploadStore.deletePerson(person.id)" name="material-symbols:delete"></Icon></td>
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
    border-radius: 25px;
    padding-left: 15px;
    display: flex;
    justify-content: flex-start;
    margin-bottom: 15px;
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