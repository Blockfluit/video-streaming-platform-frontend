<template>
    <div>
        <button v-if="!isCasting" @click="castVideo">
            <Icon name="material-symbols:cast-outline" size="28px" />
        </button>
        <button v-if="isCasting" @click="stopCastingPopup = !stopCastingPopup">
            <Icon name="material-symbols:cast-connected" size="28px" />
            <button v-if="stopCastingPopup" @click="stopCasting" class="stop-casting">Stop casting</button>
        </button>
    </div>
</template>

<script setup>
import { useChromecast } from '@/composables/useChromecast'

const stopCastingPopup = ref(false)
const { isCasting, startCasting, stopCasting, requestCastSession } = useChromecast()

const props = defineProps({
    url: String
})

onMounted(() => {
    console.log(props.url)
    window.addEventListener('click', () => {
        if (stopCastingPopup.value === true) stopCastingPopup.value = false
    })
})

const castVideo = async () => {
    const mediaInfo = {
        url: props.url,
        contentType: 'video/mp4'
    }
    await requestCastSession()
    startCasting(mediaInfo)
}
</script>

<style scoped>
button {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: transparent;
    border: none;
    outline: none;
    color: white;
    padding: 0;
    border-radius: 4px;
    cursor: pointer;
    margin-right: 8px;
}

.stop-casting {
    position: absolute;
    top: 110%;
    margin: 0;
    border: 1px solid var(--background-color-300);
    width: fit-content;
    padding: 5px 10px;
    text-wrap: nowrap;
    font-family: "Poppins";
}
</style>
