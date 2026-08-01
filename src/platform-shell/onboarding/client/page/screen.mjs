export const ONBOARDING_SCREEN_SCRIPT = String.raw`        function PlaygroundOnboardingScreen({
          className = "",
          children,
          label = "Computer Agents onboarding",
        }) {
          const screenRef = useRef(null);

          useEffect(() => {
            const root = document.documentElement;
            const body = document.body;
            const previouslyFocusedElement = document.activeElement;
            const previousRootOverflow = root.style.overflow;
            const previousBodyOverflow = body.style.overflow;
            const backgroundElements = Array.from(body.children)
              .filter((element) => element !== screenRef.current)
              .map((element) => ({
                element,
                hadInertAttribute: element.hasAttribute("inert"),
                previousAriaHidden: element.getAttribute("aria-hidden"),
              }));
            const focusFrame = window.requestAnimationFrame(() => {
              screenRef.current?.focus?.({ preventScroll: true });
            });

            root.classList.add("playground-onboarding-is-open");
            body.classList.add("playground-onboarding-is-open");
            root.style.overflow = "hidden";
            body.style.overflow = "hidden";
            backgroundElements.forEach(({ element }) => {
              element.setAttribute("inert", "");
              element.setAttribute("aria-hidden", "true");
            });

            return () => {
              window.cancelAnimationFrame(focusFrame);
              root.classList.remove("playground-onboarding-is-open");
              body.classList.remove("playground-onboarding-is-open");
              root.style.overflow = previousRootOverflow;
              body.style.overflow = previousBodyOverflow;
              backgroundElements.forEach(({
                element,
                hadInertAttribute,
                previousAriaHidden,
              }) => {
                if (!hadInertAttribute) {
                  element.removeAttribute("inert");
                }
                if (previousAriaHidden == null) {
                  element.removeAttribute("aria-hidden");
                } else {
                  element.setAttribute("aria-hidden", previousAriaHidden);
                }
              });
              if (
                previouslyFocusedElement
                && typeof previouslyFocusedElement.focus === "function"
                && document.contains(previouslyFocusedElement)
              ) {
                previouslyFocusedElement.focus({ preventScroll: true });
              }
            };
          }, []);

          return React.createElement("main", {
              ref: screenRef,
              className: "playground-onboarding-screen",
              tabIndex: -1,
              "aria-label": label,
              "data-platform-onboarding-screen": "true",
            },
            React.createElement("div", {
              className: [
                "playground-onboarding-screen-surface",
                className,
              ].filter(Boolean).join(" "),
            }, children)
          );
        }

        function PlaygroundOnboardingVideoBackground({ onStarted } = {}) {
          const videoRef = useRef(null);
          const [videoReady, setVideoReady] = useState(false);
          const hasNotifiedStartedRef = useRef(false);
          const notifyStarted = useCallback(() => {
            if (hasNotifiedStartedRef.current) {
              return;
            }
            hasNotifiedStartedRef.current = true;
            if (typeof onStarted === "function") {
              onStarted();
            }
          }, [onStarted]);

          useEffect(() => {
            const video = videoRef.current;
            if (!video) {
              return undefined;
            }
            const fallbackTimer = window.setTimeout(notifyStarted, 180);

            video.playbackRate = 0.5;
            video.preload = "auto";
            video.src = "/img/bg/macapp.mp4";

            const handleCanPlay = () => {
              setVideoReady(true);
              notifyStarted();
              const playResult = video.play();
              if (playResult && typeof playResult.then === "function") {
                playResult.catch(() => {});
              } else {
                video.play().catch(() => {});
              }
            };
            const handlePlaying = () => {
              notifyStarted();
            };

            video.addEventListener("canplaythrough", handleCanPlay);
            video.addEventListener("playing", handlePlaying);
            video.load();

            return () => {
              window.clearTimeout(fallbackTimer);
              video.removeEventListener("canplaythrough", handleCanPlay);
              video.removeEventListener("playing", handlePlaying);
            };
          }, [notifyStarted]);

          return React.createElement("div", { className: "playground-onboarding-video-bg", "aria-hidden": "true" },
            React.createElement("img", {
              className: "playground-onboarding-video-bg-media",
              src: "/img/bg/macapp-poster.jpg",
              alt: "",
            }),
            React.createElement("video", {
              ref: videoRef,
              className: "playground-onboarding-video-bg-media playground-onboarding-video-bg-video" + (videoReady ? " is-ready" : ""),
              loop: true,
              muted: true,
              playsInline: true,
              autoPlay: true,
              suppressHydrationWarning: true,
            }),
            React.createElement("div", { className: "playground-onboarding-video-bg-overlay" })
          );
        }
`;
