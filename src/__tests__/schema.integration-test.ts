import { CoreApiClient } from 'twenty-client-sdk/core';
import { MetadataApiClient } from 'twenty-client-sdk/metadata';
import { APPLICATION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { describe, expect, it } from 'vitest';

// The typed client only knows about recordComment once the app is installed,
// so the app's own queries go through a loosely typed alias.
type LooseClient = {
  query: (request: Record<string, unknown>) => Promise<Record<string, any>>;
  mutation: (request: Record<string, unknown>) => Promise<Record<string, any>>;
};

describe('App installation', () => {
  it('should find the installed app in the applications list', async () => {
    const client = new MetadataApiClient();

    const result = await client.query({
      findManyApplications: {
        id: true,
        name: true,
        universalIdentifier: true,
      },
    });

    const app = result.findManyApplications.find(
      (a: { universalIdentifier: string }) =>
        a.universalIdentifier === APPLICATION_UNIVERSAL_IDENTIFIER,
    );

    expect(app).toBeDefined();
  });
});

describe('recordComment', () => {
  it('should attach a comment to a company and delete it with the company', async () => {
    const client = new CoreApiClient() as unknown as LooseClient;

    const { createCompany } = await client.mutation({
      createCompany: { __args: { data: { name: 'Record Comments test' } }, id: true },
    });
    const companyId: string = createCompany.id;

    try {
      const { createRecordComment } = await client.mutation({
        createRecordComment: {
          __args: { data: { text: 'Hello from the integration test', companyId } },
          id: true,
        },
      });
      expect(createRecordComment.id).toBeDefined();

      const { recordComments } = await client.query({
        recordComments: {
          __args: { filter: { companyId: { eq: companyId } } },
          edges: { node: { id: true, text: true, commentImages: { edges: { node: { id: true } } } } },
        },
      });
      expect(recordComments.edges).toHaveLength(1);
      expect(recordComments.edges[0].node.text).toBe('Hello from the integration test');
      expect(recordComments.edges[0].node.commentImages.edges).toHaveLength(0);
    } finally {
      await client.mutation({ destroyCompany: { __args: { id: companyId }, id: true } });
    }
  });
});
