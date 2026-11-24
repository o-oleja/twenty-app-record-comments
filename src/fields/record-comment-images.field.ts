import { defineField, FieldType, RelationType } from 'twenty-sdk/define';

import {
  ATTACHMENT_OBJECT_UNIVERSAL_IDENTIFIER,
  ATTACHMENT_RECORD_COMMENT_FIELD_UNIVERSAL_IDENTIFIER,
  RECORD_COMMENT_IMAGES_FIELD_UNIVERSAL_IDENTIFIER,
  RECORD_COMMENT_OBJECT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

// "attachments" is already taken by a built-in field of every custom object.
export default defineField({
  universalIdentifier: RECORD_COMMENT_IMAGES_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: RECORD_COMMENT_OBJECT_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'commentImages',
  label: 'Images',
  icon: 'IconPhoto',
  relationTargetObjectMetadataUniversalIdentifier: ATTACHMENT_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier:
    ATTACHMENT_RECORD_COMMENT_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
});
