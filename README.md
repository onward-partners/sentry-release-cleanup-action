# Sentry Release Cleanup Action

This action cleans up old Sentry releases for a given project, keeping only a specified number of the most recent releases.

## Inputs

### `keep`

Amount of images to keep. Default: `3`

### `organization`

**Required** Organization slug/ID

### `project`

**Required** Project slug/ID

### `token`

**Required** Auth token for Sentry (required scopes: `project:read`, `project:releases`)

### `dryRun`

If set to `true` no releases will be deleted, only counted. Default: `false`

## Example usage

```yaml
jobs:
  cleanup-acr:
    runs-on: ubuntu-latest
    name: Cleanup Sentry releases
    steps:
      - uses: onward-partners/sentry-release-cleanup-action@v1
        with:
          keep: 3
          organization: your-organization
          project: your-project
          token: ${{ secrets.SENTRY_AUTH_TOKEN }}

```
