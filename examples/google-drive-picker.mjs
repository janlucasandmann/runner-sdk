let gapiLoaded = false;
let pickerLoaded = false;

function loadGapiScript() {
  return new Promise((resolve, reject) => {
    if (gapiLoaded && window.gapi) {
      resolve();
      return;
    }

    const existing = document.querySelector('script[src*="apis.google.com/js/api.js"]');
    if (existing) {
      const check = window.setInterval(() => {
        if (window.gapi) {
          window.clearInterval(check);
          gapiLoaded = true;
          resolve();
        }
      }, 100);

      window.setTimeout(() => {
        window.clearInterval(check);
        reject(new Error("Timeout loading Google API"));
      }, 10000);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://apis.google.com/js/api.js";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      gapiLoaded = true;
      resolve();
    };
    script.onerror = () => reject(new Error("Failed to load Google API script"));
    document.head.appendChild(script);
  });
}

function loadPickerApi() {
  return new Promise((resolve, reject) => {
    if (pickerLoaded && window.google?.picker) {
      resolve();
      return;
    }

    window.gapi.load("picker", {
      callback: () => {
        pickerLoaded = true;
        resolve();
      },
      onerror: () => reject(new Error("Failed to load Google Picker API")),
    });
  });
}

export async function openGoogleDrivePicker({
  accessToken,
  apiKey,
  appId,
  multiSelect = true,
  includeFolders = true,
  selectFolderEnabled = true,
  title = "Select files",
}) {
  await loadGapiScript();
  await loadPickerApi();

  return await new Promise((resolve, reject) => {
    try {
      const docsView = new window.google.picker.DocsView(window.google.picker.ViewId.DOCS)
        .setIncludeFolders(includeFolders)
        .setSelectFolderEnabled(selectFolderEnabled);

      const picker = new window.google.picker.PickerBuilder()
        .setAppId(appId)
        .setOAuthToken(accessToken)
        .setDeveloperKey(apiKey)
        .setOrigin(window.location.origin)
        .setTitle(title)
        .setCallback((data) => {
          if (data.action === window.google.picker.Action.PICKED) {
            resolve((data.docs || []).map((doc) => ({
              id: doc.id,
              name: doc.name,
              mimeType: doc.mimeType,
              url: doc.url,
              iconUrl: doc.iconUrl,
              type: doc.type,
              parentId: doc.parentId,
            })));
            return;
          }

          if (data.action === window.google.picker.Action.CANCEL) {
            resolve([]);
          }
        })
        .addView(docsView)
        .enableFeature(window.google.picker.Feature.SUPPORT_DRIVES);

      if (multiSelect) {
        picker.enableFeature(window.google.picker.Feature.MULTISELECT_ENABLED);
      }

      picker.build().setVisible(true);
    } catch (error) {
      reject(error);
    }
  });
}
