<script setup>
import { storeToRefs } from 'pinia';
import { getAccesToken } from '#imports';
import { useMainStore } from '~/stores/mainStore';
import { useUploadStore } from '~/stores/uploadStore';

const config = useRuntimeConfig()
const mainStore = useMainStore()
const uploadStore = useUploadStore()

const { allActors } = storeToRefs(mainStore)
const { actors } = storeToRefs(uploadStore)

const showAddActor = ref(false)
const firstNameRef = ref()

const inputFirstname = ref("")
const inputLastname = ref("")

async function addActor(firstname, lastname) {
    const predicate = (actor) => {
        const first = actor.firstname === null ? "" : actor.firstname
        const last = actor.lastname === null ? "" : actor.lastname
        return (first.toLowerCase() === firstname.toLowerCase() &&
            last.toLowerCase() === lastname.toLowerCase())
    }

    const actor = allActors.value.find(predicate)

    if (actor !== undefined) {
        actors.value.push({ firstname: actor.firstname, lastname: actor.lastname })
        inputLastname.value = "";
        inputFirstname.value = "";
        return
    }

    return fetch(config.public.baseURL + "/actors", {
        method: "POST",
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: `Bearer ${await getAccesToken()}`
        },
        body: JSON.stringify({
            firstname: firstname,
            lastname: lastname,
        })
    }).then((response) => {
        if (response.status >= 200 && response.status < 300) {
            mainStore.setAllActors()
            actors.value.push({ firstname: firstname, lastname: lastname })
            inputFirstname.value = ""
            inputLastname.value = ""
            firstNameRef.value.focus()
        }
    }).catch(e => {
        console.log(e)
    })
}

</script>

<template>
    <div class="container">
        <Icon @click="showAddActor = !showAddActor"
              name="fa-solid:plus"
              size="25"
              class="icon" />
        <form v-if="showAddActor"
              @submit.prevent="addActor(inputFirstname, inputLastname)">
            <input v-model="inputFirstname"
                   ref="firstNameRef"
                   type="text"
                   placeholder="firstname"
                   required>
            <input v-model="inputLastname"
                   type="text"
                   placeholder="lastname">
            <button type="submit">Add Actor</button>
        </form>
    </div>
</template>

<style scoped>
.container {
    display: flex;
    align-items: center;
}

.container:hover {
    cursor: pointer;
}

form {
    width: 150px;
}

.icon {
    height: 15px;
    margin-right: 6px;
}

.icon:hover {
    color: var(--primary-color-100);
}

.turn {
    rotate: 45deg;
}

input {
    border: 1px solid white;
    border-radius: 25px;
    padding-left: 15px;
    width: 100%;
}

button {
    width: 100%;
    background-color: transparent;
    border: 1px solid white;
    color: white;
    font-family: var(--font-family-1);
    border-radius: 15px;
    margin-bottom: 15px;
}

button:hover {
    cursor: pointer;
    color: var(--primary-color-100);
    border: 1px solid var(--primary-color-100);
}
</style>