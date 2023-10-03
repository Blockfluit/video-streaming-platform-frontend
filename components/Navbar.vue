<script setup>
import { useJwtStore } from "~/stores/jwtStore"
import { useMainStore } from "~/stores/mainStore";
import { storeToRefs } from "pinia";

const jwtStore = useJwtStore()
const mainStore = useMainStore()

const { searchbox } = storeToRefs(mainStore)
const showSearchBox = ref(false)

const inputValue = ref()
const showDropdown = ref(false)

watch(inputValue, (o, n) => {
    searchbox.value = inputValue.value
})
</script>

<template>
    <nav>
        <div v-if="showDropdown" class="container-dropdown">
            <NuxtLink to="/">HOME</NuxtLink>
            <NuxtLink to="/movies">MOVIES</NuxtLink>
            <NuxtLink to="/series">SERIES</NuxtLink>
            <NuxtLink to="/request">REQUEST</NuxtLink>
            <NuxtLink to="/contact">CONTACT</NuxtLink>
            <NuxtLink to="/account">ACCOUNT</NuxtLink>
            <NuxtLink v-if="jwtStore.isAdmin" to="/upload">UPLOAD</NuxtLink>
            <NuxtLink v-if="jwtStore.isAdmin" to="/admin">ADMIN</NuxtLink>
        </div>
        <Icon @click="showDropdown = !showDropdown" name="fa-solid:align-justify" size="30" />
        <NuxtLink to="/movies">MOVIES</NuxtLink>
        <NuxtLink to="/series">SERIES</NuxtLink>
        <NuxtLink style="flex-grow: 1;" to="/">{Logo}</NuxtLink>
        <input v-if="showSearchBox" v-model="inputValue" type="text">
        <Icon @click="showSearchBox = !showSearchBox" name="fa-solid:search" size="20" />
        <NuxtLink v-if="jwtStore.isAdmin" to="/upload">UPLOAD</NuxtLink>
        <NuxtLink v-if="jwtStore.isAdmin" to="/admin">ADMIN</NuxtLink>
        <NuxtLink to="/">{{ jwtStore.getSubject.toUpperCase() }}</NuxtLink>
    </nav>
    <div class="placeholder"></div>
</template>

<style scoped>
nav {
    z-index: 99999999;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: var(--navbar-height);
    display: flex;
    flex-direction: row;
    align-items: center;
    background-color: var(--background-color-1);
    box-shadow: var(--box-shadow-2);
}

nav a,
svg {
    text-decoration: none;
    padding: 0 30px;
    white-space: nowrap;
    font-size: var(--font-size-3);
    font-weight: 600;
}

.placeholder {
    position: relative;
    width: 100%;
    height: var(--navbar-height);
}

.container-dropdown {
    display: flex;
    flex-direction: column;
    top: var(--navbar-height);
    position: fixed;
    background-color: var(--background-color-1);
}
</style>