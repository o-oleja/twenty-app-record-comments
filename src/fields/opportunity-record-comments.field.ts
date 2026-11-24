import { defineField } from 'twenty-sdk/define';

import { COMMENT_TARGETS } from 'src/constants/universal-identifiers';
import { targetToCommentsField } from 'src/utils/comment-target-entities';

export default defineField(targetToCommentsField(COMMENT_TARGETS[2]));
