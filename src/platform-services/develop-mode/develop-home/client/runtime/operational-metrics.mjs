export const DEVELOP_HOME_OPERATIONAL_METRICS_SCRIPT = `        const loadDevelopServerOperationalMetrics = useCallback(async function loadDevelopServerOperationalMetrics(options = {}) {
          if (!hasRealAccess) {
            setDevelopServerOperationalMetrics(null);
            setDevelopServerOperationalMetricsError("");
            return;
          }

          const rawTargetKind = String(options?.resourceKind || "").trim();
          const targetKind = rawTargetKind ? canonicalizePlaygroundServerKind(rawTargetKind) : "";
          const requestedPeriod = normalizePlaygroundEnvironmentHomeChartPeriod(options?.period);
          const requestKey = (targetKind || "overview") + ":" + requestedPeriod;
          const loadSequence = developServerOperationalMetricsLoadSequenceRef.current + 1;
          developServerOperationalMetricsLoadSequenceRef.current = loadSequence;
          developServerOperationalMetricsRequestKeyRef.current = requestKey;
          if (developServerOperationalMetricsAbortRef.current) {
            developServerOperationalMetricsAbortRef.current.abort();
          }
          const requestController = new AbortController();
          developServerOperationalMetricsAbortRef.current = requestController;
          const isCurrentLoad = () => (
            !requestController.signal.aborted
            && developServerOperationalMetricsLoadSequenceRef.current === loadSequence
          );
          const databaseResourceScopeKey = buildPlaygroundDatabaseListScopeKey(
            proxyBackendBase,
            authRequestHeaders,
            databaseListIdentity
          );

          const buildOperationalBuckets = () => {
            const isHourly = requestedPeriod === "day";
            const bucketCount = isHourly ? 24 : requestedPeriod === "week" ? 7 : 30;
            const bucketDurationMs = isHourly ? 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
            const formatter = new Intl.DateTimeFormat("en-US", isHourly
              ? { hour: "numeric" }
              : requestedPeriod === "week"
                ? { weekday: "short" }
                : { month: "short", day: "numeric" });
            const anchor = new Date();
            if (isHourly) {
              anchor.setUTCMinutes(0, 0, 0);
            } else {
              anchor.setUTCHours(0, 0, 0, 0);
            }
            const getBucketKey = (value) => {
              const date = new Date(value);
              if (!Number.isFinite(date.getTime())) {
                return "";
              }
              return date.toISOString().slice(0, isHourly ? 13 : 10);
            };
            const buckets = Array.from({ length: bucketCount }, (_, index) => {
              const date = new Date(anchor.getTime() - ((bucketCount - 1 - index) * bucketDurationMs));
              return {
                key: getBucketKey(date),
                label: formatter.format(date),
                startMs: date.getTime(),
                hostingRequests: 0,
                apiRequests: 0,
                functionCalls: 0,
                databaseReads: 0,
                databaseWrites: 0,
                agentRuntimeRuns: 0,
                voiceCalls: 0,
                secretReads: 0,
                authEvents: 0,
                paymentCheckoutSessions: 0,
                computeTokens: 0,
                errors: 0,
              };
            });
            return {
              buckets,
              bucketByKey: new Map(buckets.map((bucket) => [bucket.key, bucket])),
              bucketIndexByKey: new Map(buckets.map((bucket, index) => [bucket.key, index])),
              bucketDurationMs,
              getBucketKey,
            };
          };
          const readAnalyticsResponse = async (path) => {
            const normalizedAnalyticsPath = String(path || "");
            const isDatabaseAnalyticsPath = normalizedAnalyticsPath.startsWith("/databases/");
            const isServerOverviewAnalyticsPath = normalizedAnalyticsPath.startsWith("/servers/analytics/overview");
            if (isDatabaseAnalyticsPath || isServerOverviewAnalyticsPath) {
              try {
                return await fetchPlaygroundCachedDatabaseResourceJson(
                  proxyBackendBase + path,
                  authRequestHeaders,
                  {
                    scopeKey: databaseResourceScopeKey,
                    ttlMs: PLAYGROUND_DATABASE_ANALYTICS_CACHE_TTL_MS,
                    priority: "low",
                    persist: isServerOverviewAnalyticsPath,
                    staleWhileRevalidate: isServerOverviewAnalyticsPath,
                  }
                );
              } catch {
                return null;
              }
            }
            const response = await fetch(proxyBackendBase + path, {
              method: "GET",
              headers: authRequestHeaders,
              signal: requestController.signal,
              priority: "low",
            });
            const data = await response.json().catch(() => ({}));
            if (isUnauthorizedStatus(response.status)) {
              triggerPlatformSessionRecovery();
              return null;
            }
            if (!response.ok) {
              return null;
            }
            return data;
          };
          const readFirstAnalyticsArray = (candidates) => {
            const match = (Array.isArray(candidates) ? candidates : []).find(Array.isArray);
            return Array.isArray(match) ? match : [];
          };
          const readOverviewResources = (payload) => readFirstAnalyticsArray([
            payload?.analytics?.resources,
            payload?.data?.analytics?.resources,
            payload?.data?.resources,
            payload?.resources,
            Array.isArray(payload?.data) ? payload.data : null,
          ]);
          const readOverviewResourceRecord = (resource) => {
            const record = resource?.server || resource?.database || resource?.resource || resource;
            return record && typeof record === "object" && !Array.isArray(record) ? record : {};
          };
          const readResourceChartBuckets = (resource, primaryKey, legacyKey) => {
            const record = readOverviewResourceRecord(resource);
            return readFirstAnalyticsArray([
              resource?.[primaryKey],
              resource?.charts?.[primaryKey],
              resource?.analytics?.charts?.[primaryKey],
              resource?.data?.charts?.[primaryKey],
              record?.[primaryKey],
              record?.charts?.[primaryKey],
              record?.analytics?.charts?.[primaryKey],
              resource?.[legacyKey],
              resource?.charts?.[legacyKey],
              resource?.analytics?.charts?.[legacyKey],
              resource?.data?.charts?.[legacyKey],
              record?.[legacyKey],
              record?.charts?.[legacyKey],
              record?.analytics?.charts?.[legacyKey],
            ]);
          };

          setDevelopServerOperationalMetricsLoading(true);
          setDevelopServerOperationalMetricsError("");
          try {
            const shouldLoadServerCatalog = targetKind !== "database";
            const shouldLoadDatabaseCatalog = !targetKind || targetKind === "database";
            const serverOverviewAnalyticsPath = "/servers/analytics/overview?"
              + (targetKind ? "kind=" + encodeURIComponent(targetKind) + "&" : "")
              + "period=" + encodeURIComponent(requestedPeriod);
            const databaseOverviewAnalyticsPath = "/databases/analytics/overview?period=" + encodeURIComponent(requestedPeriod);
            const [
              { buckets, bucketByKey, bucketIndexByKey, bucketDurationMs, getBucketKey },
              serverOverviewAnalytics,
              databaseOverviewAnalytics,
            ] = await Promise.all([
              Promise.resolve(buildOperationalBuckets()),
              shouldLoadServerCatalog
                ? readAnalyticsResponse(serverOverviewAnalyticsPath)
                : Promise.resolve(null),
              shouldLoadDatabaseCatalog
                ? readAnalyticsResponse(databaseOverviewAnalyticsPath)
                : Promise.resolve(null),
            ]);
            const serverOverviewResources = readOverviewResources(serverOverviewAnalytics);
            const databaseOverviewResources = readOverviewResources(databaseOverviewAnalytics);
            const servers = serverOverviewResources.map((resource) => (
              normalizePlaygroundServerRecord(readOverviewResourceRecord(resource))
            ));
            const databases = databaseOverviewResources.map((resource) => (
              normalizePlaygroundDatabaseRecord(readOverviewResourceRecord(resource))
            ));
            const activeServerRecords = servers.filter((server) => (
              server?.id
              && !["deleted"].includes(String(server?.status || server?.state || "").toLowerCase())
            ));
            const activeServers = activeServerRecords.filter((server) => canonicalizePlaygroundServerKind(server?.kind) !== "database");
            const activeDatabases = databases.filter((database) => database?.id && String(database?.status || "").toLowerCase() !== "deleted");
            const analyticsServers = targetKind && targetKind !== "database"
              ? activeServers.filter((server) => canonicalizePlaygroundServerKind(server?.kind) === targetKind)
              : activeServers;
            const analyticsDatabases = targetKind && targetKind !== "database" ? [] : activeDatabases;
            const metricResourceSeries = {
              hostingRequests: [],
              apiRequests: [],
              functionCalls: [],
              databaseReads: [],
              databaseWrites: [],
              agentRuntimeRuns: [],
              voiceCalls: [],
              secretReads: [],
              authEvents: [],
              paymentCheckoutSessions: [],
              computeTokens: [],
              errors: [],
            };
            const createMetricValues = () => buckets.map(() => 0);
            const readAnalyticsNumber = (source, keys) => {
              const candidates = Array.isArray(keys) ? keys : [keys];
              for (const key of candidates) {
                const value = Number(source?.[key]);
                if (Number.isFinite(value)) {
                  return value;
                }
              }
              return 0;
            };
            const readAnalyticsBucketTimestamp = (entry) => (
              entry?.bucketStart
              || entry?.bucket_start
              || entry?.timestamp
              || entry?.time
              || entry?.createdAt
              || entry?.created_at
              || ""
            );
            const getResourceSeriesLabel = (resource, fallback) => {
              const name = typeof resource?.name === "string" && resource.name.trim()
                ? resource.name.trim()
                : "";
              if (name) {
                return name;
              }
              const id = typeof resource?.id === "string" && resource.id.trim()
                ? resource.id.trim()
                : "";
              return id || fallback;
            };
            const addToMetricValues = (entry, values, value) => {
              const bucketKey = getBucketKey(readAnalyticsBucketTimestamp(entry));
              const bucketIndex = bucketIndexByKey.get(bucketKey);
              if (typeof bucketIndex !== "number") {
                return;
              }
              values[bucketIndex] += Math.max(0, Number(value || 0));
            };
            const pushResourceMetricSeries = (key, resource, values, fallbackLabel) => {
              if (!metricResourceSeries[key]) {
                return;
              }
              const normalizedValues = Array.isArray(values) && values.length === buckets.length
                ? values.map((value) => Math.max(0, Number(value || 0)))
                : createMetricValues();
              metricResourceSeries[key].push({
                id: String(resource?.id || key + "-" + metricResourceSeries[key].length),
                label: getResourceSeriesLabel(resource, fallbackLabel),
                values: normalizedValues,
                total: normalizedValues.reduce((sum, value) => sum + Math.max(0, Number(value || 0)), 0),
              });
            };

            const addToBucket = (entry, field, value) => {
              const bucketKey = getBucketKey(readAnalyticsBucketTimestamp(entry));
              const bucket = bucketByKey.get(bucketKey);
              if (!bucket) {
                return;
              }
              bucket[field] += Math.max(0, Number(value || 0));
            };

            const serverById = new Map(analyticsServers.map((server) => [String(server?.id || ""), server]));
            const scopedServerOverviewResources = targetKind && targetKind !== "database"
              ? serverOverviewResources.filter((resource) => (
                  canonicalizePlaygroundServerKind(readOverviewResourceRecord(resource)?.kind) === targetKind
                ))
              : serverOverviewResources;
            const serverAnalyticsResults = scopedServerOverviewResources.map((resource) => ({
              server: serverById.get(String(readOverviewResourceRecord(resource)?.id || ""))
                || readOverviewResourceRecord(resource),
              analytics: {
                charts: {
                  traffic: readResourceChartBuckets(resource, "traffic", "traffic24h"),
                },
              },
            }));
            const activeServerKindCounts = activeServerRecords.reduce((counts, server) => {
              const kind = canonicalizePlaygroundServerKind(server?.kind);
              counts[kind] = (counts[kind] || 0) + 1;
              return counts;
            }, {});
            serverAnalyticsResults.forEach(({ server, analytics }) => {
              const kind = canonicalizePlaygroundServerKind(server?.kind);
              const trafficBuckets = Array.isArray(analytics?.charts?.traffic)
                ? analytics.charts.traffic
                : Array.isArray(analytics?.analytics?.charts?.traffic)
                  ? analytics.analytics.charts.traffic
                  : Array.isArray(analytics?.charts?.traffic24h)
                    ? analytics.charts.traffic24h
                    : Array.isArray(analytics?.analytics?.charts?.traffic24h)
                      ? analytics.analytics.charts.traffic24h
                      : [];
              const requestValues = createMetricValues();
              const errorValues = createMetricValues();
              const computeTokenValues = createMetricValues();
              trafficBuckets.forEach((entry) => {
                const total = Math.max(0, readAnalyticsNumber(entry, [
                  "total",
                  "requests",
                  "requestCount",
                  "request_count",
                  "totalRequests",
                  "total_requests",
                ]));
                const errors = Math.max(0, readAnalyticsNumber(entry, [
                  "clientErrors",
                  "client_errors",
                ])) + Math.max(0, readAnalyticsNumber(entry, [
                  "serverErrors",
                  "server_errors",
                ]));
                const computeTokens = Math.max(0, readAnalyticsNumber(entry, [
                  "computeTokens",
                  "compute_tokens",
                  "costCT",
                  "costCt",
                  "cost_ct",
                  "ct",
                  "totalComputeTokens",
                  "total_compute_tokens",
                ]));
                if (kind === "web_app") {
                  addToBucket(entry, "hostingRequests", total);
                  addToMetricValues(entry, requestValues, total);
                } else if (kind === "api") {
                  addToBucket(entry, "apiRequests", total);
                  addToMetricValues(entry, requestValues, total);
                } else if (kind === "function") {
                  addToBucket(entry, "functionCalls", total);
                  addToMetricValues(entry, requestValues, total);
                } else if (kind === "agent_runtime") {
                  addToBucket(entry, "agentRuntimeRuns", total);
                  addToMetricValues(entry, requestValues, total);
                } else if (kind === "voice_agent") {
                  addToBucket(entry, "voiceCalls", total);
                  addToMetricValues(entry, requestValues, total);
                } else if (kind === "secrets") {
                  addToBucket(entry, "secretReads", total);
                  addToMetricValues(entry, requestValues, total);
                } else if (kind === "auth") {
                  addToBucket(entry, "authEvents", total);
                  addToMetricValues(entry, requestValues, total);
                } else if (kind === "payments") {
                  addToBucket(entry, "paymentCheckoutSessions", total);
                  addToMetricValues(entry, requestValues, total);
                }
                addToBucket(entry, "errors", errors);
                addToBucket(entry, "computeTokens", computeTokens);
                addToMetricValues(entry, errorValues, errors);
                addToMetricValues(entry, computeTokenValues, computeTokens);
              });
              if (kind === "web_app") {
                pushResourceMetricSeries("hostingRequests", server, requestValues, "Web app");
              } else if (kind === "api") {
                pushResourceMetricSeries("apiRequests", server, requestValues, "API");
              } else if (kind === "function") {
                pushResourceMetricSeries("functionCalls", server, requestValues, "Function");
              } else if (kind === "agent_runtime") {
                pushResourceMetricSeries("agentRuntimeRuns", server, requestValues, "Agent runtime");
              } else if (kind === "voice_agent") {
                pushResourceMetricSeries("voiceCalls", server, requestValues, "Voice agent");
	            } else if (kind === "secrets") {
	              pushResourceMetricSeries("secretReads", server, requestValues, "Secrets");
	            } else if (kind === "auth") {
	              pushResourceMetricSeries("authEvents", server, requestValues, "Authentication");
	            } else if (kind === "payments") {
	              pushResourceMetricSeries("paymentCheckoutSessions", server, requestValues, "Payments");
	            }
              pushResourceMetricSeries("errors", server, errorValues, "Resource");
              pushResourceMetricSeries("computeTokens", server, computeTokenValues, "Resource");
            });

            const publishOperationalMetricsSnapshot = () => {
              if (!isCurrentLoad()) {
                return;
              }
              const labels = buckets.map((bucket) => bucket.label);
              const buildSeries = (field) => buckets.map((bucket) => Math.max(0, Number(bucket[field] || 0)));
              const activeScopedResources = targetKind === "database"
                ? activeDatabases
                : targetKind
                  ? activeServerRecords.filter((server) => canonicalizePlaygroundServerKind(server?.kind) === targetKind)
                  : [...activeServerRecords, ...activeDatabases];
              const resourceCountSeries = buckets.map((bucket) => {
                const bucketEndMs = Math.max(0, Number(bucket.startMs || 0)) + bucketDurationMs;
                return activeScopedResources.reduce((count, resource) => {
                  const createdAtMs = Date.parse(String(resource?.createdAt || ""));
                  return count + (!Number.isFinite(createdAtMs) || createdAtMs <= bucketEndMs ? 1 : 0);
                }, 0);
              });
              const sortResourceSeries = (items) => (Array.isArray(items) ? [...items] : [])
                .sort((left, right) => {
                  const leftTotal = Math.max(0, Number(left?.total || 0));
                  const rightTotal = Math.max(0, Number(right?.total || 0));
                  if (leftTotal !== rightTotal) {
                    return rightTotal - leftTotal;
                  }
                  return String(left?.label || "").localeCompare(String(right?.label || ""));
                })
                .slice(0, 4);
              const topResourceSeries = Object.fromEntries(
                Object.entries(metricResourceSeries).map(([key, items]) => [key, sortResourceSeries(items)])
              );
              const scopedResourceCount = targetKind === "database"
                ? activeDatabases.length
                : targetKind
                  ? activeServerKindCounts[targetKind] || 0
                  : activeServerRecords.length + activeDatabases.length;
              setDevelopServerOperationalMetrics({
                labels,
                loadedAt: new Date().toISOString(),
                scopeKind: targetKind || "",
                period: requestedPeriod,
                resources: activeScopedResources,
                resourceCount: scopedResourceCount,
                resourceCounts: {
                  webApps: activeServerKindCounts.web_app || 0,
                  apis: activeServerKindCounts.api || 0,
                  functions: activeServerKindCounts.function || 0,
                  databases: activeDatabases.length,
                  agentRuntimes: activeServerKindCounts.agent_runtime || 0,
                  voiceAgents: activeServerKindCounts.voice_agent || 0,
                  secrets: activeServerKindCounts.secrets || 0,
                  auth: activeServerKindCounts.auth || 0,
                  payments: activeServerKindCounts.payments || 0,
                },
                series: {
                  hostingRequests: buildSeries("hostingRequests"),
                  apiRequests: buildSeries("apiRequests"),
                  functionCalls: buildSeries("functionCalls"),
                  databaseReads: buildSeries("databaseReads"),
                  databaseWrites: buildSeries("databaseWrites"),
                  agentRuntimeRuns: buildSeries("agentRuntimeRuns"),
                  voiceCalls: buildSeries("voiceCalls"),
                  secretReads: buildSeries("secretReads"),
                  authEvents: buildSeries("authEvents"),
                  paymentCheckoutSessions: buildSeries("paymentCheckoutSessions"),
                  computeTokens: buildSeries("computeTokens"),
                  resources: resourceCountSeries,
                  errors: buildSeries("errors"),
                },
                topResourceSeries,
                totals: {
                  hostingRequests: buckets.reduce((sum, bucket) => sum + bucket.hostingRequests, 0),
                  apiRequests: buckets.reduce((sum, bucket) => sum + bucket.apiRequests, 0),
                  functionCalls: buckets.reduce((sum, bucket) => sum + bucket.functionCalls, 0),
                  databaseReads: buckets.reduce((sum, bucket) => sum + bucket.databaseReads, 0),
                  databaseWrites: buckets.reduce((sum, bucket) => sum + bucket.databaseWrites, 0),
                  agentRuntimeRuns: buckets.reduce((sum, bucket) => sum + bucket.agentRuntimeRuns, 0),
                  voiceCalls: buckets.reduce((sum, bucket) => sum + bucket.voiceCalls, 0),
                  secretReads: buckets.reduce((sum, bucket) => sum + bucket.secretReads, 0),
                  authEvents: buckets.reduce((sum, bucket) => sum + bucket.authEvents, 0),
                  paymentCheckoutSessions: buckets.reduce((sum, bucket) => sum + bucket.paymentCheckoutSessions, 0),
                  computeTokens: buckets.reduce((sum, bucket) => sum + bucket.computeTokens, 0),
                  resources: scopedResourceCount,
                  errors: buckets.reduce((sum, bucket) => sum + bucket.errors, 0),
                },
              });
            };
            const ingestDatabaseAnalytics = (database, analytics) => {
              const operationBuckets = Array.isArray(analytics?.analytics?.charts?.operations)
                ? analytics.analytics.charts.operations
                : Array.isArray(analytics?.charts?.operations)
                  ? analytics.charts.operations
                  : Array.isArray(analytics?.analytics?.charts?.operations24h)
                    ? analytics.analytics.charts.operations24h
                    : Array.isArray(analytics?.charts?.operations24h)
                      ? analytics.charts.operations24h
                      : [];
              const readValues = createMetricValues();
              const writeValues = createMetricValues();
              const errorValues = createMetricValues();
              const computeTokenValues = createMetricValues();
              operationBuckets.forEach((entry) => {
                addToBucket(entry, "databaseReads", entry?.reads);
                addToBucket(entry, "databaseWrites", entry?.writes);
                addToBucket(entry, "errors", entry?.errors);
                addToMetricValues(entry, readValues, entry?.reads);
                addToMetricValues(entry, writeValues, entry?.writes);
                addToMetricValues(entry, errorValues, entry?.errors);
                const computeTokens = Math.max(0, readAnalyticsNumber(entry, [
                  "computeTokens",
                  "compute_tokens",
                  "costCT",
                  "costCt",
                  "cost_ct",
                  "ct",
                  "totalComputeTokens",
                  "total_compute_tokens",
                ]));
                addToBucket(entry, "computeTokens", computeTokens);
                addToMetricValues(entry, computeTokenValues, computeTokens);
              });
              pushResourceMetricSeries("databaseReads", database, readValues, "Database");
              pushResourceMetricSeries("databaseWrites", database, writeValues, "Database");
              pushResourceMetricSeries("errors", database, errorValues, "Database");
              pushResourceMetricSeries("computeTokens", database, computeTokenValues, "Database");
            };
            const databaseById = new Map(analyticsDatabases.map((database) => [String(database?.id || ""), database]));
            databaseOverviewResources.forEach((resource) => {
              const resourceRecord = readOverviewResourceRecord(resource);
              const database = databaseById.get(String(resourceRecord?.id || "")) || resourceRecord;
              ingestDatabaseAnalytics(database, {
                analytics: {
                  charts: {
                    operations: readResourceChartBuckets(resource, "operations", "operations24h"),
                  },
                },
              });
            });
            publishOperationalMetricsSnapshot();
          } catch (error) {
            if (isCurrentLoad() && error?.name !== "AbortError") {
              developServerOperationalMetricsRequestKeyRef.current = "";
              setDevelopServerOperationalMetricsError(error instanceof Error ? error.message : "Failed to load server activity.");
              setDevelopServerOperationalMetrics(null);
            }
          } finally {
            if (isCurrentLoad()) {
              setDevelopServerOperationalMetricsLoading(false);
            }
            if (developServerOperationalMetricsAbortRef.current === requestController) {
              developServerOperationalMetricsAbortRef.current = null;
            }
          }
        }, [authRequestHeaders, databaseListIdentity, hasRealAccess, proxyBackendBase, triggerPlatformSessionRecovery]);
`;
