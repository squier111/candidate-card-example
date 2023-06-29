import React, { useState, useEffect, useCallback, forwardRef, useMemo } from 'react';
import { Modal, Typography, Space, Menu, Dropdown, Tag } from 'antd';

//components
import { UploadSimple, DownloadSimple, Trash, Printer, DotsThreeOutline, Check } from 'components/icons';
import { AttachmentsLoading } from 'components/candidate/Attachments/AttachmentsLoading';
import { Button } from 'components/common/Button/Button';
import { Stack } from 'components/common/Stack/Stack';
import { UploadResume } from 'components/common/Upload/UploadResume/UploadResume';
import { Empty } from 'components/common/Empty/Empty';
import { ResumeViewer } from 'components/common/ResumeViewer/ResumeViewer';

import { getDefaultSelectedResume, groupResumesByPosition } from './resume.utils';

import { candidateResumeApi } from 'transport/candidateResume/candidateResume.api';
import { useConfig } from 'hooks/angular/config';
import { PersonResumeResource } from 'types/domain/person.types';

const { Title } = Typography;
const { confirm } = Modal;

interface ResumeProps {
	personId: number;
	candidateId: number;
	positionId: number;
}

export const Resume = forwardRef((props: ResumeProps, ref: React.Ref<HTMLDivElement>) => {
	const config = useConfig();

	const [resumeList, setResumeList] = useState<PersonResumeResource[]>([]);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [selectedResume, setSelectedResume] = useState<PersonResumeResource | null>(null);

	const loadResumeList = useCallback(() => {
		setIsLoading(true);
		candidateResumeApi.getAllByPersonId(config, props.personId).then((resumes) => {
			setResumeList(resumes);
			if (resumes.length > 0) {
				setSelectedResume(getDefaultSelectedResume(resumes, props.candidateId));
			}
			setIsLoading(false);
		});
	}, [props.personId]);

	const deleteResume = useCallback(() => {
		showConfirmationDeleteModal(() => {
			setIsLoading(true);
			candidateResumeApi
				.remove(config, selectedResume!.candidateId, selectedResume!.parentResumeId)
				.then(loadResumeList);
		});
	}, [selectedResume]);

	const makePrimary = useCallback(() => {
		setIsLoading(true);
		candidateResumeApi
			.makeCurrent(config, selectedResume!.candidateId, selectedResume!.parentResumeId)
			.then(loadResumeList);
	}, [selectedResume]);

	const openResume = useCallback(() => {
		openResumeInNewTab(selectedResume!, false);
	}, [selectedResume]);

	const printResume = useCallback(() => {
		openResumeInNewTab(selectedResume!, true);
	}, [selectedResume]);

	function openResumeInNewTab(resume: PersonResumeResource, forPrint: boolean) {
		const targetLink = forPrint ? resume.pdfForPrint : resume.pdfUrl;
		const windowWithResume = window.open(targetLink, '_blank');
		if (windowWithResume === null) {
			return;
		}
		windowWithResume.focus();
		windowWithResume.close();
	}

	const UploadWrapper = ({ children }: React.PropsWithChildren<object>) => {
		return (
			<UploadResume
				candidateId={props.candidateId}
				onUploadStarted={() => setIsLoading(true)}
				onUploadFailed={() => setIsLoading(false)}
				onUploadSuccess={() => loadResumeList()}
			>
				{children}
			</UploadResume>
		);
	};

	useEffect(() => {
		loadResumeList();
		return () => setSelectedResume(null);
	}, [props.personId]);

	return (
		<div ref={ref}>
			<Stack vertical spacing="tight">
				<Stack distribution="equalSpacing" alignment="center" spacing="tight">
					<Title level={4}>Resume</Title>
					{!isLoading && (
						<>
							{resumeList.length === 0 ? (
								<UploadWrapper>
									<Button type="ghost" icon={<UploadSimple />}>
										Upload Resume
									</Button>
								</UploadWrapper>
							) : (
								<Stack wrap={false} spacing="tight" alignment="center" distribution="leading">
									<ResumeSelector
										resumes={resumeList}
										selectedResume={selectedResume!}
										onSelect={setSelectedResume}
										candidateId={props.candidateId}
										positionId={props.positionId}
										uploadComponent={UploadWrapper}
									/>
									<ResumeActionsMenu
										selectedResume={selectedResume!}
										candidateId={props.candidateId}
										onMakePrimary={makePrimary}
										onDelete={deleteResume}
										onPrint={printResume}
										onDownload={openResume}
									/>
								</Stack>
							)}
						</>
					)}
				</Stack>
				<>
					{isLoading && <AttachmentsLoading />}
					{!isLoading && resumeList.length === 0 && <Empty description={'No resume'} />}
					{!isLoading && selectedResume && <ResumeViewer sourceUrl={selectedResume.pdfUrl} candidateId={props.candidateId} allowSaveOnSelect={true} />}
				</>
			</Stack>
		</div>
	);
});

