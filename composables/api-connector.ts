import { getAccesToken } from "#imports"

const config = useRuntimeConfig()

export async function fetchMedia(mediaId: Number) {
    return fetch(config.public.baseURL + "/media/" + mediaId, {
        method: "GET",
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: `Bearer ${await getAccesToken()}`
        }
    })
    .then((response) => {
        if (response.status >= 200 && response.status < 300) {
            return response.json()
        }
    })
    .then((data) => data.media)
    .catch(e => {
        console.log(e)
    })
}

export async function fetchVideoToken(videoId: Number) {
    return fetch(`${config.public.baseURL}/stream/video-token/${videoId}`, {
        method: "GET",
        headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${await getAccesToken()}`
        }
    })
    .then((response) => {
        if (response.status >= 200 && response.status < 300) {
            return response.json()
        }
    })
    .then(data => data.token)
    .catch(e => {
        console.log(e)
    })
}

export async function updateWatched(videoId: Number, time: Number) {
    return fetch(config.public.baseURL + "/watched", {
        method: "POST",
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: `Bearer ${await getAccesToken()}`
        },
        body: JSON.stringify({
            id: videoId,
            timestamp: time
        })
    })
    .then((response) => {
        if (response.status >= 200 && response.status < 300) {
            return
        }
    })
    .catch(e => {
        console.log(e)
    })
}