export const METRONOME_TEMPLATES_02_FRAGMENT = String.raw`	                : kind === "imagine"
	                  ? {
	                      mediaMode: "image",
	                      modelId: METRONOME_IMAGINE_IMAGE_MODEL_OPTIONS[0].id,
	                      imageModelId: METRONOME_IMAGINE_IMAGE_MODEL_OPTIONS[0].id,
	                      videoModelId: METRONOME_IMAGINE_VIDEO_MODEL_OPTIONS[0].id,
	                      prompt: "Create an image from this workflow context.",
	                      templateId: "",
	                      templateName: "",
	                      attachments: [],
	                      attachmentsJson: "[]",
	                      projectId: "",
	                      projectName: "",
	                      agentId: METRONOME_FALLBACK_AGENTS[0].id,
	                      agentName: METRONOME_FALLBACK_AGENTS[0].name,
	                      contextType: "computer",
	                      resource: "computer",
	                      environmentId: METRONOME_FALLBACK_COMPUTERS[0].id,
	                      environmentName: METRONOME_FALLBACK_COMPUTERS[0].name,
	                      inputContextScope: "all",
	                      aspectRatio: "",
	                      ...overrideConfig,
	                    }
		                : kind === "loop"
		                  ? createDefaultMetronomeLoopConfig(normalizedSubtype, overrideConfig)
		                : kind === "function"
		                  ? createDefaultMetronomeFunctionConfig(overrideConfig)
		                : kind === "action"
		                  ? {
		                      message: "Review the current project and propose the next action.",
		                      attachments: [],
		                      agentId: METRONOME_FALLBACK_AGENTS[0].id,
		                      agentName: METRONOME_FALLBACK_AGENTS[0].name,
		                      contextType: "computer",
		                      resource: "computer",
		                      environmentId: METRONOME_FALLBACK_COMPUTERS[0].id,
		                      environmentName: METRONOME_FALLBACK_COMPUTERS[0].name,
		                      inputContextScope: "all",
                          ...createDefaultMetronomeThreadOutputConfig(overrideConfig),
			                      ...overrideConfig,
			                    }
		                : kind === "note"
		                  ? {
		                      note: overrideConfig.note || "Hi",
		                      ...overrideConfig,
		                    }
		                : kind === "approval"
		                  ? {
		                      message: "Approve this workflow step before it continues.",
	                      conditions: normalizeMetronomeApprovalBranches(overrideConfig.conditions),
	                      conditionType: "user_approval",
	                      ...overrideConfig,
	                      conditions: normalizeMetronomeApprovalBranches(overrideConfig.conditions),
	                    }
                : overrideConfig,
            },
          };
          if (kind === "loop") {
            nextNode.style = normalizeMetronomeLoopNodeStyle(overrides.style);
            nextNode.data.label = normalizeMetronomeNodeLabel(overrides.label || meta.label, kind, normalizedSubtype);
            nextNode.data.description = overrides.description || getMetronomeSubtypeLabel(kind, normalizedSubtype);
          } else if (kind === "note") {
            nextNode.style = normalizeMetronomeNoteNodeStyle(overrides.style);
          } else if (overrides.style && typeof overrides.style === "object") {
            nextNode.style = overrides.style;
          }
          if (overrides.parentId || overrides.parentNode) {
            nextNode.parentId = String(overrides.parentId || overrides.parentNode);
            nextNode.extent = overrides.extent || "parent";
          }
          return nextNode;
        }

        function createMetronomeEdge(id, source, target, options = {}) {
          return {
            id,
            source,
            target,
            type: "metronomeOutput",
            ...(options.sourceHandle ? { sourceHandle: options.sourceHandle } : {}),
            ...(options.targetHandle ? { targetHandle: options.targetHandle } : {}),
          };
        }

        function createTriggerOnlyMetronomeGraph(options = {}) {
          const trigger = createMetronomeNode("trigger", { x: 90, y: 260 }, {
            id: "trigger_start",
            subtype: "thread_event",
            label: "Trigger",
            description: "Start when a thread message begins with @workflow.",
            config: {
              triggerType: "thread_event",
              threadCommand: "@workflow",
              promptExtension: "Capture the request, preserve the user's intent, and pass the full context into the workflow.",
            },
          });
          return {
            nodes: [trigger],
            edges: [],
          };
        }

        function createDefaultMetronomeGraph(options = {}) {
          const { nodes: [trigger] } = createTriggerOnlyMetronomeGraph(options);
          const intakeThread = createMetronomeNode("action", { x: 390, y: 260 }, {
            id: "thread_triage_request",
            subtype: "start_thread",
            label: "Thread",
            description: "Ask an agent to classify the request and decide the next path.",
            config: {
              message: "Triage the incoming workflow request. Return a concise summary and include the word READY if the request is actionable. If the request is missing context, explain what is needed.",
              inputContextScope: "all",
            },
          });
          const condition = createMetronomeNode("condition", { x: 720, y: 236 }, {
            id: "condition_request_ready",
            subtype: "previous_output_contains",
            label: "Condition",
            description: "Branch by accumulated workflow context.",
            config: {
              conditionType: "previous_output_contains",
              conditions: [
                { id: "condition-1", label: "Ready", rule: "READY" },
                { id: "else", label: "Default", rule: "" },
              ],
            },
          });
          const executeThread = createMetronomeNode("action", { x: 1060, y: 144 }, {
            id: "thread_execute_work",
            subtype: "start_thread",
            label: "Thread",
            description: "Ask an agent to execute the actionable request.",
            config: {
              message: "Use the workflow context to execute the actionable request. Produce a short run summary with the completed work, files, resources, tickets, or follow-up items.",
              inputContextScope: "all",
            },
          });
          const clarifyThread = createMetronomeNode("action", { x: 1060, y: 344 }, {
            id: "thread_request_clarification",
            subtype: "start_thread",
            label: "Thread",
            description: "Ask an agent to prepare a clarification request.",
            config: {
              message: "Use the workflow context to write a concise clarification request. Ask only for the missing details required to continue.",
              inputContextScope: "all",
            },
          });
          const executeEnd = createMetronomeNode("end", { x: 1390, y: 144 }, {
            id: "end_executed",
            subtype: "complete",
            label: "End",
            description: "Finish after the work path completes.",
            config: {},
          });
          const clarifyEnd = createMetronomeNode("end", { x: 1390, y: 344 }, {
            id: "end_clarification",
            subtype: "complete",
            label: "End",
            description: "Finish after the clarification path completes.",
            config: {},
          });
          return {
            nodes: [trigger, intakeThread, condition, executeThread, clarifyThread, executeEnd, clarifyEnd],
            edges: [
              createMetronomeEdge("edge_trigger_triage", "trigger_start", "thread_triage_request"),
              createMetronomeEdge("edge_triage_condition", "thread_triage_request", "condition_request_ready"),
              createMetronomeEdge("edge_ready_execute", "condition_request_ready", "thread_execute_work", { sourceHandle: "condition-1" }),
              createMetronomeEdge("edge_default_clarify", "condition_request_ready", "thread_request_clarification", { sourceHandle: "else" }),
              createMetronomeEdge("edge_execute_end", "thread_execute_work", "end_executed"),
              createMetronomeEdge("edge_clarify_end", "thread_request_clarification", "end_clarification"),
            ],
          };
        }

        function createProjectReleaseWatchdogMetronomeGraph(options = {}) {
          const projectId = String(options.projectId || "").trim();
          const projectName = String(options.projectName || "").trim();
          const trigger = createMetronomeNode("trigger", { x: 90, y: 260 }, {
            id: "trigger_ticket_review",
            subtype: "project_ticket",
            label: "Trigger",
            config: {
              triggerType: "project_ticket",
              ticketEventType: "status_changed",
              ticketProjectId: projectId,
              ticketProjectName: projectName,
              ticketFromStatus: "in_progress",
              ticketToStatus: "in_review",
            },
          });
          const reviewer = createMetronomeNode("action", { x: 400, y: 260 }, {
            id: "thread_review_ticket",
            config: {
              message: "Review the ticket that moved into review. Check acceptance criteria, implementation notes, linked files, and deployment context. Return CHANGES REQUESTED if work should go back, otherwise return APPROVED with a concise review summary.",
              contextType: projectId ? "project" : "computer",
              projectId,
              projectName,
              inputContextScope: "all",
            },
          });
          const condition = createMetronomeNode("condition", { x: 730, y: 236 }, {
            id: "condition_review_result",
            config: {
              conditionType: "previous_output_contains",
              conditions: [
                { id: "condition-1", label: "Changes requested", rule: "CHANGES REQUESTED" },
                { id: "else", label: "Default", rule: "" },
              ],
            },
          });
          const changeComment = createMetronomeNode("ticket", { x: 1080, y: 132 }, {
            id: "ticket_post_review_changes",
            subtype: "add_ticket_comment",
            config: {
              operation: "add_ticket_comment",
              projectId,
              projectName,
              comment: "Review found changes needed. Use the workflow context and previous review summary to write the exact follow-up comment.",
            },
          });
          const approveStatus = createMetronomeNode("ticket", { x: 1080, y: 344 }, {
            id: "ticket_mark_review_done",
            subtype: "move_ticket_status",
            config: {
              operation: "move_ticket_status",
              projectId,
              projectName,
              ticketStatus: "done",
            },
          });
          const endChanges = createMetronomeNode("end", { x: 1410, y: 132 }, { id: "end_changes_requested" });
          const endApproved = createMetronomeNode("end", { x: 1410, y: 344 }, { id: "end_review_approved" });
          return {
            nodes: [trigger, reviewer, condition, changeComment, approveStatus, endChanges, endApproved],
            edges: [
              createMetronomeEdge("edge_ticket_review_thread", "trigger_ticket_review", "thread_review_ticket"),
              createMetronomeEdge("edge_review_condition", "thread_review_ticket", "condition_review_result"),
              createMetronomeEdge("edge_review_changes_comment", "condition_review_result", "ticket_post_review_changes", { sourceHandle: "condition-1" }),
              createMetronomeEdge("edge_review_approved_status", "condition_review_result", "ticket_mark_review_done", { sourceHandle: "else" }),
              createMetronomeEdge("edge_changes_end", "ticket_post_review_changes", "end_changes_requested"),
              createMetronomeEdge("edge_approved_end", "ticket_mark_review_done", "end_review_approved"),
            ],
          };
        }

        function createCampaignAssetFactoryMetronomeGraph(options = {}) {
          const projectId = String(options.projectId || "").trim();
          const projectName = String(options.projectName || "").trim();
          const trigger = createMetronomeNode("trigger", { x: 90, y: 260 }, {
            id: "trigger_campaign_command",
            subtype: "thread_event",
            config: {
              triggerType: "thread_event",
              threadCommand: "@campaign",
              promptExtension: "Treat this as a campaign production brief. Preserve brand constraints, audience, offer, channels, and deadline.",
            },
          });
          const imagine = createMetronomeNode("imagine", { x: 390, y: 260 }, {
            id: "imagine_campaign_assets",
            config: {
              mediaMode: "image",
              prompt: "Create campaign-ready image concepts from the workflow brief. Use brand-forward composition, strong visual hierarchy, and enough negative space for copy.",
              templateId: "fashion-campaigns",
              templateName: "Fashion campaigns",
              projectId,
              projectName,
              inputContextScope: "all",
            },
          });
          const qualityReview = createMetronomeNode("action", { x: 720, y: 260 }, {
            id: "thread_campaign_quality_review",
            config: {
              message: "Review the generated campaign assets against the brief. Return REVISION if the assets need another pass, otherwise return READY with launch notes and suggested copy.",
              contextType: projectId ? "project" : "computer",
              projectId,
              projectName,
              inputContextScope: "all",
            },
          });
          const condition = createMetronomeNode("condition", { x: 1050, y: 236 }, {
            id: "condition_campaign_ready",
            config: {
              conditionType: "previous_output_contains",
              conditions: [
                { id: "condition-1", label: "Revision", rule: "REVISION" },
                { id: "else", label: "Default", rule: "" },
              ],
            },
          });
          const revisionThread = createMetronomeNode("action", { x: 1390, y: 132 }, {
            id: "thread_campaign_revision",
            config: {
              message: "Turn the review notes into a precise revision brief for the next asset generation pass.",
              contextType: projectId ? "project" : "computer",
              projectId,
              projectName,
              inputContextScope: "all",
            },
          });
          const launchThread = createMetronomeNode("action", { x: 1390, y: 344 }, {
            id: "thread_campaign_launch_pack",
            config: {
              message: "Prepare the launch handoff: final asset summary, copy options, channel recommendations, and next steps.",
              contextType: projectId ? "project" : "computer",
              projectId,
              projectName,
              inputContextScope: "all",
            },
          });
          const endRevision = createMetronomeNode("end", { x: 1720, y: 132 }, { id: "end_campaign_revision" });
          const endLaunch = createMetronomeNode("end", { x: 1720, y: 344 }, { id: "end_campaign_ready" });
          return {
            nodes: [trigger, imagine, qualityReview, condition, revisionThread, launchThread, endRevision, endLaunch],
            edges: [
              createMetronomeEdge("edge_campaign_trigger_imagine", "trigger_campaign_command", "imagine_campaign_assets"),
              createMetronomeEdge("edge_campaign_imagine_review", "imagine_campaign_assets", "thread_campaign_quality_review"),
              createMetronomeEdge("edge_campaign_review_condition", "thread_campaign_quality_review", "condition_campaign_ready"),
              createMetronomeEdge("edge_campaign_revision", "condition_campaign_ready", "thread_campaign_revision", { sourceHandle: "condition-1" }),
              createMetronomeEdge("edge_campaign_launch", "condition_campaign_ready", "thread_campaign_launch_pack", { sourceHandle: "else" }),
              createMetronomeEdge("edge_campaign_revision_end", "thread_campaign_revision", "end_campaign_revision"),
              createMetronomeEdge("edge_campaign_launch_end", "thread_campaign_launch_pack", "end_campaign_ready"),
            ],
          };
        }

        function createInboundResearchTriageMetronomeGraph(options = {}) {
          const projectId = String(options.projectId || "").trim();
          const projectName = String(options.projectName || "").trim();
          const trigger = createMetronomeNode("trigger", { x: 90, y: 260 }, {
            id: "trigger_research_email",
            subtype: "email",
            config: {
              triggerType: "email",
              emailLocalPart: "research",
              emailAddress: buildMetronomeEmailAddress("research"),
              subjectContains: "",
              bodyContains: "",
              promptExtension: "Treat this email as an inbound research request. Extract the ask, urgency, stakeholder, and deliverable format.",
            },
          });
          const researchThread = createMetronomeNode("action", { x: 400, y: 260 }, {
            id: "thread_research_summary",
            config: {
              message: "Research the inbound request, collect useful sources, and produce an executive summary. Return NEEDS HUMAN REVIEW if the request requires approval, pricing judgment, legal review, or unclear scope.",
              contextType: projectId ? "project" : "computer",
              projectId,
              projectName,
              inputContextScope: "all",
            },
          });
          const condition = createMetronomeNode("condition", { x: 735, y: 236 }, {
            id: "condition_research_review",
            config: {
              conditionType: "previous_output_contains",
              conditions: [
                { id: "condition-1", label: "Human review", rule: "NEEDS HUMAN REVIEW" },
                { id: "else", label: "Default", rule: "" },
              ],
            },
          });
          const reviewTicket = createMetronomeNode("ticket", { x: 1080, y: 132 }, {
            id: "ticket_research_review",
            subtype: "add_subtask",
            config: {
              operation: "add_subtask",
              projectId,
              projectName,
              subtaskTitle: "Review inbound research request",
              subtaskInstructions: "Create a focused human review task from the research summary and include the unresolved decision.",
            },
          });
          const responseThread = createMetronomeNode("action", { x: 1080, y: 344 }, {
            id: "thread_research_response",
            config: {
              message: "Draft a concise response to the requester with the research summary, source links, and recommended next action.",
              contextType: projectId ? "project" : "computer",
              projectId,
              projectName,
              inputContextScope: "all",
            },
          });
          const endReview = createMetronomeNode("end", { x: 1410, y: 132 }, { id: "end_research_review" });
          const endResponse = createMetronomeNode("end", { x: 1410, y: 344 }, { id: "end_research_response" });
          return {
            nodes: [trigger, researchThread, condition, reviewTicket, responseThread, endReview, endResponse],
            edges: [
              createMetronomeEdge("edge_research_email_thread", "trigger_research_email", "thread_research_summary"),
              createMetronomeEdge("edge_research_thread_condition", "thread_research_summary", "condition_research_review"),
              createMetronomeEdge("edge_research_review_ticket", "condition_research_review", "ticket_research_review", { sourceHandle: "condition-1" }),
              createMetronomeEdge("edge_research_response_thread", "condition_research_review", "thread_research_response", { sourceHandle: "else" }),
              createMetronomeEdge("edge_research_review_end", "ticket_research_review", "end_research_review"),
              createMetronomeEdge("edge_research_response_end", "thread_research_response", "end_research_response"),
            ],
          };
        }

        function createDatabaseEnrichmentLoopMetronomeGraph(options = {}) {
          const trigger = createMetronomeNode("trigger", { x: 90, y: 260 }, {
            id: "trigger_database_document",
            subtype: "database_entry",
            config: {
              triggerType: "database_entry",
              databaseEventType: "document_created",
              databaseCollection: "inbound",
              promptExtension: "Treat the new document as a record that should be validated, enriched, and written back with a clear confidence signal.",
            },
          });
          const enrichmentFunction = createMetronomeNode("function", { x: 410, y: 260 }, {
            id: "function_enrich_record",
            subtype: "invoke_function",
            config: {
              functionName: "enrich-record",
              payloadJson: "{\n  \"record\": \"{{ input }}\",\n  \"source\": \"metronome\"\n}",
            },
          });
          const condition = createMetronomeNode("condition", { x: 735, y: 236 }, {
            id: "condition_enrichment_confidence",
            config: {
              conditionType: "previous_output_contains",
              conditions: [
                { id: "condition-1", label: "Low confidence", rule: "LOW CONFIDENCE" },
                { id: "else", label: "Default", rule: "" },
              ],
            },
          });
          const verificationThread = createMetronomeNode("action", { x: 1080, y: 132 }, {
            id: "thread_verify_record",
            config: {
              message: "Manually inspect the enriched record. Resolve missing fields if possible and summarize whether it is safe to write back.",
              inputContextScope: "all",
            },
          });
          const updateReviewed = createMetronomeNode("database", { x: 1410, y: 132 }, {
            id: "database_update_reviewed_record",
            subtype: "update_document",
            config: {
              collection: "inbound",
              databaseCollection: "inbound",
              documentId: "{{ input.documentId }}",
              documentJson: "{\n  \"status\": \"reviewed\",\n  \"summary\": \"{{ input }}\"\n}",
            },
          });
          const updateEnriched = createMetronomeNode("database", { x: 1080, y: 344 }, {
            id: "database_update_enriched_record",
            subtype: "update_document",
            config: {
              collection: "inbound",
              databaseCollection: "inbound",
              documentId: "{{ input.documentId }}",
              documentJson: "{\n  \"status\": \"enriched\",\n  \"payload\": \"{{ input }}\"\n}",
            },
          });
          const endReviewed = createMetronomeNode("end", { x: 1740, y: 132 }, { id: "end_database_reviewed" });
          const endEnriched = createMetronomeNode("end", { x: 1410, y: 344 }, { id: "end_database_enriched" });
          return {
            nodes: [trigger, enrichmentFunction, condition, verificationThread, updateReviewed, updateEnriched, endReviewed, endEnriched],
            edges: [
              createMetronomeEdge("edge_database_trigger_function", "trigger_database_document", "function_enrich_record"),
              createMetronomeEdge("edge_function_condition", "function_enrich_record", "condition_enrichment_confidence"),
              createMetronomeEdge("edge_low_confidence_thread", "condition_enrichment_confidence", "thread_verify_record", { sourceHandle: "condition-1" }),
              createMetronomeEdge("edge_verified_database", "thread_verify_record", "database_update_reviewed_record"),
              createMetronomeEdge("edge_confident_database", "condition_enrichment_confidence", "database_update_enriched_record", { sourceHandle: "else" }),
              createMetronomeEdge("edge_reviewed_end", "database_update_reviewed_record", "end_database_reviewed"),
              createMetronomeEdge("edge_enriched_end", "database_update_enriched_record", "end_database_enriched"),
            ],
          };
        }

        function createRestaurantHyperEnrichmentMetronomeGraph(options = {}) {
          const projectId = String(options.projectId || "").trim();
          const projectName = String(options.projectName || "").trim();
          const workspaceConfig = projectId
            ? { contextType: "project", resource: "project", projectId, projectName }
            : { contextType: "computer", resource: "computer" };
          const trigger = createMetronomeNode("trigger", { x: 90, y: 300 }, {
            id: "trigger_restaurant_csv",
            subtype: "thread_event",
            label: "CSV Input",
            description: "Start from @restaurant-enrichment with an attached restaurant CSV.",
            config: {
              triggerType: "thread_event",
              threadCommand: "@restaurant-enrichment",
              promptExtension: "Use the attached restaurant CSV as the batch input. Preserve Record ID, Company name, Website URL, Country, and City.",
            },
          });
          const table = createMetronomeNode("table", { x: 390, y: 300 }, {
            id: "table_parse_restaurants",
            subtype: "parse_csv",
            label: "Parse CSV",
            description: "Convert the uploaded CSV into restaurant records and batches of 5.",
            config: {
              operation: "parse_csv",
              inputBinding: "workflow.trigger.input.files",
              hasHeader: true,
              batchSize: 5,
              outputKey: "restaurant_table",
            },
          });
          const loop = createMetronomeNode("loop", { x: 700, y: 140 }, {
            id: "loop_restaurant_batches",
            subtype: "input_items",
            label: "Batch Loop",
            description: "Loop through CSV batches so search and extraction can short-circuit per batch.",
            style: { width: 1080, height: 360 },
            config: {
              loopType: "input_items",
              inputBinding: "previous.restaurant_table.batches",
              maxIterations: 500,
              progressSignal: "Each iteration should produce menu-detection records for the current batch.",
              successCriteria: "Every input restaurant in the batch has a structured output record.",
              noProgressLimit: 3,
            },
          });
          const search = createMetronomeNode("firecrawl", { x: 74, y: 128 }, {
            id: "firecrawl_find_menu_pages",
            parentId: "loop_restaurant_batches",
            subtype: "web_search",
            label: "Find Menus",
            description: "Search the web for official menu pages for the current restaurant batch.",
            config: {
              operation: "web_search",
              inputBinding: "current.records",
              query: [
                "Find official menu pages for these restaurants. Prefer official websites, menu URLs, PDF menus, ordering pages, and image menu pages.",
                "Return result pages that help determine whether a menu exists online.",
                "Batch records:",
                "{{ input }}",
              ].join("\\n"),
              limit: 8,
              outputKey: "menu_search",
            },
          });
          const detectMenus = createMetronomeNode("action", { x: 404, y: 128 }, {
            id: "thread_detect_menus",
            parentId: "loop_restaurant_batches",
            subtype: "start_thread",
            label: "Detect Menus",
            description: "Map search results back to the batch and produce structured menu-detection records.",
            config: {
              ...workspaceConfig,
              message: [
                "You are processing one batch in a restaurant enrichment workflow.",
                "Use the current batch records and Firecrawl search results to produce exactly one output record per input restaurant.",
                "Do not invent menu URLs. If the evidence is weak, set menu_found to false and explain briefly.",
                "Preserve the input Record ID / record_id, company name, website URL, country, and city.",
              ].join("\\n"),
              inputContextScope: "all",
              outputMode: "structured",
              requireJsonOutput: true,
              outputKey: "menu_detection",
              outputContractJson: JSON.stringify({
                summary: "",
                records: [
                  {
                    record_id: "",
                    company_name: "",
                    website_url: "",
                    country: "",
                    city: "",
                    menu_found: false,
                    menu_url: null,
                    menu_source_type: null,
                    confidence: 0,
                    evidence_urls: [],
                    notes: "",
                  },
                ],
              }, null, 2),
            },
          });
          const persist = createMetronomeNode("database", { x: 734, y: 128 }, {
            id: "database_upsert_menu_detection",
            parentId: "loop_restaurant_batches",
            subtype: "upsert_many_documents",
            label: "Persist Batch",
            description: "Write structured menu-detection records into a Computer Agents database collection.",
            config: {
              operation: "upsert_many_documents",
              collection: "restaurant_enrichment",
              databaseCollection: "restaurant_enrichment",
              recordsBinding: "previous.menu_detection.records",
              upsertKey: "record_id",
              documentTemplateJson: JSON.stringify({
                step: "menu_detection",
                source: "metronome.restaurant_hyper_enrichment",
                record_id: "{{ input.record_id }}",
                company_name: "{{ input.company_name }}",
                menu_found: "{{ input.menu_found }}",
                menu_url: "{{ input.menu_url }}",
                payload: "{{ input }}",
              }, null, 2),
              outputKey: "persisted_menu_detection",
            },
          });
          const report = createMetronomeNode("action", { x: 1840, y: 620 }, {
            id: "thread_restaurant_run_report",
            subtype: "start_thread",
            label: "Run Report",
            description: "Summarize the batch run and list remaining production steps.",
            config: {
              ...workspaceConfig,
              message: [
                "Summarize this restaurant enrichment workflow run from the structured workflow context.",
                "Report parsed rows, processed batches, menu_found count if available, persisted records, failures, and next implementation steps for extraction, enrichment, outcome.csv, cost report, and accuracy report.",
              ].join("\\n"),
              inputContextScope: "all",
              outputMode: "structured",
              requireJsonOutput: true,
              outputKey: "run_report",
              outputContractJson: JSON.stringify({
                summary: "",
                parsed_rows: null,
                processed_batches: null,
                menu_found_count: null,
                persisted_records: null,
                failures: [],
                next_steps: [],
              }, null, 2),
            },
          });
          const done = createMetronomeNode("end", { x: 2160, y: 620 }, {
            id: "end_restaurant_enrichment",
            subtype: "complete",
            label: "End",
            description: "Finish after the run report is produced.",
            config: {},
          });
          return {
            nodes: [trigger, table, loop, search, detectMenus, persist, report, done],
            edges: [
              createMetronomeEdge("edge_restaurant_trigger_table", "trigger_restaurant_csv", "table_parse_restaurants"),
              createMetronomeEdge("edge_restaurant_table_loop", "table_parse_restaurants", "loop_restaurant_batches", { targetHandle: "loop-left" }),
              createMetronomeEdge("edge_restaurant_loop_search", "loop_restaurant_batches", "firecrawl_find_menu_pages", { sourceHandle: "loop-left", targetHandle: "node-input" }),
              createMetronomeEdge("edge_restaurant_search_detect", "firecrawl_find_menu_pages", "thread_detect_menus"),
              createMetronomeEdge("edge_restaurant_detect_persist", "thread_detect_menus", "database_upsert_menu_detection"),
              createMetronomeEdge("edge_restaurant_persist_loop_end", "database_upsert_menu_detection", "loop_restaurant_batches", { sourceHandle: "node-output", targetHandle: "loop-right" }),
              createMetronomeEdge("edge_restaurant_loop_report", "loop_restaurant_batches", "thread_restaurant_run_report", { sourceHandle: "loop-right", targetHandle: "node-input" }),
              createMetronomeEdge("edge_restaurant_report_end", "thread_restaurant_run_report", "end_restaurant_enrichment"),
            ],
          };
        }

        function createCustomerSupportEmailTemplateMetronomeGraph(options = {}) {
          const projectId = String(options.projectId || "").trim();
          const projectName = String(options.projectName || "").trim();
          const workspaceConfig = projectId
            ? { contextType: "project", resource: "project", projectId, projectName }
            : { contextType: "computer", resource: "computer" };
          const trigger = createMetronomeNode("trigger", { x: 90, y: 280 }, {
            id: "trigger_support_email",
            subtype: "email",
            label: "Support Email",
            description: "Start when a customer support email arrives.",
            config: {
              triggerType: "email",
              emailLocalPart: "support",
              emailAddress: buildMetronomeEmailAddress("support"),
              subjectContains: "",
              bodyContains: "",
              promptExtension: "Treat this email as a customer support request. Extract requester, account, urgency, product area, promised SLA, and the exact question before drafting.",
            },
          });
          const classify = createMetronomeNode("action", { x: 405, y: 280 }, {
            id: "thread_support_classify",
            subtype: "start_thread",
            label: "Classify",
            description: "Classify intent, urgency, account, and product area.",
            config: {
              ...workspaceConfig,
              message: "Classify the incoming support email. Return intent, urgency, customer/account, product area, blockers, and whether the case can be answered from available project context.",
              inputContextScope: "all",
            },
          });
          const research = createMetronomeNode("action", { x: 735, y: 280 }, {
            id: "thread_support_research",
            subtype: "start_thread",
            label: "Research",
            description: "Search project files, knowledge sources, and connected resources.",
            config: {
              ...workspaceConfig,
              message: "Search the project context and connected resources for the support answer. Include exact references, source file names, prior decisions, and missing information.",
              inputContextScope: "all",
            },
          });
          const draft = createMetronomeNode("action", { x: 1065, y: 280 }, {
            id: "thread_support_draft_reply",
            subtype: "start_thread",
            label: "Draft Reply",
            description: "Draft a customer-ready answer with evidence and next steps.",
            config: {
              ...workspaceConfig,
              message: "Draft a concise support reply. Use a helpful tone, cite the evidence gathered, list concrete next steps, and return NEEDS REVIEW if confidence is low, the answer affects billing/legal/security, or source context is missing.",
              inputContextScope: "all",
            },
          });
          const reviewGate = createMetronomeNode("condition", { x: 1395, y: 256 }, {
            id: "condition_support_review_needed",
            label: "Review Gate",
            description: "Route low-confidence replies to human review.",
            config: {
              conditionType: "previous_output_contains",
              conditions: [
                { id: "condition-1", label: "Needs review", rule: "NEEDS REVIEW" },
                { id: "else", label: "Ready", rule: "" },
              ],
            },
          });
          const reviewTask = createMetronomeNode("ticket", { x: 1740, y: 132 }, {
            id: "ticket_support_human_review",
            subtype: "add_subtask",
            label: "Review Task",
            description: "Create a review task for uncertain support replies.",
            config: {
              operation: "add_subtask",
              projectId,
              projectName,
              subtaskTitle: "Review support reply",
              subtaskInstructions: "Review the drafted support reply, fill missing context, and approve the final response before it is sent.",
            },
          });
          const sendReply = createMetronomeNode("action", { x: 1740, y: 380 }, {
            id: "thread_support_send_reply",
            subtype: "start_thread",
            label: "Send Reply",
            description: "Prepare the approved response for delivery back to the customer.",
            config: {
              ...workspaceConfig,
              message: "Prepare the final customer reply from the approved draft. Include the response, evidence summary, and any follow-up task that should be tracked.",
              inputContextScope: "all",
            },
          });
          const reviewEnd = createMetronomeNode("end", { x: 2070, y: 132 }, { id: "end_support_review" });
          const sentEnd = createMetronomeNode("end", { x: 2070, y: 380 }, { id: "end_support_sent" });
          return {
            nodes: [trigger, classify, research, draft, reviewGate, reviewTask, sendReply, reviewEnd, sentEnd],
            edges: [
              createMetronomeEdge("edge_support_email_classify", "trigger_support_email", "thread_support_classify"),
              createMetronomeEdge("edge_support_classify_research", "thread_support_classify", "thread_support_research"),
              createMetronomeEdge("edge_support_research_draft", "thread_support_research", "thread_support_draft_reply"),
              createMetronomeEdge("edge_support_draft_gate", "thread_support_draft_reply", "condition_support_review_needed"),
              createMetronomeEdge("edge_support_gate_review", "condition_support_review_needed", "ticket_support_human_review", { sourceHandle: "condition-1" }),
              createMetronomeEdge("edge_support_gate_send", "condition_support_review_needed", "thread_support_send_reply", { sourceHandle: "else" }),
              createMetronomeEdge("edge_support_review_end", "ticket_support_human_review", "end_support_review"),
              createMetronomeEdge("edge_support_send_end", "thread_support_send_reply", "end_support_sent"),
            ],
          };
        }

        function createWeeklyExecutiveBriefingTemplateMetronomeGraph(options = {}) {
          const projectId = String(options.projectId || "").trim();
          const projectName = String(options.projectName || "").trim();
          const workspaceConfig = projectId
            ? { contextType: "project", resource: "project", projectId, projectName }
            : { contextType: "computer", resource: "computer" };
          const trigger = createMetronomeNode("trigger", { x: 90, y: 280 }, {
            id: "trigger_weekly_briefing_schedule",
            subtype: "periodic",
            label: "Weekly Schedule",
            description: "Run every Monday morning.",
            config: {
              triggerType: "periodic",
              scheduleType: "recurring",
              schedulePresetId: "weekly",
              cronExpression: "0 9 * * 1",
              scheduledTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
              promptExtension: "Prepare a weekly executive briefing for the project using activity, metrics, files, and external changes.",
            },
          });
          const activity = createMetronomeNode("action", { x: 405, y: 280 }, {
            id: "thread_briefing_activity",
            subtype: "start_thread",
            label: "Activity",
            description: "Collect recent project activity.",
            config: {
              ...workspaceConfig,
              message: "Collect recent project activity: completed tickets, open risks, decisions, run summaries, releases, and notable conversations from the last week.",
              inputContextScope: "all",
            },
          });
          const metrics = createMetronomeNode("action", { x: 735, y: 280 }, {
            id: "thread_briefing_metrics",
            subtype: "start_thread",
            label: "Metrics",
            description: "Read KPI files and dashboards.",
            config: {
              ...workspaceConfig,
              message: "Read KPI files, dashboards, and project resources. Extract headline metrics, deltas, anomalies, and missing data that leadership should know about.",
              inputContextScope: "all",
            },
          });
          const research = createMetronomeNode("action", { x: 1065, y: 280 }, {
            id: "thread_briefing_external_context",
            subtype: "start_thread",
            label: "External Context",
            description: "Research external changes if needed.",
            config: {
              ...workspaceConfig,
              message: "Research external market, competitor, customer, or dependency changes that affect this project. Keep only decision-relevant signals.",
              inputContextScope: "all",
            },
          });
          const writeBrief = createMetronomeNode("action", { x: 1395, y: 280 }, {
            id: "thread_briefing_write",
            subtype: "start_thread",
            label: "Write Brief",
            description: "Write a concise weekly executive brief.",
            config: {
              ...workspaceConfig,
              message: "Write the weekly executive brief with: headline summary, progress, key metrics, risks, decisions needed, and next actions. Keep it concise and scannable.",
              inputContextScope: "all",
            },
          });
          const actionItems = createMetronomeNode("ticket", { x: 1725, y: 280 }, {
            id: "ticket_briefing_action_items",
            subtype: "add_subtask",
            label: "Action Items",
            description: "Create follow-up work from briefing actions.",
            config: {
              operation: "add_subtask",
              projectId,
              projectName,
              subtaskTitle: "Follow up on weekly executive briefing",
              subtaskInstructions: "Create focused follow-up tasks for any decisions, risks, or action items called out in the weekly brief.",
            },
          });
          const done = createMetronomeNode("end", { x: 2055, y: 280 }, { id: "end_weekly_briefing" });
          return {
            nodes: [trigger, activity, metrics, research, writeBrief, actionItems, done],
            edges: [
              createMetronomeEdge("edge_briefing_schedule_activity", "trigger_weekly_briefing_schedule", "thread_briefing_activity"),
              createMetronomeEdge("edge_briefing_activity_metrics", "thread_briefing_activity", "thread_briefing_metrics"),
              createMetronomeEdge("edge_briefing_metrics_research", "thread_briefing_metrics", "thread_briefing_external_context"),
              createMetronomeEdge("edge_briefing_research_write", "thread_briefing_external_context", "thread_briefing_write"),
              createMetronomeEdge("edge_briefing_write_actions", "thread_briefing_write", "ticket_briefing_action_items"),
              createMetronomeEdge("edge_briefing_actions_end", "ticket_briefing_action_items", "end_weekly_briefing"),
            ],
          };
        }

        function createCampaignContentCalendarTemplateMetronomeGraph(options = {}) {
          const projectId = String(options.projectId || "").trim();
          const projectName = String(options.projectName || "").trim();
          const workspaceConfig = projectId
            ? { contextType: "project", resource: "project", projectId, projectName }
            : { contextType: "computer", resource: "computer" };
          const trigger = createMetronomeNode("trigger", { x: 90, y: 280 }, {
            id: "trigger_campaign_calendar_schedule",
            subtype: "periodic",
            label: "Campaign Schedule",
            description: "Run weekly during the campaign.",
            config: {
              triggerType: "periodic",
              scheduleType: "recurring",
              schedulePresetId: "weekly",
              cronExpression: "0 10 * * 1",
              scheduledTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
              promptExtension: "Plan campaign content for the next week. Preserve audience, offer, launch date, channels, brand constraints, and review requirements.",
            },
          });
          const brief = createMetronomeNode("action", { x: 405, y: 280 }, {
            id: "thread_campaign_read_brief",
            subtype: "start_thread",
            label: "Read Brief",
            description: "Read the campaign brief and constraints.",
            config: {
              ...workspaceConfig,
              message: "Read the campaign brief, launch plan, target audience, offer, channel constraints, and prior performance notes. Return the working content strategy for this week.",
              inputContextScope: "all",
            },
          });
          const ideas = createMetronomeNode("action", { x: 735, y: 280 }, {
            id: "thread_campaign_content_ideas",
            subtype: "start_thread",
            label: "Ideas",
            description: "Generate weekly content ideas.",
            config: {
              ...workspaceConfig,
              message: "Generate a weekly content plan with post ideas, channels, intended audience, goal, CTA, and required assets.",
              inputContextScope: "all",
            },
          });
          const creative = createMetronomeNode("imagine", { x: 1065, y: 280 }, {
            id: "imagine_campaign_creative_prompts",
            label: "Creative Prompts",
            description: "Draft image prompts for campaign creative.",
            config: {
              mediaMode: "image",
              prompt: "Create campaign creative concepts for the weekly content plan. Keep composition brand-forward, conversion-focused, and channel-ready.",
              templateId: "fashion-campaigns",
              templateName: "Fashion campaigns",
              projectId,
              projectName,
              inputContextScope: "all",
            },
          });
          const posts = createMetronomeNode("action", { x: 1395, y: 280 }, {
            id: "thread_campaign_draft_posts",
            subtype: "start_thread",
            label: "Draft Posts",
            description: "Draft posts and campaign copy.",
            config: {
              ...workspaceConfig,
              message: "Draft channel-specific posts from the content plan and creative prompts. Include headline, caption, CTA, asset direction, and review notes.",
              inputContextScope: "all",
            },
          });
          const approvalTask = createMetronomeNode("ticket", { x: 1725, y: 176 }, {
            id: "ticket_campaign_approval",
            subtype: "add_subtask",
            label: "Approval Task",
            description: "Create approval tasks for the content calendar.",
            config: {
              operation: "add_subtask",
              projectId,
              projectName,
              subtaskTitle: "Approve weekly campaign content",
              subtaskInstructions: "Review the generated content calendar, copy, and creative prompts. Approve, request revisions, or assign channel owners.",
            },
          });
          const performanceReview = createMetronomeNode("ticket", { x: 1725, y: 390 }, {
            id: "ticket_campaign_performance_review",
            subtype: "add_subtask",
            label: "Performance Review",
            description: "Schedule follow-up review after launch.",
            config: {
              operation: "add_subtask",
              projectId,
              projectName,
              subtaskTitle: "Review campaign content performance",
              subtaskInstructions: "After the campaign window, review performance by channel and create next-week content recommendations.",
            },
          });
          const approvalEnd = createMetronomeNode("end", { x: 2055, y: 176 }, { id: "end_campaign_approval_ready" });
          const reviewEnd = createMetronomeNode("end", { x: 2055, y: 390 }, { id: "end_campaign_review_scheduled" });
          return {
            nodes: [trigger, brief, ideas, creative, posts, approvalTask, performanceReview, approvalEnd, reviewEnd],
            edges: [
              createMetronomeEdge("edge_campaign_calendar_brief", "trigger_campaign_calendar_schedule", "thread_campaign_read_brief"),
              createMetronomeEdge("edge_campaign_brief_ideas", "thread_campaign_read_brief", "thread_campaign_content_ideas"),
              createMetronomeEdge("edge_campaign_ideas_creative", "thread_campaign_content_ideas", "imagine_campaign_creative_prompts"),
              createMetronomeEdge("edge_campaign_creative_posts", "imagine_campaign_creative_prompts", "thread_campaign_draft_posts"),
              createMetronomeEdge("edge_campaign_posts_approval", "thread_campaign_draft_posts", "ticket_campaign_approval"),
              createMetronomeEdge("edge_campaign_posts_review", "thread_campaign_draft_posts", "ticket_campaign_performance_review"),
              createMetronomeEdge("edge_campaign_approval_end", "ticket_campaign_approval", "end_campaign_approval_ready"),
              createMetronomeEdge("edge_campaign_review_end", "ticket_campaign_performance_review", "end_campaign_review_scheduled"),
            ],
          };
        }

`;
