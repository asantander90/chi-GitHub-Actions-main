"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createNewEnvironment = exports.getCurrentEnvironments = exports.getValidTeams = exports.getTeamsId = exports.getUsersId = exports.getUsersFromRepo = exports.getOctokitSingleton = void 0;
const github_1 = require("@actions/github");
const core = __importStar(require("@actions/core"));
let octokitSingleton;
function getOctokitSingleton() {
    if (octokitSingleton) {
        return octokitSingleton;
    }
    const githubToken = core.getInput('github_token');
    octokitSingleton = (0, github_1.getOctokit)(githubToken);
    return octokitSingleton;
}
exports.getOctokitSingleton = getOctokitSingleton;
/**
 * Fetch all users for a given repository in first page
 */
function getUsersFromRepo() {
    return __awaiter(this, void 0, void 0, function* () {
        const octokit = getOctokitSingleton();
        const members = yield octokit.rest.repos.listContributors(Object.assign(Object.assign({}, github_1.context.repo), { per_page: 100, page: 1 }));
        return members.data.map(u => {
            return { id: u.id, login: u.login };
        });
    });
}
exports.getUsersFromRepo = getUsersFromRepo;
function getUsersId(usernames) {
    return __awaiter(this, void 0, void 0, function* () {
        const octokit = getOctokitSingleton();
        let usersId = [];
        yield Promise.all(usernames.map((u) => __awaiter(this, void 0, void 0, function* () {
            const member = yield octokit.rest.users.getByUsername({ username: u });
            usersId.push({
                id: member.data.id,
                login: member.data.login
            });
        })));
        return usersId;
    });
}
exports.getUsersId = getUsersId;
function getTeamsId(teams, orgName) {
    return __awaiter(this, void 0, void 0, function* () {
        const octokit = getOctokitSingleton();
        let teamsId = [];
        yield Promise.all(teams.map((u) => __awaiter(this, void 0, void 0, function* () {
            const team = yield octokit.rest.teams.getByName({
                org: orgName,
                team_slug: u
            });
            teamsId.push({
                id: team.data.id,
                login: team.data.name
            });
        })));
        return teamsId;
    });
}
exports.getTeamsId = getTeamsId;
/**
 * Fetch all teams for a given repository in first page
 */
function getValidTeams() {
    return __awaiter(this, void 0, void 0, function* () {
        const octokit = getOctokitSingleton();
        const teams = yield octokit.rest.repos.listTeams(Object.assign(Object.assign({}, github_1.context.repo), { per_page: 100, page: 1 }));
        return teams.data.map(t => t.name);
    });
}
exports.getValidTeams = getValidTeams;
/**
 * Fetch all environments for a given repository in first page
 */
function getCurrentEnvironments() {
    return __awaiter(this, void 0, void 0, function* () {
        const octokit = getOctokitSingleton();
        const allEnvs = yield octokit.rest.repos.getAllEnvironments(Object.assign(Object.assign({}, github_1.context.repo), { per_page: 100, page: 1 }));
        return allEnvs.data.environments;
    });
}
exports.getCurrentEnvironments = getCurrentEnvironments;
/**
 * Search on the environments for a given name, if not exists will be created!
 */
function createNewEnvironment(envName, waitTimer = 15, approversUsers, approversTeams) {
    return __awaiter(this, void 0, void 0, function* () {
        core.info(`Creando / Actualizando el env: '${envName}', para los usuarios: ${approversUsers} y teams: ${approversTeams}`);
        const octokit = getOctokitSingleton();
        const teams = approversTeams === null || approversTeams === void 0 ? void 0 : approversTeams.map(t => { return { type: "Team", id: t }; });
        const users = approversUsers === null || approversUsers === void 0 ? void 0 : approversUsers.map(u => { return { type: "User", id: u }; });
        let reviewers = [...teams, ...users];
        yield octokit.rest.repos.createOrUpdateEnvironment(Object.assign(Object.assign({}, github_1.context.repo), { environment_name: envName, 
            //wait_timer: waitTimer,
            reviewers }));
        //return reviewers;
    });
}
exports.createNewEnvironment = createNewEnvironment;
