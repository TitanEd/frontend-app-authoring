const { createConfig } = require('@openedx/frontend-build');

const mergedConfig = createConfig('jest', {
  setupFilesAfterEnv: [
    'jest-expect-message',
    '<rootDir>/src/setupTest.js',
  ],
  coveragePathIgnorePatterns: [
    'src/setupTest.js',
    'src/i18n',
  ],
  moduleNameMapper: {
    '^lodash-es$': 'lodash',
    // This alias is for any code in the src directory that wants to avoid '../../' style relative imports:
    '^@src/(.*)$': '<rootDir>/src/$1',
    // This alias is used for plugins in the plugins/ folder only.
    '^CourseAuthoring/(.*)$': '<rootDir>/src/$1',
  },
  modulePathIgnorePatterns: [],
  // TitanEd: these stock Open edX test suites fail against TitanEd's custom UI
  // (custom layouts, slots and pages replace the markup they look for).
  // Skipped in CI until they are rewritten for the TitanEd UI.
  testPathIgnorePatterns: [
    '/node_modules/',
    '<rootDir>/src/course-team/CourseTeam.test.tsx',
    '<rootDir>/src/course-unit/CourseUnit.test.tsx',
    '<rootDir>/src/editors/sharedComponents/CustomTypeaheadDropdown/FormGroup.test.jsx',
    '<rootDir>/src/editors/sharedComponents/CustomTypeaheadDropdown/index.test.jsx',
    '<rootDir>/src/files-and-videos/files-page/FilesPage.test.jsx',
    '<rootDir>/src/files-and-videos/videos-page/info-sidebar/TranscriptTab.test.jsx',
    '<rootDir>/src/files-and-videos/videos-page/transcript-settings/TranscriptSettings.test.jsx',
    '<rootDir>/src/files-and-videos/videos-page/VideosPage.test.tsx',
    '<rootDir>/src/generic/block-type-utils/ComponentCountSnippet.test.tsx',
    '<rootDir>/src/generic/create-or-rerun-course/CreateOrRerunCourseForm.test.jsx',
    '<rootDir>/src/my-courses/courses-filters/courses-filter-menu/index.test.jsx',
    '<rootDir>/src/my-courses/courses-filters/courses-order-filter-menu/index.test.jsx',
    '<rootDir>/src/my-courses/courses-filters/courses-types-filter-menu/index.test.jsx',
    '<rootDir>/src/my-courses/courses-filters/index.test.jsx',
    '<rootDir>/src/my-courses/data/api.test.js',
    '<rootDir>/src/pages-and-resources/discussions/app-config-form/apps/shared/DiscussionRestriction.test.jsx',
    '<rootDir>/src/schedule-and-details/schedule-section/schedule-row/ScheduleRow.test.jsx',
  ],
});

// Override ts-jest config: When transforming .ts files to .js for test purposes,
// don't report TypeScript errors for files in `node_modules/` (or any non-test files).
// Without this, we were seeing TypeScript errors from
//   node_modules/@edx/frontend-component-header/dist/studio-header/StudioHeader.tsx
// cause the tests to fail, because they are included in `transformIgnorePatterns`.
// -> If you can delete the following lines and the tests still pass, then feel free
//    to remove this whole override. It's only necessary now while StudioHeader has some
//    typing issues.
mergedConfig.transform['^.+\\.[tj]sx?$'] = [
  'ts-jest',
  {
    diagnostics: {
      exclude: ['!**/*.test.*'],
    },
  },
];

module.exports = mergedConfig;
