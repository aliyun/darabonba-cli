'use strict';

const assert = require('assert');
const path = require('path');

const {
  isDaraProject,
  getPackageInfo,
  savePackageInfo
} = require('../../lib/darafile');

const projectsDir = path.join(__dirname, '../fixture/projects');

describe('darafile lib should ok', function () {
  it('isDaraProject should be ok', async function () {
    assert.ok(await isDaraProject(path.join(projectsDir, 'dara_project')));
    assert.ok(await isDaraProject(path.join(projectsDir, 'tea_project')));
    assert.ok(!await isDaraProject(path.join(projectsDir, 'non_dara_project')));
  });

  it('getPackageInfo should be ok', async () => {
    assert.deepStrictEqual(await getPackageInfo(path.join(projectsDir, 'dara_project')), {});
    assert.deepStrictEqual(await getPackageInfo(path.join(projectsDir, 'tea_project')), {});
    assert.deepStrictEqual(await getPackageInfo(path.join(projectsDir, 'non_dara_project')), null);
  });

  it('savePackageInfo should be ok', async () => {
    await savePackageInfo(path.join(projectsDir, 'dara_project'), {});
    assert.deepStrictEqual(await getPackageInfo(path.join(projectsDir, 'dara_project')), {});
  });
});
