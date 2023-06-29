import * as React from 'react';
import { Heading } from 'components/common/Typography/Heading';

type CandidateNameProps = {
	name: string;
};

export function CandidateName({ name }: CandidateNameProps) {
	return (
		<>
			<Heading style={{ userSelect: 'text' }} level={3}>
				{name}
			</Heading>
			<span style={{ userSelect: 'text', fontSize: 0, display: 'block' }}>&nbsp;</span>
		</>
	);
}
