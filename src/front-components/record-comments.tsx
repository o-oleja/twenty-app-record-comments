import { defineFrontComponent } from 'twenty-sdk/define';
import {
  enqueueSnackbar,
  openCommandConfirmationModal,
  uploadFile,
  useLocale,
  useRecordId,
  useSelectedObjectMetadata,
  useUserId,
} from 'twenty-sdk/front-component';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { MetadataApiClient } from 'twenty-client-sdk/metadata';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { LightIconButton, MainButton } from 'twenty-ui/components/input';
import { Avatar } from 'twenty-ui/primitives/data-display';
import { Textarea } from 'twenty-ui/primitives/input';
import { Text } from 'twenty-ui/primitives/typography';
import { IconPaperclip, IconSend, IconTrash, IconX } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme';

import {
  attachmentJoinColumn,
  COMMENT_TARGETS,
  COMMENTS_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  commentJoinColumn,
  type CommentTarget,
} from 'src/constants/universal-identifiers';
import { getStrings } from 'src/utils/strings';

const POLL_INTERVAL_MS = 15_000;
const MAX_COMMENTS = 500;
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const MAX_IMAGES_PER_COMMENT = 10;
const THUMBNAIL_PX = 72;

type CommentImage = { fileId: string; label: string; url: string | null };

type RecordComment = {
  id: string;
  text: string;
  images: CommentImage[];
  createdAt: string;
  authorName: string;
  authorMemberId: string | null;
};

type UploadedFile = { fileId: string; label: string };

// The generated client is typed per object; comments are queried for whichever
// record type is open, so the dynamic parts go through this loose alias.
type LooseClient = {
  query: (request: Record<string, unknown>) => Promise<Record<string, any>>;
  mutation: (request: Record<string, unknown>) => Promise<Record<string, any>>;
};

