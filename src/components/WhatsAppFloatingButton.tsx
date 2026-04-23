import styles from './WhatsAppFloatingButton.module.css';

type WhatsAppFloatingButtonProps = {
  phoneNumber: string;
};

export default function WhatsAppFloatingButton({ phoneNumber }: WhatsAppFloatingButtonProps) {
  const defaultMessage =
    'Hello SpyBot team, I am interested in your Identity Verification, KYB, Financial Verification, and Video KYC solutions. Please share details and next steps.';
  const href = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(defaultMessage)}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={styles.fab}
      aria-label="Chat on WhatsApp"
    >
      <svg viewBox="0 0 32 32" className={styles.icon} aria-hidden="true" focusable="false">
        <path
          fill="currentColor"
          d="M19.11 17.16c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.16-.17.2-.35.22-.65.08-.3-.15-1.27-.47-2.42-1.5-.9-.8-1.5-1.78-1.67-2.08-.18-.3-.02-.46.13-.6.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.48-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.05 1.03-1.05 2.5 0 1.48 1.08 2.9 1.23 3.1.15.2 2.12 3.24 5.13 4.54.72.31 1.28.5 1.72.64.72.23 1.38.2 1.9.12.58-.08 1.77-.72 2.03-1.42.25-.7.25-1.3.17-1.42-.07-.13-.27-.2-.57-.35M16 4.8c-6.16 0-11.2 5.01-11.2 11.2 0 1.97.51 3.9 1.47 5.6L4.8 27.2l5.76-1.42c1.64.9 3.5 1.37 5.44 1.38 6.16 0 11.2-5.01 11.2-11.2S22.16 4.8 16 4.8m0 20.46a9.2 9.2 0 0 1-4.69-1.28l-.34-.2-3.42.84.91-3.33-.22-.35a9.1 9.1 0 0 1-1.4-4.85c0-5.06 4.12-9.18 9.2-9.18 2.45 0 4.75.96 6.49 2.69a9.13 9.13 0 0 1 2.71 6.49c0 5.06-4.12 9.17-9.2 9.17"
        />
      </svg>
      <span className="sr-only">Chat on WhatsApp</span>
    </a>
  );
}
