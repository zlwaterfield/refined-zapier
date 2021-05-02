import * as api from './index';

interface ZapOverview {
  description: string;
  appsUsed: string[];
  stepTitles: string[];
}

export const fetchZapDetails = async (zapId: string): Promise<ZapOverview> => {
  const response = await api.v2(
    'zapQuery',
    {zapId},
    `query zapQuery($zapId: ID!) {
      zapV2(id: $zapId) {
        description
          id
          nodes {
            selectedApi
            type
            __typename
          }
        __typename
      }
    }`
  );
  return {
    description: response.zapV2.description,
    appsUsed: response.zapV2.nodes.map((n: {selectedApi: string}) => n.selectedApi || 'No app selected'),
    stepTitles: []
  };
}
