import { defineField } from 'twenty-sdk/define';

import { COMMENT_TARGETS } from 'src/constants/universal-identifiers';
import { commentToTargetField } from 'src/utils/comment-target-entities';

export default defineField(commentToTargetField(COMMENT_TARGETS[2]));
