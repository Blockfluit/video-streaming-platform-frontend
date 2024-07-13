<script setup>
import { isAdmin, destroyTokens } from "#imports"
import { useMainStore } from "~/stores/mainStore";
import { storeToRefs } from "pinia";
import { Vue3Lottie } from 'vue3-lottie'

import { useWindowSize } from '@vueuse/core'
const windowWidth = useWindowSize().width

const config = useRuntimeConfig()

const mainStore = useMainStore()
const { currentRoute } = useRouter();

const { searchbox, showSearchBox, selectedGenres } = storeToRefs(mainStore)
const inputElement = ref()
const autoCompletionList = ref([])


const logoLottie = ref()
const logoLottieMobile = ref()
const hamburgerLottie = ref()
const hamburgerLottie2 = ref()

const showDropdown = ref(false)
const filter = ref(['/movies', '/series', '/'])
const admin = ref(isAdmin())

function toggleMenu() {
    showDropdown.value = !showDropdown.value
    if (windowWidth.value < 992) {
        if (showDropdown.value === true) {
            hamburgerLottie2.value.setDirection('forward')
            hamburgerLottie2.value.play()
        }
        else {
            hamburgerLottie2.value.setDirection('reverse')
            hamburgerLottie2.value.play()
        }
    }
    else {
        if (showDropdown.value === true) {
            hamburgerLottie.value.setDirection('forward')
            hamburgerLottie.value.play()
        }
        else {
            hamburgerLottie.value.setDirection('reverse')
            hamburgerLottie.value.play()
        }
    }
}

