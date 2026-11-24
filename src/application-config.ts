import { defineApplication } from 'twenty-sdk/define';

import {
  APP_DESCRIPTION,
  APP_DISPLAY_NAME,
  APPLICATION_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineApplication({
  universalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
  displayName: APP_DISPLAY_NAME,
  description: APP_DESCRIPTION,
  author: 'o-oleja',
  category: 'Productivity',
  logo: 'public/logo.svg',
  websiteUrl: 'https://github.com/o-oleja/twenty-app-record-comments',
  issueReportUrl: 'https://github.com/o-oleja/twenty-app-record-comments/issues',
});
