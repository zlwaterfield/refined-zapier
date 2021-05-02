import * as api from './index';

export const updateZapDescription = async (zapId: string, description: string): Promise<void> => {
	await api.v2(
		'SetZapDescription',
		{id: zapId, description},
		`mutation SetZapDescription($id: ID!, $description: String!) {
      setZapDescription(id: $id, description: $description) {
        description
        id
        __typename
      }
    }`
	);
}
