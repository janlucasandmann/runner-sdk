export const IMAGINE_PAGE_TEMPLATE_MEDIA_SCRIPT = String.raw`        function PlaygroundImagineTemplatePreviewMedia({ template }) {
          const mediaRef = useRef(null);
          const lastAssetRef = useRef(null);
          const transitionTimeoutRef = useRef(null);
          const [shouldLoad, setShouldLoad] = useState(false);
          const [transitionState, setTransitionState] = useState({
            previousAsset: null,
            direction: 1,
            token: 0,
          });
          const assets = useMemo(() => normalizePlaygroundImagineTemplateAssets(template), [template]);
          const activeIndex = Math.max(0, Number(template?.activeAssetIndex || 0) || 0);
          const activeAsset = assets[activeIndex] || assets[0] || null;
          const isVideo = activeAsset?.type === "video";
          const videoUrl = isVideo ? String(activeAsset?.url || "").trim() : "";

          useEffect(() => {
            if (!isVideo) {
              return undefined;
            }
            const node = mediaRef.current;
            if (!node || typeof IntersectionObserver === "undefined") {
              setShouldLoad(true);
              return undefined;
            }
            const observer = new IntersectionObserver((entries) => {
              if (entries.some((entry) => entry.isIntersecting || entry.intersectionRatio > 0)) {
                setShouldLoad(true);
                observer.disconnect();
              }
            }, { root: null, rootMargin: "420px 0px", threshold: 0.01 });
            observer.observe(node);
            return () => observer.disconnect();
          }, [isVideo, videoUrl]);

          useEffect(() => {
            const currentKey = activeAsset ? String(activeAsset.type || "") + ":" + String(activeAsset.url || "") : "";
            const previous = lastAssetRef.current;
            if (previous?.key && currentKey && previous.key !== currentKey) {
              const direction = Number(template?.assetDirection || 1) < 0 ? -1 : 1;
              if (transitionTimeoutRef.current) {
                clearTimeout(transitionTimeoutRef.current);
              }
              setTransitionState({
                previousAsset: previous.asset,
                direction,
                token: Date.now(),
              });
              transitionTimeoutRef.current = setTimeout(() => {
                setTransitionState((current) => ({
                  ...current,
                  previousAsset: null,
                }));
              }, 280);
            }
            lastAssetRef.current = activeAsset ? { key: currentKey, asset: activeAsset } : null;
            return undefined;
          }, [activeAsset?.type, activeAsset?.url, template?.assetDirection]);

          useEffect(() => {
            return () => {
              if (transitionTimeoutRef.current) {
                clearTimeout(transitionTimeoutRef.current);
              }
            };
          }, []);

          if (!activeAsset) {
            return null;
          }

          const renderAsset = (asset, className, key) => {
            const assetIsVideo = asset?.type === "video";
            const assetUrl = String(asset?.url || "").trim();
            return React.createElement("span", { key, className: "playground-imagine-template-media-layer " + className },
              assetIsVideo
                ? (
                    shouldLoad
                      ? React.createElement("video", {
                          className: "playground-imagine-template-video",
                          src: assetUrl,
                          muted: true,
                          loop: true,
                          playsInline: true,
                          autoPlay: true,
                          preload: "metadata",
                          onTimeUpdate: (event) => {
                            const video = event.currentTarget;
                            if (video.currentTime > 4) {
                              video.currentTime = 0;
                              void video.play?.();
                            }
                          },
                        })
                      : React.createElement("span", { className: "playground-imagine-template-video-placeholder" })
                  )
                : React.createElement("img", {
                    className: "playground-imagine-template-media-image",
                    src: assetUrl,
                    alt: "",
                    draggable: false,
                    loading: "lazy",
                  })
            );
          };

          return React.createElement("span", { ref: mediaRef, className: "playground-imagine-template-media", "aria-hidden": "true" },
            React.createElement("span", {
              className: "playground-imagine-template-media-transition",
              style: { "--imagine-template-asset-direction": transitionState.direction },
            },
              transitionState.previousAsset
                ? renderAsset(transitionState.previousAsset, "is-previous", "previous:" + transitionState.token)
                : null,
              renderAsset(
                activeAsset,
                transitionState.previousAsset ? "is-current" : "is-static",
                "current:" + String(activeAsset.url || "") + ":" + transitionState.token
              )
            )
          );
        }

`;
