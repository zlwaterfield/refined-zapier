import mem from 'mem'
import {JsonObject} from 'type-fest';

export * from './fetch-zap-details';
export * from './update-zap-description';
export * from './fetch-current-user';

interface JsonError {
	message: string;
}

interface GraphQLResponse {
	message?: string;
	data?: JsonObject;
	errors?: JsonError[];
}

const api2 = 'https://zapier.com/api/graphql/v2';

export class RefinedZapierAPIError extends Error {
	response: AnyObject = {};
	constructor(...messages: string[]) {
		super(messages.join('\n'));
	}
}

export const v2 = mem(async (
    operationName: string,
    variables: Object,
	query: string,
): Promise<AnyObject> => {
	if (/^(query )?{/.test(query.trimStart())) {
		throw new TypeError('`query` should only be what’s inside \'query {...}\', like \'user(login: "foo") { name }\', but is \n' + query);
	}

    const graphqlRequest = {operationName: operationName, variables: variables, query: query};

	const response = await fetch(api2, {
		headers: {
			'User-Agent': 'Refined Zapier',
            'Content-Type': 'application/json',
		},
		method: 'POST',
		body: JSON.stringify(graphqlRequest)
	});

	const apiResponse: GraphQLResponse = await response.json();

	const {
		data = {},
		errors = []
	} = apiResponse;

	if (errors.length > 0) {
		throw new RefinedZapierAPIError('GraphQL:', ...errors.map(error => error.message));
	}

	if (response.ok) {
		return data;
	}

	throw await getError(apiResponse as JsonObject);
}, {
	cacheKey: JSON.stringify
});


export async function getError(apiResponse: JsonObject): Promise<RefinedZapierAPIError> {
	const error = new RefinedZapierAPIError(
		'Unable to fetch.',
        'Something went wrong',
		JSON.stringify(apiResponse, null, '\t') // Beautify
	);
	error.response = apiResponse;
	return error;
}
