export const CALENDAR_LOCALIZER_SCRIPT = `
	      const PLAYGROUND_RESOLVED_EN_US_LOCALE = enUSLocale.enUS || enUSLocale.default || enUSLocale;

      const PLAYGROUND_CALENDAR_LOCALES = {
        "en-US": PLAYGROUND_RESOLVED_EN_US_LOCALE,
      };

      const playgroundCalendarLocalizer = dateFnsLocalizer({
        format,
        parse,
        startOfWeek,
        getDay,
        locales: PLAYGROUND_CALENDAR_LOCALES,
      });

`;
