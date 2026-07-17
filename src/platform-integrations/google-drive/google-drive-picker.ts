interface GoogleDrivePickerDocument {
  id?: string;
  name?: string;
  mimeType?: string;
  url?: string;
  iconUrl?: string;
  type?: string;
  parentId?: string;
}

export interface GoogleDrivePickerSelection {
  id?: string;
  name?: string;
  mimeType?: string;
  url?: string;
  iconUrl?: string;
  type?: string;
  parentId?: string;
}

export interface OpenGoogleDrivePickerOptions {
  accessToken: string;
  apiKey: string;
  appId: string;
  multiSelect?: boolean;
  includeFolders?: boolean;
  selectFolderEnabled?: boolean;
  title?: string;
}

interface GoogleApiWindow extends Window {
  gapi?: {
    load(
      api: string,
      options: {
        callback: () => void;
        onerror: () => void;
      },
    ): void;
  };
  google?: {
    picker: {
      Action: {
        PICKED: string;
        CANCEL: string;
      };
      DocsView: new (viewId: string) => {
        setIncludeFolders(value: boolean): unknown;
        setSelectFolderEnabled(value: boolean): unknown;
      };
      Feature: {
        SUPPORT_DRIVES: string;
        MULTISELECT_ENABLED: string;
      };
      PickerBuilder: new () => {
        setAppId(value: string): GooglePickerBuilder;
      };
      ViewId: {
        DOCS: string;
      };
    };
  };
}

interface GooglePickerBuilder {
  setOAuthToken(value: string): GooglePickerBuilder;
  setDeveloperKey(value: string): GooglePickerBuilder;
  setOrigin(value: string): GooglePickerBuilder;
  setTitle(value: string): GooglePickerBuilder;
  setCallback(
    callback: (data: {
      action?: string;
      docs?: GoogleDrivePickerDocument[];
    }) => void,
  ): GooglePickerBuilder;
  addView(view: unknown): GooglePickerBuilder;
  enableFeature(feature: string): GooglePickerBuilder;
  build(): {
    setVisible(value: boolean): void;
  };
}

let gapiLoaded = false;
let pickerLoaded = false;

function getGoogleApiWindow(): GoogleApiWindow {
  return window as GoogleApiWindow;
}

function loadGapiScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    const googleWindow = getGoogleApiWindow();
    if (gapiLoaded && googleWindow.gapi) {
      resolve();
      return;
    }

    const existing = document.querySelector<HTMLScriptElement>(
      'script[src*="apis.google.com/js/api.js"]',
    );
    if (existing) {
      const check = window.setInterval(() => {
        if (getGoogleApiWindow().gapi) {
          window.clearInterval(check);
          gapiLoaded = true;
          resolve();
        }
      }, 100);

      window.setTimeout(() => {
        window.clearInterval(check);
        reject(new Error("Timeout loading Google API"));
      }, 10_000);
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

function loadPickerApi(): Promise<void> {
  return new Promise((resolve, reject) => {
    const googleWindow = getGoogleApiWindow();
    if (pickerLoaded && googleWindow.google?.picker) {
      resolve();
      return;
    }

    if (!googleWindow.gapi) {
      reject(new Error("Google API client is unavailable."));
      return;
    }

    googleWindow.gapi.load("picker", {
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
}: OpenGoogleDrivePickerOptions): Promise<GoogleDrivePickerSelection[]> {
  await loadGapiScript();
  await loadPickerApi();

  return new Promise((resolve, reject) => {
    try {
      const pickerApi = getGoogleApiWindow().google?.picker;
      if (!pickerApi) {
        reject(new Error("Google Picker API is unavailable."));
        return;
      }

      const docsView = new pickerApi.DocsView(pickerApi.ViewId.DOCS);
      docsView.setIncludeFolders(includeFolders);
      docsView.setSelectFolderEnabled(selectFolderEnabled);

      const picker = new pickerApi.PickerBuilder()
        .setAppId(appId)
        .setOAuthToken(accessToken)
        .setDeveloperKey(apiKey)
        .setOrigin(window.location.origin)
        .setTitle(title)
        .setCallback((data) => {
          if (data.action === pickerApi.Action.PICKED) {
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

          if (data.action === pickerApi.Action.CANCEL) {
            resolve([]);
          }
        })
        .addView(docsView)
        .enableFeature(pickerApi.Feature.SUPPORT_DRIVES);

      if (multiSelect) {
        picker.enableFeature(pickerApi.Feature.MULTISELECT_ENABLED);
      }

      picker.build().setVisible(true);
    } catch (error) {
      reject(error);
    }
  });
}
