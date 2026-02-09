import { SetupWizard } from '@/components/setup/setup-wizard';

export const metadata = {
  title: 'Setup - Shift Manager',
  description: 'Initialize your shift scheduling system',
};

export default function SetupPage() {
  return <SetupWizard />;
}
