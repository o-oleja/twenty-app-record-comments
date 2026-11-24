import { defineField, FieldType, OnDeleteAction, RelationType } from 'twenty-sdk/define';

import {
  ATTACHMENT_OBJECT_UNIVERSAL_IDENTIFIER,
  ATTACHMENT_RECORD_COMMENT_FIELD_UNIVERSAL_IDENTIFIER,
  RECORD_COMMENT_IMAGES_FIELD_UNIVERSAL_IDENTIFIER,
  RECORD_COMMENT_OBJECT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

// An image is a regular attachment of the record (visible in its Files tab)
// that points to its comment. Deleting the comment keeps the file.
export default defineField({
  universalIdentifier: ATTACHMENT_RECORD_COMMENT_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: ATTACHMENT_OBJECT_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'recordComment',
  label: 'Record comment',
  icon: 'IconMessageCircle',
  isNullable: true,
  relationTargetObjectMetadataUniversalIdentifier: RECORD_COMMENT_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier: RECORD_COMMENT_IMAGES_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    onDelete: OnDeleteAction.SET_NULL,
    joinColumnName: 'recordCommentId',
  },
});