const RecordComments = () => {
  const recordId = useRecordId();
  const userId = useUserId();
  const locale = useLocale();
  const selectedObject = useSelectedObjectMetadata();
  const s = getStrings(locale);
  const client = useMemo(() => new CoreApiClient() as unknown as LooseClient, []);

  const [target, setTarget] = useState<CommentTarget | null>(null);
  const [comments, setComments] = useState<RecordComment[]>([]);
  const [currentMemberId, setCurrentMemberId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [attachmentFileFieldId, setAttachmentFileFieldId] = useState<string | null>(null);
  const [fileInputKey, setFileInputKey] = useState(0);
  // The image expanded under the thumbnails (one at a time for the whole feed).
  const [openedImage, setOpenedImage] = useState<{ commentId: string; fileId: string } | null>(
    null,
  );

  // Which record type is open: from the page context, or by probing the record id.
  useEffect(() => {
    if (!recordId) return;
    const fromContext = COMMENT_TARGETS.find(
      ({ nameSingular }) => nameSingular === selectedObject?.nameSingular,
    );
    if (fromContext) {
      setTarget(fromContext);
      return;
    }
    (async () => {
      for (const candidate of COMMENT_TARGETS) {
        const result = await client.query({
          [candidate.namePlural]: {
            __args: { filter: { id: { eq: recordId } }, first: 1 },
            edges: { node: { id: true } },
          },
        });
        if (result[candidate.namePlural]?.edges?.length) {
          setTarget(candidate);
          return;
        }
      }
      setIsLoading(false);
    })().catch(() => setIsLoading(false));
  }, [client, recordId, selectedObject?.nameSingular]);

  // uploadFile needs the workspace id of attachment.file, not its universal identifier.
  useEffect(() => {
    const metadata = new MetadataApiClient();
    (async () => {
      const { objects } = await metadata.query({
        objects: {
          __args: { filter: {}, paging: { first: 500 } },
          edges: { node: { id: true, nameSingular: true } },
        },
      });
      const objectId = objects?.edges?.find(({ node }) => node.nameSingular === 'attachment')
        ?.node.id;
      if (!objectId) return;
      const { fields } = await metadata.query({
        fields: {
          __args: { filter: { objectMetadataId: { eq: objectId } }, paging: { first: 200 } },
          edges: { node: { id: true, name: true } },
        },
      });
      setAttachmentFileFieldId(
        fields?.edges?.find(({ node }) => node.name === 'file')?.node.id ?? null,
      );
    })().catch(() => setAttachmentFileFieldId(null));
  }, []);

  const loadComments = useCallback(async () => {
    if (!recordId || !target) return;
    try {
      const { recordComments } = await client.query({
        recordComments: {
          __args: {
            filter: { [commentJoinColumn(target)]: { eq: recordId } },
            orderBy: [{ createdAt: 'DescNullsLast' }],
            first: MAX_COMMENTS,
          },
          edges: {
            node: {
              id: true,
              text: true,
              commentImages: {
                __args: { orderBy: [{ createdAt: 'AscNullsLast' }], first: 20 },
                edges: {
                  node: { id: true, name: true, file: { fileId: true, label: true, url: true } },
                },
              },
              createdAt: true,
              createdBy: { name: true, workspaceMemberId: true },
            },
          },
        },
      });
      setComments(
        (recordComments?.edges ?? []).map(({ node }: { node: any }) => ({
          id: node.id,
          text: node.text ?? '',
          images: (node.commentImages?.edges ?? []).flatMap(
            ({ node: attachment }: { node: any }) => {
              const file = (
                attachment.file as { fileId: string; label: string; url?: string | null }[] | null
              )?.[0];
              return file
                ? [{ fileId: file.fileId, label: attachment.name || file.label, url: file.url ?? null }]
                : [];
            },
          ),
          createdAt: node.createdAt,
          authorName: node.createdBy?.name || s.noName,
          authorMemberId: node.createdBy?.workspaceMemberId ?? null,
        })),
      );
      setLoadError(null);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : String(error));
    } finally {
      setIsLoading(false);
    }
  }, [client, recordId, target, s.noName]);

  useEffect(() => {
    if (!userId) return;
    client
      .query({
        workspaceMembers: {
          __args: { filter: { userId: { eq: userId } }, first: 1 },
          edges: { node: { id: true } },
        },
      })
      .then(({ workspaceMembers }) =>
        setCurrentMemberId(workspaceMembers?.edges?.[0]?.node?.id ?? null),
      )
      .catch(() => setCurrentMemberId(null));
  }, [client, userId]);

  useEffect(() => {
    if (!target) return;
    setIsLoading(true);
    void loadComments();
    const timer = setInterval(() => void loadComments(), POLL_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [loadComments, target]);

  const addFiles = (files: FileList | File[] | null | undefined) => {
    const picked = Array.from(files ?? []);
    const images = picked.filter((file) => file.type.startsWith('image/'));
    const tooBig = images.filter((file) => file.size > MAX_IMAGE_BYTES);
    if (images.length < picked.length) {
      enqueueSnackbar({ message: s.onlyImages, variant: 'warning' });
    }
    if (tooBig.length > 0) {
      enqueueSnackbar({ message: s.imageTooBig, variant: 'warning' });
    }
    const accepted = images.filter((file) => file.size <= MAX_IMAGE_BYTES);
    setPendingFiles((current) => [...current, ...accepted].slice(0, MAX_IMAGES_PER_COMMENT));
    setFileInputKey((key) => key + 1);
  };

  const sendComment = async () => {
    const text = draft.trim();
    if ((!text && pendingFiles.length === 0) || !recordId || !target || isSending) return;
    if (pendingFiles.length > 0 && !attachmentFileFieldId) {
      enqueueSnackbar({ message: s.uploadUnavailable, variant: 'error' });
      return;
    }
    setIsSending(true);
    try {
      // 1. Upload first, so a failed upload leaves no half-made comment.
      const uploaded: UploadedFile[] = [];
      for (const file of pendingFiles) {
        const result = await uploadFile(file, {
          fieldMetadataId: attachmentFileFieldId as string,
          fileName: file.name,
        });
        if (result.status !== 'uploaded') {
          throw new Error(s.uploadFailed(file.name, result.reason));
        }
        uploaded.push({ fileId: result.file.fileId, label: file.name });
      }
      // 2. The comment.
      const { createRecordComment } = await client.mutation({
        createRecordComment: {
          __args: { data: { text, [commentJoinColumn(target)]: recordId } },
          id: true,
        },
      });
      // 3. Each image becomes an attachment of the record, linked to the comment.
      for (const file of uploaded) {
        await client.mutation({
          createAttachment: {
            __args: {
              data: {
                name: file.label,
                file: [file],
                recordCommentId: createRecordComment?.id,
                [attachmentJoinColumn(target)]: recordId,
              },
            },
            id: true,
          },
        });
      }
      setDraft('');
      setPendingFiles([]);
      await loadComments();
    } catch (error) {
      enqueueSnackbar({
        message: s.sendFailed(error instanceof Error ? error.message : String(error)),
        variant: 'error',
      });
    } finally {
      setIsSending(false);
    }
  };

  const deleteComment = async (comment: RecordComment) => {
    const result = await openCommandConfirmationModal({
      title: s.deleteTitle,
      subtitle:
        comment.text.length > 80
          ? `${comment.text.slice(0, 80)}…`
          : comment.text || s.imagesCount(comment.images.length),
      confirmButtonText: s.delete,
      confirmButtonAccent: 'danger',
    });
    if (result !== 'confirm') return;
    try {
      await client.mutation({
        deleteRecordComment: { __args: { id: comment.id }, id: true },
      });
      await loadComments();
    } catch (error) {
      enqueueSnackbar({
        message: s.deleteFailed(error instanceof Error ? error.message : String(error)),
        variant: 'error',
      });
    }
  };

  const spacing = themeCssVariables.spacing;

  if (!recordId) {
    return (
      <div style={{ padding: spacing['4'] }}>
        <Text color="tertiary">{s.openRecord}</Text>
      </div>
    );
  }

  if (!target && !isLoading) {
    return (
      <div style={{ padding: spacing['4'] }}>
        <Text color="tertiary">{s.unsupportedRecord}</Text>
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: spacing['3'],
        padding: spacing['3'],
        boxSizing: 'border-box',
        minWidth: 0,
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: spacing['2'] }}>
        <label htmlFor="record-comment-input">
          <Text size="sm" color="secondary">
            {s.newComment}
          </Text>
        </label>
        <Textarea
          id="record-comment-input"
          value={draft}
          onValueChange={(value) => setDraft(value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
              event.preventDefault();
              void sendComment();
            }
          }}
          placeholder={s.placeholder}
          rows={3}
          disabled={isSending || !target}
        />
        {pendingFiles.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: spacing['1'] }}>
            {pendingFiles.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: spacing['1'],
                  padding: `${spacing['1']} ${spacing['2']}`,
                  borderRadius: themeCssVariables.border.radius.sm,
                  background: themeCssVariables.background.tertiary,
                  maxWidth: '100%',
                  minWidth: 0,
                }}
              >
                <Text size="sm">{file.name}</Text>
                <LightIconButton
                  aria-label={s.removeFile(file.name)}
                  size="xs"
                  disabled={isSending}
                  onClick={() =>
                    setPendingFiles((current) => current.filter((_, i) => i !== index))
                  }
                >
                  <IconX size={12} />
                </LightIconButton>
              </div>
            ))}
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <label
            htmlFor="record-comment-files"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: spacing['1'],
              cursor: isSending ? 'default' : 'pointer',
              opacity: isSending ? 0.5 : 1,
            }}
          >
            <IconPaperclip size={14} />
            <Text size="sm" color="secondary">
              {s.attachImage}
            </Text>
          </label>
          <input
            key={fileInputKey}
            id="record-comment-files"
            type="file"
            accept="image/*"
            multiple
            disabled={isSending || !target}
            style={{ display: 'none' }}
            onChange={(event) => addFiles(event.target.files)}
          />
          <MainButton
            onClick={() => void sendComment()}
            disabled={(!draft.trim() && pendingFiles.length === 0) || isSending || !target}
            loading={isSending}
            startIcon={<IconSend size={14} />}
          >
            {s.send}
          </MainButton>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: spacing['2'] }}>
        {isLoading && comments.length === 0 && <Text color="tertiary">{s.loading}</Text>}
        {loadError && <Text color="secondary">{s.loadFailed(loadError)}</Text>}
        {!isLoading && !loadError && comments.length === 0 && (
          <Text color="tertiary">{s.empty}</Text>
        )}
        {comments.map((comment) => {
          const isOwn = currentMemberId !== null && comment.authorMemberId === currentMemberId;
          const opened =
            openedImage?.commentId === comment.id
              ? comment.images.find(({ fileId }) => fileId === openedImage.fileId)
              : undefined;
          return (
            <div
              key={comment.id}
              style={{
                display: 'flex',
                gap: spacing['2'],
                padding: spacing['2'],
                borderRadius: themeCssVariables.border.radius.md,
                background: isOwn
                  ? themeCssVariables.background.tertiary
                  : themeCssVariables.background.secondary,
                minWidth: 0,
              }}
            >
              <Avatar
                name={comment.authorName}
                colorSeed={comment.authorMemberId ?? comment.authorName}
                size="md"
              />
              <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: spacing['2'] }}>
                  <Text weight="semibold" size="sm">
                    {comment.authorName}
                  </Text>
                  <Text size="xs" color="tertiary">
                    {new Date(comment.createdAt).toLocaleString(locale, {
                      day: '2-digit',
                      month: '2-digit',
                      year: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                  <div style={{ flex: 1 }} />
                  {isOwn && (
                    <LightIconButton
                      aria-label={s.deleteComment}
                      tooltip={s.delete}
                      size="xs"
                      onClick={() => void deleteComment(comment)}
                    >
                      <IconTrash size={14} />
                    </LightIconButton>
                  )}
                </div>
                {comment.text && (
                  <div style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>
                    <Text size="md">{comment.text}</Text>
                  </div>
                )}
                {comment.images.length > 0 && (
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: spacing['2'],
                      marginTop: spacing['1'],
                    }}
                  >
                    {comment.images.map((image) => {
                      const isOpen = opened?.fileId === image.fileId;
                      return image.url ? (
                        <button
                          key={image.fileId}
                          type="button"
                          title={image.label}
                          aria-label={s.openImage(image.label)}
                          onClick={() =>
                            setOpenedImage(
                              isOpen ? null : { commentId: comment.id, fileId: image.fileId },
                            )
                          }
                          style={{
                            padding: 0,
                            border: `2px solid ${
                              isOpen ? themeCssVariables.color.blue : 'transparent'
                            }`,
                            borderRadius: themeCssVariables.border.radius.sm,
                            background: 'none',
                            cursor: 'pointer',
                            lineHeight: 0,
                          }}
                        >
                          <img
                            src={image.url}
                            alt={image.label}
                            style={{
                              display: 'block',
                              width: `${THUMBNAIL_PX}px`,
                              height: `${THUMBNAIL_PX}px`,
                              objectFit: 'cover',
                              borderRadius: themeCssVariables.border.radius.sm,
                            }}
                          />
                        </button>
                      ) : (
                        <Text key={image.fileId} size="sm" color="tertiary">
                          {image.label}
                        </Text>
                      );
                    })}
                  </div>
                )}
                {opened?.url && (
                  <div
                    tabIndex={-1}
                    onKeyDown={(event) => {
                      if (event.key === 'Escape') setOpenedImage(null);
                    }}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: spacing['1'],
                      marginTop: spacing['2'],
                      padding: spacing['2'],
                      borderRadius: themeCssVariables.border.radius.md,
                      background: themeCssVariables.background.primary,
                      border: `1px solid ${themeCssVariables.border.color.medium}`,
                      minWidth: 0,
                      outline: 'none',
                    }}
                  >
                    <div
                      style={{ display: 'flex', alignItems: 'center', gap: spacing['2'], minWidth: 0 }}
                    >
                      <div
                        style={{
                          flex: 1,
                          minWidth: 0,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        <Text size="sm" color="secondary">
                          {opened.label}
                        </Text>
                      </div>
                      <a
                        href={opened.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ flexShrink: 0, textDecoration: 'none' }}
                      >
                        <Text size="sm" color="secondary">
                          {s.original}
                        </Text>
                      </a>
                      <LightIconButton
                        aria-label={s.closeImage}
                        tooltip={s.close}
                        size="xs"
                        onClick={() => setOpenedImage(null)}
                      >
                        <IconX size={14} />
                      </LightIconButton>
                    </div>
                    <button
                      type="button"
                      aria-label={s.closeImage}
                      title={s.clickToClose}
                      onClick={() => setOpenedImage(null)}
                      style={{
                        padding: 0,
                        border: 'none',
                        background: 'none',
                        cursor: 'zoom-out',
                        lineHeight: 0,
                      }}
                    >
                      <img
                        src={opened.url}
                        alt={opened.label}
                        style={{
                          display: 'block',
                          maxWidth: '100%',
                          maxHeight: '70vh',
                          margin: '0 auto',
                          objectFit: 'contain',
                          borderRadius: themeCssVariables.border.radius.sm,
                        }}
                      />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default defineFrontComponent({
  universalIdentifier: COMMENTS_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  name: 'Record comments',
  description: 'Comment feed with image attachments for the open record',
  component: RecordComments,
});
