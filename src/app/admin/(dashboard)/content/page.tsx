import ContentClient from "@/components/admin/ContentClient";

export default function AdminContentPage() {
  return (
    <div className="p-5 lg:p-8">
      <p className="eyebrow">Homepage content</p>
      <h1 className="mt-1.5 text-[24px] lg:text-[28px]">Banners &amp; content</h1>
      <p className="mt-1.5 max-w-xl text-[13px] text-slate-soft">
        Changes here go live on the home page immediately — no rebuild needed.
      </p>

      <div className="mt-6">
        <ContentClient />
      </div>
    </div>
  );
}
