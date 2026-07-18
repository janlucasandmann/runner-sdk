export const FINE_TUNING_PAGE_CONTROLLER_VIEW_SCRIPT = String.raw`        const isDetailPage = fineTuningPageMode === "detail" && selectedJob;
        const pageTitle = isDetailPage ? selectedJob.name : "Fine-Tuning";
        const detailJob = isDetailPage ? normalizePlaygroundFineTuningJob(selectedJob) : null;
        const showStopButton = detailJob ? canStopPlaygroundFineTuningJob(detailJob) : false;
        const isStoppingDetailJob = detailJob ? fineTuningStopJobId === detailJob.id : false;
        if (!isDetailPage) {
          return React.createElement(React.Fragment, null,
            renderOverview(),
            renderCreateModal()
          );
        }
        return React.createElement("section", { className: "playground-files-page playground-guardrails-page playground-evaluations-page playground-fine-tuning-page" },
          React.createElement("div", { className: "playground-files-shell playground-guardrails-shell" },
            React.createElement("section", { className: "playground-files-browser playground-guardrails-browser" },
              React.createElement("div", { className: "playground-files-browser-header playground-guardrails-browser-header" + (!isDetailPage ? " playground-guardrails-overview-browser-header" : "") },
                React.createElement("div", { className: "playground-files-library-header playground-guardrails-library-header" },
                  isDetailPage
                    ? React.createElement("button", {
                        type: "button",
                        className: "playground-resource-detail-back-button playground-guardrails-detail-back-button playground-evaluations-detail-back-button",
                        onClick: () => {
                          if (typeof setFineTuningPageMode === "function") setFineTuningPageMode("overview");
                        },
                        "aria-label": "Back to fine-tuning jobs",
                      },
                        React.createElement(ArrowLeft, { width: 12, height: 12, strokeWidth: 1.8 }),
                        React.createElement("span", null, "Back")
                      )
                    : null,
                  React.createElement("div", { className: "playground-files-library-title-row" + (isDetailPage ? " playground-guardrails-detail-title-row" : "") },
	                    React.createElement("h1", { className: "playground-files-library-title" + (isDetailPage ? " playground-guardrails-detail-title" : "") }, pageTitle),
	                    isDetailPage
	                      ? React.createElement("div", { className: "playground-guardrails-detail-actions" },
	                          React.createElement("div", { className: "playground-fine-tuning-detail-time" }, formatPlaygroundFineTuningDateTime(detailJob.createdAt)),
                            showStopButton
                              ? React.createElement("button", {
                                  type: "button",
                                  className: "playground-fine-tuning-detail-stop-button",
                                  onClick: () => stopFineTuningJob(detailJob),
                                  disabled: isStoppingDetailJob,
                                  title: "Stop fine-tune run",
                                  "aria-label": "Stop fine-tune run",
                                },
                                  isStoppingDetailJob
                                    ? React.createElement(Loader2, { className: "is-spinning", width: 13, height: 13, strokeWidth: 1.8 })
                                    : React.createElement(Square, { width: 12, height: 12, strokeWidth: 2 }),
                                  React.createElement("span", null, isStoppingDetailJob ? "Stopping" : "Stop")
                                )
                              : null
	                        )
	                      : null
	                  )
                )
              ),
              React.createElement("div", { className: "playground-files-browser-body playground-guardrails-browser-body" + (!isDetailPage ? " playground-guardrails-overview-browser-body" : "") },
                isDetailPage ? renderDetail() : renderOverview()
              )
            )
          ),
          renderCreateModal()
        );
      }

`;
