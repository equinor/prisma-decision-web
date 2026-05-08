import { Banner, Icon } from '@equinor/eds-core-react';
import { check_circle_outlined, error_outlined } from '@equinor/eds-icons';
import { IconData } from '@equinor/eds-icons';
import { toast } from 'sonner';

type ToastVariant = 'success' | 'error';

const config: Record<ToastVariant, { icon: IconData; iconVariant?: 'warning' }> = {
	success: { icon: check_circle_outlined },
	error: { icon: error_outlined, iconVariant: 'warning' },
};

const showToast = (message: string, variant: ToastVariant) => {
	const { icon, iconVariant } = config[variant];
	return toast(
		<Banner>
			<Banner.Icon variant={iconVariant}>
				<Icon data={icon} />
			</Banner.Icon>
			<Banner.Message>{message}</Banner.Message>
		</Banner>,
		{
			duration: 5000,
			cancel: {
				label: 'Cancel',
				onClick: () => {},
			},
		},
	);
};

export const showSuccessToast = (message: string) => showToast(message, 'success');
export const showErrorToast = (message: string) => showToast(message, 'error');
