export const IMAGINE_APP_STATE_SCRIPT = String.raw`
        const [imagineActiveView, setImagineActiveView] = useState("explore");
        const [imagineTemplateSelectionRequest, setImagineTemplateSelectionRequest] = useState(null);
        const [imagineToolbarPopover, setImagineToolbarPopover] = useState("");
        const [imagineMediaModePopover, setImagineMediaModePopover] = useState(false);
        const [imagineMediaMode, setImagineMediaMode] = useState("image");
        const [imagineFilterMode, setImagineFilterMode] = useState("all");
        const [imagineSortMode, setImagineSortMode] = useState("featured");
`;
