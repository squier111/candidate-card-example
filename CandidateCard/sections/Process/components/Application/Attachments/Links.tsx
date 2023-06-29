import React, { forwardRef } from 'react';
import { Modal, Typography } from 'antd';

// components
import { AttachmentsList } from 'components/candidate/Attachments/AttachmentsList';
import { AttachmentsLoading } from 'components/candidate/Attachments/AttachmentsLoading';
import { useAttachments } from 'components/candidate/Attachments/useAttachments.hook';
import { Button } from 'components/common/Button/Button';
import { Stack } from 'components/common/Stack/Stack';
import { Plus } from 'components/icons';

//types
import { PersonLinksResource } from 'types/domain/attachments.types';

// hooks
import { usePersons } from 'hooks/angular/persons';
import { useCandidateLinks } from 'hooks/angular/candidate-links';

// types
import { CandidateResourceAngular } from 'types/domain/candidate.types';

const { Title } = Typography;
const { confirm } = Modal;

type LinksProps = {
	candidate: CandidateResourceAngular;
	add: () => void;
	reloadFlag: object;
};

export const Links = forwardRef(
	({ candidate, add, reloadFlag }: LinksProps, ref: React.Ref<HTMLDivElement>) => {
		const personsService = usePersons();
		const candidateLinksService = useCandidateLinks();

		const [links, totalCount, loading, reload] = useAttachments<PersonLinksResource>(
			() => personsService.getLinks({ id: candidate.person }),
			reloadFlag
		);

		function removeLink(name: string, attachmentId: number) {
			showConfirmationDeleteModal(name, () => {
				candidateLinksService.remove({ parentId: candidate.id, id: attachmentId }).$promise.then(reload);
			});
		}

		return (
			<div ref={ref}>
				<Stack vertical spacing="tight">
					<Stack distribution="equalSpacing" alignment="center" spacing="tight">
						<Title level={4}>Links ({totalCount})</Title>
						<Button type="ghost" onClick={() => add()} icon={<Plus />}>
							Add Link
						</Button>
					</Stack>
					{loading ? (
						<AttachmentsLoading />
					) : (
						<AttachmentsList candidateId={candidate.id} deleteCallback={removeLink} attachments={links} type="links" />
					)}
				</Stack>
			</div>
		);
	}
);

function showConfirmationDeleteModal(linkName: string, onOk: () => void) {
	confirm({
		title: `Remove attachment link ${linkName}`,
		icon: null,
		okText: 'Remove',
		onOk
	});
}
