import { STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-sdk/define';

export const APP_DISPLAY_NAME = 'Record Comments';
export const APP_DESCRIPTION =
  'A comment feed with image attachments on Company, Person and Opportunity records';

export const APPLICATION_UNIVERSAL_IDENTIFIER = 'baea5cec-a0ec-43ab-9446-ed21a7bd217b';
export const DEFAULT_ROLE_UNIVERSAL_IDENTIFIER = 'c8acf80a-d26d-459c-8555-e919d47a9720';

export const RECORD_COMMENT_OBJECT_UNIVERSAL_IDENTIFIER = 'f535f165-cc06-4ed2-bf01-cdafc24b5c6a';
export const RECORD_COMMENT_TEXT_FIELD_UNIVERSAL_IDENTIFIER =
  'bd1f1ce1-239d-4ecf-8b57-e63e6c67381d';

export const COMMENTS_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER =
  'd1b65faf-3783-4218-833d-0eb02cc56ce6';

// Images are regular attachments of the record, linked to their comment.
export const ATTACHMENT_OBJECT_UNIVERSAL_IDENTIFIER =
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.attachment.universalIdentifier;
export const ATTACHMENT_RECORD_COMMENT_FIELD_UNIVERSAL_IDENTIFIER =
  '05479234-ee8f-4033-8963-fd72d45a725c';
export const RECORD_COMMENT_IMAGES_FIELD_UNIVERSAL_IDENTIFIER =
  'b3aec497-d4df-485b-9bc2-5b95ec893d39';

// One entry per record type that gets a "Comments" tab.
// Adding a type = one entry here + nothing else.
export const COMMENT_TARGETS = [
  {
    nameSingular: 'company',
    namePlural: 'companies',
    label: 'Company',
    objectUniversalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.company.universalIdentifier,
    pageLayoutKey: 'companyRecordPage',
    commentFieldUniversalIdentifier: '00d5cc0e-b1a5-4ac5-b0c6-c7c1394b1878',
    reverseFieldUniversalIdentifier: '87720b91-cea8-4d87-96ac-1b17bf904a8a',
    tabUniversalIdentifier: '59064c18-f887-473c-ad88-09e084676ade',
    widgetUniversalIdentifier: 'e8ee95c9-008a-4904-8a11-809a73a20738',
  },
  {
    nameSingular: 'person',
    namePlural: 'people',
    label: 'Person',
    objectUniversalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
    pageLayoutKey: 'personRecordPage',
    commentFieldUniversalIdentifier: 'ec1db851-cbe5-466f-bc5e-7f7ee89d11bd',
    reverseFieldUniversalIdentifier: '3767c0e9-e2b1-4cb9-8268-e4159a8fed5f',
    tabUniversalIdentifier: '085b64fd-bd7d-47dd-8322-d2fe21df0420',
    widgetUniversalIdentifier: '93730368-7db4-431c-a9be-04ae71284bea',
  },
  {
    nameSingular: 'opportunity',
    namePlural: 'opportunities',
    label: 'Opportunity',
    objectUniversalIdentifier:
      STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.universalIdentifier,
    pageLayoutKey: 'opportunityRecordPage',
    commentFieldUniversalIdentifier: '5a6f8dde-8b23-4fdd-a02c-829f2a706ec7',
    reverseFieldUniversalIdentifier: '8d4c9c8d-72b1-4c33-9ed2-69806d85396f',
    tabUniversalIdentifier: 'de82891a-33e3-4f13-a2df-155abdd9c86c',
    widgetUniversalIdentifier: 'f1d3d1f6-6c0e-4a43-9f2b-6a8a0c1d4e27',
  },
] as const;

export type CommentTarget = (typeof COMMENT_TARGETS)[number];

// Join columns, derived from the names above:
// recordComment.<nameSingular>Id and attachment.target<NameSingular>Id.
export const commentJoinColumn = (target: CommentTarget) => `${target.nameSingular}Id`;
export const attachmentJoinColumn = (target: CommentTarget) =>
  `target${target.nameSingular[0].toUpperCase()}${target.nameSingular.slice(1)}Id`;
