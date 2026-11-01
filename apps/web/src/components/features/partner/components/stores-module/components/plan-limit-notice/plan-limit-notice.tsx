export const PlanLimitNotice = ({ description }: { description: string }) => (
  <div
    role="status"
    className="rounded-[22px] bg-[#FFF1E0] px-[18px] py-3.5 text-sm leading-normal text-[#6E3B00]"
  >
    <p className="font-extrabold">Limite do plano atingido</p>
    <p>{description}</p>
  </div>
);