type MoreMenuOptions = {
	selectedResume: PersonResumeResource;
	candidateId: number;
	onMakePrimary: () => void;
	onDownload: () => void;
	onPrint: () => void;
	onDelete: () => void;
};

const ResumeActionsMenu = (props: MoreMenuOptions) => {
	const canBeMadePrimary = props.selectedResume.candidateId === props.candidateId && !props.selectedResume.isCurrent;

	const menuOptions = () => (
		<Menu>
			<Menu.Item key="1" onClick={props.onMakePrimary} icon={<Check />} disabled={!canBeMadePrimary}>
				Make primary
			</Menu.Item>
			<Menu.Item key="2" onClick={props.onDownload} icon={<DownloadSimple />}>
				Download
			</Menu.Item>
			<Menu.Item key="3" onClick={props.onPrint} icon={<Printer />}>
				Print
			</Menu.Item>
			<Menu.Item key="4" onClick={props.onDelete} icon={<Trash />}>
				Delete
			</Menu.Item>
		</Menu>
	);

	return (
			<Dropdown trigger={['click']} overlay={menuOptions}>
				<Button neutral type="ghost" icon={<DotsThreeOutline style={{ fontSize: '20px' }} />} />
			</Dropdown>
	);
};

type ResumeSelectorProps = {
	resumes: PersonResumeResource[];
	selectedResume: PersonResumeResource;
	onSelect: (resume: PersonResumeResource) => void;
	candidateId: number;
	positionId: number;
	uploadComponent: React.FunctionComponent;
};

function ResumeSelector(props: ResumeSelectorProps) {
	const resumesGroupedByPosition = useMemo(
		() => groupResumesByPosition(props.resumes, props.positionId),
		[props.resumes, props.positionId]
	);
	const primaryResumeId = useMemo(() => {
		const primaryResume = props.resumes.find((resume) => resume.candidateId == props.candidateId && resume.isCurrent);
		return primaryResume?.parentResumeId;
	}, [props.resumes]);

	function formatDate(date: Date) {
		return moment(date).format('DD MMM YYYY');
	}

	const WrapperComponent = props.uploadComponent;
	const renderMenu = () => (
		<Menu selectedKeys={[`${props.selectedResume}`]}>
			<WrapperComponent>
				<Menu.Item key="download" icon={<UploadSimple />}>
					Upload resume
				</Menu.Item>
			</WrapperComponent>
			<Menu.Divider />
			{resumesGroupedByPosition.map((position) => {
				return (
					<React.Fragment key={`f${position.positionId}`}>
						<Menu.ItemGroup title={position.positionName} />
						{position.resumeList.map((item) => {
							return (
								<Menu.Item
									key={item.parentResumeId}
									onClick={() => {
										props.onSelect(item);
									}}
								>
									<Space>
										<Typography>{formatDate(item.timeCreated)}</Typography>
										{item.parentResumeId == primaryResumeId && <Tag color="processing">Primary</Tag>}
									</Space>
								</Menu.Item>
							);
						})}
					</React.Fragment>
				);
			})}
		</Menu>
	);

	return (
		<Dropdown trigger={['click']} overlay={renderMenu()}>
			<Button disclosure={'down'} neutral type="ghost">
				Resume added: {formatDate(props.selectedResume.timeCreated)}
			</Button>
		</Dropdown>
	);
}

function showConfirmationDeleteModal(onOk: () => void) {
	confirm({
		title: `Delete resume?`,
		icon: null,
		okText: 'Delete',
		onOk
	});
}
