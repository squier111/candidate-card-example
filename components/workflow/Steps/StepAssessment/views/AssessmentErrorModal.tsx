import React, { useState } from 'react'
import { Modal, Typography } from 'antd';

//hooks
import { useUsers } from 'hooks/angular/users';

//types
import { Partners } from 'types/domain/workflow.types';

const { Title, Text } = Typography;

export type AssessmentError = {
	provider: Partners;
	error: {
		status: number;
		displayMessage?: string;
		message?: string;
		errorDetails?: {
			request?: { url: string; payload: string };
			response?: { statusCode: string; body: string; message: string };
		};
	};
};

export type AssessmentErrorProps = {
	assessment?: AssessmentError;
	isOpen: boolean;
	isModalClose: () => void;
};

export function AssessmentErrorModal({ isOpen, isModalClose, assessment }: AssessmentErrorProps) {
	const [isTechnicalDetailsVisible, setTechnicalDetailsVisible] = useState(false);
	const userService = useUsers();
	const currentUser = userService.getCurrent();

		if (!assessment) return null;

		return (
			<Modal
				cancelButtonProps={{ style: { display: 'none' } }}
				visible={isOpen}
				okText={'Okay'}
				onOk={isModalClose}
				onCancel={isModalClose}
			>
				{assessment.provider.name && (
					<>
						{assessment.error?.status === 404 ? (
							<Title level={3}>This integration has been disabled</Title>
						) : (
							<Title level={3}>There's a problem starting this step with {assessment.provider.name}</Title>
						)}
					</>
				)}

				{assessment.error?.status === 404 ? (
					<>
						{currentUser.userPermissions.editCompanySettings ? (
							<Text>
								To continue, enable this integration in the
								<a href="#/company/settings/integrations" target="_blank" rel="noopener">
									Integrations settings
								</a>
								(requires an Admin role).
							</Text>
						) : (
							<Text>To continue, enable this integration in the Integration settings (requires an Admin role).</Text>
						)}
					</>
				) : (
					<>
						{assessment.error?.displayMessage ? (
							<Text>
								{assessment.provider.name} says: {assessment.error.displayMessage}
							</Text>
						) : (
							<Text>{assessment.provider.name} returned an error.</Text>
						)}
					</>
				)}

				{assessment.error?.status !== 404 && (
					<Title onClick={() => setTechnicalDetailsVisible((prev) => !prev)} level={4}>
						{isTechnicalDetailsVisible ? 'Hide technical details' : 'Show technical details'}
					</Title>
				)}

				{isTechnicalDetailsVisible && (
					<>
						{assessment.error?.errorDetails && (
							<>
								{assessment.error?.errorDetails?.request && (
									<>
										<Title level={4}>REQUEST</Title>
										{assessment.error?.errorDetails?.request.url && (
											<Text>Url:&nbsp;{assessment.error?.errorDetails?.request.url}</Text>
										)}
										{assessment.error?.errorDetails?.request.payload && (
											<Text>
												Payload:&nbsp;
												<pre>
													<code>{assessment.error?.errorDetails?.request.payload}</code>
												</pre>
											</Text>
										)}
									</>
								)}
								{assessment.error?.errorDetails?.response && (
									<>
										<Title level={4}>RESPONSE</Title>
										{assessment.error?.errorDetails?.response.statusCode && (
											<Text>Status:&nbsp;{assessment.error?.errorDetails?.response.statusCode}</Text>
										)}
										{assessment.error?.errorDetails?.response.body && (
											<Text>
												Body:&nbsp;
												{assessment.error?.errorDetails?.response.body}
											</Text>
										)}
										{assessment.error?.errorDetails?.response.message && (
											<Text>
												Message:&nbsp;
												{assessment.error?.errorDetails?.response.message}
											</Text>
										)}
									</>
								)}
								{assessment.error?.errorDetails && (
									<>
										{assessment.error?.displayMessage && <Text>;{assessment.error?.displayMessage}</Text>}
										{assessment.error?.message && <Text>{assessment.error?.message} </Text>}
									</>
								)}
							</>
						)}
					</>
				)}
			</Modal>
		);
};
