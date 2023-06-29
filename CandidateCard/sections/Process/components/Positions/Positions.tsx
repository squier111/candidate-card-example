import React from 'react';

// libs
import { AngularTemplate } from 'bridge/angular-bridge';

export type PositionsProps = {
	candidateId: number;
};

export function Positions({ candidateId }: PositionsProps) {
	return (
		<>
			<AngularTemplate
				key={candidateId}
				template={`<person-processes
							api="{isProcessesTab: true}"
							person-ids="[candidate.person]"
							add-to-another-position="addToAnotherPosition()"
					></person-processes>
				`}
			/>
		</>
	);
}
