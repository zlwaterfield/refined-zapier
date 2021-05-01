import delegate from 'delegate-it';

import features from '.';
import * as api from '../helpers/api';
import {isZaps}  from '../helpers/page-detect';
import {onDashboardZapHover} from '../events/on-div-hover';

const friendlyNameForApis = new Map<string, string>([
    // TODO: Add more APIs here.
    ['GoogleMailV2API', 'GMail'],
    ['GoogleDocsV2API', 'Google Docs'],
    ['GoogleDriveAPI', 'Google Drive'],
    ['GoogleCalendarAPI', 'Google Calendar'],
    ['GoogleSheetsV2API', 'Google Sheets'],
]);

async function handleZapHover(event: delegate.Event<MouseEvent>): Promise<void> {
    const zapId = event.delegateTarget.getAttribute('data-zap-id');
    if (zapId === null) {
        console.log("Unexpected missing zapId");
        return;
    }
    if (event.type === 'mouseover') {
        const overview = await fetchZapOverview(zapId);
        console.log(overview);
        // TODO: Create the tooltip hover to show if needed.
        // TODO: Show the hover.
        console.log("Will show hover for zapId: " + zapId);
    } else if (event.type === 'mouseout') {
        // TODO: Hide the hover.
        console.log("Will hide hover for zapId: " + zapId);
    }
}

interface ZapOverview {
    description: string;
    appsUsed: string[];
    stepTitles: string[];
}

async function fetchZapOverview(zapId: string): Promise<ZapOverview> {
    const response = await api.v2(
        /* operationName */ "zapQuery",
        /* variables */ {"zapId": zapId},
        /* query */ `query zapQuery($zapId: ID!) {
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
        }`);
        return {
            description: response.zapV2.description,
            appsUsed: response.zapV2.nodes.map((n: { selectedApi: string; }) => apiNameToUse(n.selectedApi)),
            stepTitles: [],
        };
}

function apiNameToUse(apiName: string): string {
    if (friendlyNameForApis.has(apiName)) {
        return friendlyNameForApis.get(apiName)!;
    }
    return apiName;
}

async function init(): Promise<false | void> {
    onDashboardZapHover(handleZapHover);
    // Pre-cache the hover information
}

void features.add(__filebasename, {
    include: [
        isZaps
    ],
    init
});
