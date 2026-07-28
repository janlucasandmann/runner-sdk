export const PROJECT_ACTIVITY_LIST_SCRIPT = `        function getProjectWorkActivityTicketIdentifier(ticketNumber) {
          const normalizedTicketNumber = String(ticketNumber || "").trim();
          const identifierMatch = normalizedTicketNumber.match(
            /(?:^|\\s)([a-z]{3})-(\\d+)(?=\\s|$)/i
          );
          return identifierMatch
            ? identifierMatch[1].toUpperCase() + "-" + identifierMatch[2]
            : normalizedTicketNumber.split(/\\s+/)[0] || "";
        }

        function renderProjectWorkActivityListSummary(event, ticketNumber) {
          const ticketIdentifier = getProjectWorkActivityTicketIdentifier(
            ticketNumber
          );
          if (!ticketIdentifier) {
            return renderProjectWorkActivityEventSummary(event);
          }
          const ticket = React.createElement("strong", null, ticketIdentifier);
          if (event?.eventType === "created") {
            return React.createElement(
              React.Fragment,
              null,
              React.createElement(
                "strong",
                null,
                getProjectWorkActivityActorName(event)
              ),
              " created ",
              ticket
            );
          }
          return React.createElement(
            React.Fragment,
            null,
            renderProjectWorkActivityEventSummary(event),
            " · ",
            ticket
          );
        }
`;
