export const useChromecast = () => {
  const isCasting = ref(false)
  const castSession = ref(null)

  const initializeCastApi = () => {
    const context = cast.framework.CastContext.getInstance()
    context.setOptions({
      receiverApplicationId: chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID, // Replace with your app ID if needed
      autoJoinPolicy: chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED,
    })

    context.addEventListener(cast.framework.CastContextEventType.CAST_STATE_CHANGED, (event) => {
      isCasting.value = event.castState === cast.framework.CastState.CONNECTED
      castSession.value = context.getCurrentSession()
    })
  }

  onMounted(() => {
    if (window.chrome && window.chrome.cast && window.chrome.cast.isAvailable) {
      initializeCastApi()
    } else {
      window['__onGCastApiAvailable'] = (isAvailable) => {
        if (isAvailable) initializeCastApi()
      }
    }
  })

  const requestCastSession = async () => {
    try {
      const context = cast.framework.CastContext.getInstance();
      await context.requestSession(); // This triggers the popup for device selection
      console.log("Session successfully started.");
    } catch (error) {
      console.error("Error starting session:", error);
    }
  };


  const startCasting = (mediaInfo) => {
    const context = cast.framework.CastContext.getInstance()
    console.log(context)
    let session = context.getCurrentSession()

    if (!session) return console.log("No current session found.")
      console.log('session: ', session)

    const media = new chrome.cast.media.MediaInfo(mediaInfo.url, mediaInfo.contentType)
    media.metadata = {
      type: chrome.cast.media.MetadataType.MOVIE
    }

    const request = new chrome.cast.media.LoadRequest(media)

    session.loadMedia(request).catch((error) => {
      console.error('Error loading media:', error)
    })
  }


  const stopCasting = () => {
    if (castSession.value) {
      castSession.value.endSession(true)
    }
  }

  return { isCasting, startCasting, stopCasting, requestCastSession }
}
