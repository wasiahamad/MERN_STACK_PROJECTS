import { cn } from "@/lib/utils";

function isImageUrl(value: string) {
  const v = value.trim();
  return /^https?:\/\//i.test(v) || v.startsWith("/uploads") || v.startsWith("data:image/");
}

export function CompanyLogo({
  logo,
  alt = "Company logo",
  fallback = "🏢",
  className,
  imgClassName,
}: {
  logo?: string | null;
  alt?: string;
  fallback?: string;
  className?: string;
  imgClassName?: string;
}) {
  const value = String(logo || "").trim();
  const showImage = value && isImageUrl(value);

  return (
    <div className={cn("bg-muted overflow-hidden flex items-center justify-center", className)}>
      {showImage ? (
        <img
          src={value}
          alt={alt}
          className={cn("h-full w-full object-cover", imgClassName)}
          loading="lazy"
        />
      ) : (
        <span aria-hidden className="leading-none">
          {value || fallback}
        </span>
      )}
    </div>
  );
}
