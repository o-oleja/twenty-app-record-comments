import { defineObject, FieldType } from 'twenty-sdk/define';

import {
  RECORD_COMMENT_OBJECT_UNIVERSAL_IDENTIFIER,
  RECORD_COMMENT_TEXT_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

// Author and time come from the built-in createdBy / createdAt fields:
// the front component calls the API as the viewing workspace member.
export default defineObject({
  universalIdentifier: RECORD_COMMENT_OBJECT_UNIVERSAL_IDENTIFIER,
  nameSingular: 'recordComment',
  namePlural: 'recordComments',
  labelSingular: 'Record comment',
  labelPlural: 'Record comments',
  description: 'A comment left by a workspace member on a record',
  icon: 'IconMessageCircle',
  labelIdentifierFieldMetadataUniversalIdentifier: RECORD_COMMENT_TEXT_FIELD_UNIVERSAL_IDENTIFIER,
  fields: [
    {
      universalIdentifier: RECORD_COMMENT_TEXT_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      name: 'text',
      label: 'Text',
      icon: 'IconAlignLeft',
    },
  ],
});
