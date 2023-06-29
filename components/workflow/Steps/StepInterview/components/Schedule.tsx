import React, { useEffect, useState } from 'react';
import { Modal, Menu, Dropdown } from 'antd';

//components
import { Button } from 'components/common/Button/Button';
import { CalendarBlank, ArrowCircleUp } from 'components/icons';

//types
import { CandidateStepResource } from 'types/domain/workflow.types';
import { MeetingRoomResource } from 'types/domain/meeting-room.types';

//hooks
import { UtilsService } from 'hooks/angular/utils/useUtils.hook';
import { useScheduleStepModal } from 'hooks/angular/scheduleStepModal';
import { useSessionService } from 'hooks/angular/session';
import { useCalendar } from 'hooks/angular/calendar';
import { useUtils } from 'hooks/angular/utils';
import { useCandidates } from 'hooks/angular/candidates';
import { useCandidateAutoScheduling } from 'hooks/angular/candidate-auto-scheduling';
import { useConferenceRoom } from 'hooks/angular/conference-rooms';
import { useCandidateSteps } from 'hooks/angular/candidate-steps';
import { useUsers } from 'hooks/angular/users';

const { confirm } = Modal;

export type ScheduleViewProps = {
	step: CandidateStepResource;
};

export function Schedule({ step }: ScheduleViewProps) {
	const scheduleStepModalService = useScheduleStepModal();
	const inviteForAutoSchedulingModalService = useCandidateAutoScheduling();
	const utilsService = useUtils();
	const [session] = useSessionService();
	const calendarService = useCalendar();
	const candidateService = useCandidates();
	const userService = useUsers();
	const conferenceRoomService = useConferenceRoom();
	const candidateStepsService = useCandidateSteps();

	const currentUser = userService.getCurrent();
	const currentCandidate = candidateService.getCurrent();

	const {
		companySettings: { autoSchedulingInRollout, autoSchedulingEnabled, autoSchedulingPro }
	} = session;

	const [meetingRooms, setMeetingRooms] = useState<MeetingRoomResource[]>([]);

	/* todo: is session.companySettings.autoSchedulingInRollout already enabled in all companies  */
	const isAutoSchedulingEnabled = autoSchedulingInRollout && autoSchedulingEnabled;
	const isAutoSchedulingProEnabled = isAutoSchedulingEnabled && autoSchedulingPro;
	const canUseAutoSchedulingWithMultipleStepAssignees = step.assignedTo.length > 1 && !isAutoSchedulingProEnabled;

	// const scheduleRenderCondition = isAutoSchedulingEnabled && !step.timeScheduled;

	useEffect(() => {
		conferenceRoomService.get({ parentId: session.companyId })?.$promise.then((data) => {
			setMeetingRooms(data);
		});
	}, []);

	const openScheduleModal = (step: CandidateStepResource) => {
		scheduleStepModalService.edit(step).result.then(() => {
			candidateService.reloadCurrent();
		});
	};

	const openInviteForAutoSchedulingModal = (step: CandidateStepResource) => {
		const calendarUsedInCompany = calendarService.getCalendar();

		if (!calendarUsedInCompany?.supportsAutoScheduling) {
			session.userPermissions.editCompanySettings
				? showIntegrateCompanyCalendarModal()
				: showCompanyCalendarIsDisabledModal();
			return;
		}

		if (canUseAutoSchedulingWithMultipleStepAssignees) {
			showProposeToUpgradeToAutoSchedulingProModal(() => {
				utilsService.goToOffer('auto-scheduling-pro', currentUser);
			});
			return;
		}

		if (!currentCandidate.email) {
			showCandidateEmailMissingModal();
			return;
		}

		inviteForAutoSchedulingModalService
			.open({
				meetingRooms,
				activeStep: step,
				requisitionId: currentCandidate.requisitionId
			})
			.result.then((updatedStep: CandidateStepResource) => {
				candidateStepsService.save(
					{ parentId: updatedStep.candidateId, id: updatedStep.id },
					{ sendMailByEvent: 36, ...updatedStep }
				);
			});
	};

	if (step.timeScheduled) {
		return (
			<Button onClick={() => openScheduleModal(step)} block type="ghost" icon={<CalendarBlank weight="bold" />}>
				Reschedule
			</Button>
		);
	}

	return isAutoSchedulingEnabled ? (
		<Dropdown
			trigger={['click']}
			overlay={renderScheduleMenu(
				step,
				openScheduleModal,
				openInviteForAutoSchedulingModal,
				canUseAutoSchedulingWithMultipleStepAssignees
			)}
			placement="bottom"
		>
			<Button block disclosure type="ghost" icon={<CalendarBlank weight="bold" />}>
				Schedule
			</Button>
		</Dropdown>
	) : (
		<Button block disclosure type="ghost" icon={<CalendarBlank weight="bold" />}>
			Select a time
		</Button>
	);
}

function renderScheduleMenu(
	step: CandidateStepResource,
	openScheduleModal: (step: CandidateStepResource) => void,
	openInviteForAutoSchedulingModal: (step: CandidateStepResource) => void,
	useWithMultipleAssignees: boolean
) {
	return (
		<Menu>
			<Menu.Item onClick={() => openScheduleModal(step)} key={1}>
				Select a time...
			</Menu.Item>
			<Menu.Item
				icon={!useWithMultipleAssignees && <ArrowCircleUp />}
				onClick={() => openInviteForAutoSchedulingModal(step)}
				key={2}
			>
				Invite candidate to select a time...
			</Menu.Item>
		</Menu>
	);
}

function showProposeToUpgradeToAutoSchedulingProModal(onOk: () => void) {
	confirm({
		title: 'Upgrade to Auto-Scheduling Pro for panel interviews',
		icon: <ArrowCircleUp />,
		content:
			'Win more candidates and save time by automating scheduling of panel interviews, meeting rooms reservations and more.',
		okText: 'Details',
		onOk
	});
}

function showIntegrateCompanyCalendarModal() {
	confirm({
		title: 'Complete setting up your calendar integration',
		content: (
			<>
				To get started with auto-scheduling complete the setup of your company\'s calendar integration in your&nbsp;
				<a href="#/company/settings/integrations" target="_blank" rel="noopener">
					Integrations settings
				</a>
			</>
		),
		icon: null,
		okText: 'Okay'
	});
}

function showCompanyCalendarIsDisabledModal() {
	confirm({
		title: 'Calendar integration is disabled',
		content: (
			<>
				Your system Owner or Admin must enable the calendar integration to get started with auto-scheduling.&nbsp;
				<a href="https://help.comeet.com/en/articles/3112465-integrate-calendar" target="_blank" rel="noopener">
					Learn more
				</a>
			</>
		),
		icon: null,
		okText: 'Okay'
	});
}

function showCandidateEmailMissingModal() {
	confirm({
		title: `Candidate's email address is missing`,
		content: `Please add it to the candidate's profile and try again.`,
		icon: null,
		okText: 'Okay'
	});
}
