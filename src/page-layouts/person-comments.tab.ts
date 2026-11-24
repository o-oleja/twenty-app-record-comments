import { definePageLayoutTab } from 'twenty-sdk/define';

import { COMMENT_TARGETS } from 'src/constants/universal-identifiers';
import { commentsTab } from 'src/utils/comment-target-entities';

export default definePageLayoutTab(commentsTab(COMMENT_TARGETS[1]));
