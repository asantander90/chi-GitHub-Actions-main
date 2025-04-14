import action from '../src/action';
import * as utils from '../src/utils';
import * as core from '@actions/core';
import {
  loadDefaultInputs,
  setInput,
  setRepository,
} from './helper';

jest.spyOn(core, 'debug').mockImplementation(() => {});
//jest.spyOn(core, 'info').mockImplementation(() => {});
jest.spyOn(console, 'info').mockImplementation(() => {});

beforeAll(() => {
  setRepository('https://github.com', 'org/repo');
});


const mockCreateEnv = jest
  .spyOn(utils, 'createNewEnvironment')
  .mockResolvedValue(undefined);

const mockSetOutput = jest
  .spyOn(core, 'setOutput')
  .mockImplementation(() => {});

const mockSetFailed = jest.spyOn(core, 'setFailed');

describe('santander-manual-approval-action', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    loadDefaultInputs();
    setInput('GITHUB_ORG', 'santander-group-chile')
    setInput('APPROVERS_TEAMS', 'chi-QAT,chi-Impl')
  });

  describe('Initial cases', () => {
    it('does create dev environment with default values', async () => {
      /*
       * Given
       */
      const users = [{id: 1, login: 'dcampos'}, {id: 2, login: 'mangulo'}, {id: 3, login: 'dlobos'}];
      jest
        .spyOn(utils, 'getUsersFromRepo')
        .mockImplementation(async () => users);

      const teamsId = [{id: 100, login: 'chi-QAT'}, {id: 200, login: 'chi-Impl'}];
      jest
        .spyOn(utils, 'getTeamsId')
        .mockImplementation(async () => teamsId);

      /*
       * When
       */
      await action();

      /*
       * Then
       */
      expect(mockCreateEnv).toHaveBeenCalledWith(
          'dev',
          72,
          [1,2,3],
          [100,200]
          //expect.any(Boolean),
          //expect.any(String)
      );

      expect(mockSetFailed).not.toBeCalled();
    });
  });
});