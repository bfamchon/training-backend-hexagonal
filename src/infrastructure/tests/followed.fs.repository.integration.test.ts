import * as fs from 'fs';
import * as path from 'path';
import { FileSystemFollowedRepository } from '../followed.fs.repository';

const testFollowedPath = path.join(__dirname, './followed.test.json');

describe('FileSystemFollowedRepository', () => {
  beforeEach(async () => {
    await fs.promises.writeFile(testFollowedPath, JSON.stringify({}));
  });

  test('followUser() should save a new Followed when there was no followed before', async () => {
    const followedRepository = new FileSystemFollowedRepository(testFollowedPath);

    await fs.promises.writeFile(
      testFollowedPath,
      JSON.stringify({
        Bob: ['Charlie']
      })
    );

    await followedRepository.followUser({
      user: 'Alice',
      userToFollow: 'Charlie'
    });

    const followedData = await fs.promises.readFile(testFollowedPath);
    const followedJson = JSON.parse(followedData.toString());

    expect(followedJson).toEqual({
      Alice: ['Charlie'],
      Bob: ['Charlie']
    });
  });

  test('followUser() should save a new Followed', async () => {
    const followedRepository = new FileSystemFollowedRepository(testFollowedPath);

    await fs.promises.writeFile(
      testFollowedPath,
      JSON.stringify({
        Alice: ['Bob'],
        Bob: ['Charlie']
      })
    );

    await followedRepository.followUser({
      user: 'Alice',
      userToFollow: 'Charlie'
    });

    const followedData = await fs.promises.readFile(testFollowedPath);
    const followedJson = JSON.parse(followedData.toString());

    expect(followedJson).toEqual({
      Alice: ['Bob', 'Charlie'],
      Bob: ['Charlie']
    });
  });
  test('getFollowedOfUser() should return user followed', async () => {
    const followedRepository = new FileSystemFollowedRepository(testFollowedPath);

    await fs.promises.writeFile(
      testFollowedPath,
      JSON.stringify({
        Alice: ['Bob', 'Charlie'],
        Bob: ['Charlie']
      })
    );

    const [aliceFollowed, bobFollowed] = await Promise.all([
      followedRepository.getFollowedOfUser('Alice'),
      followedRepository.getFollowedOfUser('Bob')
    ]);

    expect(aliceFollowed).toEqual(['Bob', 'Charlie']);
    expect(bobFollowed).toEqual(['Charlie']);
  });
});
