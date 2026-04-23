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
      <svg viewBox="0 0 16 16" className={styles.icon} aria-hidden="true" focusable="false">
        <path
          fill="currentColor"
          d="M13.601 2.326A7.854 7.854 0 0 0 8.034 0C3.643 0 .067 3.576.067 7.968a7.9 7.9 0 0 0 1.104 4.051L0 16l4.094-1.073a7.94 7.94 0 0 0 3.939 1.007h.003c4.392 0 7.966-3.576 7.966-7.968A7.9 7.9 0 0 0 13.6 2.326Zm-5.565 12.29a6.63 6.63 0 0 1-3.386-.929l-.243-.144-2.43.636.65-2.37-.158-.245a6.62 6.62 0 0 1-1.015-3.55c0-3.66 2.977-6.637 6.637-6.637a6.6 6.6 0 0 1 4.693 1.943 6.59 6.59 0 0 1 1.944 4.694c0 3.66-2.976 6.637-6.637 6.637Zm3.64-4.991c-.198-.099-1.172-.578-1.354-.644-.181-.066-.314-.1-.446.1-.132.198-.512.644-.628.776-.115.132-.23.149-.429.05-.198-.1-.837-.309-1.594-.986-.59-.526-.988-1.175-1.103-1.373-.116-.199-.012-.306.087-.405.09-.09.199-.232.297-.347.099-.116.132-.199.198-.331.066-.132.033-.248-.016-.347-.05-.1-.446-1.075-.611-1.472-.161-.387-.326-.335-.446-.341-.115-.006-.247-.006-.379-.006s-.347.05-.528.248c-.182.198-.694.678-.694 1.654s.71 1.918.81 2.05c.099.132 1.399 2.136 3.39 2.996.473.204.843.326 1.13.418.475.151.907.13 1.249.079.381-.057 1.172-.479 1.337-.942.165-.463.165-.86.116-.942-.05-.083-.182-.132-.38-.232Z"
        />
      </svg>
      <span className="sr-only">Chat on WhatsApp</span>
    </a>
  );
}
