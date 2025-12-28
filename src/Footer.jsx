import ScratchBadge from './ScratchBadge';

export default function Footer() {
  return (
    <footer className="not-prose text-center mt-16 pb-8">
      <ScratchBadge />
      <p className="text-gray-400 text-sm">
        MIT License · © 2025 Pete Koomen
      </p>
    </footer>
  );
}
