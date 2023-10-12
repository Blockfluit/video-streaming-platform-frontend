<script setup>
import { useJwtStore } from '~/stores/jwtStore';
import { useMainStore } from '~/stores/mainStore';

const config = useRuntimeConfig()
const jwtStore = useJwtStore()
const mainStore = useMainStore()

const showAddActor = ref(false)

const firstname = ref()
const lastname = ref()

const addActor = () => {
    if (mainStore.actors.find(actor => actor.firstname.toLowerCase() === firstname.value.toLowerCase() &&
        actor.lastname.toLowerCase() === lastname.value.toLowerCase()) !== undefined) {
        alert("Actor already exists")
        return
    }

    fetch(config.public.baseURL + "/actors", {
        method: "POST",
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: `Bearer ${jwtStore.getJwt}`
        },
        body: JSON.stringify({
            firstname: firstname.value,
            lastname: lastname.value,
        })
    }).then((response) => {
        if (response.status >= 200 && response.status < 300) {
            mainStore.setActors()
            firstname.value = null
            lastname.value = null
        }
    }).catch(e => {
        console.log(e)
    })
}

</script>

<template>
    <div class="container">
        <Icon @click="showAddActor = !showAddActor" name="fa-solid:plus" size="25" class="icon" />
        <form v-if="showAddActor" @submit.prevent="addActor">
            <input v-model="firstname" type="text" placeholder="firstname" required>
            <input v-model="lastname" type="text" placeholder="lastname">
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