export const SECURITY_SETUP_RETURN_LIFECYCLE_SCRIPT = `        useEffect(() => {
          const shouldOpenSecurity = readCurrentSearchParam("develop_security") === "1"
            || Boolean(readCurrentSearchParam("github_security"));
          if (shouldOpenSecurity) {
            openDevelopSecurityPage();
          }
        }, []);
`;

