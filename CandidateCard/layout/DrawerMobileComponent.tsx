import React from 'react';
import { Drawer } from 'antd';

//components
import { Stack } from 'components/common/Stack/Stack';
import { Heading } from 'components/common/Typography/Heading';
import { X } from 'components/icons';
import { Button } from 'components/common/Button/Button';

type DrawerMobileComponentProps = {
	drawerIcon: React.ReactElement | null;
	expanded: boolean;
	title: string;
	children: React.ReactNode;
	setExpanded: (expand: boolean) => void;
};

export function DrawerMobileComponent({
	setExpanded,
	expanded,
	title,
	drawerIcon,
	children
}: DrawerMobileComponentProps) {
	return (
		<Drawer
			visible={expanded}
			onClose={() => {
				setExpanded(false);
			}}
			width={'100%'}
			title={
				<Stack wrap={false} alignment="center" spacing="tight">
					{drawerIcon}
					<Heading level={3}>{title}</Heading>
				</Stack>
			}
			closable={false}
			extra={
				<Button
					neutral
					type="text"
					onClick={() => {
						setExpanded(!expanded);
					}}
					icon={<X weight="bold" />}
				/>
			}
		>
			{children}
		</Drawer>
	);
}
