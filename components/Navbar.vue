<script setup>
import { isAdmin, destroyTokens } from "#imports"
import { useMainStore } from "~/stores/mainStore";
import { storeToRefs } from "pinia";

const mainStore = useMainStore()
const { currentRoute } = useRouter();

const { searchbox, showSearchBox, selectedGenres } = storeToRefs(mainStore)
const inputElement = ref()
const autoCompletionList = ref([])

const showDropdown = ref(false)
const filter = ref(['/movies', '/series', '/'])
const admin = ref(isAdmin())

function logout() {
    destroyTokens()
    navigateTo("/login")
}

function openSearchBox() {
    showSearchBox.value = true;
    nextTick(() => inputElement.value.focus())
}

function hideSearchBox() {
    autoCompletionList.value.splice(0, autoCompletionList.value.length)
    showSearchBox.value = false;
}

async function updateAutoCompletion() {
    const data = await mainStore.getAutoCompletion(0, 10, { genres: selectedGenres.value, search: searchbox.value })
    autoCompletionList.value.splice(0, autoCompletionList.value.length)
    autoCompletionList.value.push(...data.content)
}

function navigateToMedia(id) {
    hideSearchBox()
    navigateTo(`/media/${id}`)
}
</script>

<template>
    <nav>
        <transition name="fadedown">
            <div v-if="showDropdown"
                 @click="showDropdown = false"
                 class="container-dropdown">
                <NuxtLink @click="showDropdown = false"
                          to="/"
                          style="margin-top: 50px;">HOME</NuxtLink>
                <NuxtLink @click="showDropdown = false"
                          to="/movies">MOVIES</NuxtLink>
                <NuxtLink @click="showDropdown = false"
                          to="/series">SERIES</NuxtLink>
                <NuxtLink @click="showDropdown = false"
                          to="/watchlist">WATCHLIST</NuxtLink>
                <NuxtLink @click="showDropdown = false"
                          to="/request">REQUEST</NuxtLink>
                <NuxtLink to="/cinema">CINEMA</NuxtLink>
                <NuxtLink @click="showDropdown = false"
                          v-if="admin"
                          to="/upload">UPLOAD</NuxtLink>
                <NuxtLink @click="showDropdown = false"
                          v-if="admin"
                          to="/admin">ADMIN</NuxtLink>
                <span class="logout"
                      @click="logout(); showDropdown = false">LOGOUT</span>
            </div>
        </transition>

        <div class="mobile-menu">
            <div style="display:flex; align-items: center;">
                <NuxtLink class="logo-mobile"
                          to="/">
                    <img src="/icons/dellekes_logo.png"
                         class="home-icon" />
                </NuxtLink>
                <transition name="fade">
                    <div v-if="filter.includes(currentRoute.path) && showSearchBox"
                         class="search-bar">
                        <input ref="inputElement"
                               @keyup.enter="hideSearchBox()"
                               @keyup="updateAutoCompletion()"
                               class="search-bar-input"
                               v-model="searchbox"
                               type="text"
                               placeholder="Movie, Series, Genre, Actor">
                        <ul v-if="autoCompletionList.length !== 0"
                            class="search-bar-suggestions">
                            <li v-for="entry in autoCompletionList"
                                class="search-bar-suggestions-item"
                                @click="navigateToMedia(entry[0])"
                                style="list-style: none; cursor: pointer;">
                                <span style="font-weight: bold;">{{ entry[1].substring(0, searchbox.length) }}</span>
                                <span style="overflow: hidden;">{{ entry[1].substring(searchbox.length) }}</span>
                            </li>
                        </ul>
                    </div>
                </transition>
                <Icon v-if="filter.includes(currentRoute.path) && showSearchBox === false"
                      @click="openSearchBox()"
                      name="ph:magnifying-glass"
                      size="25px"
                      class="search-icon-mobile" />
                <Icon v-if="filter.includes(currentRoute.path) && showSearchBox === true"
                      @click="hideSearchBox()"
                      name="radix-icons:cross-2"
                      size="25px"
                      class="search-icon" />
            </div>
            <Icon class="hamburger-menu"
                  @click="showDropdown = !showDropdown"
                  name="solar:hamburger-menu-outline"
                  size="35px" />
        </div>

        <div class="desktop-nav">
            <div class="menu-left">
                <NuxtLink class="logo-center"
                          to="/">
                    <img src="/icons/dellekes_logo.png"
                         class="home-icon" />
                </NuxtLink>
                <NuxtLink to="/movies">MOVIES</NuxtLink>
                <NuxtLink to="/series">SERIES</NuxtLink>
                <transition name="fade">
                    <div v-if="filter.includes(currentRoute.path) && showSearchBox"
                         class="search-bar">
                        <input ref="inputElement"
                               @keyup.enter="hideSearchBox()"
                               @keyup="updateAutoCompletion()"
                               class="search-bar-input"
                               v-model="searchbox"
                               type="text"
                               placeholder="Movie, Series, Genre, Actor">
                        <ul v-if="autoCompletionList.length !== 0"
                            class="search-bar-suggestions">
                            <li v-for="entry in autoCompletionList"
                                class="search-bar-suggestions-item"
                                @click="navigateToMedia(entry[0])"
                                style="list-style: none; cursor: pointer;">
                                <span style="font-weight: bold;">{{ entry[1].substring(0, searchbox.length) }}</span>
                                <span style="overflow: hidden;">{{ entry[1].substring(searchbox.length) }}</span>
                            </li>
                        </ul>
                    </div>
                </transition>
                <Icon v-if="filter.includes(currentRoute.path) && showSearchBox === false"
                      @click="openSearchBox()"
                      name="ph:magnifying-glass"
                      size="25px"
                      class="search-icon" />
                <Icon v-if="filter.includes(currentRoute.path) && showSearchBox === true"
                      @click="hideSearchBox()"
                      name="radix-icons:cross-2"
                      size="25px"
                      class="search-icon" />
            </div>
            <div class="menu-right">
                <div>
                    <Icon class="hamburger-menu-desktop"
                          @click="showDropdown = !showDropdown"
                          name="solar:hamburger-menu-outline"
                          size="35px" />
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
    width: 100%;
    height: var(--navbar-height);
    display: flex;
    flex-direction: row;
    align-items: center;
    background-color: rgba(18, 18, 18, 0.95);
    backdrop-filter: blur(5px);
    box-shadow: var(--box-shadow-2);
}

svg {
    min-width: 25px;
    max-width: 35px;
}

.search-icon {
    margin-left: 6px;
}

.search-icon-mobile {
    margin-left: 25px;
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

/* 
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
} */

.search-bar {
    position: relative;

    border: 1px solid white;
    border-radius: 5px;
}

.search-bar-input {
    border: none;
    padding-left: 5px;
    max-width: 220px;
}

.search-bar-input:focus {
    outline: none;
}

.search-bar-input::placeholder {
    font-size: 16px;
}

.search-bar-suggestions {
    position: absolute;
    width: 100%;
    top: 54px;
    padding: 5px;
    margin: 0;
    background-color: var(--transparent-background-color-100);
    font-family: var(--font-family-1);
    font-size: var(--font-size-4);
    color: var(--text-color-2);
    border-radius: 10px;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
}

.search-bar-suggestions-item:hover {
    color: var(--primary-color-100);
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