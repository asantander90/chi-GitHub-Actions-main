import { context, getOctokit } from '@actions/github';
import * as core from '@actions/core';
import { UserOrTeamInfo } from './types/usersOrTeamInfo';

let octokitSingleton: ReturnType<typeof getOctokit>;

export function getOctokitSingleton() {
	if (octokitSingleton) {
	  return octokitSingleton;
	}
	const githubToken = core.getInput('github_token');
	octokitSingleton = getOctokit(githubToken);
	return octokitSingleton;
}

/**
 * Fetch all users for a given repository in first page
 */
 export async function getUsersFromRepo() {
	const octokit = getOctokitSingleton();
	const members = await octokit.rest.repos.listContributors ({
		...context.repo,
	  	per_page: 100,
	  	page: 1,
	});
  
	return members.data.map(u => {
		return { id: u.id, login: u.login }
	});
}

export async function getUsersId(usernames: string[]) {
	const octokit = getOctokitSingleton();
	let usersId: Array<{ id: number, login: string }> = []

	await Promise.all( usernames.map( async (u) => {
		const member = await octokit.rest.users.getByUsername({username: u});
		usersId.push({
			id: member.data.id,
			login: member.data.login
		});
	}));
	
	return usersId;
}

export async function getTeamsId(teams: string[], orgName: string) {
	const octokit = getOctokitSingleton();
	let teamsId: Array<{ id: number, login: string }> = []

	await Promise.all( teams.map( async (u) => {
		const team = await octokit.rest.teams.getByName ({
			org: orgName,
			team_slug: u
		});
		teamsId.push({
			id: team.data.id,
			login: team.data.name
		});
	}));
	
	return teamsId;
}


/**
 * Fetch all teams for a given repository in first page
 */
 export async function getValidTeams() {
	const octokit = getOctokitSingleton();
	const teams = await octokit.rest.repos.listTeams({
		...context.repo,
	  	per_page: 100,
	  	page: 1,
	});
  
	return teams.data.map(t => t.name);
}


/**
 * Fetch all environments for a given repository in first page
 */
 export async function getCurrentEnvironments() {
	const octokit = getOctokitSingleton();
	const allEnvs = await octokit.rest.repos.getAllEnvironments({
		...context.repo,
	  	per_page: 100,
	  	page: 1,
	});
  
	return allEnvs.data.environments;
}


/**
 * Search on the environments for a given name, if not exists will be created!
 */
 export async function createNewEnvironment(envName: string, waitTimer: number = 15, approversUsers: (number|undefined)[], approversTeams: (number|undefined)[] ) {
	 core.info(`Creando / Actualizando el env: '${envName}', para los usuarios: ${approversUsers} y teams: ${approversTeams}`);
	const octokit = getOctokitSingleton();
	
	const teams = approversTeams?.map(t => { return { type: "Team", id: t } as UserOrTeamInfo });
	const users = approversUsers?.map(u => { return { type: "User", id: u } as UserOrTeamInfo })
	let reviewers = [...teams, ...users]
	
	await octokit.rest.repos.createOrUpdateEnvironment({
		...context.repo,
		environment_name: envName,
		//wait_timer: waitTimer,
		reviewers
	});

	//return reviewers;
}
