import React from 'react';
import { Menu, Dropdown } from 'antd';

// hooks
import { useCandidates } from 'hooks/angular/candidates';

// metadata
import { StatusesEnum } from 'metadata/candidate/candidate.meta';

// types
import { CandidateStatus } from 'types/domain/candidate.types';

// components
import { Stack } from 'components/common/Stack/Stack';
import { Button } from 'components/common/Button/Button';
import { CandidateStatusButton } from 'components/candidate/CandidateStatusInfo/CandidateStatusButton';
import { CandidateStatusTag } from 'components/candidate/CandidateStatusInfo/CandidateStatusTag';
import { Flag, DotsThreeOutline, PlusCircle, Printer, Copy, ArrowUUpRight } from 'components/icons';
import { MenuTitle } from 'components/common/Menu/MenuTitle';

export type ProfileActionsCallbackProps = {
	setStatus: (status: CandidateStatus) => void;
	setFavorite: (v: boolean) => void;
	readOnly?: boolean;
} & MoreActionsMenuProps;

type ProfileActionsProps = {
	isMobile? : boolean;
	isFavorite: boolean;
	statusId: StatusesEnum;
} & ProfileActionsCallbackProps;

export function ProfileActions({
	isFavorite,
	statusId,
	setStatus,
	setFavorite,
	readOnly,
	isMobile,
	...moreActions
}: ProfileActionsProps) {
	return (
		<Stack wrap={false} spacing="tight" alignment="center" distribution={isMobile ? "equalSpacing" : 'leading'}>
			{readOnly ? (
				<CandidateStatusTag statusId={statusId} size="large" />
			) : (
				<Dropdown trigger={['click']} overlay={renderChangeStatusMenu([`${statusId}`], setStatus)}>
					<CandidateStatusButton statusId={statusId} />
				</Dropdown>
			)}
			<Stack.Item>
				<Stack wrap={false} spacing="tight" alignment="center" distribution="leading">
					<Button
						onClick={() => {
							setFavorite(!isFavorite);
						}}
						neutral
						type="ghost"
						icon={isFavorite ? <Flag weight="fill" /> : <Flag />}
						style={{ fontSize: '20px' }}
					/>
					{!readOnly && (
						<Dropdown trigger={['click']} overlay={() => renderActionsMenu({ ...moreActions })}>
							<Button neutral type="ghost" icon={<DotsThreeOutline style={{ fontSize: '20px' }} />} />
						</Dropdown>
					)}
				</Stack>
			</Stack.Item>
		</Stack>
	);
}

type MoreActionsMenuProps = {
	moveReq: () => void;
	addToAnotherPosition: () => void;
	lookForDuplicates: () => void;
	printCandidateCard: () => void;
};

function renderActionsMenu({
	moveReq,
	addToAnotherPosition,
	lookForDuplicates,
	printCandidateCard
}: MoreActionsMenuProps) {
	return (
		<Menu>
			<Menu.Item onClick={moveReq} key="1" icon={<ArrowUUpRight />}>
				Change position
			</Menu.Item>
			<Menu.Item onClick={addToAnotherPosition} key="2" icon={<PlusCircle weight="fill" />}>
				Start new hiring process
			</Menu.Item>
			<Menu.Item onClick={lookForDuplicates} key="3" icon={<Copy weight="fill" />}>
				Look for duplicates
			</Menu.Item>
			<Menu.Item onClick={printCandidateCard} key="4" icon={<Printer weight="fill" />}>
				Print candidate
			</Menu.Item>
		</Menu>
	);
}

function renderChangeStatusMenu(selectedKeys: string[] = [], setStatus: (status: CandidateStatus) => void) {
	const { statuses: candidateStatuses } = useCandidates();

	return (
		<Menu selectedKeys={selectedKeys}>
			<MenuTitle title="Set status" />
			{Object.values(candidateStatuses)
				.sort((a, b) => a.order - b.order)
				.filter((status) => status.allowChoice)
				.map((status) => {
					return (
						<Menu.Item
							onClick={() => {
								setStatus(status);
							}}
							key={status.id}
						>
							<CandidateStatusTag statusId={status.id} />
						</Menu.Item>
					);
				})}
		</Menu>
	);
}


