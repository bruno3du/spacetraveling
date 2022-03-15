import * as prismic from '@prismicio/client';

export function getPrismicClient(req?: unknown): prismic.Client {
  const endpoint = prismic.getRepositoryEndpoint(
    process.env.PRISMIC_API_ENDPOINT
  );
  const client = prismic.createClient(endpoint, {
    accessToken: process.env.PRISMIC_API_ACCESS_TOKEN,
  });
  client.enableAutoPreviewsFromReq(req);

  return client;
}
