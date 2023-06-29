import React, { forwardRef } from 'react';
import { Modal, Typography } from 'antd';

// components
import { AttachmentsList } from 'components/candidate/Attachments/AttachmentsList';
import { AttachmentsLoading } from 'components/candidate/Attachments/AttachmentsLoading';
import { useAttachments } from 'components/candidate/Attachments/useAttachments.hook';
import { Button } from 'components/common/Button/Button';
import { Stack } from 'components/common/Stack/Stack';
import { UploadSimple } from 'components/icons';

//types
import { PersonFilesResource } from 'types/domain/attachments.types';

// hooks
import { usePersons } from 'hooks/angular/persons';
import { useCandidateFiles } from 'hooks/angular/candidate-files';

// types
import { CandidateResourceAngular } from 'types/domain/candidate.types';

const { Title } = Typography;
const { confirm } = Modal;

type FilesProps = {
	candidate: CandidateResourceAngular;
	add: () => void;
	reloadFlag: object;
};

export const Files = forwardRef(
	({ candidate, add, reloadFlag }: FilesProps, ref: React.Ref<HTMLDivElement>) => {
		const personsService = usePersons();
		const candidateFilesService = useCandidateFiles();

		const [files, totalCount, loading, reload] = useAttachments<PersonFilesResource>(
			() => personsService.getFiles({ id: candidate.person }),
			reloadFlag
		);

		function removeFile(name: string, attachmentId: number) {
			showConfirmationDeleteModal(name, () =>
				candidateFilesService.remove({ parentId: candidate.id, id: attachmentId }).$promise.then(reload)
			);
		}

		return (
			<div ref={ref}>
				<Stack vertical spacing="tight">
					<Stack.Item></Stack.Item>
					<Stack distribution="equalSpacing" alignment="center" spacing="tight">
						<Title level={4}>Files ({totalCount})</Title>
						<Button type="ghost" onClick={() => add()} icon={<UploadSimple />}>
							Upload File
						</Button>
					</Stack>
					{loading ? (
						<AttachmentsLoading />
					) : (
						<AttachmentsList candidateId={candidate.id} deleteCallback={removeFile} attachments={files} type="files" />
					)}
				</Stack>
			</div>
		);
	}
);

function showConfirmationDeleteModal(fileName: string, onOk: () => void) {
	confirm({
		title: `Remove attachment file ${fileName}`,
		icon: null,
		okText: 'Remove',
		onOk
	});
}
