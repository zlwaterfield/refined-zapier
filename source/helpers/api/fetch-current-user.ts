import * as api from './index';

interface CurrentUser {
	id: string;
	email: string;
}

export const fetchCurrentUser = async (): Promise<CurrentUser> => {
	const response = await api.v2(
		'accountsDataQuery',
		{},
		`query accountsDataQuery {
      currentUserV2 {
        id
        email
        __typename
      }
    }`
	);
	return response.currentUserV2;
}
