<script setup>
import { storeToRefs } from "pinia";
import { useMainStore } from "~/stores/mainStore";

const props = defineProps({
    supplier: {
        default: () => Promise.resolve({ content: [] }),
        type: Function
    },
    title: {
        default: "Title undefined",
        type: String
    }
})

const mainStore = useMainStore()
const { searchbox, selectedGenres } = storeToRefs(mainStore)

const allMedia = ref([])
const totalElements = ref(0)
let fetching = false
let totalPages = 0
let nextPage = 0
let previousSearch = ""

onMounted(() => {
    window.addEventListener("scroll", scrollHandler)

    fetchNextPage()
})

onBeforeUnmount(() => {
    window.removeEventListener("scroll", scrollHandler)
})

watch(searchbox, () => {
    if (searchbox.value !== previousSearch) {
        nextPage = 0
        fetching = true
        props.supplier(nextPage, 20, selectedGenres.value, searchbox.value).then(data => {
            allMedia.value.splice(0, allMedia.value.length)
            allMedia.value.push(...data.content)
            totalElements.value = data.totalElements
            totalPages = data.totalPages
            nextPage++
            previousSearch = searchbox.value
            fetching = false
        })
    }
})

watch(selectedGenres, () => {
    nextPage = 0
    fetching = true
    props.supplier(nextPage, 20, selectedGenres.value, searchbox.value).then(data => {
        allMedia.value.splice(0, allMedia.value.length)
        allMedia.value.push(...data.content)
        totalElements.value = data.totalElements
        totalPages = data.totalPages
        nextPage++
        previousSearch = searchbox.value
        fetching = false
    })
})

function fetchNextPage() {
    props.supplier(nextPage, 20, selectedGenres.value, searchbox.value).then(data => {
        allMedia.value.push(...data.content)
        totalElements.value = data.totalElements
        totalPages = data.totalPages
        nextPage++
        fetching = false
    })
}

function scrollHandler() {
    const totalHeight = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight, document.body.offsetHeight, document.documentElement.offsetHeight, document.body.clientHeight, document.documentElement.clientHeight);
    if ((totalHeight - window.scrollY - window.innerHeight) < window.innerHeight * 2 &&
        !fetching &&
        nextPage < totalPages) {
        fetching = true
        fetchNextPage()
    }
}
</script>

<template>
    <div>
        <div class="container">
            <span class="title">{{ title }}</span>
            <span class="title-count">{{ totalElements }}</span>
        </div>
        <div class="cards">
            <div style="margin: 5px !important;"
                 v-for="media of allMedia">
                <Card :shownMedia="media" />
            </div>
        </div>
    </div>
</template>

<style scoped>
.container {
    display: flex;
    justify-content: center;
    align-items: center;
}

.cards {
    display: flex;
    justify-content: center;
    width: 100%;
    flex-wrap: wrap;
}

.title {
    font-size: 3rem;
    font-weight: 800;
}

.title-count {
    font-size: 1rem;
    margin: 0px 0px 0px 10px;
    color: var(--text-color-2)
}
</style>