<script setup>
import { useJwtStore } from "~/stores/jwtStore"
import { useMainStore } from "~/stores/mainStore";
import { storeToRefs } from "pinia";

const jwtStore = useJwtStore()
const mainStore = useMainStore()
const { currentRoute } = useRouter();

const { searchbox } = storeToRefs(mainStore)
const showSearch = ref(["/", "/movies", "/series"].includes(currentRoute.value.path))
const showSearchField = ref(false)

const inputValue = ref()
const showDropdown = ref(false)

const logout = () => {
    jwtStore.jwt = null
    navigateTo("/login")
}

watch(inputValue, (o, n) => {
    searchbox.value = inputValue.value
})
</script>

<template>
    <nav>
        <div v-if="showDropdown" class="container-dropdown icon">
            <NuxtLink to="/">HOME</NuxtLink>
            <NuxtLink to="/movies">MOVIES</NuxtLink>
            <NuxtLink to="/series">SERIES</NuxtLink>
            <NuxtLink to="/request">REQUEST</NuxtLink>
            <!-- <NuxtLink to="/contact">CONTACT</NuxtLink> -->
            <NuxtLink v-if="jwtStore.isAdmin" to="/upload">UPLOAD</NuxtLink>
            <NuxtLink v-if="jwtStore.isAdmin" to="/admin">ADMIN</NuxtLink>
            <span @click="logout">LOGOUT</span>
        </div>
        <div class="mobile-menu">
            <NuxtLink to="/">
                <Icon name="fa-solid:pizza-slice" class="icon" />
            </NuxtLink>
            <Icon class="hamburger-menu" @click="showDropdown = !showDropdown" name="fa-solid:align-justify" size="30" />
        </div>
        <div class="desktop-nav">
            <div class="menu-left">
                <NuxtLink to="/">
                    <Icon name="fa-solid:pizza-slice" class="icon" />
                </NuxtLink>
                <NuxtLink to="/movies">MOVIES</NuxtLink>
                <NuxtLink to="/series">SERIES</NuxtLink>
                <input v-if="showSearch && showSearchField" v-model="inputValue" type="text">
                <Icon v-if="showSearch" @click="showSearchField = !showSearchField" name="fa-solid:search" size="20" />
            </div>
            <div class="menu-right">
                <NuxtLink to="/request">REQUEST</NuxtLink>
                <NuxtLink v-if="jwtStore.isAdmin" to="/upload">UPLOAD</NuxtLink>
                <NuxtLink v-if="jwtStore.isAdmin" to="/admin">ADMIN</NuxtLink>
                <span @click="logout">LOGOUT</span>
            </div>
        </div>
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
    background-color: var(--background-color-100);
    box-shadow: var(--box-shadow-2);
}

.desktop-nav {
    display: flex;
    flex-direction: row;
    align-items: center;
}

.mobile-menu {
    display: flex;
    align-items: center;
    width: 100%;
    justify-content: space-between;
}

nav a {
    text-decoration: none;
    padding: 0 30px;
    white-space: nowrap;
    font-size: var(--font-size-3);
    font-weight: 600;
}

.hamburger-menu {
    padding: 5px;
    margin-right: 25px;
}

a:hover {
    color: var(--primary-color-100)
}

span {
    text-decoration: none;
    padding: 0 30px;
    white-space: nowrap;
    font-size: var(--font-size-3);
    font-weight: 600;
}

span:hover {
    color: var(--primary-color-100);
    cursor: pointer;
}

.icon {
    min-width: 50px;
}

.icon:hover {
    cursor: pointer;
    color: var(--primary-color-100)
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
    background-color: var(--background-color-100);
}

.container-dropdown a,
.container-dropdown span {
    margin: 5px;
}

.mobile-menu {
    display: none;
}

.desktop-nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
}

.menu-left,
.menu-right {
    display: flex;
    align-items: center;
}

@media screen and (max-width: 992px) {
    .mobile-menu {
        display: flex;
    }

    nav {
        justify-content: end;
    }

    .desktop-nav {
        display: none;
    }
}</style>