'use client';

type BuilderValidationBannerProps = {
  errors: string[];
  warnings: string[];
};

export function BuilderValidationBanner({ errors, warnings }: BuilderValidationBannerProps) {
  if (errors.length === 0 && warnings.length === 0) return null;

  return (
    <div className="mb-6 space-y-3">
      {errors.length > 0 && (
        <div
          className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 space-y-1.5"
          role="alert"
        >
          <p className="text-[10px] font-bold uppercase tracking-wider text-red-600">
            ไม่สามารถบันทึกได้ — แก้ไขก่อนบันทึก
          </p>
          {errors.map((message) => (
            <p key={message} className="text-xs text-red-700 leading-relaxed">
              {message}
            </p>
          ))}
        </div>
      )}

      {warnings.length > 0 && (
        <div
          className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 space-y-1.5"
          role="status"
        >
          <p className="text-[10px] font-bold uppercase tracking-wider text-amber-700">
            {errors.length > 0 ? 'คำเตือนเพิ่มเติม' : 'คำเตือน — บันทึกได้ แต่ค่าบางอย่างจะถูก normalize'}
          </p>
          {warnings.map((message) => (
            <p key={message} className="text-xs text-amber-800 leading-relaxed">
              {message}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
