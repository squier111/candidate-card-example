import React, { useRef, useMemo } from 'react';
import { Divider } from 'antd';
import { Sticky, StickyContainer } from 'react-sticky';

//components
import { Stack } from 'components/common/Stack/Stack';

// components
import { Files } from './Attachments/Files';
import { Links } from './Attachments/Links';
import { Resume } from './Resume/Resume'
import { JumpToApplicationSection } from './JumpToApplicationSection/JumpToSection';
import { Questionnaires } from './Questionnaires/Questionnaires';

//types
import { CandidateResourceAngular } from 'types/domain/candidate.types';

// styled
import * as S from './Application.styled';

export type ApplicationProps = {
	candidate: CandidateResourceAngular;
	addLink: () => void;
	addFile: () => void;
	reloadLinks: object;
	reloadFiles: object;
};

export function Application({ candidate, addLink, addFile, reloadLinks, reloadFiles }: ApplicationProps) {
	const linksRef = useRef<HTMLDivElement>(null);
	const filesRef = useRef<HTMLDivElement>(null);
	const resumeRef = useRef<HTMLDivElement>(null);
	const questionnairesRef = useRef<HTMLDivElement>(null);

	const sections = [
		{
			id: 1,
			title: 'Resume',
			ref: resumeRef.current
		},
		{
			id: 2,
			title: 'Links',
			ref: linksRef.current
		},
		{
			id: 3,
			title: 'Files',
			ref: filesRef.current
		},
		{
			id: 4,
			title: 'Questionnaires',
			ref: questionnairesRef.current
		}
	];

	return (
		<StickyContainer>
			<Stack vertical spacing="normal">
				<Sticky topOffset={-110}>
					{({ style, isSticky }) => (
						<S.JumpToBar isSticky={isSticky} style={style}>
							<JumpToApplicationSection sections={sections} offset={200} />
						</S.JumpToBar>
					)}
				</Sticky>
				<Stack vertical spacing="tight" split={<Divider />}>
					<Resume ref={resumeRef} personId={candidate.person} candidateId={candidate.id} positionId={candidate.requisitionId} />
					<Links ref={linksRef} add={addLink} candidate={candidate} reloadFlag={reloadLinks} />
					<Files ref={filesRef} add={addFile} candidate={candidate} reloadFlag={reloadFiles} />
					<Questionnaires candidate={candidate} ref={questionnairesRef} />
				</Stack>
			</Stack>
		</StickyContainer>
	);
}
