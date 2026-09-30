# ADR-0003: Publish the scanned frontend image after the quality gate

- Status: Accepted
- Date: 2026-09-30

## Context

The frontend has a Node build stage and an Nginx runtime image. Docker Hub consumers need to associate a published image with a verified `master` commit. A second build after scanning could produce different bytes.

## Decision

Run source, contract regeneration, high/critical npm audit, lint/build, unit coverage, container acceptance, and secret scanning as required CI checks. Require Dependency Review on PR and an intentionally skipped result on push. After the explicit gate succeeds, build one local image, smoke test the SPA entry point, a client route, and static assets, and scan it with Trivy for fixable HIGH/CRITICAL findings. Record its image ID. On a green `master` push only, tag that same local image with the full commit SHA and `latest` under `mb0101/ecommerce-store-web`, verify both tags have the scanned image ID, push them, and compare the published digests. Pull requests do not receive Docker Hub credentials and do not publish.

## Consequences

Failed or skipped required checks prevent image work and publication. The browser registration scenario runs against the BFF/11 image pinned by digest; a regression blocks this gate. The SHA tag identifies a build; `latest` moves on later successful pushes. Registry credentials use `DOCKERHUB_USERNAME` and `DOCKERHUB_TOKEN` repository secrets. Publication distributes an image but does not deploy a runtime or provision the BFF/upstreams.

## Alternatives considered

- Publish from PRs: distributes unmerged changes and exposes publishing credentials.
- Rebuild before pushing: risks publishing a different image from the one scanned.
- Skip acceptance to unblock Docker Hub: permits a known broken registration contract through the mandatory gate.
