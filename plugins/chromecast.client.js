// plugins/chromecast.client.ts
export default defineNuxtPlugin((nuxtApp) => {
  const initializeCastApi = () => {
    const context = cast.framework.CastContext.getInstance();
    context.setOptions({
      receiverApplicationId: chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID,
      autoJoinPolicy: chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED
    });
    
    return context;
  };

  // Only run on client-side
  if (process.client) {
    // Load the Cast API
    window['__onGCastApiAvailable'] = function(isAvailable) {
      if (isAvailable) {
        initializeCastApi();
      }
    };

    // Add the Cast SDK script
    const script = document.createElement('script');
    script.src = 'https://www.gstatic.com/cv/js/sender/v1/cast_sender.js?loadCastFramework=1';
    document.head.appendChild(script);
  }

  // Composable to handle casting
  const useChromecast = () => {
    const isCasting = ref(false);
    const castSession = ref(null);

    const startCasting = async (videoUrl, title, thumbnail = '') => {
      try {
        const context = cast.framework.CastContext.getInstance();
        const session = await context.requestSession();
        castSession.value = session;
        
        const mediaInfo = new chrome.cast.media.MediaInfo(videoUrl, 'video/mp4');
        mediaInfo.metadata = new chrome.cast.media.GenericMediaMetadata();
        mediaInfo.metadata.title = title;
        if (thumbnail) {
          mediaInfo.metadata.images = [{ url: thumbnail }];
        }

        const request = new chrome.cast.media.LoadRequest(mediaInfo);
        await session.loadMedia(request);
        isCasting.value = true;
      } catch (error) {
        console.error('Error starting cast:', error);
        throw error;
      }
    };

    const stopCasting = async () => {
      if (castSession.value) {
        try {
          await castSession.value.endSession(true);
          isCasting.value = false;
          castSession.value = null;
        } catch (error) {
          console.error('Error stopping cast:', error);
          throw error;
        }
      }
    };

    return {
      isCasting,
      startCasting,
      stopCasting
    };
  };

  return {
    provide: {
      chromecast: useChromecast
    }
  };
});