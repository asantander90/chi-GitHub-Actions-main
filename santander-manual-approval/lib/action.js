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
const core = __importStar(require("@actions/core"));
const utils_1 = require("./utils");
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const envName = core.getInput('env_name');
        const orgName = core.getInput('github_org');
        const approversUsers = core.getInput('approvers_users');
        const approversTeams = core.getInput('approvers_teams');
        const approvalTimeout = core.getInput('timeout');
        const dryRun = core.getInput('dry_run');
        // busqueda de los id de los usuarios aprobadores
        core.info(`Busqueda de usuarios ...`);
        let usersId = [];
        if (approversUsers != undefined && approversUsers != '') {
            usersId = yield (0, utils_1.getUsersId)(approversUsers.split(','));
        }
        else {
            usersId = yield (0, utils_1.getUsersFromRepo)();
        }
        core.info(`Busqueda de teams ...`);
        // busqueda de los id de los teams aprobadores
        let teamsId = [];
        if (approversTeams != undefined && approversTeams != '') {
            teamsId = yield (0, utils_1.getTeamsId)(approversTeams.split(','), orgName);
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
        yield (0, utils_1.createNewEnvironment)(envName, (Number(approvalTimeout) || 30), usersId.map(e => e.id), teamsId.map(e => e.id));
    });
}
exports.default = main;
