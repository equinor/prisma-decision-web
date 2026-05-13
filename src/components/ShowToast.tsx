import { Banner, Button, Icon } from '@equinor/eds-core-react';
import { check_circle_outlined, close, error_outlined } from '@equinor/eds-icons';
import { IconData } from '@equinor/eds-icons';
import { toast } from 'sonner';

type ToastVariant = 'success' | 'error';

const config: Record<ToastVariant, { icon: IconData; iconVariant?: 'warning' }> = {
	success: { icon: check_circle_outlined },
	error: { icon: error_outlined, iconVariant: 'warning' },
};

const showToast = (message: string, variant: ToastVariant) => {
	const { icon, iconVariant } = config[variant];
	return toast.custom(
		id => (
			<Banner>
				<Banner.Icon variant={iconVariant}>
					<Icon data={icon} />
				</Banner.Icon>
				<Banner.Message>{message}</Banner.Message>
				<Banner.Actions>
					<Button variant='ghost_icon' onClick={() => toast.dismiss(id)}>
						<Icon data={close} />
					</Button>
				</Banner.Actions>
			</Banner>
		),
		{
			duration: 5000,
		},
	);
};

export const showSuccessToast = (message: string) => showToast(message, 'success');
export const showErrorToast = (message: string) => showToast(message, 'error');
