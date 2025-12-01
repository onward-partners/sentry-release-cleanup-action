import * as core from '@actions/core';
import axios from 'axios';
import { parse } from 'http-link-header';
import { Project } from './type/project';
import { Release } from './type/release';


async function run(): Promise<void> {
  let totalDeletedReleases = 0;
  try {
    const releasesToKeep = parseInt(core.getInput('keep'), 10);
    const organization = core.getInput('organization', { required: true, trimWhitespace: true });
    const projectSlugOrId = core.getInput('project', { required: true, trimWhitespace: true });
    const token = core.getInput('token', { required: true });
    const dryRun = core.getInput('dryRun', { required: false, trimWhitespace: true })?.toLowerCase() === 'true';

    core.debug(`releasesToKeep: ${ releasesToKeep }`);
    core.debug(`organization: ${ organization }`);
    core.debug(`project: ${ projectSlugOrId }`);
    core.debug(`dryRun: ${ dryRun }`);

    const project = await getProject(organization, projectSlugOrId, token);
    core.info(`Managing releases for project: ${ project.slug } (${ project.id })`);

    let releases = await getReleases(organization, token);
    // Filter releases for the specific project
    releases = releases.filter(r => r.projects.some(p => p.slug === project.slug));
    core.info(`Found releases: ${ releases.length }`);
    // Sort releases by dateCreated descending
    releases = releases.sort((a, b) => a.dateCreated.localeCompare(b.dateCreated)).reverse();

    const releaseToDelete = releases.slice(releasesToKeep);
    core.debug(`Releases to delete: ${ releaseToDelete.length }`);

    for (const release of releaseToDelete) {
      const success = dryRun || await deleteReleases(organization, token, release.version);
      if (success) {
        core.debug(`Deleted release: [${ release.dateCreated }] ${ release.version }`);
        totalDeletedReleases++;
      }
    }

    core.info(`Deleted ${ totalDeletedReleases } releases`);
    core.setOutput('count', totalDeletedReleases);
  } catch (error) {
    core.info(`Deleted ${ totalDeletedReleases } releases`);
    core.setFailed(error as Error);
  }
}

async function deleteReleases(orgSlug: string, token: string, version: string): Promise<boolean> {
  const uri = `https://sentry.io/api/0/organizations/${ orgSlug }/releases/${ version }/`;
  try {
    await axios.delete(
      uri,
      {
        headers: {
          Authorization: `Bearer ${ token }`,
        },
      },
    );
    return true;
  } catch (e) {
    core.warning('Could not delete release ' + version + ': ' + (e as any).response.data.detail);
    return false;
  }
}

async function getReleases(orgSlug: string, token: string): Promise<Release[]> {
  const releases: Release[] = [];
  let uri = `https://sentry.io/api/0/organizations/${ orgSlug }/releases/`;
  for (let i = 0; i < 100000; i++) {
    const result = await axios.get(
      uri,
      {
        headers: {
          Authorization: `Bearer ${ token }`,
        },
      },
    );
    const linkHeader = parse(result.headers.link);
    releases.push(...result.data);
    const hasNext = linkHeader.get('rel', 'next').some(link => link.results === 'true');
    if (!hasNext) {
      break;
    }
    uri = linkHeader.get('rel', 'next')[0].uri;
  }
  return releases;
}

async function getProject(organization: string, projectIdOrSlug: string, token: string): Promise<Project> {
  let uri = `https://sentry.io/api/0/projects/${ organization }/${ projectIdOrSlug }/`;
  const result = await axios.get(
    uri,
    {
      headers: {
        Authorization: `Bearer ${ token }`,
      },
    },
  );
  return result.data;
}

void run();
