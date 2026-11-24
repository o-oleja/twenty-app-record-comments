import {
  FieldType,
  OnDeleteAction,
  PageLayoutTabLayoutMode,
  PageLayoutWidgetVerticalListHeightBehavior,
  RelationType,
  STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

import {
  COMMENTS_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  type CommentTarget,
  commentJoinColumn,
  RECORD_COMMENT_OBJECT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

// Builders for the three entities each commentable record type needs.
// Entity files still call define*() directly, as the SDK expects.

// recordComment.<target> -> the commented record. Deleting the record deletes its comments.
export const commentToTargetField = (target: CommentTarget) => ({
  universalIdentifier: target.commentFieldUniversalIdentifier,
  objectUniversalIdentifier: RECORD_COMMENT_OBJECT_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION as const,
  name: target.nameSingular,
  label: target.label,
  icon: 'IconLink',
  isNullable: true,
  relationTargetObjectMetadataUniversalIdentifier: target.objectUniversalIdentifier,
  relationTargetFieldMetadataUniversalIdentifier: target.reverseFieldUniversalIdentifier,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE as const,
    onDelete: OnDeleteAction.CASCADE as const,
    joinColumnName: commentJoinColumn(target),
  },
});

// <target>.recordComments -> its comments.
export const targetToCommentsField = (target: CommentTarget) => ({
  universalIdentifier: target.reverseFieldUniversalIdentifier,
  objectUniversalIdentifier: target.objectUniversalIdentifier,
  type: FieldType.RELATION as const,
  name: 'recordComments',
  label: 'Comments',
  icon: 'IconMessageCircle',
  relationTargetObjectMetadataUniversalIdentifier: RECORD_COMMENT_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier: target.commentFieldUniversalIdentifier,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY as const,
  },
});

// "Comments" tab on the record page.
export const commentsTab = (target: CommentTarget) => ({
  universalIdentifier: target.tabUniversalIdentifier,
  pageLayoutUniversalIdentifier:
    STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS[target.pageLayoutKey].universalIdentifier,
  title: 'Comments',
  position: 2,
  icon: 'IconMessageCircle',
  layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
  widgets: [
    {
      universalIdentifier: target.widgetUniversalIdentifier,
      title: 'Comments',
      type: 'FRONT_COMPONENT' as const,
      heightBehavior: PageLayoutWidgetVerticalListHeightBehavior.FIT_CONTENT,
      configuration: {
        configurationType: 'FRONT_COMPONENT' as const,
        frontComponentUniversalIdentifier: COMMENTS_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
      },
    },
  ],
});
