import * as core from '@actions/core';
import { getUsersFromRepo, getTeamsId, createNewEnvironment, getUsersId } from './utils';

export default async function main() {
  const envName = core.getInput('env_name');
  const orgName = core.getInput('github_org');
  const approversUsers = core.getInput('approvers_users');
  const approversTeams = core.getInput('approvers_teams');
  const approvalTimeout = core.getInput('timeout');
  const dryRun = core.getInput('dry_run');

  
  // busqueda de los id de los usuarios aprobadores
  core.info(`Busqueda de usuarios ...`)
  let usersId: Array<{id: number | undefined, login: string | undefined}> = [];
  if( approversUsers!= undefined && approversUsers!= '' ){  
    usersId = await getUsersId(approversUsers.split(','));
  }
  else {
    usersId = await getUsersFromRepo()
  }
  
  core.info(`Busqueda de teams ...`)
  // busqueda de los id de los teams aprobadores
  let teamsId: Array<{id: number, login: string}> = [];
  if( approversTeams != undefined && approversTeams != ''  ){
    teamsId = await getTeamsId(approversTeams.split(','), orgName);
  }
  

  core.info(`[1] Approvers is:`);
  [...usersId, ...teamsId].forEach(u => {
    core.info(`${u.login} : ${u.id}`);
  });

  if (/true/i.test(dryRun)) {
    core.info('Dry run: not performing create environment action.');
    return;
  }
  /*
  core.setOutput('previous_version', previousVersion.version);
  core.info(`Changelog is ${changelog}.`);
  core.setOutput('changelog', changelog);

  */
  await createNewEnvironment(envName, (Number(approvalTimeout) || 30), usersId.map(e => e.id), teamsId.map(e => e.id));

}
