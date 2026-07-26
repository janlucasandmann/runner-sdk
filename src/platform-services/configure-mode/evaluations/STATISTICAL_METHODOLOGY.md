# Evaluation statistical methodology

## Supported comparison contract

The service reports case-level scores, a mean score over scoreable cases, and a
pass rate over scoreable cases. Repeated executions of one dataset row remain
separate auditable trials. Operational failures are excluded and reported
separately.

`buildPairedEvaluationComparison` implements a deterministic paired percentile
bootstrap:

1. Pin dataset, case-selection, evaluator, and system fingerprints.
2. Match baseline and candidate trials by dataset-row ID and repeat index.
3. Exclude and enumerate unscored or unmatched trials; never impute zero.
4. Aggregate repeated paired trials within dataset row so a frequently repeated
   row does not receive more inferential weight.
5. Resample dataset rows with replacement using a seed derived from both run
   fingerprints.
6. Report the paired row count, paired trial count, coverage, mean score delta,
   pass-rate delta, standard error, confidence intervals, and probability of
   improvement.
7. Repeat the same analysis for every declared slice.

The default confidence level is 95% with 2,000 bootstrap iterations. The seed
and algorithm version are stored with the result, so rerunning the comparison
with the same inputs produces the same evidence. Percentile bootstrap intervals
are an uncertainty estimate, not a guarantee of external validity.

The default release policy requires at least 10 paired dataset rows overall and
at least 5 paired rows in every required slice. Policies may raise these
thresholds. The implementation enforces an absolute minimum of 2 paired rows,
even for older or malformed policies, because a one-row bootstrap distribution
cannot provide credible promotion evidence.

## Release gate

For each required evaluation target:

- paired trial and dataset-row coverage meet the configured threshold;
- the configured minimum number of paired dataset rows is present;
- no grader or infrastructure failures occurred;
- the lower bound of the paired score-delta interval is above the configured
  non-inferiority margin;
- the lower bound of the paired pass-rate delta is above the same margin;
- required slices have enough paired rows and no confidence-bound regression;
- a claimed improvement meets the configured minimum practical effect at the
  lower confidence bound;
- the sealed holdout meets the configured minimum score and pass rate.

Agent Optimization stores the comparison, normalized gate policy, and decision
evidence on each iteration. Aggregate means alone cannot approve a candidate.
