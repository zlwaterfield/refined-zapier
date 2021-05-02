import * as api from './index';

interface ZapOverview {
	description: string;
	appsUsed: string[];
	stepTitles: string[];
}

const friendlyNameForApis = new Map<string, string>([
	// TODO: Add more APIs here.
	['GoogleMailV2API', 'GMail'],
	['GoogleDocsV2API', 'Google Docs'],
	['GoogleDriveAPI', 'Google Drive'],
	['GoogleCalendarAPI', 'Google Calendar'],
	['GoogleSheetsV2API', 'Google Sheets']
]);

function apiNameToUse(apiName: string): string {
	if (friendlyNameForApis.has(apiName)) {
		return friendlyNameForApis.get(apiName)!;
	}

	return apiName;
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
		appsUsed: response.zapV2.nodes.map((n: {selectedApi: string}) => apiNameToUse(n.selectedApi)),
		stepTitles: []
	};
}
