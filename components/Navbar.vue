<script setup>
import { useJwtStore } from "~/stores/jwtStore"
import { useMainStore } from "~/stores/mainStore";
import { storeToRefs } from "pinia";

const jwtStore = useJwtStore()
const mainStore = useMainStore()
const { currentRoute } = useRouter();

const { searchbox, showSearchBox } = storeToRefs(mainStore)
const searchBar = ref()

const showDropdown = ref(false)
const filter = ref(['/movies', '/series', '/'])

const logout = () => {
    jwtStore.destroyToken()
    navigateTo("/login")
} 
</script>

<template>
    <nav>

        <transition name="fadedown">
            <div v-if="showDropdown" @click="showDropdown = false" class="container-dropdown">
                <NuxtLink @click="showDropdown = false" to="/" style="margin-top: 50px;">HOME</NuxtLink>
                <NuxtLink @click="showDropdown = false" to="/movies">MOVIES</NuxtLink>
                <NuxtLink @click="showDropdown = false" to="/series">SERIES</NuxtLink>
                <NuxtLink @click="showDropdown = false" to="/watchlist">WATCHLIST</NuxtLink>
                <NuxtLink @click="showDropdown = false" to="/request">REQUEST</NuxtLink>
                <NuxtLink to="/cinema">CINEMA</NuxtLink>
                <NuxtLink @click="showDropdown = false" v-if="jwtStore.isAdmin" to="/upload">UPLOAD</NuxtLink>
                <NuxtLink @click="showDropdown = false" v-if="jwtStore.isAdmin" to="/admin">ADMIN</NuxtLink>
                <span class="logout" @click="logout(); showDropdown = false">LOGOUT</span>
            </div>
        </transition>

        <div class="mobile-menu">
            <div style="display:flex; align-items: center;">
                <NuxtLink class="logo-mobile" to="/">
                    <img src="/icons/dellekes_logo.png" class="home-icon" />
                </NuxtLink>
                <transition name="fade">
                    <input ref="searchBar" key="1" class="search-bar" v-if="showSearchBox" v-model="searchbox" type="text"
                        style="margin-left: 20px;">
                </transition>
                <Icon v-if="filter.includes(currentRoute.path) && showSearchBox === false" @click="showSearchBox = true;"
                    name="ph:magnifying-glass" size="25" class="search-icon-mobile" />
                <Icon v-if="filter.includes(currentRoute.path) && showSearchBox === true"
                    @click="showSearchBox = false; searchbox = ''" name="radix-icons:cross-2" size="20"
                    class="search-icon" />
            </div>
            <Icon class="hamburger-menu" @click="showDropdown = !showDropdown" name="solar:hamburger-menu-outline"
                size="35px" />
        </div>

        <div class="desktop-nav">
            <div class="menu-left">
                <NuxtLink class="logo-center" to="/">
                    <img src="/icons/dellekes_logo.png" class="home-icon" />
                </NuxtLink>
                <NuxtLink to="/movies">MOVIES</NuxtLink>
                <NuxtLink to="/series">SERIES</NuxtLink>
                <transition name="fade">
                    <input key="1" class="search-bar" v-if="filter.includes(currentRoute.path) && showSearchBox"
                        v-model="searchbox" type="text">
                </transition>
                <Icon v-if="filter.includes(currentRoute.path) && showSearchBox === false" @click="showSearchBox = true"
                    name="ph:magnifying-glass" size="25" />
                <Icon v-if="filter.includes(currentRoute.path) && showSearchBox === true"
                    @click="showSearchBox = false; searchbox = ''" name="radix-icons:cross-2" size="20"
                    class="search-icon" />
            </div>
            <div class="menu-right">
                <div>
                    <Icon class="hamburger-menu-desktop" @click="showDropdown = !showDropdown"
                        name="solar:hamburger-menu-outline" size="35px" />
                </div>
            </div>
        </div>

    </nav>
</template>

<style scoped>
nav {
    z-index: 99999999;
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    min-height: var(--navbar-height);
    display: flex;
    flex-direction: row;
    align-items: center;
    background-color: rgba(18, 18, 18, 0.95);
    backdrop-filter: blur(5px);
    box-shadow: var(--box-shadow-2);
}

svg {
    min-width: fit-content;
}

.search-icon {
    margin-left: 10px;
}

.search-icon-mobile {
    margin-left: 30px;
}

.desktop-nav {
    display: flex;
    flex-direction: row;
    align-items: center;
}

.mobile-menu {
    display: none;
    align-items: center;
    width: 100vw;
    justify-content: space-between;
    padding-left: 5px;
    padding-right: 15px;
}

.profile {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 40px;
    height: 40px;
    border-radius: 25px;
    border: 1px solid white;
}

.profile:hover {
    border: 1px solid var(--primary-color-100);
    cursor: pointer;
}

.profile:hover svg {
    color: var(--primary-color-100);
}

.search-bar {
    border: 1px solid white;
    border-radius: 5px;
    padding-left: 20px;
    width: 100%;
    max-width: 300px;
}

.logo-center {
    position: absolute;
    left: 50%;
    transform: translate(-50%, 0%);
}

.logo-mobile {
    margin-left: 2vw;
}

nav a,
.logout {
    text-decoration: none;
    white-space: nowrap;
    font-size: var(--font-size-3);
    font-weight: 500;
}

.menu-left a {
    padding-right: 30px;
    text-decoration: none;
    white-space: nowrap;
    font-size: var(--font-size-3);
    font-weight: 500;
}

.menu-left .logo-center {
    padding: 0;
}

.hamburger-menu {
    margin-right: 2vw;
}


a:hover {
    color: var(--primary-color-100)
}

span:hover {
    color: var(--primary-color-100);
    cursor: pointer;
}

.home-icon {
    color: var(--primary-color-300)
}

.icon:hover {
    cursor: pointer;
    color: var(--primary-color-100);
}

.home-icon {
    height: 50px;
    aspect-ratio: auto;
    margin-top: 10px;
}

.home-icon:hover {
    cursor: pointer;
}

.container-dropdown {
    display: flex;
    align-items: center;
    flex-direction: column;
    top: var(--navbar-height);
    position: fixed;
    right: 0;
    width: 300px;
    height: 100vh;
    background-color: rgba(18, 18, 18, 0.97);
    z-index: 9;
}

.container-dropdown a,
.container-dropdown span {
    margin: 10px;
    font-size: 2rem;
    font-weight: 600;
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
    padding: 0px 30px;
    width: 50%;
}

.menu-left {
    padding-right: 60px;
}

.menu-right {
    display: flex;
    justify-content: flex-end;
}

.fade-enter-active,
.fade-leave-active {
    transition: all 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
    width: 0px;
    opacity: 0;
}

.fadedown-enter-active,
.fadedown-leave-active {
    transition: all 0.5s ease;
}

.fadedown-enter-from,
.fadedown-leave-to {
    right: -100%;
    opacity: 0;
}

@media screen and (max-width: 992px) {
    .mobile-menu {
        display: flex;
    }

    .container-dropdown {
        width: 100%;
    }

    .desktop-nav {
        display: none;
    }

    .search-results-desktop {
        display: none;
    }

    .search-results-mobile {
        display: flex;
    }
}
</style>