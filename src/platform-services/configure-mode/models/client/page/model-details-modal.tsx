import { ExternalLink } from "../../../../../platform-ui/components/ui/hugeicons-compat.js";
import {
  PlatformModal,
} from "../../../../../platform-ui/components/composite/modal/index.js";
import {
  PlatformPrimaryButton,
  PlatformSecondaryButton,
} from "../../../../../platform-ui/components/ui/button/index.js";
import type {
  ModelOverviewDetailFact,
  ModelsOverviewRow,
} from "../domain/index.js";

export interface ModelDetailsModalProps {
  model: ModelsOverviewRow | null;
  onClose: () => void;
  onCreateAgent?: (model: ModelsOverviewRow) => void;
}

function ModelDetailFacts({
  facts,
}: {
  facts: readonly ModelOverviewDetailFact[];
}) {
  return (
    <dl className="models-overview-details-modal__facts">
      {facts.map((fact) => (
        <div
          key={`${fact.label}:${fact.value}`}
          className="models-overview-details-modal__fact"
        >
          <dt>{fact.label}</dt>
          <dd>
            <span>{fact.value}</span>
            {fact.description ? <small>{fact.description}</small> : null}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function ModelDetailsTitle({ model }: { model: ModelsOverviewRow | null }) {
  const label = model?.label || model?.id || "Model details";
  const providerIcon = model?.details?.providerIcon;
  return (
    <span className="models-overview-details-modal__title-content">
      {providerIcon ? (
        <span
          className="playground-agents-model-provider-icon-shell playground-agents-overview-table-model-icon models-overview-details-modal__provider-icon"
          aria-hidden="true"
        >
          <img
            src={providerIcon.src}
            alt=""
            draggable={false}
            className={`playground-agents-model-provider-icon${providerIcon.className ? ` ${providerIcon.className}` : ""}`}
          />
        </span>
      ) : null}
      <span className="models-overview-details-modal__title-label">{label}</span>
    </span>
  );
}

export function ModelDetailsModal({
  model,
  onClose,
  onCreateAgent,
}: ModelDetailsModalProps) {
  const details = model?.details;
  const canCreateAgent = Boolean(model && details?.canCreateAgent && onCreateAgent);

  return (
    <PlatformModal
      open={Boolean(model)}
      onClose={onClose}
      title={<ModelDetailsTitle model={model} />}
      description={model
        ? details?.description || "No model description is available."
        : undefined}
      size="medium"
      className="models-overview-details-modal"
      bodyClassName="models-overview-details-modal__body"
      footerClassName="models-overview-details-modal__footer"
      footer={model ? (
        <>
          {details?.documentationUrl ? (
            <a
              className="models-overview-details-modal__documentation"
              href={details.documentationUrl}
              target="_blank"
              rel="noreferrer"
            >
              <ExternalLink width={13} height={13} strokeWidth={1.8} aria-hidden="true" />
              <span>Provider documentation</span>
            </a>
          ) : <span className="models-overview-details-modal__footer-spacer" />}
          <PlatformSecondaryButton size="small" onClick={onClose}>
            Close
          </PlatformSecondaryButton>
          {canCreateAgent ? (
            <PlatformPrimaryButton
              size="small"
              onClick={() => {
                onClose();
                onCreateAgent?.(model);
              }}
            >
              Create Agent
            </PlatformPrimaryButton>
          ) : null}
        </>
      ) : undefined}
      closeButtonLabel="Close model details"
    >
      {model ? (
        <>
          {details?.overviewFacts?.length ? (
            <section className="models-overview-details-modal__section">
              <h3>Model</h3>
              <ModelDetailFacts facts={details.overviewFacts} />
            </section>
          ) : null}

          {details?.availabilityFacts?.length ? (
            <section className="models-overview-details-modal__section">
              <h3>Availability</h3>
              <ModelDetailFacts facts={details.availabilityFacts} />
            </section>
          ) : null}

          {details?.capabilities?.length ? (
            <section className="models-overview-details-modal__section">
              <h3>Capabilities</h3>
              <div className="models-overview-details-modal__capabilities">
                {details.capabilities.map((capability) => (
                  <span key={capability}>{capability}</span>
                ))}
              </div>
            </section>
          ) : null}
        </>
      ) : null}
    </PlatformModal>
  );
}
