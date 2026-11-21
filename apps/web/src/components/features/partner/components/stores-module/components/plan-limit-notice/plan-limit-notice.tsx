export const PlanLimitNotice = ({ description }: { description: string }) => (
  <div
    role="status"
    className="rounded-[22px] bg-warning-bg px-[18px] py-3.5 text-sm leading-normal text-warning"
  >
    <p className="font-extrabold">Limite do plano atingido</p>
    <p>{description}</p>
  </div>
);
