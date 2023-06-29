import React, { useRef, useState } from 'react';
import { Card, Col, Row } from 'antd';

//components
import { Stack } from 'components/common/Stack/Stack';
import { FileText } from 'components/icons';
import { Heading } from 'components/common/Typography/Heading';

// components
import { Button } from 'components/common/Button/Button';
import { DrawerMobileComponent } from 'pages/Candidate/CandidateCard/layout/DrawerMobileComponent';
import { Resume } from './Resume/Resume';

//hooks
import { useAttachments } from 'components/candidate/Attachments/useAttachments.hook';
import { usePersons } from 'hooks/angular/persons';

//types
import { CandidateResourceAngular } from 'types/domain/candidate.types';
import { PersonFilesResource, PersonLinksResource } from 'types/domain/attachments.types';
import { Links } from './Attachments/Links';
import { Files } from './Attachments/Files';
import { Questionnaires } from './Questionnaires/Questionnaires';

// styled

export type ApplicationProps = {
	candidate: CandidateResourceAngular;
	addLink: () => void;
	addFile: () => void;
	reloadLinks: object;
	reloadFiles: object;
};

export function ApplicationMobile({ candidate, addLink, addFile, reloadLinks, reloadFiles }: ApplicationProps) {
	const resumeRef = useRef<HTMLDivElement>(null);
	const [expandedLinks, setExpandedLinks] = useState(false);
	const [expandedFiles, setExpandedFiles] = useState(false);
	const [expandedQuestionnaires, setExpandedQuestionnaires] = useState(false);

	const personsService = usePersons();
	const [links, totalCountLinks] = useAttachments<PersonLinksResource>(
		() => personsService.getLinks({ id: candidate.person }),
		reloadLinks
	);

	const [files, totalCountFiles] = useAttachments<PersonFilesResource>(
		() => personsService.getFiles({ id: candidate.person }),
		reloadFiles
	);

	return (
		<Card
			size="small"
			title={
				<Stack wrap={false} alignment="center" spacing="tight">
					<FileText weight="duotone" />
					<Heading level={4}>Application</Heading>
				</Stack>
			}
		>
			<Stack vertical spacing="tight">
				<Resume
					ref={resumeRef}
					personId={candidate.person}
					candidateId={candidate.id}
					positionId={candidate.requisitionId}
				/>
				<Row gutter={[8, 8]}>
					{/* Notes button will be for future implementation */}
					{/* <Col span={12}>
					<Button size="large" block neutral type="default">
						Notes
					</Button>
				</Col> */}
					<Col span={12}>
						<Button size="large" block neutral type="default" onClick={() => setExpandedLinks(true)}>
							Links ({totalCountLinks})
						</Button>
					</Col>
					<Col span={12}>
						<Button size="large" block neutral type="default" onClick={() => setExpandedFiles(true)}>
							Files ({totalCountFiles})
						</Button>
					</Col>
					<Col span={24}>
						<Button size="large" block neutral type="default" onClick={() => setExpandedQuestionnaires(true)}>
							Questionnaires
						</Button>
					</Col>
				</Row>
				<DrawerMobileComponent title="Links" drawerIcon={null} expanded={expandedLinks} setExpanded={setExpandedLinks}>
					<Links add={addLink} candidate={candidate} reloadFlag={reloadLinks} />
				</DrawerMobileComponent>
				<DrawerMobileComponent title="Files" drawerIcon={null} expanded={expandedFiles} setExpanded={setExpandedFiles}>
					<Files add={addFile} candidate={candidate} reloadFlag={reloadFiles} />
				</DrawerMobileComponent>
				<DrawerMobileComponent
					title="Questionnaires"
					drawerIcon={null}
					expanded={expandedQuestionnaires}
					setExpanded={setExpandedQuestionnaires}
				>
					<Questionnaires candidate={candidate} />
				</DrawerMobileComponent>
			</Stack>
		</Card>
	);
}
