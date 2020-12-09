# yarn-invalid-version-bug
A repo for [reproduce a bug](https://github.com/yarnpkg/berry/issues/2224) in yarn berry

# run the project
```
npm i
node index.js
```

# description
This repo is a repo for reproduce a bug in yarn berry.
once you run this project you will get an error:
```
got error TypeError: Invalid Version: 0.1.0
    at new SemVer (/Users/giladshoham/dev/temp/yarn-bug/node_modules/@yarnpkg/core/node_modules/semver/classes/semver.js:21:13)
    at compare (/Users/giladshoham/dev/temp/yarn-bug/node_modules/@yarnpkg/core/node_modules/semver/functions/compare.js:4:10)
    at gte (/Users/giladshoham/dev/temp/yarn-bug/node_modules/@yarnpkg/core/node_modules/semver/functions/gte.js:2:30)
    at cmp (/Users/giladshoham/dev/temp/yarn-bug/node_modules/@yarnpkg/core/node_modules/semver/functions/cmp.js:37:14)
    at Comparator.test (/Users/giladshoham/dev/temp/yarn-bug/node_modules/@yarnpkg/core/node_modules/semver/classes/comparator.js:73:12)
    at testSet (/Users/giladshoham/dev/temp/yarn-bug/node_modules/@yarnpkg/core/node_modules/semver/classes/range.js:479:17)
    at Range.test (/Users/giladshoham/dev/temp/yarn-bug/node_modules/@yarnpkg/core/node_modules/semver/classes/range.js:179:11)
    at /Users/giladshoham/dev/temp/yarn-bug/node_modules/@yarnpkg/plugin-npm/lib/NpmSemverResolver.js:51:38
    at Array.filter (<anonymous>)
    at NpmSemverResolver.getCandidates (/Users/giladshoham/dev/temp/yarn-bug/node_modules/@yarnpkg/plugin-npm/lib/NpmSemverResolver.js:51:14)
```
This error is expected - this is the error need to be solved.

This error is a result of the following:
- when trying to create a new instance of SemVer, semver will check if it's already an instance of semver or if it's a string, otherwise it will throw an `Invalid Version` error.
(This is a dangerous code since you might get an instance of SemVer from another instance of semver in your node modules).
see this code in semver [here](https://github.com/npm/node-semver/blob/master/classes/semver.js#L11) 
An issue about this dangerous check is opened [here](https://github.com/npm/node-semver/issues/354)
- yarn's plugin-npm [creates a range using](https://github.com/yarnpkg/berry/blob/master/packages/plugin-npm/sources/NpmSemverResolver.ts#L46) `semverUtils.validRange` which resolves semver from @yarn/core
- later the plugin-npm [creates an instance of semver directly](https://github.com/yarnpkg/berry/blob/master/packages/plugin-npm/sources/NpmSemverResolver.ts#L57) which resolves semver from @yarn/plugin-npm
- once it passes the local instance to the range it get's inside the `range.test` to the constructor of SemVer (from yarn/core) with an instance of semver from plugin-npm. which then throws the above error.

In this repo, I've added `"semver": "^6.3.0"` in the package.json to make sure we will have different instances of semver in @yarn/core and @yarn/plugin-npm.
In the real world, this might happen very easily since many projects require semver, and many nested dependencies of a project require semver, so it is up to the package manager to decide what it hoists to the root. 
so it's very likely to have different instances of semver between @yarn/core and @yarn/plugin-npm.

A possible solution will be just to expose the SemVer constructor from the semverUtils in the core and use the constructor from there instead of call directly to the semver package in the plugin-npm.