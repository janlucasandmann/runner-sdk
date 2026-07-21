export const FINE_TUNING_PAGE_CONTROLLER_VIEW_SCRIPT = String.raw`        const isDetailPage = fineTuningPageMode === "detail" && selectedJob;
        if (!isDetailPage) {
          return React.createElement(React.Fragment, null,
            renderOverview(),
            renderCreateModal()
          );
        }
        return React.createElement("section", { className: "playground-files-page playground-guardrails-page playground-evaluations-page playground-fine-tuning-page" },
          React.createElement("div", { className: "playground-files-shell playground-guardrails-shell" },
            React.createElement("section", { className: "playground-files-browser playground-guardrails-browser" },
              React.createElement("div", { className: "playground-files-browser-body playground-guardrails-browser-body is-detail-page playground-fine-tuning-detail-page-body" },
                renderDetail()
              )
            )
          ),
          renderCreateModal()
        );
      }

`;
