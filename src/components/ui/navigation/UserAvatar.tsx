"use client";

export default function UserAvatar() {
  return (
    <div className="avatar gap-2 items-center">
      <div className="ring-primary w-8 rounded-full">
        <img
          alt="Tailwind-CSS-Avatar-component"
          src="https://img.daisyui.com/images/profile/demo/spiderperson@192.webp"
        />
      </div>
      <span className="font-semibold">Alexander</span>
    </div>
  );
}
