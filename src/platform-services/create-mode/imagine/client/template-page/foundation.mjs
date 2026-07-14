export const IMAGINE_TEMPLATE_PAGE_FOUNDATION_SCRIPT = String.raw`
        function normalizePlaygroundImagineTemplatePageAssets(template) {
          const normalizedAssets = [];
          const pushAsset = (asset) => {
            if (!asset) {
              return;
            }
            const url = String(asset.url || asset.imageUrl || asset.videoUrl || "").trim();
            if (!url) {
              return;
            }
            const explicitType = String(asset.type || asset.mediaType || "").toLowerCase();
            const type = explicitType === "video" || /\.(mp4|webm|mov)(?:[?#].*)?$/i.test(url) ? "video" : "image";
            normalizedAssets.push({
              ...asset,
              url,
              type,
              title: String(asset.title || template?.title || "").trim(),
              aspectRatio: String(asset.aspectRatio || template?.aspectRatio || "").trim(),
            });
          };
          (Array.isArray(template?.assets) ? template.assets : []).forEach(pushAsset);
          (Array.isArray(template?.mediaItems) ? template.mediaItems : []).forEach(pushAsset);
          if (!normalizedAssets.length) {
            const imageUrl = String(template?.imageUrl || "").trim();
            const videoUrl = String(template?.videoUrl || "").trim();
            if (imageUrl) {
              pushAsset({ type: "image", url: imageUrl, title: template?.title, aspectRatio: template?.aspectRatio });
            } else if (videoUrl) {
              pushAsset({ type: "video", url: videoUrl, title: template?.title, aspectRatio: template?.aspectRatio });
            }
          }
          return normalizedAssets;
        }

        function getPlaygroundImagineTemplateModelProviderIcon(model) {
          const normalizedProvider = String(model?.provider || model?.providerType || "").trim().toLowerCase();
          const normalizedModelId = String(model?.id || model?.baseModelId || "").trim().toLowerCase();
          const haystack = [normalizedProvider, normalizedModelId].filter(Boolean).join(" ");
          if (haystack.includes("bytedance") || haystack.includes("seedance")) {
            return { src: "/img/05-model-provider-icons/bytedance.svg", alt: "ByteDance", className: "" };
          }
          if (haystack.includes("xai") || haystack.includes("x.ai") || haystack.includes("grok")) {
            return { src: "/img/05-model-provider-icons/xai.svg", alt: "xAI", className: "" };
          }
          if (haystack.includes("google") || haystack.includes("gemini")) {
            return { src: "/img/05-model-provider-icons/gemini.png", alt: "Google", className: "" };
          }
          if (haystack.includes("openai") || haystack.includes("open-ai") || normalizedModelId.startsWith("gpt-")) {
            return { src: "/img/05-model-provider-icons/openai.svg", alt: "OpenAI", className: "is-openai" };
          }
          return null;
        }

        function createPlaygroundImagineTemplateComposerPopupSourceId(prefix) {
          return String(prefix || "imagine-template-popup") + ":" + Math.random().toString(36).slice(2);
        }

        function emitPlaygroundImagineTemplateComposerPopupOpen(sourceId) {
          if (typeof window === "undefined") {
            return;
          }
          window.dispatchEvent(new CustomEvent("tb-runner-composer-popup-open", {
            detail: { sourceId },
          }));
        }

        function getPlaygroundImagineTemplateComposerPopupEventSource(event) {
          return event instanceof CustomEvent && typeof event.detail?.sourceId === "string"
            ? event.detail.sourceId
            : "";
        }

        function usePlaygroundImagineTemplatePopupAnimation(open) {
          const [rendered, setRendered] = useState(open);
          const [phase, setPhase] = useState(open ? "enter" : "idle");

          useEffect(() => {
            if (open) {
              setRendered(true);
              setPhase("enter");
              return undefined;
            }
            if (!rendered) {
              setPhase("idle");
              return undefined;
            }
            setPhase("exit");
            if (typeof window === "undefined") {
              setRendered(false);
              setPhase("idle");
              return undefined;
            }
            const timeoutId = window.setTimeout(() => {
              setRendered(false);
              setPhase("idle");
            }, 180);
            return () => window.clearTimeout(timeoutId);
          }, [open, rendered]);

          return {
            shouldRender: rendered,
            animation: phase === "exit" ? "up-out" : "up-in",
          };
        }

        function usePlaygroundImagineTemplateAnchoredPopupStyle({
          open,
          anchorRef,
          popupRef,
          gap = 8,
          viewportPadding = 8,
        }) {
          const [style, setStyle] = useState(null);

          useLayoutEffect(() => {
            if (!open) {
              setStyle(null);
              return undefined;
            }

            if (typeof window === "undefined") {
              return undefined;
            }

            let frameId = 0;
            const settleFrameIds = [];
            const resizeObserver = typeof ResizeObserver !== "undefined" ? new ResizeObserver(() => scheduleUpdate()) : null;
            let observedElements = new Set();

            const observeCurrentElements = (...elements) => {
              if (!resizeObserver) {
                return;
              }

              const nextElements = new Set(elements.filter(Boolean));
              observedElements.forEach((element) => {
                if (!nextElements.has(element)) {
                  resizeObserver.unobserve(element);
                }
              });
              nextElements.forEach((element) => {
                if (!observedElements.has(element)) {
                  resizeObserver.observe(element);
                }
              });
              observedElements = nextElements;
            };

            const update = () => {
              const anchor = anchorRef.current;
              if (!anchor) {
                setStyle(null);
                return;
              }

              const popup = popupRef.current;
              const anchorRect = anchor.getBoundingClientRect();
              const popupWidth = popup?.offsetWidth || 300;
              const popupHeight = popup?.offsetHeight || 0;
              const visualViewport = window.visualViewport;
              const viewportWidth = visualViewport?.width || window.innerWidth;
              const viewportHeight = visualViewport?.height || window.innerHeight;
              const viewportLeft = visualViewport?.offsetLeft || 0;
              const viewportTop = visualViewport?.offsetTop || 0;
              const layoutViewportHeight = window.innerHeight;
              const viewportBottom = viewportTop + viewportHeight;
              const maxLeft = viewportLeft + viewportWidth - popupWidth - viewportPadding;
              const maxBottom = Math.max(viewportPadding, layoutViewportHeight - viewportBottom + viewportPadding);
              const bottomEdge = anchorRect.top - gap;
              let bottom = layoutViewportHeight - bottomEdge;
              const unclampedTop = bottomEdge - popupHeight;

              if (unclampedTop < viewportTop + viewportPadding) {
                bottom = Math.min(bottom, layoutViewportHeight - (viewportTop + viewportPadding + popupHeight));
              }

              const clampedLeft = Math.min(
                Math.max(anchorRect.left, viewportLeft + viewportPadding),
                Math.max(viewportLeft + viewportPadding, maxLeft)
              );

              observeCurrentElements(anchor, popup || null);
              setStyle({
                left: Math.round(clampedLeft) + "px",
                top: "auto",
                bottom: Math.max(maxBottom, Math.round(bottom)) + "px",
                visibility: "visible",
              });
            };

            const scheduleUpdate = () => {
              window.cancelAnimationFrame(frameId);
              frameId = window.requestAnimationFrame(update);
            };

            update();
            const scheduleSettledUpdate = (remainingFrames) => {
              const settledFrameId = window.requestAnimationFrame(() => {
                scheduleUpdate();
                if (remainingFrames > 1) {
                  scheduleSettledUpdate(remainingFrames - 1);
                }
              });
              settleFrameIds.push(settledFrameId);
            };
            scheduleSettledUpdate(4);

            window.addEventListener("resize", scheduleUpdate);
            window.addEventListener("scroll", scheduleUpdate, true);
            window.visualViewport?.addEventListener("resize", scheduleUpdate);
            window.visualViewport?.addEventListener("scroll", scheduleUpdate);
            observeCurrentElements(anchorRef.current, popupRef.current);

            return () => {
              window.cancelAnimationFrame(frameId);
              settleFrameIds.forEach((id) => window.cancelAnimationFrame(id));
              window.removeEventListener("resize", scheduleUpdate);
              window.removeEventListener("scroll", scheduleUpdate, true);
              window.visualViewport?.removeEventListener("resize", scheduleUpdate);
              window.visualViewport?.removeEventListener("scroll", scheduleUpdate);
              resizeObserver?.disconnect();
            };
          }, [anchorRef, gap, open, popupRef, viewportPadding]);

          return style;
        }

        function renderPlaygroundImagineTemplatePopupPortal(content, style) {
          if (!content || typeof document === "undefined") {
            return null;
          }

          const resolvedStyle = style || {
            left: "-9999px",
            top: "0px",
            bottom: "auto",
            visibility: "hidden",
          };

          return createPortal(
            React.createElement("div", { className: "tb-composer-popup-portal-root", style: resolvedStyle },
              React.createElement("div", { className: "tb-runner-chat tb-composer-popup-portal-scope" }, content)
            ),
            document.body
          );
        }

`;