function freezeMenuAnimation() {
    if (windowWidth.value < 992) {
        if (showDropdown.value === true) {
            hamburgerLottie2.value.goToAndStop(31)
        }
        else {
            hamburgerLottie2.value.goToAndStop(0)
        }
    }
    else {
        if (showDropdown.value === true) {
            hamburgerLottie.value.goToAndStop(31)
        }
        else {
            hamburgerLottie.value.goToAndStop(0)
        }
    }
}

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
            <div v-if="showDropdown" @click="showDropdown = false" class="container-dropdown">
                <NuxtLink class="menu-item" @click="toggleMenu" to="/">HOME
                </NuxtLink>
                <NuxtLink class="menu-item" @click="toggleMenu" to="/movies">MOVIES
                </NuxtLink>
                <NuxtLink class="menu-item" @click="toggleMenu" to="/series">SERIES
                </NuxtLink>
                <NuxtLink class="menu-item" @click="toggleMenu" to="/watchlist">
                    WATCHLIST
                </NuxtLink>
                <NuxtLink class="menu-item" @click="toggleMenu" to="/request">REQUEST
                </NuxtLink>
                <NuxtLink class="menu-item" v-if="config.public.cinemaURL !== ''" to="/cinema">CINEMA</NuxtLink>
                <NuxtLink class="menu-item" @click="toggleMenu" v-if="admin" to="/upload">UPLOAD
                </NuxtLink>
                <NuxtLink class="menu-item" @click="toggleMenu" v-if="admin" to="/admin">ADMIN
                </NuxtLink>
                <span class="logout menu-item" @click="logout(); showDropdown = false">LOGOUT</span>
            </div>
        </transition>

        <div class="mobile-menu">
            <div style="display:flex; align-items: center;">
                <NuxtLink class="logo-mobile" to="/">
                    <Vue3Lottie style="padding-bottom: 12px;" animationLink="/animations/dellekes_logo.json"
                        ref="logoLottieMobile" :height="75" :width="75" @mouseover="logoLottieMobile.play()"
                        @on-loop-complete="logoLottieMobile.stop()" :autoPlay="false" />
                    <!-- <img src="/icons/dellekes_logo.png" class="home-icon" /> -->
                </NuxtLink>
                <transition name="fade">
                    <div v-if="filter.includes(currentRoute.path) && showSearchBox" class="search-bar">
                        <input ref="inputElement" @keyup.enter="hideSearchBox()" @keyup="updateAutoCompletion()"
                            class="search-bar-input" v-model="searchbox" type="text"
                            placeholder="Movie, Series, Genre, Actor">
                        <ul v-if="autoCompletionList.length !== 0" class="search-bar-suggestions">
                            <li v-for="entry in autoCompletionList" class="search-bar-suggestions-item"
                                @click="navigateToMedia(entry[0])" style="list-style: none; cursor: pointer;">
                                <span style="font-weight: bold;">{{ entry[1].substring(0, searchbox.length) }}</span>
                                <span style="overflow: hidden;">{{ entry[1].substring(searchbox.length) }}</span>
                            </li>
                        </ul>
                    </div>
                </transition>
                <Icon v-if="filter.includes(currentRoute.path) && showSearchBox === false" @click="openSearchBox()"
                    name="ph:magnifying-glass" size="25px" class="search-icon-mobile" />
                <Icon v-if="filter.includes(currentRoute.path) && showSearchBox === true" @click="hideSearchBox()"
                    name="radix-icons:cross-2" size="25px" class="search-icon" />
            </div>
            <div>
                <Vue3Lottie class="hamburger-menu-mobile" animationLink="/animations/hamburger.json"
                    ref="hamburgerLottie2" :height="25" :width="25" @click="toggleMenu"
                    @on-loop-complete="freezeMenuAnimation" :speed="2" :autoPlay="false" />
            </div>
            <!-- <Icon class="hamburger-menu" @click="showDropdown = !showDropdown" name="solar:hamburger-menu-outline"
                size="35px" /> -->
        </div>

        <div class="desktop-nav">
            <div class="menu-left">
                <NuxtLink class="logo-center" to="/">
                    <Vue3Lottie style="padding-bottom: 12px;" animationLink="/animations/dellekes_logo.json"
                        ref="logoLottie" :height="75" :width="75" @mouseover="logoLottie.play()"
                        @on-loop-complete="logoLottie.stop()" :autoPlay="false" />
                    <!-- <img src="/icons/dellekes_logo.png" class="home-icon" /> -->
                </NuxtLink>
                <NuxtLink to="/movies">MOVIES</NuxtLink>
                <NuxtLink to="/series">SERIES</NuxtLink>
                <transition name="fade">
                    <div v-if="filter.includes(currentRoute.path) && showSearchBox" class="search-bar">
                        <input ref="inputElement" @keyup.enter="hideSearchBox()" @keyup="updateAutoCompletion()"
                            class="search-bar-input" v-model="searchbox" type="text"
                            placeholder="Movie, Series, Genre, Actor">
                        <ul v-if="autoCompletionList.length !== 0" class="search-bar-suggestions">
                            <li v-for="entry in autoCompletionList" class="search-bar-suggestions-item"
                                @click="navigateToMedia(entry[0])" style="list-style: none; cursor: pointer;">
                                <span style="font-weight: bold;">{{ entry[1].substring(0, searchbox.length) }}</span>
                                <span style="overflow: hidden;">{{ entry[1].substring(searchbox.length) }}</span>
                            </li>
                        </ul>
                    </div>
                </transition>
                <Icon v-if="filter.includes(currentRoute.path) && showSearchBox === false" @click="openSearchBox()"
                    name="ph:magnifying-glass" size="25px" class="search-icon" />
                <Icon v-if="filter.includes(currentRoute.path) && showSearchBox === true" @click="hideSearchBox()"
                    name="radix-icons:cross-2" size="25px" class="search-icon" />
            </div>
            <div class="menu-right">
                <div>
                    <Vue3Lottie class="hamburger-menu-desktop" animationLink="/animations/hamburger.json"
                        ref="hamburgerLottie" :height="25" :width="25" @click="toggleMenu"
                        @on-loop-complete="freezeMenuAnimation" :speed="2" :autoPlay="false" />
                    <!-- <transition name="fadeInOut">
                        <Icon v-if="showDropdown === false" class="hamburger-menu-desktop" @click="showDropdown = true"
                            name="solar:hamburger-menu-outline" size="35px" />
                    </transition>
                    <transition name="fadeInOut">
                        <Icon v-if="showDropdown === true" class="hamburger-menu-desktop" @click="showDropdown = false"
                            name="radix-icons:cross-1" size="35px" style="padding: 6px 3px" />
                    </transition> -->

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

.menu-item {
    text-align: center;
    border-bottom: 1px solid var(--background-color-200);
    padding: 10px 0px;
    margin: 0;
    width: 100%;
}

.menu-item:hover {
    background-color: rgba(17, 17, 17, 0.9);
}

.hamburger-menu-mobile,
.hamburger-menu-desktop {
    filter: invert(100%);
    cursor: pointer;
}

.hamburger-menu-mobile:hover,
.hamburger-menu-desktop:hover {
    filter: invert(46%) sepia(58%) saturate(7088%) hue-rotate(343deg) brightness(101%) contrast(91%);
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
    background-color: rgba(18, 18, 18, 0.99);
    z-index: 9;
}

.container-dropdown a,
.container-dropdown span {
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

.fadeInOut-enter-active,
.fadeInOut-leave-active {
    transition: all 0.3s ease;
}

.fadeInOut-enter-from,
.fadeInOut-leave-to {
    opacity: 0;
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
    transition: all 0.3s ease-in-out;
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

    .menu-item:first-child {
        border-top: 1px solid var(--background-color-200);
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